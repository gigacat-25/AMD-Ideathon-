"""
Dashboard API Routes - Aggregated nutrition data for the user dashboard.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import date, timedelta

from app.services.firestore_service import (
    get_daily_summary,
    get_food_logs_range,
    get_user_profile,
)
from app.services.gemini_service import generate_weekly_report

router = APIRouter()


def _get_uid(authorization: Optional[str]) -> str:
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "").strip()
    return "demo_user_001"


@router.get("/today")
async def get_today_dashboard(
    authorization: Optional[str] = Header(None),
):
    """
    Get today's nutrition dashboard data.

    Returns aggregated daily totals, health score, and meal list.
    """
    uid = _get_uid(authorization)
    today = date.today().isoformat()
    summary = await get_daily_summary(uid, today)

    # Get user profile for targets
    user = await get_user_profile(uid)
    daily_target = 2000
    if user and user.get("profile"):
        daily_target = user["profile"].get("daily_calorie_target", 2000)

    summary["daily_calorie_target"] = daily_target
    summary["calorie_progress"] = round(
        (summary["total_calories"] / daily_target * 100) if daily_target else 0, 1
    )

    return {
        "status": "success",
        "dashboard": summary,
    }


@router.get("/weekly")
async def get_weekly_dashboard(
    authorization: Optional[str] = Header(None),
):
    """
    Get weekly nutrition report with AI-generated insights.

    Aggregates 7 days of food logs and generates a Gemini-powered analysis.
    """
    uid = _get_uid(authorization)

    # Get last 7 days of data
    today = date.today()
    week_start = today - timedelta(days=6)

    logs = await get_food_logs_range(
        uid, week_start.isoformat(), today.isoformat()
    )

    # Aggregate by day
    daily_totals = {}
    for log in logs:
        log_date = log.get("date", today.isoformat())
        if log_date not in daily_totals:
            daily_totals[log_date] = {
                "calories": 0, "protein_g": 0, "carbs_g": 0,
                "fat_g": 0, "health_scores": [], "meal_count": 0
            }
        daily_totals[log_date]["calories"] += log.get("total_calories", 0)
        daily_totals[log_date]["protein_g"] += log.get("total_protein_g", 0)
        daily_totals[log_date]["carbs_g"] += log.get("total_carbs_g", 0)
        daily_totals[log_date]["fat_g"] += log.get("total_fat_g", 0)
        daily_totals[log_date]["meal_count"] += 1
        if log.get("health_score"):
            daily_totals[log_date]["health_scores"].append(log["health_score"])

    # Calculate averages
    days_with_data = len(daily_totals)
    if days_with_data == 0:
        return {
            "status": "success",
            "report": {
                "days_tracked": 0,
                "message": "No food logs found for this week. Start logging to see insights!",
            },
        }

    avg_calories = sum(d["calories"] for d in daily_totals.values()) / days_with_data
    avg_protein = sum(d["protein_g"] for d in daily_totals.values()) / days_with_data
    avg_carbs = sum(d["carbs_g"] for d in daily_totals.values()) / days_with_data
    avg_fat = sum(d["fat_g"] for d in daily_totals.values()) / days_with_data

    all_scores = []
    for d in daily_totals.values():
        all_scores.extend(d["health_scores"])
    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0

    weekly_data = {
        "days_tracked": days_with_data,
        "avg_daily_calories": round(avg_calories),
        "avg_daily_protein_g": round(avg_protein, 1),
        "avg_daily_carbs_g": round(avg_carbs, 1),
        "avg_daily_fat_g": round(avg_fat, 1),
        "avg_health_score": round(avg_score),
        "daily_breakdown": daily_totals,
        "total_meals_logged": sum(d["meal_count"] for d in daily_totals.values()),
    }

    # Generate AI insights
    user = await get_user_profile(uid)
    user_profile = user.get("profile", {}) if user else {}

    try:
        ai_report = await generate_weekly_report(weekly_data, user_profile)
        weekly_data["ai_insights"] = ai_report
    except Exception:
        weekly_data["ai_insights"] = {"summary": "Weekly AI report generation temporarily unavailable."}

    return {
        "status": "success",
        "report": weekly_data,
    }
