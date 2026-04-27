"""
Profile API Routes - User profile CRUD and nutritional target calculation.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from app.models.user import ProfileUpdateRequest
from app.services.firestore_service import get_user_profile, update_user_profile
from app.services.nutrition_service import calculate_daily_targets

router = APIRouter()


def _get_uid(authorization: Optional[str]) -> str:
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "").strip()
    return "demo_user_001"


@router.get("/")
async def get_profile(
    authorization: Optional[str] = Header(None),
):
    """Get the current user's profile and nutritional targets."""
    uid = _get_uid(authorization)
    user = await get_user_profile(uid)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "status": "success",
        "user": user,
    }


@router.put("/")
async def update_profile(
    request: ProfileUpdateRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Update user profile and recalculate nutritional targets.

    Auto-calculates BMR, TDEE, and daily macro targets using
    the Mifflin-St Jeor equation based on profile data.
    """
    uid = _get_uid(authorization)
    profile_data = request.profile.model_dump()

    # Auto-calculate daily targets if sufficient data
    if all([
        profile_data.get("weight_kg"),
        profile_data.get("height_cm"),
        profile_data.get("age"),
        profile_data.get("gender"),
    ]):
        targets = calculate_daily_targets(
            weight_kg=profile_data["weight_kg"],
            height_cm=profile_data["height_cm"],
            age=profile_data["age"],
            gender=profile_data["gender"],
            activity_level=profile_data.get("activity_level", "moderate"),
            health_goals=profile_data.get("health_goals", ["maintenance"]),
        )
        profile_data["daily_calorie_target"] = targets["daily_calorie_target"]
        profile_data["bmr"] = targets["bmr"]
        profile_data["tdee"] = targets["tdee"]
        profile_data["protein_target_g"] = targets["protein_target_g"]
        profile_data["carbs_target_g"] = targets["carbs_target_g"]
        profile_data["fat_target_g"] = targets["fat_target_g"]
        profile_data["fiber_target_g"] = targets["fiber_target_g"]

    updated = await update_user_profile(uid, profile_data)

    return {
        "status": "success",
        "user": updated,
        "targets_calculated": True if profile_data.get("bmr") else False,
    }
