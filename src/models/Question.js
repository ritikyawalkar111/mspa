import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    options: [{
        text: {
            type: String,
            required: true
        },
        image: {
            type: String,
            trim: true
        },
        isCorrect: {
            type: Boolean,
            default: false
        }
    }],
    questionType: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'fill_in_blank'],
        default: 'multiple_choice'
    },
    correctAnswer: {
        type: String,
        trim: true
    },
    marks: {
        type: Number,
        default: 1
    },
    negativeMarks: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        trim: true
    },
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

export default mongoose.model('Question', questionSchema);