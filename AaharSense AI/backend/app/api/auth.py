"""
Auth API Routes - Firebase Authentication verification.

Verifies Firebase ID tokens server-side and manages user creation.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import firebase_admin.auth as firebase_auth

from app.models.user import AuthTokenRequest
from app.services.firestore_service import create_or_get_user

router = APIRouter()


async def verify_firebase_token(authorization: str = Header(None)) -> dict:
    """
    Verify Firebase ID token from Authorization header.

    Args:
        authorization: Bearer token from Firebase Auth

    Returns:
        Decoded token with uid, email, name

    Raises:
        HTTPException 401 if token is invalid
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")


@router.post("/verify")
async def verify_and_create_user(request: AuthTokenRequest):
    """
    Verify Firebase token and create/get user in Firestore.

    Called after Google Sign-In on the frontend.
    Creates user document if first login, returns existing if not.
    """
    try:
        decoded = firebase_auth.verify_id_token(request.id_token)
        uid = decoded["uid"]
        email = decoded.get("email", request.email or "")
        name = decoded.get("name", request.name or "User")

        user = await create_or_get_user(uid, email, name)

        return {
            "status": "success",
            "user": user,
            "uid": uid,
        }
    except Exception as e:
        # For demo/development: allow mock auth
        if request.email:
            mock_uid = f"demo_{request.email.split('@')[0]}"
            user = await create_or_get_user(mock_uid, request.email, request.name or "Demo User")
            return {
                "status": "success",
                "user": user,
                "uid": mock_uid,
                "mode": "demo",
            }
        raise HTTPException(status_code=401, detail=f"Auth verification failed: {str(e)}")


@router.post("/demo")
async def demo_login():
    """
    Demo login for testing without Firebase.
    Creates a demo user for easy evaluation.
    """
    demo_uid = "demo_user_001"
    demo_email = "demo@nutrisense.app"
    demo_name = "Demo User"

    user = await create_or_get_user(demo_uid, demo_email, demo_name)

    return {
        "status": "success",
        "user": user,
        "uid": demo_uid,
        "mode": "demo",
    }
