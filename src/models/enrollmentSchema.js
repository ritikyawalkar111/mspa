// models/enrollmentModel.js
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    enrolledAt: {
        type: Date,
        default: Date.now
    }
});

// 🚫 prevent duplicate enrollments
enrollmentSchema.index(
    { student: 1, subject: 1 },
    { unique: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
