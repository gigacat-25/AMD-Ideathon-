"""
Recommendations API Routes - AI-powered personalized meal suggestions.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime

from app.services.gemini_service import generate_recommendations, answer_food_query
from app.services.firestore_service import get_food_logs, get_user_profile

router = APIRouter()


def _get_uid(authorization: Optional[str]) -> str:
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "").strip()
    return "demo_user_001"


@router.post("/meal")
async def get_meal_recommendations(
    authorization: Optional[str] = Header(None),
):
    """
    Get AI-powered meal recommendations based on:
    - User's health profile and goals
    - Today's meals eaten so far
    - Remaining nutritional budget
    - Time of day
    - Dietary restrictions and allergies
    """
    uid = _get_uid(authorization)

    # Get user profile
    user = await get_user_profile(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    user_profile = user.get("profile", {})

    # Get today's meals
    today_meals = await get_food_logs(uid)

    # Current time for context
    current_time = datetime.now().strftime("%H:%M")

    # Generate recommendations
    result = await generate_recommendations(user_profile, today_meals, current_time)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "status": "success",
        "recommendations": result,
    }


@router.post("/query")
async def food_health_query(
    query: dict,
    authorization: Optional[str] = Header(None),
):
    """
    Ask any food or health related question.

    The AI will provide a personalized answer based on the user's profile.

    - **query**: {"question": "Is butter chicken healthy?"}
    """
    uid = _get_uid(authorization)
    question = query.get("question", "")

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    user = await get_user_profile(uid)
    user_profile = user.get("profile", {}) if user else {}

    result = await answer_food_query(question, user_profile)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "status": "success",
        "response": result,
    }
