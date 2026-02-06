import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        selectedOption: Number,
        textAnswer: String,
        isCorrect: Boolean
    }],
    status: {
        type: String,
        enum: ['started', 'submitted', 'abandoned'],
        default: 'started'
    },
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    },
    timeTaken: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    autoSubmitted: {
        type: Boolean,
        default: false
    }
});


// Ensure one student can only have one result per test
resultSchema.index({ test: 1, student: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);