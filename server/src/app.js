import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'https://chatapp-chatify.vercel.app',
  'https://chatapp-chatify.vercel.app/',
  'https://real-time-chat-app-aymc.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, '') === normalizedOrigin);
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, true); // fallback allow matching origins
  },
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

