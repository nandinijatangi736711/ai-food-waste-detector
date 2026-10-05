import Analysis from '../models/Analysis.js';
import { analyzeFoodWasteWithGemini, getDemoAnalysis } from '../services/geminiService.js';

// In-memory array fallback if MongoDB connection is unavailable
let inMemoryHistory = [
  {
    _id: "demo-sample-1",
    foodName: "Cooked Rice",
    category: "Cooked Food",
    wasteClassification: "Edible food",
    wasteLevel: "Medium",
    estimatedQuantity: "250–350 g",
    estimatedWeightGrams: 300,
    confidenceScore: 94,
    suggestions: [
      "Store leftover cooked rice in an airtight container in the refrigerator.",
      "Transform leftover rice into fried rice for your next meal.",
      "Prepare smaller portions next time."
    ],
    environmentalImpact: {
      co2ImpactKg: 0.85,
      waterImpactLiters: 750,
      potentialMealsSaved: 1
    },
    isDemo: true,
    createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
  },
  {
    _id: "demo-sample-2",
    foodName: "Mixed Fresh Vegetables",
    category: "Vegetables",
    wasteClassification: "Partially edible",
    wasteLevel: "Low",
    estimatedQuantity: "150–250 g",
    estimatedWeightGrams: 200,
    confidenceScore: 91,
    suggestions: [
      "Use vegetable trimmings to prepare broth.",
      "Store leafy greens wrapped in damp paper towels.",
      "Sauté softening vegetables into stir-fries."
    ],
    environmentalImpact: {
      co2ImpactKg: 0.40,
      waterImpactLiters: 180,
      potentialMealsSaved: 1
    },
    isDemo: true,
    createdAt: new Date(Date.now() - 3600000 * 24) // 1 day ago
  }
];

export const isMongoConnected = () => {
  return Analysis.db && Analysis.db.readyState === 1;
};

/**
 * Analyze an uploaded food waste image
 */
export const analyzeImage = async (req, res) => {
  try {
    let base64Image = '';
    let mimeType = 'image/jpeg';

    if (req.file) {
      base64Image = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body.image) {
      base64Image = req.body.image;
      const match = base64Image.match(/^data:(image\/\w+);base64,/);
      if (match) {
        mimeType = match[1];
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'No image provided. Please select or drag a valid food image.' 
      });
    }

    console.log('[FoodGuard AI] Processing image analysis request...');
    
    // Perform AI analysis or demo fallback
    const result = await analyzeFoodWasteWithGemini(base64Image, mimeType);

    // Prepare thumbnail preview (truncated for lighter DB storage)
    const thumbnail = base64Image.length < 200000 ? base64Image : undefined;

    const analysisData = {
      ...result,
      imageData: thumbnail,
      createdAt: new Date()
    };

    let savedRecord;

    if (isMongoConnected()) {
      try {
        savedRecord = await Analysis.create(analysisData);
      } catch (dbErr) {
        console.warn('[FoodGuard AI] MongoDB save warning, utilizing fallback:', dbErr.message);
        savedRecord = { ...analysisData, _id: `mem-${Date.now()}` };
        inMemoryHistory.unshift(savedRecord);
      }
    } else {
      savedRecord = { ...analysisData, _id: `mem-${Date.now()}` };
      inMemoryHistory.unshift(savedRecord);
    }

    return res.status(200).json({
      success: true,
      data: savedRecord,
      message: savedRecord.isDemo 
        ? 'Analysis completed in Demo Mode. (Add GEMINI_API_KEY in server/.env for live AI analysis).'
        : 'AI Food Waste Analysis successful!'
    });
  } catch (error) {
    console.error('[FoodGuard AI] Analysis Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to analyze this image. Please try another clear food image.',
      error: error.message
    });
  }
};

/**
 * Get analysis history
 */
export const getHistory = async (req, res) => {
  try {
    let history = [];
    if (isMongoConnected()) {
      history = await Analysis.find().sort({ createdAt: -1 });
    } else {
      history = inMemoryHistory;
    }
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
      isMongoConnected: isMongoConnected()
    });
  } catch (error) {
    console.error('[FoodGuard AI] Fetch History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis history.',
      data: inMemoryHistory
    });
  }
};

/**
 * Delete a specific analysis history item
 */
export const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Analysis.findByIdAndDelete(id);
    }
    inMemoryHistory = inMemoryHistory.filter(item => String(item._id) !== String(id));
    
    return res.status(200).json({
      success: true,
      message: 'Analysis record deleted successfully.'
    });
  } catch (error) {
    console.error('[FoodGuard AI] Delete History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete record.'
    });
  }
};

/**
 * Clear all history
 */
export const clearHistory = async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Analysis.deleteMany({});
    }
    inMemoryHistory = [];
    
    return res.status(200).json({
      success: true,
      message: 'Analysis history cleared successfully.'
    });
  } catch (error) {
    console.error('[FoodGuard AI] Clear History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear history.'
    });
  }
};

/**
 * Get dashboard analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    let dataset = [];
    if (isMongoConnected()) {
      dataset = await Analysis.find();
    } else {
      dataset = inMemoryHistory;
    }

    const totalAnalyses = dataset.length;
    let totalWeightGrams = 0;
    let totalCo2Kg = 0;
    let totalWaterL = 0;
    let totalMealsSaved = 0;

    const categoryDistribution = {
      'Cooked Food': 0,
      'Vegetables': 0,
      'Fruits': 0,
      'Bakery': 0,
      'Dairy': 0,
      'Meat': 0,
      'Other': 0,
      'Mixed Waste': 0
    };

    const foodNameCounts = {};

    dataset.forEach(item => {
      totalWeightGrams += item.estimatedWeightGrams || 300;
      totalCo2Kg += item.environmentalImpact?.co2ImpactKg || 0.8;
      totalWaterL += item.environmentalImpact?.waterImpactLiters || 500;
      totalMealsSaved += item.environmentalImpact?.potentialMealsSaved || 1;

      if (categoryDistribution[item.category] !== undefined) {
        categoryDistribution[item.category] += 1;
      } else {
        categoryDistribution['Other'] += 1;
      }

      const name = item.foodName || 'Unknown Food';
      foodNameCounts[name] = (foodNameCounts[name] || 0) + 1;
    });

    const topWastedFoods = Object.entries(foodNameCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        totalAnalyses,
        totalWeightKg: (totalWeightGrams / 1000).toFixed(2),
        totalCo2Kg: totalCo2Kg.toFixed(2),
        totalWaterL: Math.round(totalWaterL),
        totalMealsSaved,
        categoryDistribution,
        topWastedFoods
      }
    });
  } catch (error) {
    console.error('[FoodGuard AI] Analytics Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute analytics.'
    });
  }
};
