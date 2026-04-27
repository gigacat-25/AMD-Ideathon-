"""
Pydantic models for User data.

These models serve as:
1. API request/response validation
2. Self-documenting schema (visible in Swagger docs)
3. Type-safe data handling throughout the app
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """User health profile for personalized recommendations."""
    age: Optional[int] = Field(None, ge=10, le=120, description="Age in years")
    weight_kg: Optional[float] = Field(None, ge=20, le=300, description="Weight in kg")
    height_cm: Optional[float] = Field(None, ge=100, le=250, description="Height in cm")
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    activity_level: str = Field(
        "moderate",
        description="Activity level",
        pattern="^(sedentary|light|moderate|active|very_active)$"
    )
    health_goals: list[str] = Field(
        default=["maintenance"],
        description="Health goals: weight_loss, muscle_gain, maintenance, heart_health, diabetes_management"
    )
    dietary_preferences: list[str] = Field(
        default=["none"],
        description="Dietary preferences: vegetarian, vegan, keto, paleo, mediterranean, none"
    )
    allergies: list[str] = Field(
        default=[],
        description="Food allergies: gluten, dairy, nuts, shellfish, soy, eggs, etc."
    )
    daily_calorie_target: Optional[int] = Field(None, ge=800, le=6000)


class ProfileUpdateRequest(BaseModel):
    """Request body for updating user profile."""
    profile: UserProfile


class UserResponse(BaseModel):
    """API response for user data."""
    uid: str
    email: str
    name: str
    profile: UserProfile
    onboarding_complete: bool = False


class AuthTokenRequest(BaseModel):
    """Request containing Firebase ID token for verification."""
    id_token: str
    name: Optional[str] = None
    email: Optional[str] = None
