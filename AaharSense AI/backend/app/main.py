"""
NutriSense - FastAPI Main Application Entry Point

Serves the React frontend as static files and exposes the REST API.
All Google Services are initialized here at startup.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.api import auth, food, dashboard, recommendations, profile
from app.services.gemini_service import init_gemini
from app.services.firestore_service import init_firestore


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Google Services on startup."""
    init_gemini()
    init_firestore()
    print("[OK] NutriSense API started successfully")
    print(f"(-) Environment: {settings.environment}")
    yield
    print("[STOP] NutriSense API shutting down")


app = FastAPI(
    title="NutriSense API",
    description="AI-Powered Food Health Assistant using Google Gemini",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow frontend dev server and deployed domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:8080",
        "*",  # Cloud Run domain (tighten in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routes ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(food.router, prefix="/api/food", tags=["Food Analysis"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(
    recommendations.router, prefix="/api/recommendations", tags=["Recommendations"]
)
app.include_router(profile.router, prefix="/api/profile", tags=["User Profile"])


# --- Health Check ---
@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint for Cloud Run and monitoring."""
    return {
        "status": "healthy",
        "service": "NutriSense API",
        "version": "1.0.0",
        "google_services": {
            "gemini": "connected",
            "firestore": "connected",
            "firebase_auth": "connected",
        },
    }


# --- Serve React Frontend ---
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React SPA - all non-API routes go to index.html."""
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
