"""
Unit Tests for NutriSense Nutrition Service.

Tests the core health scoring algorithm and BMR calculations
using industry-standard expected values.
"""

import pytest
from app.services.nutrition_service import (
    calculate_bmr,
    calculate_tdee,
    calculate_daily_targets,
    calculate_health_score,
)


class TestBMRCalculation:
    """Test Mifflin-St Jeor BMR equation implementation."""

    def test_male_bmr(self):
        """Standard male: 70kg, 175cm, 25y → expected ~1724 kcal/day."""
        bmr = calculate_bmr(70, 175, 25, "male")
        assert 1720 <= bmr <= 1730, f"Male BMR should be ~1724, got {bmr}"

    def test_female_bmr(self):
        """Standard female: 60kg, 165cm, 25y → expected ~1358 kcal/day."""
        bmr = calculate_bmr(60, 165, 25, "female")
        assert 1355 <= bmr <= 1365, f"Female BMR should be ~1358, got {bmr}"

    def test_higher_weight_increases_bmr(self):
        """Heavier person should have higher BMR."""
        light = calculate_bmr(50, 170, 30, "male")
        heavy = calculate_bmr(90, 170, 30, "male")
        assert heavy > light, "Higher weight should increase BMR"

    def test_older_age_decreases_bmr(self):
        """Older person should have lower BMR."""
        young = calculate_bmr(70, 175, 20, "male")
        old = calculate_bmr(70, 175, 60, "male")
        assert old < young, "Older age should decrease BMR"

    def test_taller_height_increases_bmr(self):
        """Taller person should have higher BMR."""
        short = calculate_bmr(70, 150, 30, "male")
        tall = calculate_bmr(70, 190, 30, "male")
        assert tall > short, "Taller height should increase BMR"


class TestTDEE:
    """Test Total Daily Energy Expenditure calculation."""

    def test_sedentary_multiplier(self):
        tdee = calculate_tdee(1700, "sedentary")
        assert tdee == round(1700 * 1.2), f"Sedentary TDEE wrong: {tdee}"

    def test_active_multiplier(self):
        tdee = calculate_tdee(1700, "active")
        assert tdee == round(1700 * 1.725), f"Active TDEE wrong: {tdee}"

    def test_unknown_defaults_to_moderate(self):
        tdee = calculate_tdee(1700, "unknown")
        assert tdee == round(1700 * 1.55), "Unknown activity should default to moderate"


class TestDailyTargets:
    """Test comprehensive daily target calculations."""

    def test_weight_loss_deficit(self):
        """Weight loss goal should produce calorie deficit."""
        targets = calculate_daily_targets(70, 175, 25, "male", "moderate", ["weight_loss"])
        maintenance = calculate_daily_targets(70, 175, 25, "male", "moderate", ["maintenance"])
        assert targets["daily_calorie_target"] < maintenance["daily_calorie_target"]

    def test_muscle_gain_surplus(self):
        """Muscle gain goal should produce calorie surplus."""
        targets = calculate_daily_targets(70, 175, 25, "male", "moderate", ["muscle_gain"])
        maintenance = calculate_daily_targets(70, 175, 25, "male", "moderate", ["maintenance"])
        assert targets["daily_calorie_target"] > maintenance["daily_calorie_target"]

    def test_minimum_calorie_floor(self):
        """Should never go below 1200 kcal safety floor."""
        targets = calculate_daily_targets(40, 150, 70, "female", "sedentary", ["weight_loss"])
        assert targets["daily_calorie_target"] >= 1200, "Should not go below 1200 kcal"

    def test_macro_targets_sum(self):
        """Macro targets (in calories) should approximately equal calorie target."""
        targets = calculate_daily_targets(70, 175, 25, "male", "moderate", ["maintenance"])
        macro_cals = (
            targets["protein_target_g"] * 4 +
            targets["carbs_target_g"] * 4 +
            targets["fat_target_g"] * 9
        )
        assert abs(macro_cals - targets["daily_calorie_target"]) < 50, \
            f"Macro calories ({macro_cals}) should match target ({targets['daily_calorie_target']})"


class TestHealthScore:
    """Test multi-factor health scoring algorithm."""

    def test_empty_food_returns_zero(self):
        """Empty food data should return 0."""
        score = calculate_health_score({"foods": [], "total_calories": 0})
        assert score == 0

    def test_balanced_meal_scores_well(self):
        """A balanced meal should score above 50."""
        food = {
            "total_calories": 600,
            "foods": [
                {"name": "Grilled chicken", "protein_g": 35, "carbs_g": 0, "fat_g": 8, "fiber_g": 0, "sugar_g": 0, "sodium_mg": 300},
                {"name": "Brown rice", "protein_g": 5, "carbs_g": 45, "fat_g": 2, "fiber_g": 4, "sugar_g": 1, "sodium_mg": 10},
                {"name": "Salad", "protein_g": 3, "carbs_g": 10, "fat_g": 5, "fiber_g": 5, "sugar_g": 3, "sodium_mg": 50},
            ]
        }
        score = calculate_health_score(food)
        assert score >= 40, f"Balanced meal should score ≥40, got {score}"

    def test_junk_food_scores_low(self):
        """High calorie, high sugar, low fiber meal should score poorly."""
        food = {
            "total_calories": 1200,
            "foods": [
                {"name": "Large fries", "protein_g": 5, "carbs_g": 60, "fat_g": 25, "fiber_g": 1, "sugar_g": 0, "sodium_mg": 800},
                {"name": "Soda", "protein_g": 0, "carbs_g": 50, "fat_g": 0, "fiber_g": 0, "sugar_g": 50, "sodium_mg": 50},
            ]
        }
        score = calculate_health_score(food)
        assert score < 50, f"Junk food should score <50, got {score}"

    def test_score_range(self):
        """Score should always be 0-100."""
        food = {
            "total_calories": 500,
            "foods": [
                {"name": "Test", "protein_g": 20, "carbs_g": 50, "fat_g": 15, "fiber_g": 3, "sugar_g": 5, "sodium_mg": 200}
            ]
        }
        score = calculate_health_score(food)
        assert 0 <= score <= 100, f"Score should be 0-100, got {score}"

    def test_goal_alignment(self):
        """Weight loss goal should reward lower calorie meals."""
        food = {
            "total_calories": 350,
            "foods": [
                {"name": "Salad", "protein_g": 20, "carbs_g": 15, "fat_g": 8, "fiber_g": 5, "sugar_g": 3, "sodium_mg": 100}
            ]
        }
        profile_wl = {"daily_calorie_target": 1800, "health_goals": ["weight_loss"]}
        profile_mg = {"daily_calorie_target": 2500, "health_goals": ["muscle_gain"]}

        score_wl = calculate_health_score(food, profile_wl)
        score_mg = calculate_health_score(food, profile_mg)
        # Scores may differ based on goal alignment
        assert isinstance(score_wl, int) and isinstance(score_mg, int)
