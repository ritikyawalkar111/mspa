import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';

export const createTest = async (req, res) => {
    try {
        const test = new Test({
            ...req.body,
            createdBy: req.user.id
        });

        await test.save();
        await test.populate('questions');
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getMyTests = async (req, res) => {
    try {
        const tests = await Test.find({ createdBy: req.user.id })
            .populate('questions')
            .sort({ createdAt: -1 });

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getActiveTests = async (req, res) => {
    try {
        console.log("insiide active")
        // Only students can access
        if (req.user.role !== 'student') {
            console.log("he")
            return res.json([]);
        }

        const enrolledTeachers = req.user.enrolledTeachers || [];
        if (enrolledTeachers.length === 0) {
            console.log("not enrolled");
            return res.json([]);
        }

        // 1️⃣ Tests already attempted by student
        const results = await Result.find({
            student: req.user._id
        }).select('test submittedAt');

        const submittedTestIds = results
            .filter(r => r.submittedAt)
            .map(r => r.test);


        const inProgressTestIds = results
            .filter(r => !r.submittedAt)
            .map(r => r.test);
        // console.log(submittedTestIds);
        // console.log(inProgressTestIds);
        const all = await Test.find({
            createdBy: { $in: enrolledTeachers },
            // status: 'published',
        });
        console.log("all", all);
        const tests = await Test.find({
            createdBy: { $in: enrolledTeachers },
            status: 'published',
            type: { $in: ['self_paced', 'teacher_controlled'] },
            $and: [
                {
                    $or: [
                        { _id: { $nin: submittedTestIds } },
                        { _id: { $in: inProgressTestIds } }
                    ]
                }
            ]
        })
            .populate('createdBy', 'name')
            .select('title description duration createdAt type status')
            .sort({ createdAt: -1 });

        // console.log(tests);
        const now = Date.now();

        const activeTests = [];
        const expiredTests = [];

        tests.forEach(test => {
            const durationMs = test.duration * 60 * 1000;
            const createdAtMs = new Date(test.createdAt).getTime();

            if (now - createdAtMs <= durationMs) {
                activeTests.push(test);
            } else {
                expiredTests.push(test);
            }
        });
        res.json({ activeTests, expiredTests });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// export const getActiveTests = async (req, res) => {
//     try {
//         let query = { isActive: true };


//         // API is intended for students only. If not student, return empty.
//         if (req.user.role !== 'student') {

//             return res.json([]);
//         }


//         const enrolled = req.user.enrolledTeachers || [];

//         if (enrolled.length === 0) {

//             return res.json([]);
//         }
//         query.createdBy = { $in: enrolled, };

//         const tests = await Test.find(query)
//             .populate('createdBy', 'name')
//             .select('title description duration createdAt');

//         res.json(tests);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

export const getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('questions');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }


        if (req.user.role === 'student') {
            if (!test.isActive) {
                return res.status(403).json({ message: 'Test is not active' });
            }

            // Check if student is enrolled with the test creator
            const isEnrolled = req.user.enrolledTeachers.includes(test.createdBy._id || test.createdBy);
            if (!isEnrolled) {
                return res.status(403).json({ message: 'You must enroll with this teacher to view this test' });
            }

            const testWithoutAnswers = {
                _id: test._id,
                title: test.title,
                description: test.description,
                duration: test.duration,
                questions: test.questions.map(q => ({
                    _id: q._id,
                    questionText: q.questionText,
                    options: q.options.map(opt => ({ text: opt.text })),
                    questionType: q.questionType,
                    marks: q.marks
                }))
            };
            return res.json(testWithoutAnswers);
        }

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const startTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test || !test.isActive) {
            return res.status(404).json({ message: 'Test not found or inactive' });
        }

        // Check enrollment for student
        if (req.user.role === 'student') {
            const isEnrolled = req.user.enrolledTeachers.includes(test.createdBy.toString());
            if (!isEnrolled) {
                return res.status(403).json({ message: 'You must enroll with this teacher to attempt this test' });
            }
        }

        const existingResult = await Result.findOne({
            test: test._id,
            student: req.user.id
        });

        if (existingResult) {
            return res.status(400).json({ message: 'Test already attempted' });
        }


        const questions = await Question.find({ _id: { $in: test.questions } });
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);


        const result = new Result({
            test: test._id,
            student: req.user.id,
            totalMarks,
            answers: test.questions.map(questionId => ({
                question: questionId
            }))
        });

        await result.save();

        res.json({
            testId: test._id,
            duration: test.duration,
            totalQuestions: test.questions.length,
            totalMarks,
            startTime: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const submitTest = async (req, res) => {
    try {
        const { answers, timeTaken, autoSubmitted = false } = req.body;
        const test = await Test.findById(req.params.id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }


        let result = await Result.findOne({
            test: test._id,
            student: req.user.id
        }).populate('answers.question');

        if (!result) {
            return res.status(400).json({ message: 'Test not started' });
        }

        if (result.submittedAt) {
            return res.status(400).json({ message: 'Test already submitted' });
        }


        let score = 0;
        const updatedAnswers = await Promise.all(
            answers.map(async (answer) => {
                const question = await Question.findById(answer.questionId).select('+correctAnswer');
                if (!question) return null;

                let isCorrect = false;
                if (question.questionType === 'fill_in_blank') {

                    isCorrect = answer.textAnswer &&
                        question.correctAnswer &&
                        answer.textAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                } else {

                    isCorrect = question.options[answer.selectedOption]?.isCorrect || false;
                }

                if (isCorrect) {
                    score += question.marks;
                } else {
                    // Apply negative marking
                    if (question.negativeMarks) {
                        score -= question.negativeMarks;
                    }
                }

                return {
                    question: answer.questionId,
                    selectedOption: answer.selectedOption,
                    textAnswer: answer.textAnswer,
                    isCorrect
                };
            })
        );


        const validAnswers = updatedAnswers.filter(answer => answer !== null);


        result.answers = validAnswers;
        result.score = score;
        result.percentage = (score / result.totalMarks) * 100;
        result.timeTaken = timeTaken;
        result.autoSubmitted = autoSubmitted;
        result.submittedAt = new Date();

        await result.save();

        res.json({
            message: 'Test submitted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateTest = async (req, res) => {
    try {
        const test = await Test.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            req.body,
            { new: true, runValidators: true }
        ).populate('questions');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteTest = async (req, res) => {
    try {
        const test = await Test.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }


        await Result.deleteMany({ test: req.params.id });

        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const publishTest = async (req, res) => {
    try {
        const test = await Test.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            { isActive: true },
            { new: true }
        );

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.json({ message: 'Test published successfully', test });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
