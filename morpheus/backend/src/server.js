import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { env } from './config/env.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import tutorRouter from './routes/tutor.route.js';
import chatRouter from './routes/chat.route.js';
import adminRouter from './routes/admin.route.js';
import sessionRouter from './routes/session.route.js';
import subjectsRouter from './routes/subjects.route.js';
import connectionRouter from './routes/connection.route.js';
import reviewRouter from './routes/review.route.js';
import { getPublicTutorProfile } from './controller/user.controller.js';
import { setupSocket } from './socket/index.js';
import chatbotRouter from './routes/chatbot.route.js';
import communityRouter from './routes/community.route.js';



const __filename = fileURLToPath(import.meta.url);//These two lines are changed by Aniket wanave These lines are
const __dirname = path.dirname(__filename);       //Replaced in alternative of const __dirname = path.dirname(__filename);


const app = express();
const httpServer = createServer(app);

const io = setupSocket(httpServer);

app.set('io', io);

app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true, 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));


app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/connections', connectionRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/community', communityRouter);


app.get('/api/tutors/:tutorId', getPublicTutorProfile);

//const __dirname = path.dirname(__filename);
app.use('/call-test', express.static(path.join(__dirname, '../../test')));
app.get('/call-test', (_req, res) =>
    res.sendFile(path.join(__dirname, '../../test/videocall.html'))
);

app.use((err, _req, res, _next) => {
    console.error('[GlobalError]', err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || 'Internal server error',
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`🚀 Morpheus server running on http://localhost:${env.PORT}`);
});
