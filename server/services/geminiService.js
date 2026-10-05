import { GoogleGenerativeAI } from '@google/generative-ai';

// Predefined demo profiles for demo mode or fallbacks
const DEMO_PROFILES = [
  {
    foodName: "Cooked Rice",
    category: "Cooked Food",
    wasteClassification: "Edible food",
    wasteLevel: "Medium",
    estimatedQuantity: "250–350 g",
    estimatedWeightGrams: 300,
    confidenceScore: 94,
    suggestions: [
      "Store leftover cooked rice in an airtight container in the refrigerator within 2 hours.",
      "Transform leftover rice into delicious fried rice or lemon rice for your next meal.",
      "Measure portion sizes before cooking to avoid surplus rice generation.",
      "Freeze extra rice in meal-sized portions for up to 1 month."
    ],
    environmentalImpact: {
      co2ImpactKg: 0.85,
      waterImpactLiters: 750,
      potentialMealsSaved: 1
    }
  },
  {
    foodName: "Mixed Fresh Vegetables",
    category: "Vegetables",
    wasteClassification: "Partially edible",
    wasteLevel: "Low",
    estimatedQuantity: "150–250 g",
    estimatedWeightGrams: 200,
    confidenceScore: 91,
    suggestions: [
      "Use vegetable trimmings and peels to prepare nutritious homemade vegetable broth.",
      "Store leafy greens wrapped in damp paper towels to double their crisp freshness.",
      "Sauté softening vegetables into stir-fries, omelets, or hearty vegetable soups.",
      "Pickle surplus sliced vegetables to extend shelf life for up to 3 weeks."
    ],
    environmentalImpact: {
      co2ImpactKg: 0.40,
      waterImpactLiters: 180,
      potentialMealsSaved: 1
    }
  },
  {
    foodName: "Artisan Bakery Bread",
    category: "Bakery",
    wasteClassification: "Edible food",
    wasteLevel: "Medium",
    estimatedQuantity: "200–300 g",
    estimatedWeightGrams: 250,
    confidenceScore: 96,
    suggestions: [
      "Blend slightly stale bread into garlic breadcrumbs for casseroles and toppings.",
      "Cube and bake with olive oil & herbs to craft crunchy homemade salad croutons.",
      "Make classic French toast or savory bread pudding with dry slices.",
      "Slice fresh loaf and freeze half immediately to maintain bakery fresh texture."
    ],
    environmentalImpact: {
      co2ImpactKg: 0.55,
      waterImpactLiters: 400,
      potentialMealsSaved: 1
    }
  },
  {
    foodName: "Overripe Fresh Bananas",
    category: "Fruits",
    wasteClassification: "Edible food",
    wasteLevel: "Medium",
    estimatedQuantity: "300–400 g",
    estimatedWeightGrams: 350,
    confidenceScore: 93,
    suggestions: [
      "Bake ripe spotty bananas into moist banana bread or morning muffins.",
      "Peel, slice, and freeze in ziplock bags for instant creamy smoothie bases.",
      "Mash onto whole-grain toast with peanut butter for a high-energy snack.",
      "Store bananas away from apples to slow ethylene gas ripening process."
    ],
    environmentalImpact: {
      co2ImpactKg: 0.48,
      waterImpactLiters: 320,
      potentialMealsSaved: 2
    }
  },
  {
    foodName: "Grilled Chicken Leftovers",
    category: "Meat",
    wasteClassification: "Edible food",
    wasteLevel: "High",
    estimatedQuantity: "350–450 g",
    estimatedWeightGrams: 400,
    confidenceScore: 89,
    suggestions: [
      "Shred leftover chicken for chicken wraps, tacos, or chicken salad sandwiches.",
      "Simmer bones and remaining meat into rich, collagen-packed chicken soup.",
      "Refrigerate leftovers promptly below 4°C (40°F) and consume within 3 days.",
      "Adjust meat portion sizes per person before cooking to prevent excess."
    ],
    environmentalImpact: {
      co2ImpactKg: 2.60,
      waterImpactLiters: 1700,
      potentialMealsSaved: 2
    }
  },
  {
    foodName: "Mixed Plate Food Waste",
    category: "Mixed Waste",
    wasteClassification: "Mixed food waste",
    wasteLevel: "High",
    estimatedQuantity: "400–500 g",
    estimatedWeightGrams: 450,
    confidenceScore: 88,
    suggestions: [
      "Practice self-service buffeting or serve smaller initial portions.",
      "Separate edible leftovers before plate scraping for easy remaking.",
      "Compost non-salvageable organic scraps to enrich garden soil.",
      "Keep a food waste diary to identify items most frequently discarded."
    ],
    environmentalImpact: {
      co2ImpactKg: 1.45,
      waterImpactLiters: 1100,
      potentialMealsSaved: 2
    }
  }
];

/**
 * Gets demo analysis results (used when no API key is provided or on AI failure)
 */
export function getDemoAnalysis(imageHint = "") {
  // Pick profile based on index or hash
  let selected = DEMO_PROFILES[Math.floor(Math.random() * DEMO_PROFILES.length)];
  return {
    ...selected,
    isDemo: true
  };
}

/**
 * Analyzes image using Google Gemini Vision API
 * @param {string} base64Image - Base64 data string (with or without data URI prefix)
 * @param {string} mimeType - Image mime type e.g. 'image/jpeg'
 */
export async function analyzeFoodWasteWithGemini(base64Image, mimeType = 'image/jpeg') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    console.log('[FoodGuard AI] No Gemini API key provided. Using Demo Mode analysis.');
    return getDemoAnalysis();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Clean base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg'
      }
    };

    const prompt = `You are FoodGuard AI, an expert computer vision system for food waste identification, quantification, classification, and waste reduction.
Analyze the provided image carefully and identify any food waste, leftover food, or food item present.

Respond ONLY with a valid JSON object strictly matching this schema format (no markdown formatting, no code blocks):
{
  "foodName": "<Specific identified food item, e.g. Cooked Rice, Mixed Salad, White Bread Slices, Rotten Tomatoes>",
  "category": "<Must be exactly one of: 'Cooked Food', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Other', 'Mixed Waste'>",
  "wasteClassification": "<Must be exactly one of: 'Edible food', 'Partially edible', 'Inedible', 'Spoiled food', 'Mixed food waste'>",
  "wasteLevel": "<Must be exactly one of: 'Low', 'Medium', 'High'>",
  "estimatedQuantity": "<String estimate range, e.g. '250–350 g' or '100–150 g'>",
  "estimatedWeightGrams": <Numeric estimate of weight in grams, e.g. 300>,
  "confidenceScore": <Numeric confidence percentage between 70 and 99, e.g. 92>,
  "suggestions": [
    "<Practical recommendation 1>",
    "<Practical recommendation 2>",
    "<Practical recommendation 3>",
    "<Practical recommendation 4>"
  ],
  "environmentalImpact": {
    "co2ImpactKg": <Numeric estimated CO2 equivalent in kg, e.g. 0.75>,
    "waterImpactLiters": <Numeric estimated virtual water impact in liters, e.g. 600>,
    "potentialMealsSaved": <Numeric estimated meal count, e.g. 1>
  }
}

Ensure all numerical values are realistic numbers, suggestions are actionable and encouraging, and category matches the exact enum string.`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean potential markdown json wrappers
    const jsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    return {
      foodName: parsed.foodName || 'Identified Food Item',
      category: ['Cooked Food', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Other', 'Mixed Waste'].includes(parsed.category) ? parsed.category : 'Cooked Food',
      wasteClassification: parsed.wasteClassification || 'Edible food',
      wasteLevel: parsed.wasteLevel || 'Medium',
      estimatedQuantity: parsed.estimatedQuantity || `${parsed.estimatedWeightGrams || 300} g`,
      estimatedWeightGrams: Number(parsed.estimatedWeightGrams) || 300,
      confidenceScore: Number(parsed.confidenceScore) || 90,
      suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : [
        "Store leftovers promptly in airtight containers.",
        "Repurpose leftovers into creative recipes.",
        "Adjust portion sizes to reduce future waste."
      ],
      environmentalImpact: {
        co2ImpactKg: Number(parsed.environmentalImpact?.co2ImpactKg) || 0.8,
        waterImpactLiters: Number(parsed.environmentalImpact?.waterImpactLiters) || 500,
        potentialMealsSaved: Number(parsed.environmentalImpact?.potentialMealsSaved) || 1
      },
      isDemo: false
    };
  } catch (error) {
    console.error('[FoodGuard AI] Gemini API Error / Fallback to Demo Mode:', error.message);
    return getDemoAnalysis();
  }
}
