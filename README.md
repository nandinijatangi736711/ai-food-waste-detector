# FoodGuard AI – AI-Based Food Waste Detection and Reduction System

> **Tagline:** Detect. Understand. Reduce.

FoodGuard AI is a full-stack web application that leverages multimodal artificial intelligence (Google Gemini Vision AI) to identify food waste from uploaded images, estimate quantities and carbon/water ecological footprints, classify waste types, and deliver actionable waste reduction recommendations.

---

## 🌟 Key Features

1. **AI-Powered Image Recognition & Analysis:**
   - Detects specific food items (e.g., Cooked Rice, Mixed Salad, Artisan Bread, Chicken Leftovers).
   - Categorizes waste into visual groups: 🍚 Cooked Food, 🥦 Vegetables, 🍎 Fruits, 🍞 Bakery, 🥛 Dairy, 🍗 Meat, 🥤 Other, 🗑️ Mixed Waste.
   - Classifies waste into 5 levels: Edible food, Partially edible, Inedible, Spoiled food, or Mixed food waste.
   - Estimates quantity ranges and weight in grams (clearly labeled as an AI estimate).
   - Provides AI Confidence Scores (%) with visual progress bars.

2. **Personalized Waste Reduction Suggestions:**
   - Delivers 3–5 practical storage, portioning, and recipe repurposing recommendations for identified items.

3. **Environmental Footprint Calculation:**
   - Estimates CO₂ greenhouse gas footprint (kg CO₂e).
   - Estimates virtual embedded water footprint (liters).
   - Estimates salvageable potential meal counts.

4. **Interactive Dashboard & Live Analytics:**
   - Summary statistics cards: Food Waste Detected, Meals Saved, CO₂ Impact, Scans Completed.
   - Visual charts powered by Recharts:
     - Doughnut Chart: Waste Category Distribution.
     - Bar Chart: Cumulative Waste Mass by Category.
     - Line Chart: Weekly Food Waste Trends.
     - Leaderboard: Most Commonly Wasted Foods.

5. **MongoDB Analysis History:**
   - Persists all past image analyses with timestamp, category, weight, and confidence.
   - Interactive Detail View Modal, search & category filtering, individual item deletion, and clear history functionality.

6. **Automatic Demo Mode & Offline Fallback:**
   - Runs out-of-the-box in **Demo Mode** with realistic sample profiles if no Gemini API key is configured.
   - Operates in-memory if MongoDB is not running locally.

---

## 🛠️ Technology Stack

- **Frontend:** React.js (v18), Vite, Tailwind CSS, Lucide React icons, Recharts, Axios.
- **Backend:** Node.js, Express.js, Multer (Memory Storage).
- **AI Engine:** Google Gemini Vision API (`@google/generative-ai`).
- **Database:** MongoDB (via Mongoose) + In-Memory Fallback.

---

## 📁 Project Architecture

```
foodguard-ai/
├── client/                      # Frontend React SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── CategoryCard.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   ├── AnalysisDetailModal.jsx
│   │   │   └── DemoBadge.jsx
│   │   ├── pages/               # Application Pages
│   │   │   ├── Home.jsx
│   │   │   ├── DetectWaste.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── About.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios API Client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Backend Express API Server
│   ├── models/
│   │   └── Analysis.js          # Mongoose Schema
│   ├── routes/
│   │   └── analysisRoutes.js    # Express Routes
│   ├── controllers/
│   │   └── analysisController.js# Route Controllers
│   ├── services/
│   │   └── geminiService.js     # Gemini Vision API & Demo Mode
│   ├── server.js                # Express Application Setup
│   ├── .env.example
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: Local MongoDB instance or MongoDB Atlas URI (If unavailable, server degrades gracefully to in-memory history).

---

### Step 1: Install Backend Dependencies & Start Server

```bash
# Navigate to server directory
cd server

# Install Node.js dependencies
npm install

# Start Express server
npm start
```
The backend server will launch at: `http://localhost:5000`

---

### Step 2: Install Frontend Dependencies & Start Client

Open a second terminal window:

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Run Vite development server
npm run dev
```
The frontend web application will launch at: `http://localhost:5173`

---

## ⚙️ Environment Configuration & AI API Setup

1. Locate `server/.env` (or copy from `server/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodguard_ai
GEMINI_API_KEY=your_gemini_api_key_here
```

2. **To enable live Gemini AI Vision scanning:**
   - Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
   - Replace `your_gemini_api_key_here` in `server/.env` with your actual API key.
   - Restart the backend server (`npm start`).

3. **Demo Mode:**
   - If `GEMINI_API_KEY` is empty or left as default, FoodGuard AI automatically runs in **Demo Mode**, utilizing curated sample analysis profiles so you can demonstrate all features instantly without an API key!

---

## 📡 Backend REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze` | Upload image (Base64 or multipart) & receive AI food waste analysis |
| `GET` | `/api/history` | Fetch all saved analysis history records |
| `DELETE` | `/api/history/:id` | Delete a specific analysis record by ID |
| `DELETE` | `/api/history` | Clear all analysis history |
| `GET` | `/api/analytics` | Retrieve aggregated analytics (category totals, weights, top foods) |
| `GET` | `/api/health` | System status & AI/DB health check |

---

## 🔮 Future Enhancements

- 📱 Progressive Web App (PWA) with offline caching.
- 🔔 Smart notification reminders for expiring pantry food items.
- 🥗 Automated leftover recipe generator using Gemini.
- 🏢 Enterprise kitchen waste monitoring dashboards.

---

## 📄 License

Created for educational, research, and environmental sustainability purposes. Built with ❤️ for zero food waste!
