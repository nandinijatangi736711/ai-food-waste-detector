import express from 'express';
import multer from 'multer';
import {
  analyzeImage,
  getHistory,
  deleteHistoryItem,
  clearHistory,
  getAnalytics
} from '../controllers/analysisController.js';

const router = express.Router();

// Multer memory storage configuration for file uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, etc.) are allowed!'), false);
    }
  }
});

// Image Analysis endpoint
router.post('/analyze', upload.single('image'), analyzeImage);

// History management endpoints
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistoryItem);
router.delete('/history', clearHistory);

// Dashboard analytics endpoint
router.get('/analytics', getAnalytics);

export default router;
