# NutriSense — Development Memory Log

> This document tracks every change, decision, and implementation detail throughout the hackathon build.

---

## Project Overview
- **Name**: NutriSense — AI-Powered Food Health Assistant
- **Vertical**: Food & Health
- **Stack**: React 18 + Vite (frontend) | FastAPI (backend) | Cloud Firestore (DB) | Gemini 2.0 Flash (AI)
- **Google Services**: Gemini API, Firestore, Firebase Auth, Cloud Run, Cloud Storage, Cloud Logging

---

## Implementation Timeline

### Phase 1: Foundation (Completed)
**Timestamp**: Session Start

**What was done:**
1. Project structure created at `c:\Users\ASUS\Desktop\CS\Projects\nutrisense\`
2. Vite + React frontend initialized with `create-vite@latest`
3. FastAPI backend skeleton created with proper Python package structure
4. `.gitignore` configured to exclude node_modules, __pycache__, .venv (keeps repo < 1MB)
5. `.env.example` created with all required environment variables
6. `requirements.txt` pinned with all Python dependencies

**Why these choices:**
- **Vite over CRA**: 10x faster HMR, smaller bundle, better DX in time-constrained hackathon
- **FastAPI over Flask**: Auto Swagger docs (visible at /docs), Pydantic validation, async support
- **Pinned deps**: Reproducible builds = higher code quality score

---

### Phase 2: Backend Services (Completed)

**Files created:**
1. `backend/app/config.py` — Pydantic Settings class loading from env vars
2. `backend/app/main.py` — FastAPI app with lifespan context, CORS, router includes, health check, static file serving
3. `backend/app/services/gemini_service.py` — 5 core Gemini functions:
   - `analyze_food_image()` — Multimodal food photo analysis
   - `analyze_food_text()` — Text description analysis
   - `generate_recommendations()` — Context-aware meal suggestions
   - `generate_weekly_report()` — Weekly trend analysis
   - `answer_food_query()` — Natural language food Q&A
4. `backend/app/services/firestore_service.py` — Full CRUD: users, food_logs (sub-collection), daily summaries, weekly reports
5. `backend/app/services/nutrition_service.py` — Industry-standard calculations:
   - Mifflin-St Jeor BMR equation (ADA gold standard)
   - TDEE with 5 activity level multipliers
   - 5-factor health scoring algorithm (0-100)
   - Goal-based macro ratio targets

**Why these implementations:**
- **Mifflin-St Jeor**: Recommended by ADA over Harris-Benedict; more accurate for modern populations
- **5-factor health score**: Multi-dimensional scoring is more defensible than simple calorie counting
- **Firestore sub-collections**: Efficient date-range queries without loading entire user document
- **Structured JSON prompts**: Forces Gemini to return parseable responses; includes cleanup for markdown code blocks

---

### Phase 3: API Routes (Completed)

**Files created:**
1. `backend/app/api/auth.py` — Firebase token verification + demo login fallback
2. `backend/app/api/food.py` — Image analysis (multipart upload), text analysis, food log CRUD
3. `backend/app/api/dashboard.py` — Daily summary aggregation, weekly report with AI insights
4. `backend/app/api/recommendations.py` — Context-aware meal suggestions, food Q&A
5. `backend/app/api/profile.py` — Profile CRUD with auto-calculated BMR/TDEE/macro targets

**Key decisions:**
- **Demo mode**: All routes accept a simple Bearer token (uid) for hackathon demo; Firebase auth is secondary
- **Auto-calculate on profile update**: When user saves profile, BMR → TDEE → daily targets are computed and stored
- **Dual health score**: Gemini provides its score + our custom algorithm provides a secondary validated score

---

### Phase 4: Pydantic Models (Completed)

**Files created:**
1. `backend/app/models/user.py` — UserProfile, ProfileUpdateRequest, AuthTokenRequest with validation
2. `backend/app/models/food.py` — FoodItem, FoodAnalysisResponse, FoodLogRequest, DailySummary

**Why Pydantic models matter:**
- Self-documenting API (visible in Swagger UI at /docs)
- Input validation (age 10-120, weight 20-300, pattern matching for enums)
- Type safety throughout the codebase → higher code quality score

---

### Phase 5: Frontend Design System (Completed)

**Files created:**
1. `frontend/src/index.css` — Complete design system with:
   - CSS custom properties (colors, spacing, typography, shadows)
   - Dark theme with glassmorphism (backdrop-filter: blur(16px))
   - Color palette: Deep navy (#0a0f1a), Green accent (#4ADE80), Cyan (#22D3EE)
   - Button system (primary gradient, secondary glass, ghost)
   - Input system with focus glow
   - Progress bars with color coding
   - Tags/badges for allergens, meal types
   - 6 keyframe animations (fadeIn, slideUp, pulse, spin, shimmer, glow)
   - Responsive breakpoints (768px, 480px)
   - prefers-reduced-motion support (WCAG compliance)
   - Custom scrollbar styling

**Why this design:**
- **Dark mode primary**: Health/fitness apps overwhelmingly use dark themes (Fitbit, MyFitnessPal Pro)
- **Glassmorphism**: Premium aesthetic that differentiates from generic card layouts
- **Green accent**: Subconscious association with health, freshness, nature
- **Inter font**: Most readable sans-serif for data-heavy dashboards

---

### Phase 6: React Components (Completed)

**Components created (7 total):**

1. **App.jsx** — Main app with client-side routing, auth state, loading screen
2. **Landing.jsx + Landing.css** — Hero section with gradient orbs, feature cards, Google Services showcase, demo login
3. **Navbar.jsx + Navbar.css** — Glassmorphism nav with active states, responsive (icons only on mobile)
4. **Dashboard.jsx + Dashboard.css** — Health score SVG ring, calorie progress, macro bars, meal timeline, quick actions
5. **FoodScanner.jsx + FoodScanner.css** — Image upload dropzone, text input mode, analyzing overlay, results with food items/alternatives/allergens
6. **ProfileSetup.jsx + ProfileSetup.css** — 3-step onboarding wizard (body stats → goals → diet/allergies) with progress indicator
7. **Recommendations.jsx + Recommendations.css** — AI meal suggestion cards with nutritional gaps, prep time
8. **WeeklyReport.jsx + WeeklyReport.css** — Stats grid, AI insights (achievements/improvements/tips), macro breakdown
9. **FoodQuery.jsx + FoodQuery.css** — Chat-style Q&A with suggested questions, typing indicator, key facts display

**API service:**
- `frontend/src/services/api.js` — Centralized fetch wrapper with auth headers, error handling, all endpoint functions

**Key frontend decisions:**
- **No routing library**: Simple state-based routing saves 30KB bundle and is sufficient for 7 pages
- **No chart library**: Custom SVG ring + CSS progress bars save 50KB+ (Chart.js, Recharts)
- **Local fallbacks**: Every component handles API failures gracefully with local defaults
- **Demo mode**: Auto-creates a local demo user if backend is unavailable

---

### Phase 7: Testing & Deployment (Completed)

1. **test_nutrition.py** — 15 pytest test cases covering BMR, TDEE, daily targets, health scoring
2. **Dockerfile** — Multi-stage build (Node for React → Python slim for backend)
3. **README.md** — Competition-format with all required sections

---

## Architecture Decisions Record

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Frontend framework | React + Vite | Next.js, Vue | Fastest build, largest ecosystem, no SSR needed |
| Backend framework | FastAPI | Flask, Express | Auto-docs, async, Pydantic, Python Google SDKs |
| Database | Firestore | PostgreSQL, MongoDB | Serverless, Google service, real-time, free tier |
| AI | Gemini 2.0 Flash | GPT-4, custom model | Google service, multimodal, free tier, latest |
| Auth | Firebase Auth | Auth0, Custom JWT | Google service, zero-config Google Sign-In |
| Deployment | Cloud Run | App Engine, GKE | Single container, auto-scale, simple CLI deploy |
| Styling | Vanilla CSS | Tailwind, Styled-Components | Full control, zero deps, smaller bundle |
| State management | useState/useEffect | Redux, Zustand | Sufficient for 7-page app, zero bundle cost |
| BMR formula | Mifflin-St Jeor | Harris-Benedict | ADA-recommended, more accurate for modern populations |
| Health scoring | Multi-factor (5) | Single metric | More nuanced, defensible, goal-aware |

---

## What Was NOT Implemented (Time Constraints)
- [ ] Barcode scanning (would need @nickvision/barcode library)
- [ ] PWA / offline mode
- [ ] Social sharing / streaks gamification
- [ ] Multi-language support
- [ ] Cloud Storage image upload (images analyzed but not persisted)
- [ ] CI/CD pipeline
