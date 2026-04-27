"""
Firestore Service - Database operations for NutriSense.

Handles all CRUD operations for users, food logs, and weekly reports
using Google Cloud Firestore (NoSQL, serverless).
"""

import os
from datetime import datetime, date
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth

# Module-level Firestore client
_db = None


def init_firestore():
    """Initialize Firebase Admin SDK and Firestore client."""
    global _db
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        try:
            # Initialize with application default credentials or project ID
            project_id = os.getenv("GCP_PROJECT_ID") or os.getenv("VITE_FIREBASE_PROJECT_ID")
            if project_id and os.getenv("ENVIRONMENT") == "production":
                from firebase_admin import credentials
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, {"projectId": project_id})
            else:
                # Local development - initialize without credentials for demo mode
                firebase_admin.initialize_app()
        except Exception as e:
            print(f"[WARN] Firebase Init Warning (Running in Demo Mode): {e}")
            pass # Fails safely in local dev so Uvicorn doesn't crash

    try:
        _db = firestore.client()
        print("[OK] Firestore initialized")
    except Exception as e:
        print(f"[WARN] Firestore skipped (Demo Mode active)")
        _db = "DEMO_MODE"


def get_db():
    """Get the Firestore client."""
    if _db is None:
        init_firestore()
    return _db


# ============== USER OPERATIONS ==============

async def create_or_get_user(uid: str, email: str, name: str) -> dict:
    """Create a new user document or return existing one."""
    db = get_db()
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if user_doc.exists:
        return user_doc.to_dict()

    # Create new user with defaults
    user_data = {
        "uid": uid,
        "email": email,
        "name": name,
        "profile": {
            "age": None,
            "weight_kg": None,
            "height_cm": None,
            "gender": None,
            "activity_level": "moderate",
            "health_goals": ["maintenance"],
            "dietary_preferences": ["none"],
            "allergies": [],
            "daily_calorie_target": 2000,
        },
        "onboarding_complete": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    user_ref.set(user_data)
    return user_data


async def get_user_profile(uid: str) -> Optional[dict]:
    """Get user profile data."""
    db = get_db()
    user_doc = db.collection("users").document(uid).get()
    if user_doc.exists:
        return user_doc.to_dict()
    return None


async def update_user_profile(uid: str, profile_data: dict) -> dict:
    """Update user profile with new data."""
    db = get_db()
    user_ref = db.collection("users").document(uid)

    update_data = {
        "profile": profile_data,
        "onboarding_complete": True,
        "updated_at": datetime.utcnow(),
    }
    user_ref.update(update_data)

    return (await get_user_profile(uid))


# ============== FOOD LOG OPERATIONS ==============

async def log_food(uid: str, food_data: dict) -> str:
    """
    Save a food log entry to Firestore.

    Args:
        uid: User ID
        food_data: Analyzed food data from Gemini

    Returns:
        Document ID of the created log entry
    """
    db = get_db()
    today = date.today().isoformat()

    log_entry = {
        **food_data,
        "date": today,
        "logged_at": datetime.utcnow(),
    }

    # Add to user's food_logs sub-collection
    doc_ref = db.collection("users").document(uid).collection("food_logs").add(log_entry)
    return doc_ref[1].id


async def get_food_logs(uid: str, target_date: str = None) -> list:
    """
    Get food logs for a specific date.

    Args:
        uid: User ID
        target_date: Date string (YYYY-MM-DD), defaults to today

    Returns:
        List of food log entries
    """
    db = get_db()
    if target_date is None:
        target_date = date.today().isoformat()

    logs_ref = (
        db.collection("users")
        .document(uid)
        .collection("food_logs")
        .where("date", "==", target_date)
        .order_by("logged_at")
    )

    logs = []
    for doc in logs_ref.stream():
        log_data = doc.to_dict()
        log_data["id"] = doc.id
        # Convert Firestore timestamps to ISO strings
        if "logged_at" in log_data and hasattr(log_data["logged_at"], "isoformat"):
            log_data["logged_at"] = log_data["logged_at"].isoformat()
        logs.append(log_data)

    return logs


async def get_food_logs_range(uid: str, start_date: str, end_date: str) -> list:
    """Get food logs for a date range (for weekly reports)."""
    db = get_db()

    logs_ref = (
        db.collection("users")
        .document(uid)
        .collection("food_logs")
        .where("date", ">=", start_date)
        .where("date", "<=", end_date)
        .order_by("date")
    )

    logs = []
    for doc in logs_ref.stream():
        log_data = doc.to_dict()
        log_data["id"] = doc.id
        if "logged_at" in log_data and hasattr(log_data["logged_at"], "isoformat"):
            log_data["logged_at"] = log_data["logged_at"].isoformat()
        logs.append(log_data)

    return logs


async def delete_food_log(uid: str, log_id: str) -> bool:
    """Delete a specific food log entry."""
    db = get_db()
    db.collection("users").document(uid).collection("food_logs").document(log_id).delete()
    return True


# ============== DASHBOARD OPERATIONS ==============

async def get_daily_summary(uid: str, target_date: str = None) -> dict:
    """
    Calculate daily nutrition summary from food logs.

    Returns aggregated totals and health score for the day.
    """
    logs = await get_food_logs(uid, target_date)

    if not logs:
        return {
            "date": target_date or date.today().isoformat(),
            "total_calories": 0,
            "total_protein_g": 0,
            "total_carbs_g": 0,
            "total_fat_g": 0,
            "total_fiber_g": 0,
            "avg_health_score": 0,
            "meal_count": 0,
            "meals": [],
        }

    total_cals = sum(log.get("total_calories", 0) for log in logs)
    total_protein = sum(log.get("total_protein_g", 0) for log in logs)
    total_carbs = sum(log.get("total_carbs_g", 0) for log in logs)
    total_fat = sum(log.get("total_fat_g", 0) for log in logs)
    total_fiber = sum(
        sum(f.get("fiber_g", 0) for f in log.get("foods", [])) for log in logs
    )
    health_scores = [log.get("health_score", 0) for log in logs if log.get("health_score")]
    avg_score = sum(health_scores) / len(health_scores) if health_scores else 0

    return {
        "date": target_date or date.today().isoformat(),
        "total_calories": round(total_cals),
        "total_protein_g": round(total_protein, 1),
        "total_carbs_g": round(total_carbs, 1),
        "total_fat_g": round(total_fat, 1),
        "total_fiber_g": round(total_fiber, 1),
        "avg_health_score": round(avg_score),
        "meal_count": len(logs),
        "meals": logs,
    }


# ============== WEEKLY REPORT OPERATIONS ==============

async def save_weekly_report(uid: str, week_id: str, report_data: dict) -> str:
    """Save a generated weekly report."""
    db = get_db()
    report_data["generated_at"] = datetime.utcnow()

    db.collection("users").document(uid).collection("weekly_reports").document(
        week_id
    ).set(report_data)
    return week_id


async def get_weekly_report(uid: str, week_id: str) -> Optional[dict]:
    """Get a specific weekly report."""
    db = get_db()
    doc = (
        db.collection("users")
        .document(uid)
        .collection("weekly_reports")
        .document(week_id)
        .get()
    )
    if doc.exists:
        return doc.to_dict()
    return None
