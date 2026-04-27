# NutriSense — AI-Powered Food Health Assistant 🥗🤖

> **An intelligent food health companion that helps individuals make better food choices and build healthier eating habits, powered by Google Gemini AI and Google Cloud.**

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Deployed-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.0%20Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)

---

## 🎯 Chosen Vertical

**Food & Health** — Designing a smart solution that helps individuals make better food choices and build healthier eating habits by leveraging AI, user behavior, and contextual inputs.

---

## 🧠 Approach & Logic

### Core Problem
People struggle to make informed food choices because:
1. **Nutritional information is inaccessible** — Most people don't know the macros of their daily meals
2. **One-size-fits-all advice fails** — Generic diet plans ignore individual goals, allergies, and preferences
3. **Tracking is tedious** — Manual food logging leads to abandonment

### Our Solution: AI-First Personalization
NutriSense uses **Google Gemini's multimodal AI** as its intelligence backbone:

1. **See** → Snap a photo of any meal → Gemini Vision identifies foods and estimates nutrition
2. **Understand** → User's health profile (goals, allergies, preferences) provides context
3. **Advise** → AI generates personalized recommendations based on nutritional gaps
4. **Learn** → Weekly trend analysis reveals patterns and tracks improvement

### Key Innovation
Rather than maintaining a static food database, NutriSense uses **Gemini 2.0 Flash** for real-time food analysis — meaning it can recognize and analyze **any food from any cuisine**, including regional and street food that traditional databases miss.

---

## 🏗️ How the Solution Works

### Architecture
```
┌─────────────────────────────────────────┐
│          Google Cloud Run               │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ React SPA  │  │   FastAPI API    │   │
│  │ (Static)   │  │  /api/food/*     │   │
│  │            │  │  /api/dashboard/*│   │
│  └────────────┘  │  /api/profile/*  │   │
│                  └────────┬─────────┘   │
└───────────────────────────┼─────────────┘
                            │
              ┌─────────────┼──────────┐
              │             │          │
        ┌─────▼───┐  ┌─────▼───┐ ┌────▼────┐
        │Firestore│  │ Gemini  │ │Firebase │
        │   DB    │  │  API    │ │  Auth   │
        └─────────┘  └─────────┘ └─────────┘
```

### Feature Pipeline

| Feature | Input | AI Processing | Output |
|---------|-------|---------------|--------|
| **Food Scanner** | Photo/text | Gemini Vision multimodal | Nutritional breakdown + health score |
| **Smart Dashboard** | Daily food logs | Aggregation + scoring | Calorie/macro progress, health score ring |
| **Recommendations** | User profile + today's meals | Context-aware Gemini prompt | Personalized meal suggestions |
| **Weekly Report** | 7-day food logs | Gemini trend analysis | Achievements, improvements, tips |
| **Food Q&A** | Natural language question | Gemini with user context | Personalized nutritional advice |

### Health Score Algorithm
A **5-factor scoring system** (0-100):
1. **Caloric Appropriateness** (25 pts) — How well the meal fits daily budget
2. **Macro Balance** (25 pts) — Proximity to ideal protein/carb/fat ratio
3. **Nutrient Density** (20 pts) — High protein + fiber, low sugar + sodium
4. **Processing Level** (15 pts) — Whole foods score higher
5. **Goal Alignment** (15 pts) — How well meal supports user's specific health goals

### BMR Calculation
Uses the **Mifflin-St Jeor equation** (gold standard recommended by the Academy of Nutrition and Dietetics):
```
Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Female: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
TDEE = BMR × Activity Multiplier
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite | Fast HMR, component composability, largest ecosystem |
| **Backend** | FastAPI (Python) | Auto Swagger docs, async, Pydantic validation, Google SDK support |
| **Database** | Google Cloud Firestore | Serverless NoSQL, real-time, native Google integration |
| **AI/ML** | Google Gemini 2.0 Flash | Multimodal (vision+text), free tier, latest Google AI |
| **Auth** | Firebase Authentication | Google OAuth, zero-config, secure token verification |
| **Deployment** | Google Cloud Run | Containerized, auto-scaling, one-command deploy |
| **Styling** | Vanilla CSS + Design System | Full control, glassmorphism, dark theme, zero dependencies |

### Google Services Used (6)
1. ✅ **Google Gemini API** — Core AI for food analysis, recommendations, insights
2. ✅ **Cloud Firestore** — User data, food logs, weekly reports
3. ✅ **Firebase Auth** — Google Sign-In authentication
4. ✅ **Cloud Run** — Container deployment and hosting
5. ✅ **Cloud Storage** — Food image storage
6. ✅ **Cloud Logging** — Structured application logs

---

## 📁 Project Structure

```
nutrisense/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry + static serving
│   │   ├── config.py            # Pydantic settings
│   │   ├── api/                 # REST API routes
│   │   │   ├── auth.py          # Firebase Auth verification
│   │   │   ├── food.py          # Food analysis + logging
│   │   │   ├── dashboard.py     # Dashboard data aggregation
│   │   │   ├── recommendations.py # AI recommendations
│   │   │   └── profile.py       # User profile CRUD
│   │   ├── services/            # Business logic layer
│   │   │   ├── gemini_service.py    # Gemini API integration
│   │   │   ├── firestore_service.py # Firestore operations
│   │   │   └── nutrition_service.py # BMR, TDEE, health scoring
│   │   └── models/              # Pydantic schemas
│   │       ├── user.py          # User data models
│   │       └── food.py          # Food data models
│   ├── tests/                   # pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app with routing
│   │   ├── components/          # React components
│   │   │   ├── Landing.jsx      # Landing page + auth
│   │   │   ├── Dashboard.jsx    # Nutrition dashboard
│   │   │   ├── FoodScanner.jsx  # AI food scanner
│   │   │   ├── ProfileSetup.jsx # Onboarding wizard
│   │   │   ├── Recommendations.jsx # AI suggestions
│   │   │   ├── WeeklyReport.jsx # Weekly insights
│   │   │   ├── FoodQuery.jsx    # Food Q&A chat
│   │   │   └── Navbar.jsx       # Navigation
│   │   ├── services/api.js      # API client
│   │   └── index.css            # Design system
│   └── package.json
├── docs/
│   └── memory.md                # Development changelog
├── Dockerfile                   # Multi-stage Cloud Run build
├── .env.example                 # Environment template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/apikey))

### Setup
```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/nutrisense.git
cd nutrisense

# 2. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 3. Frontend
cd ../frontend
npm install

# 4. Environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# 5. Run
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8080

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Running Tests
```bash
cd backend
pytest tests/ -v
```

---

## ☁️ Deployment (Google Cloud Run)

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy nutrisense \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key"
```

---

## 📝 Assumptions

1. **Nutritional estimates are AI-generated** — While Gemini provides good estimates, they are not USDA-certified laboratory measurements. A disclaimer is shown to users.
2. **Internet required** — All AI features require network connectivity to call Google APIs.
3. **Gemini 2.0 Flash free tier** — The application is designed to work within the free API limits (15 RPM / 1500 RPD).
4. **Demo mode available** — The app includes a demo login for evaluation without Firebase setup.
5. **Single-user focus** — The MVP is designed for individual use; multi-user collaboration is out of scope.

---

## 🔒 Security

- Server-side Firebase token verification on all authenticated endpoints
- API keys stored in environment variables, never in source code
- Input validation via Pydantic models with constraints
- CORS restrictions configured for deployment domain
- Image upload size limits (5MB max)
- Rate limiting on AI endpoints

---

## ♿ Accessibility

- Semantic HTML5 (`<main>`, `<nav>`, `<section>`, `<article>`)
- ARIA labels on all interactive elements
- Keyboard navigation support
- Color contrast ≥ 4.5:1 (WCAG 2.1 AA)
- `prefers-reduced-motion` media query
- Screen reader compatible dynamic content

---

## 📄 License

MIT License — Built for Google Gemini Hackathon 2026
