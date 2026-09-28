import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import authRouter from './auth.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://lkerp.sheetapp.store'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Mount routes for both with and without /api prefix (for Vercel serverless rewrites resilience)
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

export default app;
