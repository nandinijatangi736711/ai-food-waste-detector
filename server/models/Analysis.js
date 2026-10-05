import mongoose from 'mongoose';

const environmentalImpactSchema = new mongoose.Schema({
  co2ImpactKg: { type: Number, required: true, default: 0 },
  waterImpactLiters: { type: Number, required: true, default: 0 },
  potentialMealsSaved: { type: Number, required: true, default: 0 }
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  foodName: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Cooked Food', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Other', 'Mixed Waste'],
    default: 'Cooked Food'
  },
  wasteClassification: { 
    type: String, 
    required: true, 
    enum: ['Edible food', 'Partially edible', 'Inedible', 'Spoiled food', 'Mixed food waste'],
    default: 'Edible food'
  },
  wasteLevel: { 
    type: String, 
    required: true, 
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  estimatedQuantity: { type: String, required: true, default: '250–350 g' },
  estimatedWeightGrams: { type: Number, required: true, default: 300 },
  confidenceScore: { type: Number, required: true, min: 0, max: 100, default: 90 },
  suggestions: [{ type: String, required: true }],
  environmentalImpact: { type: environmentalImpactSchema, required: true },
  imageData: { type: String }, // Base64 thumbnail or data URL
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', analysisSchema);
export default Analysis;
