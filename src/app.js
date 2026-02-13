import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import testRoutes from './routes/tests.js';
import resultRoutes from './routes/results.js';
import userRoutes from './routes/users.js';
import dash from "./routes/dashboard.js";
import { auth } from './middlewares/auth.js';
import User from './models/User.js';
const app = express();
const server = http.createServer(app);

/* 🔥 SOCKET.IO WITH CORS (THIS FIXES YOUR ERROR) */
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:8081",
            "http://192.168.44.70:8081",
            "http://10.73.47.192:8081",
            "https://mspa-1.onrender.com"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

/* ---------- EXPRESS MIDDLEWARE ---------- */
app.use(cors({
    origin: [
        "http://localhost:8081",
        "http://192.168.44.70:8081",
        "http://10.73.47.192:8081",
        "https://mspa-1.onrender.com"
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

console.log("starte");
/* ---------- ROUTES ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', auth, testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/user', auth, userRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api/dashboard", dash);

/* ---------- LIVE TEST STATE ---------- */
const liveTests = new Map();
// testId -> { currentQuestionIndex }

/* ---------- SOCKET AUTH ---------- */
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
});

/* ---------- SOCKET EVENTS ---------- */
io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);
    socket.on('join-test', ({ testId }) => {
        socket.join(testId);

        if (!liveTests.has(testId)) {
            liveTests.set(testId, { currentQuestionIndex: 0 });
        }

        const { currentQuestionIndex } = liveTests.get(testId);

        /* 🔥 SYNC QUESTION TO NEW JOINER */
        socket.emit('sync-question', { index: currentQuestionIndex });
    });

    socket.on('question-change', ({ testId, index }) => {
        if (!liveTests.has(testId)) return;

        liveTests.get(testId).currentQuestionIndex = index;

        io.to(testId).emit('sync-question', { index });
    });

    socket.on('end-test', ({ testId }) => {
        io.to(testId).emit('end-test');
        liveTests.delete(testId);
    });

    socket.on("join-test", async ({ testId }) => {
        console.log(socket.user.id, "user")
        const student = await User.findById(socket.user.id);
        console.log(student)
        socket.join(testId);

        io.to(testId).emit("student-joined", {
            _id: student.id,
            name: student.name,
            submitted: false
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected:', socket.id);
    });
});

export { app, io, server };
