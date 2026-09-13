import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'https://real-time-chat-app-aymc.vercel.app', 'https://real-time-chat-app-aymc.vercel.app/'].filter(Boolean),
  credentials: true,
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Backend API Server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

export default app;

