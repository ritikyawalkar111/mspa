import mongoose from "mongoose";
const subjects = [
    'Physics', 'Chemistry', 'Mathematics', 'Biology',
    'Computer Science', 'DBMS', 'Operating Systems',
    'C', 'C++', 'Java', 'Python', 'JavaScript',
    'React', 'Node.js', 'MongoDB',
    'Economics', 'Management', 'English'
];

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: subjects,
        required: true,
        trim: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    code: {
        type: String,
        unique: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🔒 key business rule
// subjectSchema.index({ name: 1, teacher: 1 }, { unique: true });

export default mongoose.model("Subject", subjectSchema);
