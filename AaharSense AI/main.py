"""
AaharSense AI — FastAPI Backend (single file)
Calls Google Gemini directly. Serves the built React frontend as static files.
"""

import json
import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ─── Gemini Setup ─────────────────────────────────────────────────────────────
from google import genai
from google.genai import types

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
client: genai.Client | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set.")
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("[OK] AaharSense AI started — Gemini connected.")
    yield
    print("[STOP] AaharSense AI shutting down.")


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AaharSense AI API",
    description="Indian Food Safety & Nutrition Analysis powered by Gemini",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Analysis Schema ──────────────────────────────────────────────────────────
_SCHEMA = """{
  "foods": [
    {
      "name": "Food item name",
      "quantity": "1 cup / 200g",
      "calories": 250,
      "protein_g": 12.5,
      "carbs_g": 30.0,
      "fat_g": 8.0,
      "fiber_g": 3.0,
      "adulteration_risk": "low",
      "potential_adulterants": ["e.g. metanil yellow"]
    }
  ],
  "total_calories": 500,
  "total_protein_g": 25.0,
  "total_carbs_g": 60.0,
  "total_fat_g": 16.0,
  "health_score": 72,
  "safety_score": 85,
  "health_summary": "Brief clinical assessment",
  "adulteration_check": "Detailed adulteration report for Indian food context",
  "safety_verdict": "SAFE",
  "alternatives": ["Healthier swap 1"],
  "allergens_detected": ["dairy"],
  "clinical_notes": "Extra clinical notes"
}"""

_SYSTEM_PROMPT = (
    "You are 'AaharSense AI', an expert Indian Food Safety and Nutrition AI.\n"
    "Analyze the food for:\n"
    "1. Nutritional profile (calories, macros, fiber per item)\n"
    "2. Adulteration risks common in India (metanil yellow in turmeric, chalk in milk, saw dust in spices, water in oil, etc)\n"
    "3. Health Score 0-100 (nutrient density, GI, processing level)\n"
    "4. Safety Score 0-100 (deduct heavily for adulteration risks)\n"
    "5. Safety Verdict: exactly one of SAFE | PROCEED WITH CAUTION | UNSAFE\n"
    "Respond ONLY with valid JSON matching the schema exactly, no markdown, no code fences."
)


def _clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    if text.lower().startswith("json"):
        text = text[4:]
    return text.strip()


# ─── Schemas ──────────────────────────────────────────────────────────────────
class TextRequest(BaseModel):
    description: str


# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "AaharSense AI"}


@app.post("/api/analyze-text")
async def analyze_text(req: TextRequest):
    if not client:
        raise HTTPException(status_code=503, detail="Gemini not initialized")

    prompt = f"{_SYSTEM_PROMPT}\n\nFood description: \"{req.description}\"\n\nJSON schema:\n{_SCHEMA}"
    try:
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        data = json.loads(_clean_json(response.text))
        return {"analysis": data}
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Failed to parse Gemini response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not client:
        raise HTTPException(status_code=503, detail="Gemini not initialized")

    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"
    prompt = f"{_SYSTEM_PROMPT}\n\nAnalyze the food shown in the image.\n\nJSON schema:\n{_SCHEMA}"

    try:
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, image_part],
        )
        data = json.loads(_clean_json(response.text))
        return {"analysis": data}
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Failed to parse Gemini response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Serve React Frontend ─────────────────────────────────────────────────────
STATIC_DIR = Path(__file__).parent / "frontend" / "dist"

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react(full_path: str):
        return FileResponse(str(STATIC_DIR / "index.html"))
