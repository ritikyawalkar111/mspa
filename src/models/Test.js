
import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],

    duration: {
        type: Number, // minutes
        required: true
    },

    // 🔥 NEW FIELD
    type: {
        type: String,
        enum: ['teacher_controlled', 'self_paced'],
        default: 'teacher_controlled'
    },

    status: {
        type: String,
        enum: ['draft', 'published', 'live', 'ended'],
        default: 'draft'
    },

    currentQuestionIndex: {
        type: Number,
        default: 0
    },

    startTime: Date,
    endTime: Date,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Test', testSchema);
