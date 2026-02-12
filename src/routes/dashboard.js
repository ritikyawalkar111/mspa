import express from 'express';
import mongoose from 'mongoose';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import { auth, requireStudent, requireTeacher } from '../middlewares/auth.js';

const router = express.Router();

/**
 * GET /student-dashboard/:studentId
 * Returns student's results and summary
 */
router.get('/teacher/:testId/dash', auth, requireTeacher, async (req, res) => {
    try {
        const { testId } = req.params;

        // 🔴 IMPORTANT: convert testId to ObjectId
        const testObjectId = new mongoose.Types.ObjectId(testId);

        // 1️⃣ Leaderboard
        const leaderboardAgg = await Result.aggregate([
            { $match: { test: testObjectId } },

            // 1️⃣ Sort first (score desc, time asc)
            { $sort: { score: -1, timeTaken: 1 } },

            // 2️⃣ Join student
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "student",
                },

            },
            { $unwind: "$student" },

            // 3️⃣ Select fields
            {
                $project: {
                    result_id: "$_id",
                    result: "$autoSubmitted",
                    _id: 0,
                    studentName: "$student.name",
                    email: "$student.email",
                    score: 1,
                    timeTaken: 1,
                    submittedAt: 1,
                },
            },
        ]);

        // 4️⃣ Add rank manually (SAFE)
        const leaderboard = leaderboardAgg.map((item, index) => ({
            rank: index + 1,
            ...item,
        }));


        // 2️⃣ Test Summary
        const summaryAgg = await Result.aggregate([
            { $match: { test: testObjectId } },
            {
                $group: {
                    _id: "$test",
                    totalStudents: { $sum: 1 },
                    avgScore: { $avg: "$score" },
                    maxScore: { $max: "$score" },
                    minScore: { $min: "$score" },
                    avgTime: { $avg: "$timeTaken" },
                },
            },
        ]);

        const testSummary = summaryAgg.length
            ? {
                totalStudents: summaryAgg[0].totalStudents,
                avgScore: Number(summaryAgg[0].avgScore.toFixed(2)),
                maxScore: summaryAgg[0].maxScore,
                minScore: summaryAgg[0].minScore,
                avgTime: Number(summaryAgg[0].avgTime.toFixed(2)),
            }
            : {
                totalStudents: 0,
                avgScore: 0,
                maxScore: 0,
                minScore: 0,
                avgTime: 0,
            };

        // 3️⃣ Question Analytics
        const questionAnalytics = await Result.aggregate([
            { $match: { test: testObjectId } },
            { $unwind: "$answers" },
            {
                $group: {
                    _id: "$answers.question",
                    totalAttempts: { $sum: 1 },
                    correctCount: {
                        $sum: {
                            $cond: ["$answers.isCorrect", 1, 0],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    questionId: "$_id",
                    totalAttempts: 1,
                    correctCount: 1,
                    correctPercentage: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ["$correctCount", "$totalAttempts"] },
                                    100,
                                ],
                            },
                            2,
                        ],
                    },
                },
            },
        ]);

        // 4️⃣ Time Analytics
        const timeAnalyticsAgg = await Result.aggregate([
            { $match: { test: testObjectId } },
            {
                $group: {
                    _id: "$test",
                    avgTime: { $avg: "$timeTaken" },
                    fastestTime: { $min: "$timeTaken" },
                    slowestTime: { $max: "$timeTaken" },
                },
            },
        ]);

        const timeAnalytics = timeAnalyticsAgg.length
            ? {
                avgTime: Number(timeAnalyticsAgg[0].avgTime.toFixed(2)),
                fastestTime: timeAnalyticsAgg[0].fastestTime,
                slowestTime: timeAnalyticsAgg[0].slowestTime,
            }
            : {
                avgTime: 0,
                fastestTime: 0,
                slowestTime: 0,
            };

        // 5️⃣ Participation
        const participationAgg = await Result.aggregate([
            { $match: { test: testObjectId } },
            {
                $group: {
                    _id: null,
                    totalAttempted: { $sum: 1 },
                    autoSubmitted: {
                        $sum: {
                            $cond: ["$autoSubmitted", 1, 0],
                        },
                    },
                    manualSubmitted: {
                        $sum: {
                            $cond: ["$autoSubmitted", 0, 1],
                        },
                    },
                },
            },
        ]);

        const participation = participationAgg.length
            ? participationAgg[0]
            : {
                totalAttempted: 0,
                autoSubmitted: 0,
                manualSubmitted: 0,
            };

        // 6️⃣ Score Distribution
        const scoreDistribution = await Result.aggregate([
            { $match: { test: testObjectId } },
            {
                $bucket: {
                    groupBy: "$score",
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: "100+",
                    output: {
                        count: { $sum: 1 },
                    },
                },
            },
        ]);

        // ✅ Final Response
        return res.json({
            leaderboard,
            testSummary,
            questionAnalytics,
            timeAnalytics,
            participation,
            scoreDistribution,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Dashboard analytics failed" });
    }
});

router.get('/student/:studentId', auth, requireStudent, async (req, res) => {
    try {
        console.log("inside stu-das");

        const { studentId } = req.params;

        if (req.user.id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const studentResults = await Result.find({ student: studentId })
            .populate('test', '_id title description duration startTime endTime')
            .select('_id score totalMarks timeTaken submittedAt answers test')
            .sort({ submittedAt: 1 }); // ✅ OLD → NEW (important for graph)

        let totalTests = studentResults.length;
        let totalScoredMarks = 0;
        let totalMaxMarks = 0;
        let totalTime = 0;

        studentResults.forEach(r => {
            totalScoredMarks += Number(r.score);
            totalMaxMarks += Number(r.totalMarks);
            totalTime += Number(r.timeTaken || 0);
        });

        const avgPercentage =
            totalMaxMarks > 0
                ? Math.round((totalScoredMarks / totalMaxMarks) * 100)
                : 0;

        const dashboardData = {
            totalTests,
            avgScore: avgPercentage,
            totalTime,
            results: studentResults.map(r => ({
                id: r._id,
                testId: r.test._id,
                testTitle: r.test.title,
                submittedAt: r.submittedAt,
                score: Number(r.score),
                totalMarks: Number(r.totalMarks),
                percentage: Math.round((r.score / r.totalMarks) * 100), // ✅ derive fresh
                timeTaken: Number(r.timeTaken || 0),
                answers: r.answers?.map(a => ({
                    questionId: a.question,
                    selectedOption: a.selectedOption,
                    textAnswer: a.textAnswer,
                    isCorrect: a.isCorrect,
                })) || [],
            })),
        };

        res.json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

export default router;
