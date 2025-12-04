import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import playlistRoutes from './routes/playlists.js';
import playbackRoutes from './routes/playback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Groove backend is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/playback', playbackRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code,
      retryable: err.retryable || false
    }
  });
});

app.listen(PORT, () => {
  console.log(`Groove backend server running on port ${PORT}`);
});

export default app;
