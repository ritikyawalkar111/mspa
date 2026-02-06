import express from 'express';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import { auth, requireTeacher, requireStudent } from '../middlewares/auth.js';

const router = express.Router();

/* =====================================================
   GET ALL RESULTS FOR A TEST (TEACHER)
===================================================== */
router.get('/test/:testId', auth, requireTeacher, async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Ownership check
        if (test.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const results = await Result.find({ test: test._id })
            .populate('student', 'name email')
            .populate('test', 'title type status')
            .sort({ submittedAt: -1 });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/* =====================================================
   GET MY RESULTS (STUDENT)
===================================================== */
router.get('/my-results', auth, requireStudent, async (req, res) => {
    try {
        const results = await Result.find({
            student: req.user.id,
            submittedAt: { $ne: null }
        })
            .populate({
                path: 'test',
                select: 'title description duration type status createdBy startTime endTime',
                populate: {
                    path: 'createdBy',
                    select: 'name'
                }
            })
            .select('-answers') // hide answers list view
            .sort({ submittedAt: -1 });


        
        console.log(results);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/* =====================================================
   GET SINGLE RESULT DETAILS
===================================================== */
router.get('/:id', auth, async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate({
                path: 'test',
                select: 'title description duration type status createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'name'
                }
            })
            .populate('student', 'name email')
            .populate('answers.question');

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        // 🔐 Authorization
        if (
            req.user.role === 'student' &&
            result.student._id.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (
            req.user.role === 'teacher' &&
            result.test.createdBy._id.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
