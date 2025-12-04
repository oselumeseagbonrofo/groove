import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import playlistRoutes from './routes/playlists.js';
import playbackRoutes from './routes/playback.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimitMiddleware } from './middleware/rateLimitHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting middleware - detects and handles 429 responses
// Requirements: 7.5
app.use('/api', rateLimitMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Groove backend is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/playback', playbackRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handling middleware - logs to Supabase and returns appropriate responses
// Requirements: 7.3
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Groove backend server running on port ${PORT}`);
});

export default app;
