"""
Gemini AI Service - Core intelligence layer for NutriSense.

Uses Google Gemini 2.0 Flash (free tier) for:
- Multimodal food image analysis with GI/micronutrient profiling
- Text-based nutritional estimation
- Personalized meal recommendations with nutrient synergy
- Health insights generation with clinical-grade metrics
"""

import json
import google.generativeai as genai
from app.config import settings

_model = None
_vision_model = None


def init_gemini():
    global _model, _vision_model
    genai.configure(api_key=settings.gemini_api_key)
    _model = genai.GenerativeModel("gemini-2.5-flash")
    _vision_model = genai.GenerativeModel("gemini-2.5-flash")
    print("[OK] Gemini API initialized (gemini-2.5-flash)")


def get_model():
    if _model is None:
        init_gemini()
    return _model


def get_vision_model():
    if _vision_model is None:
        init_gemini()
    return _vision_model


def _clean_json(text: str) -> str:
    """Strip markdown code fences from Gemini output."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    if text.startswith("json"):
        text = text[4:]
    return text.strip()


# ─── CLINICAL-GRADE FOOD ANALYSIS PROMPT ────────────────────────────
_FOOD_ANALYSIS_SCHEMA = """{
  "foods": [
    {
      "name": "Food item name",
      "quantity": "estimated portion (e.g., '1 cup', '200g')",
      "calories": 250,
      "protein_g": 12.5,
      "carbs_g": 30.0,
      "fat_g": 8.0,
      "fiber_g": 3.0,
      "sugar_g": 5.0,
      "sodium_mg": 300,
      "glycemic_index": 55,
      "glycemic_load": 8.2,
      "micronutrients": {
        "vitamin_a_mcg": 120,
        "vitamin_c_mg": 15,
        "vitamin_d_mcg": 0,
        "calcium_mg": 80,
        "iron_mg": 2.5,
        "potassium_mg": 350,
        "zinc_mg": 1.8,
        "magnesium_mg": 40
      },
      "processing_level": "minimally_processed"
    }
  ],
  "total_calories": 500,
  "total_protein_g": 25.0,
  "total_carbs_g": 60.0,
  "total_fat_g": 16.0,
  "total_fiber_g": 8.5,
  "meal_glycemic_load": 18.5,
  "health_score": 72,
  "health_summary": "Brief clinical assessment with key strengths and concerns",
  "nutrient_synergies": ["Vitamin C in X enhances iron absorption from Y"],
  "nutrient_conflicts": ["Calcium in dairy may reduce iron absorption from spinach"],
  "alternatives": [
    "Replace white rice with brown rice to reduce GI by ~20 points",
    "Add a handful of nuts for healthy fats and magnesium",
    "Swap soda with sparkling water with lemon for zero sugar"
  ],
  "allergens_detected": ["dairy", "gluten"],
  "meal_type_guess": "lunch",
  "clinical_notes": "Meal is high in refined carbs. For diabetes management, consider..."
}"""


async def analyze_food_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """Analyze food image with clinical-grade nutritional profiling."""
    model = get_vision_model()

    prompt = f"""You are a clinical nutritionist AI with expertise in glycemic index analysis and micronutrient profiling. Analyze this food image with medical-grade precision.

ANALYSIS PROTOCOL:
1. Identify EVERY food item with estimated portion sizes (use standard serving references)
2. Calculate macronutrients per item using USDA FoodData Central reference values
3. Calculate Glycemic Index (GI) and Glycemic Load (GL) per item and overall meal GL
4. Profile key micronutrients: Vitamins A, C, D; Calcium, Iron, Potassium, Zinc, Magnesium
5. Classify processing level: minimally_processed | processed | ultra_processed
6. Detect nutrient synergies (e.g., Vitamin C + Iron = 6x absorption) and conflicts
7. Calculate health score (0-100) based on: nutrient density, GI impact, processing level, macro balance, micronutrient coverage
8. Detect allergens from the Big 8 (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy)
9. Provide clinical notes relevant to common conditions (diabetes, hypertension, etc.)

Respond with ONLY valid JSON — no markdown, no code blocks:
{_FOOD_ANALYSIS_SCHEMA}"""

    image_part = {"mime_type": mime_type, "data": image_bytes}

    try:
        response = model.generate_content([prompt, image_part])
        return json.loads(_clean_json(response.text))
    except json.JSONDecodeError as e:
        return {"error": "Failed to parse AI response", "raw_response": response.text, "detail": str(e)}
    except Exception as e:
        return {"error": f"Gemini API error: {str(e)}"}


async def analyze_food_text(description: str) -> dict:
    """Analyze text food description with clinical-grade profiling."""
    model = get_model()

    prompt = f"""You are a clinical nutritionist AI. A user described their meal as:
"{description}"

ANALYSIS PROTOCOL:
1. Identify each food item with standard portion sizes
2. Calculate macros using USDA FoodData Central reference values
3. Calculate GI and GL per item and overall meal GL
4. Profile micronutrients: Vitamins A, C, D; Calcium, Iron, Potassium, Zinc, Magnesium
5. Classify processing: minimally_processed | processed | ultra_processed
6. Detect nutrient synergies and conflicts
7. Health score (0-100): nutrient density, GI impact, processing, macro balance, micronutrient coverage
8. Detect Big 8 allergens
9. Clinical notes for common conditions

Respond with ONLY valid JSON — no markdown, no code blocks:
{_FOOD_ANALYSIS_SCHEMA.replace('{', '{{').replace('}', '}}')}"""

    try:
        response = model.generate_content(prompt)
        return json.loads(_clean_json(response.text))
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw_response": response.text}
    except Exception as e:
        return {"error": f"Gemini API error: {str(e)}"}


async def generate_recommendations(user_profile: dict, today_meals: list, current_time: str) -> dict:
    """Generate context-aware meal recommendations with nutrient gap analysis."""
    model = get_model()

    consumed_cals = sum(m.get("total_calories", 0) for m in today_meals)
    daily_target = user_profile.get("daily_calorie_target", 2000)
    remaining = max(0, daily_target - consumed_cals)
    consumed_p = sum(m.get("total_protein_g", 0) for m in today_meals)
    consumed_c = sum(m.get("total_carbs_g", 0) for m in today_meals)
    consumed_f = sum(m.get("total_fat_g", 0) for m in today_meals)

    prompt = f"""You are a clinical nutrition advisor. Generate evidence-based meal recommendations.

USER PROFILE:
- Goals: {user_profile.get('health_goals', ['maintenance'])}
- Diet: {user_profile.get('dietary_preferences', ['none'])}
- Allergies: {user_profile.get('allergies', [])}
- Daily Target: {daily_target} kcal
- BMR: {user_profile.get('bmr', 'unknown')} kcal

TODAY'S INTAKE:
- Calories: {consumed_cals}/{daily_target} kcal (Remaining: {remaining})
- Protein: {consumed_p}g | Carbs: {consumed_c}g | Fat: {consumed_f}g
- Meals eaten: {len(today_meals)}

TIME: {current_time}

REQUIREMENTS:
1. Fill remaining calorie/macro budget precisely
2. Prioritize micronutrient gaps (common deficiencies: Vitamin D, Iron, Calcium, Fiber)
3. Optimize meal timing for circadian nutrition (protein in morning, complex carbs for lunch)
4. Include nutrient synergy combos (e.g., turmeric + black pepper = 2000% better curcumin absorption)
5. Respect all dietary restrictions and allergens
6. Practical meals with real ingredients, include prep time

Respond with ONLY valid JSON:
{{
  "recommendations": [
    {{
      "name": "Meal name",
      "description": "Description with specific ingredients",
      "calories": 400,
      "protein_g": 25,
      "carbs_g": 45,
      "fat_g": 12,
      "glycemic_load": 12,
      "key_micronutrients": ["Iron", "Vitamin C"],
      "nutrient_synergy": "Vitamin C from lemon enhances iron absorption from lentils",
      "why_recommended": "Fills protein gap and low GI suits your metabolic goals",
      "prep_time_minutes": 20,
      "meal_type": "dinner"
    }}
  ],
  "nutritional_gaps": ["protein", "fiber", "iron", "vitamin D"],
  "daily_summary": "Clinical summary of today's intake...",
  "circadian_note": "Time-based eating recommendation..."
}}"""

    try:
        response = model.generate_content(prompt)
        return json.loads(_clean_json(response.text))
    except Exception as e:
        return {"error": f"Recommendation generation failed: {str(e)}"}


async def generate_weekly_report(weekly_data: dict, user_profile: dict) -> dict:
    """Generate clinical-grade weekly health report with trend analysis."""
    model = get_model()

    prompt = f"""You are a health analytics AI. Generate a clinical weekly nutrition report.

USER PROFILE: {json.dumps(user_profile, default=str)}
WEEKLY DATA: {json.dumps(weekly_data, default=str)}

ANALYSIS REQUIRED:
1. Overall health score with justification
2. Macro and micronutrient trend analysis (improving/stable/declining)
3. Glycemic load patterns and metabolic impact
4. Protein adequacy assessment (g/kg body weight)
5. Hydration estimation based on food water content
6. Top 3 achievements and 3 improvement areas
7. Specific, actionable evidence-based tips for next week
8. Risk flags for nutritional deficiencies

Respond with ONLY valid JSON:
{{
  "overall_score": 75,
  "summary": "Clinical weekly summary...",
  "trends": {{
    "calories": "on_track",
    "protein": "below_target",
    "glycemic_load": "declining_good",
    "health_score": "improving"
  }},
  "achievements": ["Achievement 1"],
  "improvements": ["Improvement 1"],
  "tips": ["Evidence-based tip 1"],
  "risk_flags": ["Low iron intake detected — consider fortified foods"],
  "streak_days": 5,
  "protein_per_kg": 1.2,
  "avg_glycemic_load": 22
}}"""

    try:
        response = model.generate_content(prompt)
        return json.loads(_clean_json(response.text))
    except Exception as e:
        return {"error": f"Weekly report generation failed: {str(e)}"}


async def answer_food_query(query: str, user_profile: dict) -> dict:
    """Answer nutrition questions with clinical precision and personalization."""
    model = get_model()

    prompt = f"""You are a clinical nutritionist AI assistant. Answer with scientific accuracy.

Question: "{query}"

User context:
- Goals: {user_profile.get('health_goals', ['maintenance'])}
- Diet: {user_profile.get('dietary_preferences', ['none'])}
- Allergies: {user_profile.get('allergies', [])}

REQUIREMENTS:
1. Evidence-based answer with specific nutritional data
2. Include glycemic index data where relevant
3. Mention nutrient interactions and synergies
4. Personalize based on user's goals and restrictions
5. Cite scientific reasoning (not just generic advice)

Respond with ONLY valid JSON:
{{
  "answer": "Detailed, evidence-based answer...",
  "key_facts": ["Specific fact with numbers"],
  "related_foods": ["Food 1", "Food 2"],
  "health_tip": "Personalized actionable tip",
  "scientific_basis": "Brief explanation of the science behind the answer"
}}"""

    try:
        response = model.generate_content(prompt)
        return json.loads(_clean_json(response.text))
    except Exception as e:
        return {"error": f"Query failed: {str(e)}"}
