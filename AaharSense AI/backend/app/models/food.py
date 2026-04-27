"""
Pydantic models for Food data.

Covers food analysis requests/responses and food logging.
"""

from typing import Optional
from pydantic import BaseModel, Field


class FoodItem(BaseModel):
    """Individual food item with nutritional data."""
    name: str
    quantity: str = "1 serving"
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: float = 0


class FoodAnalysisResponse(BaseModel):
    """Response from Gemini food analysis."""
    foods: list[FoodItem] = []
    total_calories: float = 0
    total_protein_g: float = 0
    total_carbs_g: float = 0
    total_fat_g: float = 0
    health_score: int = Field(0, ge=0, le=100)
    health_summary: str = ""
    alternatives: list[str] = []
    allergens_detected: list[str] = []
    meal_type_guess: str = "snack"


class FoodLogRequest(BaseModel):
    """Request to save a food log entry."""
    meal_type: str = Field(
        "snack",
        pattern="^(breakfast|lunch|dinner|snack)$"
    )
    foods: list[FoodItem]
    total_calories: float = 0
    total_protein_g: float = 0
    total_carbs_g: float = 0
    total_fat_g: float = 0
    health_score: int = Field(0, ge=0, le=100)
    health_summary: str = ""
    alternatives: list[str] = []
    allergens_detected: list[str] = []
    image_url: Optional[str] = None
    ai_analysis: Optional[str] = None


class FoodTextRequest(BaseModel):
    """Request to analyze food from text description."""
    description: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Natural language description of food (e.g., '2 chapatis with dal')"
    )


class DailySummary(BaseModel):
    """Daily nutrition summary."""
    date: str
    total_calories: int = 0
    total_protein_g: float = 0
    total_carbs_g: float = 0
    total_fat_g: float = 0
    total_fiber_g: float = 0
    avg_health_score: int = 0
    meal_count: int = 0
    meals: list = []
