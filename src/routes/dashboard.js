import express from 'express';
import mongoose from 'mongoose';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import { auth, requireStudent } from '../middlewares/auth.js';

const router = express.Router();

/**
 * GET /student-dashboard/:studentId
 * Returns student's results and summary
 */
router.get('/:testId', auth, requireTeacher, async (req, res) => {
    try {
        const { testId } = req.params;
        const testObjectId = mongoose.Types.ObjectId(testId);

        // 1️⃣ Leaderboard
        const results = await Result.find({ test: testObjectId })
            .populate('student', 'name email')
            .select('score timeTaken submittedAt student')
            .sort({ score: -1, timeTaken: 1 });

        const leaderboard = results.map((r, index) => ({
            rank: index + 1,
            studentName: r.student.name,
            email: r.student.email,
            score: r.score,
            timeTaken: r.timeTaken,
            submittedAt: r.submittedAt,
        }));

        // 2️⃣ Test Summary
        const summaryAgg = await Result.aggregate([
            { $match: { test: testObjectId } },
            {
                $group: {
                    _id: '$test',
                    totalStudents: { $sum: 1 },
                    avgScore: { $avg: '$score' },
                    maxScore: { $max: '$score' },
                    minScore: { $min: '$score' },
                    avgTime: { $avg: '$timeTaken' },
                },
            },
        ]);
        const testSummary = summaryAgg[0] || {};

        // 3️⃣ Question Analytics
        const questionAnalytics = await Result.aggregate([
            { $match: { test: testObjectId } },
            { $unwind: '$answers' },
            {
                $group: {
                    _id: '$answers.question',
                    totalAttempts: { $sum: 1 },
                    correctCount: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
                },
            },
            {
                $project: {
                    questionId: '$_id',
                    totalAttempts: 1,
                    correctCount: 1,
                    correctPercentage: { $multiply: [{ $divide: ['$correctCount', '$totalAttempts'] }, 100] },
                },
            },
        ]);

        // 4️⃣ Time Analytics
        const timeAnalyticsAgg = await Result.aggregate([
            { $match: { test: testObjectId } },
            {
                $group: {
                    _id: '$test',
                    avgTime: { $avg: '$timeTaken' },
                    fastestTime: { $min: '$timeTaken' },
                    slowestTime: { $max: '$timeTaken' },
                },
            },
        ]);
        const timeAnalytics = timeAnalyticsAgg[0] || {};

        // 5️⃣ Participation
        const total = results.length;
        const autoSubmitted = results.filter(r => r.autoSubmitted).length;
        const participation = {
            totalAttempted: total,
            autoSubmitted,
            manualSubmitted: total - autoSubmitted,
        };

        // 6️⃣ Score Distribution
        const scoreDistribution = await Result.aggregate([
            { $match: { test: testObjectId } },
            {
                $bucket: {
                    groupBy: '$score',
                    boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                    default: 'Other',
                    output: { count: { $sum: 1 } },
                },
            },
        ]);

        res.json({
            leaderboard,
            testSummary,
            questionAnalytics,
            timeAnalytics,
            participation,
            scoreDistribution,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/:studentId', auth, requireStudent, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Ensure the logged-in user is the same as the requested student
        if (req.user.id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const studentResults = await Result.find({ student: studentId })
            .populate('test', 'title description duration startTime endTime')
            .select('score totalMarks percentage timeTaken submittedAt answers test')
            .sort({ submittedAt: -1 });

        // Calculate summary metrics for student
        let totalScore = 0;
        let totalTests = studentResults.length;
        let avgScore = 0;
        let totalTime = 0;

        studentResults.forEach(r => {
            totalScore += r.score;
            totalTime += r.timeTaken;
        });

        if (totalTests > 0) avgScore = totalScore / totalTests;

        // Prepare data: results + summary
        const dashboardData = {
            totalTests,
            avgScore,
            totalTime,
            results: studentResults.map(r => ({
                testId: r.test._id,
                testTitle: r.test.title,
                submittedAt: r.submittedAt,
                score: r.score,
                totalMarks: r.totalMarks,
                percentage: r.percentage,
                timeTaken: r.timeTaken,
                answers: r.answers.map(a => ({
                    questionId: a.question,
                    selectedOption: a.selectedOption,
                    textAnswer: a.textAnswer,
                    isCorrect: a.isCorrect,
                })),
            })),
        };

        res.json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
