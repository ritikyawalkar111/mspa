import express from 'express';
import { enrollTeacher } from '../Controller/userController.js';
// import { auth } from '../middlewares/auth.js';
import { requireStudent, requireTeacher } from '../middlewares/auth.js';
const router = express.Router();
import User from '../models/User.js';
router.post('/enroll', requireStudent, enrollTeacher);
router.post('/request', requireStudent, async (req, res) => {
    try {
        console.log("aldskjfajk");

        const studentId = req.user.id;
        const { code } = req.body;
        const user = req.user;
        if (!code || code.length !== 4) {
            return res.status(400).json({ message: 'Invalid 4-digit code' });
        }

        const teacher = await User.findOne({ teacherCode: code, role: 'teacher' });
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can enroll' });
        }
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({ message: "Teacher not found" });
        }

        if (teacher.pendingStudents?.includes(studentId)) {
            return res.status(400).json({ message: "Request already sent" });
        }

        if (user.enrolledTeachers.includes(teacher._id)) {
            return res.status(401).json({ message: "already enrolled" });
        }
        console.log("aldskjfajk");
        teacher.pendingStudents = teacher.pendingStudents || [];
        teacher.pendingStudents.push(studentId);

        await teacher.save();
        res.status(200).json({ message: "Request sent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/accept", requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user._id;
        const { studentId } = req.body;

        const teacher = await User.findById(teacherId);
        const student = await User.findById(studentId);

        if (!teacher || teacher.role !== "teacher") {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!student || student.role !== "student") {
            return res.status(404).json({ message: "Student not found" });
        }

        // Remove from pending list
        teacher.pendingStudents = teacher.pendingStudents?.filter(
            (id) => id.toString() !== studentId
        );

        // Add teacher to student's enrolledTeachers
        if (!student.enrolledTeachers.includes(teacherId)) {
            student.enrolledTeachers.push(teacherId);
        }

        await teacher.save();
        await student.save();

        res.status(200).json({
            message: "Student accepted successfully",
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }

});

router.post("/reject", requireTeacher, async (req, res) => {
    const teacherId = req.user.id;
    const { studentId } = req.body;

    const teacher = await User.findById(teacherId);

    teacher.pendingStudents = teacher.pendingStudents.filter(
        (id) => id.toString() !== studentId
    );

    await teacher.save();

    res.json({ message: "Student rejected" });
});

// router.get("/pending", requireTeacher, async (req, res) => {
//     try {
//         const teacherId = req.user.id;

//         // Ensure teacher
//         const teacher = await User.findById(teacherId)
//             .populate("pendingStudents", "name email rollNo");

//         if (!teacher || teacher.role !== "teacher") {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         res.status(200).json({
//             pendingStudents: teacher.pendingStudents,
//         });
//     } catch (err) {
//         res.status(500).json({ message: "Server error" });
//     }
// });
export default router;
