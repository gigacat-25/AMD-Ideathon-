"""
Food API Routes - Image analysis, text analysis, and food logging.

Core endpoints for the NutriSense food intelligence pipeline.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Header
from typing import Optional

from app.models.food import FoodLogRequest, FoodTextRequest
from app.services.gemini_service import analyze_food_image, analyze_food_text
from app.services.firestore_service import log_food, get_food_logs, delete_food_log
from app.services.nutrition_service import calculate_health_score

router = APIRouter()


def _get_uid(authorization: Optional[str]) -> str:
    """Extract user ID from auth header or use demo user."""
    # In production, verify Firebase token here
    # For hackathon demo, accept uid directly or default to demo
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "").strip()
    return "demo_user_001"


@router.post("/analyze")
async def analyze_food_image_endpoint(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    """
    Analyze a food image using Google Gemini Vision.

    Accepts an image upload, sends to Gemini for multimodal analysis,
    and returns structured nutritional breakdown with health score.

    - **file**: Food image (JPEG, PNG, WebP)
    - Returns: Nutritional analysis with health score, alternatives, allergens
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: {allowed_types}"
        )

    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Maximum 5MB.")

    # Analyze with Gemini Vision
    result = await analyze_food_image(contents, file.content_type)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Calculate our own health score as well (multi-factor algorithm)
    custom_score = calculate_health_score(result)
    result["health_score_detailed"] = custom_score

    return {
        "status": "success",
        "analysis": result,
    }


@router.post("/analyze-text")
async def analyze_food_text_endpoint(
    request: FoodTextRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Analyze a food description using Google Gemini.

    Takes natural language food description and returns nutritional analysis.

    - **description**: Text like "2 chapatis with dal and a glass of lassi"
    - Returns: Structured nutritional breakdown
    """
    result = await analyze_food_text(request.description)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    custom_score = calculate_health_score(result)
    result["health_score_detailed"] = custom_score

    return {
        "status": "success",
        "analysis": result,
    }


@router.post("/log")
async def log_food_endpoint(
    request: FoodLogRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Save analyzed food to the user's daily food log.

    Stores the nutritional data in Firestore for tracking and dashboard.

    - **request**: Food log data with nutritional info
    - Returns: Created log entry ID
    """
    uid = _get_uid(authorization)

    food_data = request.model_dump()
    log_id = await log_food(uid, food_data)

    return {
        "status": "success",
        "log_id": log_id,
        "message": "Food logged successfully",
    }


@router.get("/log")
async def get_food_logs_endpoint(
    date: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    """
    Get food logs for a specific date.

    - **date**: Date in YYYY-MM-DD format (defaults to today)
    - Returns: List of food log entries
    """
    uid = _get_uid(authorization)
    logs = await get_food_logs(uid, date)

    return {
        "status": "success",
        "date": date,
        "logs": logs,
        "count": len(logs),
    }


@router.delete("/log/{log_id}")
async def delete_food_log_endpoint(
    log_id: str,
    authorization: Optional[str] = Header(None),
):
    """Delete a specific food log entry."""
    uid = _get_uid(authorization)
    await delete_food_log(uid, log_id)

    return {"status": "success", "message": "Food log deleted"}
