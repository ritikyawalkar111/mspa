import express from 'express';
import { enrollTeacher } from '../Controller/userController.js';
// import { auth } from '../middlewares/auth.js';
import { requireStudent, requireTeacher } from '../middlewares/auth.js';
const router = express.Router();
import User from '../models/User.js';
import Subject from '../models/subject.js';
import Enrollment from "../models/enrollmentSchema.js";
router.post('/enroll', requireStudent, enrollTeacher);
router.post('/request', requireStudent, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { code } = req.body;

        if (!code || code.length !== 4) {
            return res.status(400).json({ message: 'Invalid subject code' });
        }

        // Find subject by code
        const subject = await Subject.findOne({ code }).populate('teacher');

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        console.log("in subject")
        // Create enrollment (unique index handles duplicates)
        const exist = await Enrollment.findOne({
            student: studentId,
            subject: subject._id
        });
        
        if (exist) {
            console.log(exist);
            return res.status(400).json({
                msg: "already exist"
            })
        }
        const enrollment = await Enrollment.create({
            student: studentId,
            subject: subject._id
        });

        res.status(200).json({
            message: 'Enrollment request sent',
            enrollment
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: 'You have already requested/enrolled in this subject'
            });
        }

        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/accept', requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { enrollmentId } = req.body;
        console.log(enrollmentId)

        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('subject', 'name teacher code');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        if (enrollment.subject.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        enrollment.status = 'approved';
        await enrollment.save();

        res.status(200).json({
            message: 'Student accepted successfully'
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/reject', requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { enrollmentId } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('subject');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        if (enrollment.subject.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        enrollment.status = 'rejected';
        await enrollment.save();

        res.status(200).json({
            message: 'Student rejected'
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/pending', requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;

        const pendingEnrollments = await Enrollment.find({ status: 'pending' })
            .populate({
                path: 'subject',
                match: { teacher: teacherId },
                select: 'name'
            })
            .populate('student', 'name email rollNo');

        // remove null subjects (not teacher’s)
        const filtered = pendingEnrollments.filter(e => e.subject);

        res.status(200).json(filtered);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.get("/enrollments", requireStudent, async (req, res) => {
    try {
        const student = req.user.id;

        const requested = await Enrollment.find({
            student,
            status: "pending"
        }).populate({
            path: "subject",
            select: "name teacher",
            populate: {
                path: "teacher",
                select: "name"
            }
        });

        const enrolled = await Enrollment.find({
            student,
            status: "approved"
        }).populate({
            path: "subject",
            select: "name teacher",
            populate: {
                path: "teacher",
                select: "name"
            }
        });


        console.log("enrolled")
        return res.status(200).json({
            requested,
            enrolled
        });
    } catch (e) {
        return res.status(500).json({ msg: e.message });
    }
});

export default router;
