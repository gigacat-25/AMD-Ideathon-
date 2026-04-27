import streamlit as st
import google.generativeai as genai
import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path so we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Try to use the existing gemini service to extend base code
try:
    from backend.app.services.gemini_service import get_model, get_vision_model, init_gemini
    init_gemini()
except ImportError:
    # Fallback if running outside the proper context
    genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
    
    def get_model():
        return genai.GenerativeModel("gemini-2.5-flash")
        
    def get_vision_model():
        return genai.GenerativeModel("gemini-2.5-flash")

# --- UI Setup ---
st.set_page_config(page_title="AaharSense AI", page_icon="🍛", layout="centered")

# --- Custom CSS for Indian Flag Colors & Card Layout ---
st.markdown("""
<style>
    /* Primary Color (Saffron) */
    h1, h2, h3 {
        color: #FF9933 !important;
    }
    
    /* Green buttons and highlights */
    .stButton>button {
        background-color: #138808;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
    }
    .stButton>button:hover {
        background-color: #0e6606;
        color: white;
    }
    
    /* Safety Badges */
    .badge-green {
        background-color: #138808;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
    .badge-yellow {
        background-color: #FFCC00;
        color: black;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
    .badge-red {
        background-color: #D32F2F;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

st.title("AaharSense AI 🍛")
st.subheader("Indian Food Nutrition & Adulteration Analyzer")

# --- Language Selection ---
selected_lang_ui = st.radio(
    "Select Language", 
    ["English", "ಕನ್ನಡ (Kannada)", "हिंदी (Hindi)"], 
    horizontal=True,
    key="language_toggle"
)

if "English" in selected_lang_ui:
    selected_language = "English"
elif "ಕನ್ನಡ" in selected_lang_ui:
    selected_language = "Kannada"
else:
    selected_language = "Hindi"

# --- Input Section ---
tab1, tab2 = st.tabs(["📝 Text Input", "📷 Image Upload"])

food_input_text = ""
food_image = None
analyze_clicked = False

with tab1:
    food_input_text = st.text_input("Enter a food item (e.g., milk, turmeric, ghee):")
    if st.button("Analyze Text"):
        if food_input_text.strip():
            analyze_clicked = True
        else:
            st.warning("Please enter a food item.")

with tab2:
    food_image = st.file_uploader("Upload or snap a photo of the food item", type=["jpg", "jpeg", "png"])
    if st.button("Analyze Image"):
        if food_image:
            if not food_input_text:
                food_input_text = "the food shown in the image"
            analyze_clicked = True
        else:
            st.warning("Please upload an image first.")

# --- Processing Section ---
if analyze_clicked:
    with st.spinner("Analyzing with AaharSense AI..."):
        try:
            prompt = f"""
You are an Indian food safety and nutrition expert.

For the Indian food item: '{food_input_text}'

Provide a structured response with exactly these sections:

**NUTRITION** (per 100g):
- Calories: [value] kcal
- Protein: [value]g
- Carbohydrates: [value]g
- Fat: [value]g
- Key nutrients: [list 2-3]
- Health note: [one sentence relevant to Indian diet]

**ADULTERATION RISKS IN INDIA**:
- Adulterant 1: [name] — [how it is added]
- Adulterant 2: [name] — [how it is added]
- Adulterant 3: [name] — [how it is added]
- Home test: [one simple test using household items]
- Safety Risk Score: [X]/10

**ADVISORY**:
- [One actionable recommendation]
- FSSAI Consumer Portal: https://foscos.fssai.gov.in

Respond in {selected_language}.
"""
            if food_image:
                model = get_vision_model()
                image_parts = [{"mime_type": food_image.type, "data": food_image.getvalue()}]
                response = model.generate_content([prompt, image_parts[0]])
            else:
                model = get_model()
                response = model.generate_content(prompt)
                
            response_text = response.text
            
            # Render the report card
            st.markdown("---")
            with st.container(border=True):
                # We can add dynamic color coding if we parse the safety risk score
                # For simplicity and to stick exactly to Gemini's prompt, we'll just display it.
                # However, the prompt asks for: Safety score badge must be color-coded (green / yellow / red)
                
                # Let's try to inject the badge CSS into the text if we find the score
                import re
                
                def colorize_score(match):
                    score_str = match.group(1)
                    try:
                        score = int(score_str)
                        if score <= 3:
                            return f'Safety Risk Score: <span class="badge-green">{score}/10</span>'
                        elif score <= 6:
                            return f'Safety Risk Score: <span class="badge-yellow">{score}/10</span>'
                        else:
                            return f'Safety Risk Score: <span class="badge-red">{score}/10</span>'
                    except:
                        return match.group(0)

                # Assuming Gemini outputs "Safety Risk Score: X/10" in English, Kannada, or Hindi
                # We will try a flexible regex
                formatted_text = re.sub(r'Safety Risk Score:\s*(\d+)/10', colorize_score, response_text, flags=re.IGNORECASE)
                
                st.markdown(formatted_text, unsafe_allow_html=True)
            
        except Exception as e:
            st.error("Could not analyze this item. Please try again.")
            st.error(f"Details: {str(e)}")
