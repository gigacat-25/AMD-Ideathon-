"""
AaharSense AI — Streamlit Application
Self-contained: Gemini API called directly (no FastAPI backend required).
Deploys to Google Cloud Run via Dockerfile.
"""

import streamlit as st
import json
import os
import io
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# ─── Gemini SDK (google-genai) ────────────────────────────────────────────────
try:
    from google import genai
    from google.genai import types

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    if not GEMINI_API_KEY:
        st.error("⚠️  GEMINI_API_KEY not found. Set it in .env or as an environment variable.")
        st.stop()

    client = genai.Client(api_key=GEMINI_API_KEY)
except ImportError:
    st.error("google-genai package not installed. Run: pip install google-genai")
    st.stop()


# ─── Analysis Schema ──────────────────────────────────────────────────────────
_SCHEMA = """{
  "foods": [
    {
      "name": "Food item name",
      "quantity": "1 cup / 200g",
      "calories": 250,
      "protein_g": 12.5,
      "carbs_g": 30.0,
      "fat_g": 8.0,
      "fiber_g": 3.0,
      "adulteration_risk": "low | medium | high",
      "potential_adulterants": ["e.g. metanil yellow", "chalk powder"]
    }
  ],
  "total_calories": 500,
  "total_protein_g": 25.0,
  "total_carbs_g": 60.0,
  "total_fat_g": 16.0,
  "health_score": 72,
  "safety_score": 85,
  "health_summary": "Brief clinical assessment",
  "adulteration_check": "Detailed adulteration report for Indian food context",
  "safety_verdict": "SAFE",
  "alternatives": ["Healthier swap 1", "Healthier swap 2"],
  "allergens_detected": ["dairy", "gluten"],
  "clinical_notes": "Extra clinical notes if any"
}"""

_SYSTEM_PROMPT = """You are 'AaharSense AI', an expert Indian Food Safety and Nutrition AI.
Analyze the given food for:
1. Nutritional profile (calories, macros, fiber)
2. Adulteration risks common in India (e.g., metanil yellow in turmeric, chalk in milk, saw dust in spices)
3. Health Score 0-100 (nutrient density, GI, processing level)
4. Safety Score 0-100 (deduct heavily for adulteration risks)
5. Safety Verdict: SAFE | PROCEED WITH CAUTION | UNSAFE

Respond ONLY with valid JSON, no markdown, no code fences."""


def _clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    if text.lower().startswith("json"):
        text = text[4:]
    return text.strip()


def analyze_text(description: str) -> dict:
    prompt = f"{_SYSTEM_PROMPT}\n\nFood description: \"{description}\"\n\nJSON schema:\n{_SCHEMA}"
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return json.loads(_clean_json(response.text))


def analyze_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    prompt = f"{_SYSTEM_PROMPT}\n\nAnalyze the food shown in the image.\n\nJSON schema:\n{_SCHEMA}"
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[prompt, image_part],
    )
    return json.loads(_clean_json(response.text))


# ─── Streamlit UI ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AaharSense AI",
    page_icon="🍛",
    layout="centered",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
:root { --saffron: #FF9933; --indian-green: #138808; --navy: #0a1628; }
* { font-family: 'Inter', sans-serif; }
.stApp { background: #f8fafc; }
h1 { color: var(--saffron) !important; }
h2, h3 { color: var(--navy) !important; }
.report-card {
    background: white; padding: 28px; border-radius: 16px;
    border-left: 6px solid var(--saffron);
    box-shadow: 0 4px 24px rgba(0,0,0,0.07); margin: 20px 0;
}
.verdict-safe { background:#E8F5E9; color:#2E7D32; border:1px solid #A5D6A7; padding:8px 18px; border-radius:100px; font-weight:700; display:inline-block; }
.verdict-proceed { background:#FFF3E0; color:#E65100; border:1px solid #FFB74D; padding:8px 18px; border-radius:100px; font-weight:700; display:inline-block; }
.verdict-unsafe  { background:#FFEBEE; color:#B71C1C; border:1px solid #EF9A9A; padding:8px 18px; border-radius:100px; font-weight:700; display:inline-block; }
.metric-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:18px 0; }
.metric-box { background:#f1f5f9; border-radius:10px; padding:14px 8px; text-align:center; }
.metric-val { font-size:1.3rem; font-weight:800; color:var(--navy); }
.metric-lbl { font-size:0.65rem; color:#64748b; text-transform:uppercase; letter-spacing:.05em; margin-top:3px; }
.stButton>button {
    background: var(--indian-green) !important; color: white !important;
    border-radius: 10px !important; font-weight: 700 !important;
    width: 100% !important; border: none !important;
    padding: 12px !important;
}
.flag-bar { height: 5px; background: linear-gradient(to right, #FF9933 33%, #fff 33% 66%, #138808 66%); border-radius: 3px; margin-bottom: 20px; }
</style>
<div class="flag-bar"></div>
""", unsafe_allow_html=True)

# ─── Header ───────────────────────────────────────────────────────────────────
st.title("AaharSense AI 🍛")
st.markdown("**Safe. Pure. Nutritious.** — Indian Food Safety & Adulteration Detection")
st.markdown("---")

# ─── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 🌐 Language")
    lang_choice = st.radio("", ["English", "ಕನ್ನಡ (Kannada)", "हिंदी (Hindi)"], label_visibility="collapsed")
    st.markdown("---")
    st.markdown("### About AaharSense AI")
    st.info(
        "AaharSense AI uses Google Gemini to detect nutritional data and "
        "food adulteration risks in Indian food. Built for **AMD Ideathon 2025**."
    )
    st.markdown("---")
    st.markdown("🟠 Saffron &nbsp;⚪ White &nbsp;🟢 Green")
    st.caption("Built with ❤️ for Food Safety in India")

# ─── Input Tabs ───────────────────────────────────────────────────────────────
tab_text, tab_img = st.tabs(["📝 Describe Food", "📷 Upload Photo"])

with tab_text:
    placeholder_map = {
        "English": "e.g. Milk from local vendor, turmeric powder, chapati with dal",
        "ಕನ್ನಡ (Kannada)": "ಉದಾ: ಸ್ಥಳೀಯ ಅಂಗಡಿಯ ಹಾಲು, ಅರಿಶಿನ, ಚಪಾತಿ",
        "हिंदी (Hindi)": "उदा. स्थानीय दूध, हल्दी पाउडर, रोटी के साथ दाल",
    }
    food_text = st.text_area(
        "Describe your food or ingredients:",
        height=130,
        placeholder=placeholder_map[lang_choice],
    )
    btn_text = st.button("🔬 Run Safety Analysis", key="btn_text")

with tab_img:
    uploaded = st.file_uploader("Upload a food photo:", type=["jpg", "jpeg", "png", "webp"])
    cam = st.camera_input("Or take a photo")
    img_source = cam if cam else uploaded
    if img_source:
        st.image(img_source, caption="Ready to analyze", use_column_width=True)
    btn_img = st.button("🔍 Scan with Vision AI", key="btn_img")


# ─── Run Analysis ─────────────────────────────────────────────────────────────
def render_results(result: dict):
    verdict = result.get("safety_verdict", "SAFE")
    verdict_cls = {
        "SAFE": "verdict-safe",
        "PROCEED WITH CAUTION": "verdict-proceed",
        "UNSAFE": "verdict-unsafe",
    }.get(verdict.upper(), "verdict-proceed")

    st.markdown('<div class="report-card">', unsafe_allow_html=True)
    st.markdown(f"### 📋 AaharSense Report")
    st.markdown(f'<div class="{verdict_cls}">🛡 {verdict}</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    c1.metric("Health Score", f"{result.get('health_score', 'N/A')}/100")
    c2.metric("Safety Score", f"{result.get('safety_score', 'N/A')}/100")

    st.markdown(f"""
    <div class="metric-grid">
        <div class="metric-box"><div class="metric-val">{result.get('total_calories', '—')}</div><div class="metric-lbl">Calories</div></div>
        <div class="metric-box"><div class="metric-val">{result.get('total_protein_g', '—')}g</div><div class="metric-lbl">Protein</div></div>
        <div class="metric-box"><div class="metric-val">{result.get('total_carbs_g', '—')}g</div><div class="metric-lbl">Carbs</div></div>
        <div class="metric-box"><div class="metric-val">{result.get('total_fat_g', '—')}g</div><div class="metric-lbl">Fat</div></div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("#### 🥗 Food Breakdown")
    for f in result.get("foods", []):
        risk_icon = {"low": "🟢", "medium": "🟡", "high": "🔴"}.get(str(f.get("adulteration_risk", "")).lower(), "⚪")
        st.write(f"{risk_icon} **{f.get('name')}** ({f.get('quantity')}) — {f.get('calories')} kcal")

    st.markdown("#### ⚠️ Adulteration Check")
    st.info(result.get("adulteration_check", "No specific adulterants detected."))

    if result.get("allergens_detected"):
        st.warning(f"🚨 **Allergens:** {', '.join(result['allergens_detected'])}")

    st.markdown("#### 💡 Clinical Advice")
    st.success(result.get("health_summary", "Balanced meal."))

    alts = result.get("alternatives", [])
    if alts:
        st.markdown("**Healthier Swaps:**")
        for alt in alts:
            st.write(f"  • {alt}")

    st.markdown('</div>', unsafe_allow_html=True)


if btn_text and food_text.strip():
    with st.spinner("🔬 Analyzing safety and nutrition..."):
        try:
            result = analyze_text(food_text)
            if "error" in result:
                st.error(result["error"])
            else:
                render_results(result)
        except json.JSONDecodeError as e:
            st.error(f"Could not parse AI response. Please try again. ({e})")
        except Exception as e:
            st.error(f"Analysis failed: {e}")

elif btn_text and not food_text.strip():
    st.warning("Please describe your food before analyzing.")

if btn_img and img_source:
    with st.spinner("🔍 Vision AI scanning..."):
        try:
            img_bytes = img_source.getvalue()
            mime = img_source.type if hasattr(img_source, "type") else "image/jpeg"
            result = analyze_image(img_bytes, mime)
            if "error" in result:
                st.error(result["error"])
            else:
                render_results(result)
        except json.JSONDecodeError as e:
            st.error(f"Could not parse AI response. Please try again. ({e})")
        except Exception as e:
            st.error(f"Vision analysis failed: {e}")

elif btn_img and not img_source:
    st.warning("Please upload or capture a food image first.")
