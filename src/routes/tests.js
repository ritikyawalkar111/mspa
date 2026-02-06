// import express from 'express';
import {
    createTest,
    getMyTests,
    getActiveTests, // Added
    getTestById,
    startTest,
    submitTest,
    updateTest,
    deleteTest,
    publishTest
} from '../Controller/testController.js';
// import { auth, requireTeacher, requireStudent } from '../middlewares/auth.js';
// import { validateTest } from '../middlewares/validation.js';
// import Test from '../models/Test.js';
// import Question from '../models/Question.js';
// import Result from '../models/Result.js';

// const router = express.Router();


// router.post('/', auth, requireTeacher, validateTest, async (req, res) => {
//     try {
//         const test = new Test({
//             ...req.body,
//             createdBy: req.user.id
//         });

//         await test.save();
//         await test.populate('questions');
//         res.status(201).json(test);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });


// router.get('/my-tests', auth, requireTeacher, async (req, res) => {
//     try {
//         const tests = await Test.find({ createdBy: req.user.id })
//             .populate('questions')
//             .sort({ createdAt: -1 });

//         res.json(tests);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });




// router.get('/:id', auth, async (req, res) => {
//     try {
//         const test = await Test.findById(req.params.id).populate('questions');

//         if (!test) {
//             return res.status(404).json({ message: 'Test not found' });
//         }


//         if (req.user.role === 'student') {
//             if (!test.isActive) {
//                 return res.status(403).json({ message: 'Test is not active' });
//             }

//             const testWithoutAnswers = {
//                 _id: test._id,
//                 title: test.title,
//                 description: test.description,
//                 duration: test.duration,
//                 questions: test.questions.map(q => ({
//                     _id: q._id,
//                     questionText: q.questionText,
//                     options: q.options.map(opt => ({ text: opt.text })),
//                     questionType: q.questionType,
//                     marks: q.marks
//                 }))
//             };
//             return res.json(testWithoutAnswers);
//         }

//         res.json(test);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });


// router.post('/:id/start', auth, requireStudent, async (req, res) => {
//     try {
//         const test = await Test.findById(req.params.id);

//         if (!test || !test.isActive) {
//             return res.status(404).json({ message: 'Test not found or inactive' });
//         }


//         const existingResult = await Result.findOne({
//             test: test._id,
//             student: req.user.id
//         });

//         if (existingResult) {
//             if (existingResult.submittedAt) {
//                 return res.status(400).json({ message: 'Test already attempted' });
//             }

//             // Resume Test
//             return res.json({
//                 testId: test._id,
//                 duration: test.duration,
//                 totalQuestions: test.questions.length,
//                 totalMarks: existingResult.totalMarks,
//                 startTime: existingResult.createdAt, // Use original start time
//                 isResumed: true
//             });
//         }


//         const questions = await Question.find({ _id: { $in: test.questions } });
//         const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);


//         const result = new Result({
//             test: test._id,
//             student: req.user.id,
//             totalMarks,
//             answers: test.questions.map(questionId => ({
//                 question: questionId
//             }))
//         });

//         await result.save();

//         res.json({
//             testId: test._id,
//             duration: test.duration,
//             totalQuestions: test.questions.length,
//             totalMarks,
//             startTime: result.createdAt
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });


// router.post('/:id/submit', auth, requireStudent, async (req, res) => {
//     try {
//         const { answers, timeTaken, autoSubmitted = false } = req.body;
//         const test = await Test.findById(req.params.id);

//         if (!test) {
//             return res.status(404).json({ message: 'Test not found' });
//         }


//         let result = await Result.findOne({
//             test: test._id,
//             student: req.user.id
//         }).populate('answers.question');

//         if (!result) {
//             return res.status(400).json({ message: 'Test not started' });
//         }

//         if (result.submittedAt) {
//             return res.status(400).json({ message: 'Test already submitted' });
//         }


//         let score = 0;
//         const updatedAnswers = await Promise.all(
//             answers.map(async (answer) => {
//                 const question = await Question.findById(answer.questionId).select('+correctAnswer');
//                 if (!question) return null;

//                 let isCorrect = false;
//                 if (question.questionType === 'fill_in_blank') {

//                     isCorrect = answer.textAnswer &&
//                         question.correctAnswer &&
//                         answer.textAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
//                 } else {

//                     isCorrect = question.options[answer.selectedOption]?.isCorrect || false;
//                 }

//                 if (isCorrect) {
//                     score += question.marks;
//                 }

//                 return {
//                     question: answer.questionId,
//                     selectedOption: answer.selectedOption,
//                     textAnswer: answer.textAnswer,
//                     isCorrect
//                 };
//             })
//         );


//         const validAnswers = updatedAnswers.filter(answer => answer !== null);


//         result.answers = validAnswers;
//         result.score = score;
//         result.percentage = (score / result.totalMarks) * 100;
//         result.timeTaken = timeTaken;
//         result.autoSubmitted = autoSubmitted;
//         result.submittedAt = new Date();

//         await result.save();

//         res.json({
//             message: 'Test submitted successfully'
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });


// router.put('/:id', auth, requireTeacher, async (req, res) => {
//     try {
//         const test = await Test.findById(req.params.id);

//         if (!test) {
//             return res.status(404).json({ message: 'Test not found' });
//         }

//         // Check ownership
//         // Check ownership (if test has an owner)
//         if (test.createdBy && test.createdBy.toString() !== req.user.id) {
//             return res.status(403).json({ message: 'Not authorized to update this test' });
//         }

//         const updatedTest = await Test.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true }
//         ).populate('questions');

//         res.json(updatedTest);
//     } catch (error) {
//         console.error('Error in PUT /tests/:id:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });


// router.delete('/:id', auth, requireTeacher, async (req, res) => {
//     try {
//         const test = await Test.findById(req.params.id);

//         if (!test) {
//             return res.status(404).json({ message: 'Test not found' });
//         }

//         // Check ownership
//         // Check ownership (if test has an owner)
//         if (test.createdBy && test.createdBy.toString() !== req.user.id) {
//             return res.status(403).json({ message: 'Not authorized to delete this test' });
//         }

//         await Test.findByIdAndDelete(req.params.id);
//         await Result.deleteMany({ test: req.params.id });

//         res.json({ message: 'Test deleted successfully' });
//     } catch (error) {
//         console.error('Error in DELETE /tests/:id:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// router.put('/:id/publish', auth, requireTeacher, async (req, res) => {
//     try {
//         const test = await Test.findById(req.params.id);

//         if (!test) {
//             return res.status(404).json({ message: 'Test not found' });
//         }

//         // Check ownership
//         if (test.createdBy && test.createdBy.toString() !== req.user.id) {
//             return res.status(403).json({ message: 'Not authorized to publish this test' });
//         }

//         test.isActive = true;
//         await test.save();

//         res.json({ message: 'Test published successfully', test });
//     } catch (error) {
//         console.error('Error in PUT /tests/:id/publish:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// export default router;


import express from 'express';
import { auth, requireTeacher, requireStudent } from '../middlewares/auth.js';
import { validateTest } from '../middlewares/validation.js';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
// import { getActiveTests } from '../Controller/testController.js';
const router = express.Router();

/* =====================================================
   CREATE TEST (DRAFT)
===================================================== */
router.post('/', auth, requireTeacher, validateTest, async (req, res) => {
    try {
        console.log("hi0");
        const test = new Test({
            ...req.body, // title, description, duration, type
            status: 'draft',
            createdBy: req.user.id
        });

        await test.save();
        await test.populate('questions');

        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

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
router.get('/fetch-active', auth, requireStudent, getActiveTests);

/* =====================================================
   GET MY TESTS (TEACHER)
===================================================== */
router.get('/my-tests', auth, requireTeacher, async (req, res) => {
    try {
        const tests = await Test.find({ createdBy: req.user.id })
            .populate('questions')
            .sort({ createdAt: -1 });

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/* =====================================================
   GET TEST BY ID
===================================================== */
router.get('/:id', auth, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('questions');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        /* ---------- STUDENT VIEW ---------- */
        if (req.user.role === 'student') {
            if (test.status === 'draft') {
                return res.status(403).json({ message: 'Test not available' });
            }

            const testWithoutAnswers = {
                _id: test._id,
                title: test.title,
                description: test.description,
                duration: test.duration,
                type: test.type,
                status: test.status,
                currentQuestionIndex: test.currentQuestionIndex,
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

        /* ---------- TEACHER VIEW ---------- */
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// // Route to get active tests (Visible to students only)

/* =====================================================
   START TEST (STUDENT)
===================================================== */
const autoSubmit = async (result) => {
    try {
        // Populate questions
        await result.populate('answers.question');

        let score = 0;

        for (const ans of result.answers) {
            const question = await Question
                .findById(ans.question)
                .select('+correctAnswer');

            if (!question) continue;

            let isCorrect = false;

            if (question.questionType === 'fill_in_blank') {
                isCorrect =
                    ans.textAnswer &&
                    question.correctAnswer &&
                    ans.textAnswer.trim().toLowerCase() ===
                    question.correctAnswer.trim().toLowerCase();
            } else {
                isCorrect =
                    question.options[ans.selectedOption]?.isCorrect || false;
            }

            ans.isCorrect = isCorrect;

            if (isCorrect) {
                score += question.marks;
            }
        }

        // Calculate time taken (in seconds)
        const timeTaken = Math.floor(
            (Date.now() - result.createdAt.getTime()) / 1000
        );

        result.score = score;
        result.percentage = (score / result.totalMarks) * 100;
        result.timeTaken = timeTaken;
        result.autoSubmitted = true;
        result.status = 'auto_submitted';
        result.submittedAt = new Date();

        await result.save();

        // End test only if self-paced
        // const test = await Test.findById(result.test);
        // if (test?.type === 'self_paced') {
        //     test.status = 'ended';
        //     test.endTime = new Date();
        //     await test.save();
        // }

        console.log(`✅ Auto-submitted test for student ${result.student}`);

    } catch (error) {
        console.error('❌ AutoSubmit failed:', error.message);
    }
};

router.post('/:id/start', auth, requireStudent, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        console.log(test);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        const durationMs = test.duration * 60 * 1000;
        const createdAtMs = new Date(test.createdAt).getTime();
        if (now - createdAtMs > durationMs) {
            return res.status(403).json({ message: 'test expired' });
        }

        // 🔒 Visibility rules
        if (test.status === 'draft' || test.status === 'ended') {
            return res.status(403).json({ message: 'Test not available' });
        }

        // if (test.type === 'teacher_controlled') {
        //     return res.status(403).json({ message: 'Test not live yet' });
        // }

        let result = await Result.findOne({
            test: test._id,
            student: req.user.id
        });

        if (result && !result.submittedAt) {
            const endTime = result.createdAt.getTime() + test.duration * 60 * 1000;

            if (Date.now() >= endTime) {
                autoSubmit(result);
            }
        }
        console.log("hii", result);


        // 🔁 Resume test
        if (result) {
            console.log("pagal");
            if (result.submittedAt) {
                console.log(result);
                return res.status(400).json({ message: 'Test already attempted' });
            }

            return res.json({
                testId: test._id,
                duration: test.duration,
                totalQuestions: test.questions.length,
                totalMarks: result.totalMarks,
                startTime: result.createdAt,
                isResumed: true,
                type: test.type
            });
        }

        // 🆕 First start
        const questions = await Question.find({
            _id: { $in: test.questions }
        });

        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

        result = new Result({
            test: test._id,
            student: req.user.id,
            totalMarks,
            status: 'started',
            lastSeenAt: new Date(),
            answers: test.questions.map(qId => ({
                question: qId
            }))
        });

        await result.save();

        res.json({
            testId: test._id,
            duration: test.duration,
            totalQuestions: test.questions.length,
            totalMarks,
            startTime: result.createdAt,
            type: test.type
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});


/* =====================================================
   SUBMIT TEST (STUDENT)
===================================================== */
router.post('/:id/submit', auth, requireStudent, async (req, res) => {
    try {
        const { answers, timeTaken, autoSubmitted = false } = req.body;

        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        const result = await Result.findOne({
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

        const evaluatedAnswers = await Promise.all(
            answers.map(async ans => {
                const question = await Question
                    .findById(ans.questionId)
                    .select('+correctAnswer');

                if (!question) return null;

                let isCorrect = false;

                if (question.questionType === 'fill_in_blank') {
                    isCorrect =
                        ans.textAnswer &&
                        question.correctAnswer &&
                        ans.textAnswer.trim().toLowerCase() ===
                        question.correctAnswer.trim().toLowerCase();
                } else {
                    isCorrect =
                        question.options[ans.selectedOption]?.isCorrect || false;
                }

                if (isCorrect) score += question.marks;

                return {
                    question: ans.questionId,
                    selectedOption: ans.selectedOption,
                    textAnswer: ans.textAnswer,
                    isCorrect
                };
            })
        );

        result.answers = evaluatedAnswers.filter(Boolean);
        result.score = score;
        result.status = 'submitted';
        result.percentage = (score / result.totalMarks) * 100;
        result.timeTaken = timeTaken;
        result.autoSubmitted = autoSubmitted;
        result.submittedAt = new Date();

        await result.save();

        // 🔥 Only self-paced tests auto-end
        // if (test.type === 'self_paced') {
        //     test.status = 'ended';
        //     test.endTime = new Date();
        //     await test.save();
        // }

        res.json({ message: 'Test submitted successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});
/* =====================================================
   UPDATE TEST (TEACHER – DRAFT ONLY)
===================================================== */
router.put('/:id', auth, requireTeacher, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test) return res.status(404).json({ message: 'Test not found' });

        if (test.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (test.status !== 'draft') {
            return res.status(400).json({ message: 'Cannot edit published test' });
        }

        const updated = await Test.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('questions');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/* =====================================================
   DELETE TEST
===================================================== */
router.delete('/:id', auth, requireTeacher, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        if (test.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Test.findByIdAndDelete(req.params.id);
        await Result.deleteMany({ test: req.params.id });

        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/* =====================================================
   PUBLISH TEST
===================================================== */
router.put('/:id/publish', auth, requireTeacher, async (req, res) => {
    try {
        console.log("hii");
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        if (test.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (test.status !== 'draft') {
            console.log("published");
            console.log(test);
            return res.status(400).json({ message: 'Test already published' });
        }
        test.status = 'published';

        await test.save();

        res.json({ message: 'Test published', test });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/* =====================================================
   START LIVE TEST (TEACHER CONTROLLED)
===================================================== */
router.put('/:id/start-live', auth, requireTeacher, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        if (test.type !== 'teacher_controlled') {
            return res.status(400).json({ message: 'Not a teacher-controlled test' });
        }

        test.status = 'live';
        test.startTime = new Date();
        test.currentQuestionIndex = 0;

        await test.save();

        res.json({ message: 'Test started', test });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/* =====================================================
   END TEST
===================================================== */
router.put('/:id/end', auth, requireTeacher, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        test.status = 'ended';
        test.endTime = new Date();
        await test.save();

        res.json({ message: 'Test ended' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
