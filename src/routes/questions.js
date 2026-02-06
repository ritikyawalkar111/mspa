import express from 'express';
import Question from '../models/Question.js';
import { auth, requireTeacher } from '../middlewares/auth.js';
import { validateQuestion } from '../middlewares/validation.js';

const router = express.Router();


import { upload } from '../middlewares/uploadMiddleware.js';

// Middleware to parse options if they are strings (from FormData)
const parseOptions = (req, res, next) => {
    if (req.body.options && typeof req.body.options === 'string') {
        try {
            req.body.options = JSON.parse(req.body.options);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid options format' });
        }
    }
    next();
};

router.post('/', auth, requireTeacher, upload.any(), parseOptions, validateQuestion, async (req, res) => {
    try {

        // Handle File Uploads
        // req.files is an array of files. We need to map them to the correct fields.
        // Frontend will send specific fieldnames: 'questionImage', 'optionResult_0', etc.

        let questionImageUrl = '';
        const files = req.files || [];

        // Find question image
        const questionFile = files.find(f => f.fieldname === 'questionImage');
        if (questionFile) {
            // Construct full URL (assuming server runs on same host/port for now, or relative path)
            // Use relative path for flexibility, frontend can prepend base URL if needed.
            // Or better: store full URL if we know the domain. For localhost:
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            questionImageUrl = `${baseUrl}/uploads/${questionFile.filename}`;
        }

        // Map option images
        if (req.body.options && Array.isArray(req.body.options)) {
            req.body.options = req.body.options.map((opt, index) => {
                const optionFile = files.find(f => f.fieldname === `optionImage_${index}`);
                let optionImageUrl = opt.image || ''; // Keep existing if any?

                if (optionFile) {
                    const baseUrl = `${req.protocol}://${req.get('host')}`;
                    optionImageUrl = `${baseUrl}/uploads/${optionFile.filename}`;
                }

                return {
                    ...opt,
                    image: optionImageUrl
                };
            });
        }

        const question = new Question({
            ...req.body,
            image: questionImageUrl || req.body.image, // Prefer uploaded file, fallback to body (if text)
            createdBy: req.user.id
        });

        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.get('/my-questions', auth, requireTeacher, async (req, res) => {
    try {
        const questions = await Question.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.get('/:id', auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }


        if (req.user.role === 'student') {
            const questionWithoutAnswers = {
                _id: question._id,
                questionText: question.questionText,
                questionType: question.questionType,
                marks: question.marks
            };

            if (question.questionType !== 'fill_in_blank') {
                questionWithoutAnswers.options = question.options.map(opt => ({ text: opt.text }));
            }

            return res.json(questionWithoutAnswers);
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.put('/:id', auth, requireTeacher, async (req, res) => {
    try {
        const question = await Question.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.delete('/:id', auth, requireTeacher, async (req, res) => {
    try {
        const question = await Question.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;