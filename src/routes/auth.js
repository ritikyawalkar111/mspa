import express from 'express';
import { getMe, login, logout, refreshToken } from '../Controller/authController.js';
import { Register_verifyOtp, sendOtp } from '../Controller/register.controller.js';
import { auth } from '../middlewares/auth.js';
const router = express.Router();
router.post('/sendOtp', sendOtp);
router.post('/register', Register_verifyOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', auth, getMe);

export default router;