"""
Nutrition Service - Health scoring and BMR calculations.

Implements industry-standard formulas:
- Mifflin-St Jeor equation for BMR (gold standard per ADA)
- Multi-factor health scoring algorithm
- Macro ratio analysis
"""

from typing import Optional


# Activity level multipliers for TDEE calculation
ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,       # Little or no exercise
    "light": 1.375,         # Light exercise 1-3 days/week
    "moderate": 1.55,       # Moderate exercise 3-5 days/week
    "active": 1.725,        # Hard exercise 6-7 days/week
    "very_active": 1.9,     # Very hard exercise, physical job
}

# Ideal macro ratios by goal
GOAL_MACRO_TARGETS = {
    "maintenance": {"protein": 0.25, "carbs": 0.50, "fat": 0.25},
    "weight_loss": {"protein": 0.35, "carbs": 0.40, "fat": 0.25},
    "muscle_gain": {"protein": 0.35, "carbs": 0.45, "fat": 0.20},
    "heart_health": {"protein": 0.20, "carbs": 0.50, "fat": 0.30},
    "diabetes_management": {"protein": 0.25, "carbs": 0.35, "fat": 0.40},
}


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """
    Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.

    This is the gold standard recommended by the Academy of Nutrition and Dietetics.

    Formula:
        Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
        Female: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

    Args:
        weight_kg: Body weight in kilograms
        height_cm: Height in centimeters
        age: Age in years
        gender: 'male' or 'female'

    Returns:
        BMR in kcal/day
    """
    base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
    if gender.lower() == "male":
        return base + 5
    else:
        return base - 161


def calculate_tdee(bmr: float, activity_level: str) -> float:
    """
    Calculate Total Daily Energy Expenditure.

    TDEE = BMR × Activity Multiplier

    Args:
        bmr: Basal Metabolic Rate
        activity_level: One of sedentary, light, moderate, active, very_active

    Returns:
        TDEE in kcal/day
    """
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
    return round(bmr * multiplier)


def calculate_daily_targets(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str,
    health_goals: list,
) -> dict:
    """
    Calculate comprehensive daily nutritional targets.

    Returns:
        Dict with calorie target and macro targets in grams
    """
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)

    # Adjust calories based on primary goal
    primary_goal = health_goals[0] if health_goals else "maintenance"
    calorie_adjustments = {
        "weight_loss": -500,        # ~0.5kg loss/week (safe rate)
        "muscle_gain": 300,         # Lean bulk surplus
        "maintenance": 0,
        "heart_health": -200,       # Slight deficit for heart health
        "diabetes_management": -300, # Moderate deficit
    }
    calorie_target = tdee + calorie_adjustments.get(primary_goal, 0)
    calorie_target = max(1200, calorie_target)  # Safety floor

    # Calculate macro targets in grams
    macro_ratios = GOAL_MACRO_TARGETS.get(primary_goal, GOAL_MACRO_TARGETS["maintenance"])
    protein_g = round((calorie_target * macro_ratios["protein"]) / 4, 1)  # 4 cal/g
    carbs_g = round((calorie_target * macro_ratios["carbs"]) / 4, 1)     # 4 cal/g
    fat_g = round((calorie_target * macro_ratios["fat"]) / 9, 1)         # 9 cal/g

    return {
        "bmr": round(bmr),
        "tdee": tdee,
        "daily_calorie_target": round(calorie_target),
        "protein_target_g": protein_g,
        "carbs_target_g": carbs_g,
        "fat_target_g": fat_g,
        "fiber_target_g": 25.0 if gender.lower() == "female" else 38.0,  # WHO guidelines
    }


def calculate_health_score(food_data: dict, user_profile: Optional[dict] = None) -> int:
    """
    Multi-factor health scoring algorithm (0-100).

    Factors:
    1. Caloric Appropriateness (25 pts) - How meal fits daily budget
    2. Macro Balance (25 pts) - Proximity to ideal protein/carb/fat ratio
    3. Nutrient Density (20 pts) - High protein + fiber, low sugar + sodium
    4. Processing Level (15 pts) - Whole foods score higher
    5. Goal Alignment (15 pts) - How well meal supports user's health goals

    Args:
        food_data: Nutritional data for the meal
        user_profile: User's health profile (optional)

    Returns:
        Health score 0-100
    """
    score = 0
    total_cals = food_data.get("total_calories", 0)
    foods = food_data.get("foods", [])

    if not foods or total_cals == 0:
        return 0

    total_protein = sum(f.get("protein_g", 0) for f in foods)
    total_carbs = sum(f.get("carbs_g", 0) for f in foods)
    total_fat = sum(f.get("fat_g", 0) for f in foods)
    total_fiber = sum(f.get("fiber_g", 0) for f in foods)
    total_sugar = sum(f.get("sugar_g", 0) for f in foods)
    total_sodium = sum(f.get("sodium_mg", 0) for f in foods)

    # --- Factor 1: Caloric Appropriateness (25 pts) ---
    daily_target = 2000
    if user_profile and user_profile.get("daily_calorie_target"):
        daily_target = user_profile["daily_calorie_target"]

    # A single meal should be ~25-35% of daily target
    ideal_meal_cals = daily_target * 0.30
    cal_deviation = abs(total_cals - ideal_meal_cals) / ideal_meal_cals
    cal_score = max(0, 25 * (1 - cal_deviation))
    score += cal_score

    # --- Factor 2: Macro Balance (25 pts) ---
    if total_cals > 0:
        protein_ratio = (total_protein * 4) / total_cals
        carbs_ratio = (total_carbs * 4) / total_cals
        fat_ratio = (total_fat * 9) / total_cals

        # Ideal: ~30% protein, 40% carbs, 30% fat (balanced)
        protein_dev = abs(protein_ratio - 0.30)
        carbs_dev = abs(carbs_ratio - 0.40)
        fat_dev = abs(fat_ratio - 0.30)

        macro_balance = 1 - (protein_dev + carbs_dev + fat_dev) / 3
        score += max(0, 25 * macro_balance)

    # --- Factor 3: Nutrient Density (20 pts) ---
    # High protein and fiber = good, high sugar and sodium = bad
    protein_per_cal = total_protein / total_cals * 100 if total_cals else 0
    fiber_per_cal = total_fiber / total_cals * 100 if total_cals else 0
    sugar_per_cal = total_sugar / total_cals * 100 if total_cals else 0

    density_score = 0
    density_score += min(8, protein_per_cal * 2)   # Up to 8 pts for protein
    density_score += min(6, fiber_per_cal * 4)      # Up to 6 pts for fiber
    density_score += max(0, 6 - sugar_per_cal * 2)  # Lose pts for excess sugar
    score += min(20, density_score)

    # --- Factor 4: Processing Level (15 pts) ---
    # Heuristic: whole foods tend to have more fiber, less sodium
    whole_food_indicators = 0
    if total_fiber > 3:
        whole_food_indicators += 5
    if total_sodium < 600:
        whole_food_indicators += 5
    if total_sugar < total_carbs * 0.3:  # Less than 30% of carbs from sugar
        whole_food_indicators += 5
    score += min(15, whole_food_indicators)

    # --- Factor 5: Goal Alignment (15 pts) ---
    if user_profile:
        goals = user_profile.get("health_goals", ["maintenance"])
        primary_goal = goals[0] if goals else "maintenance"

        if primary_goal == "weight_loss" and total_cals < ideal_meal_cals:
            score += 12
        elif primary_goal == "muscle_gain" and protein_ratio > 0.30:
            score += 12
        elif primary_goal == "heart_health" and total_sodium < 500:
            score += 12
        elif primary_goal == "diabetes_management" and total_sugar < 10:
            score += 12
        elif primary_goal == "maintenance":
            score += 10  # Baseline for balanced eating
    else:
        score += 8  # Default

    return min(100, max(0, round(score)))
