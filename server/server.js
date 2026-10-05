import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import analysisRoutes from './routes/analysisRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection with graceful fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodguard_ai';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000 // 3s timeout for fast fallback
    });
    console.log('[FoodGuard AI] MongoDB connected successfully at:', MONGODB_URI);
  } catch (error) {
    console.warn('[FoodGuard AI] MongoDB connection skipped/unavailable:', error.message);
    console.warn('[FoodGuard AI] Operating in-memory history mode.');
  }
};

connectDB();

// API Routes
app.use('/api', analysisRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'FoodGuard AI',
    tagline: 'Detect. Understand. Reduce.',
    mongoDB: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected (in-memory mode)',
    hasGeminiKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[FoodGuard AI Server Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌱 FoodGuard AI Server running on http://localhost:${PORT}`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
