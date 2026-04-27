# AaharSense AI — Antigravity Build Prompt

## Context

You are building **AaharSense AI**, a combined Indian food nutrition analyzer and adulteration detector. The base code is provided as a ZIP file. Extract it, understand the existing structure, and extend it with the features below.

---

## Step 1 — Extract and Understand the Base Code

1. Extract the ZIP file provided
2. Read all existing files — understand the current app structure, existing Gemini API calls, and UI layout
3. Do not delete or rewrite working code — only extend it

---

## Step 2 — What to Build On Top

### Core Feature: Dual-Mode Food Analysis

The app must accept **two types of input**:
- Text input (user types a food item e.g. "milk", "turmeric", "ghee")
- Image upload (user uploads or snaps a photo of the food item)

For **both input types**, the app must return a **single combined report card** with the following sections:

#### Section 1 — Nutrition Analysis
- Estimated calories (per 100g)
- Protein, Carbohydrates, Fat (in grams)
- Key micronutrients relevant to the food item
- A short note on health benefit or risk for Indians

#### Section 2 — Adulteration Detection
- Top 3 common adulterants found in this food in India (with FSSAI context)
- One simple home test the user can do right now (using household items like water, iodine, vinegar, or flame)
- Safety Risk Score out of 10 (1 = very safe, 10 = very risky)
- Color-coded badge: 🟢 Low (1–3) / 🟡 Medium (4–6) / 🔴 High (7–10)

#### Section 3 — Advisory
- One actionable recommendation (e.g. "Buy from FSSAI-certified sellers only")
- Link to FSSAI consumer complaint portal: https://foscos.fssai.gov.in

---

## Step 3 — The Gemini Prompt to Use

Use this exact prompt structure inside your Gemini API call:

```python
prompt = f"""
You are an Indian food safety and nutrition expert.

For the Indian food item: '{food_input}'

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

Respond in {selected_language}.
"""
```

---

## Step 4 — Language Toggle

Add a toggle button at the top of the app:

```
[ English ]  [ ಕನ್ನಡ ]  [ हिंदी ]
```

- Default: English
- When Kannada or Hindi is selected, pass `selected_language = "Kannada"` or `"Hindi"` into the Gemini prompt
- The entire AI response must switch language — not just the UI labels

---

## Step 5 — UI Requirements

- Clean, mobile-friendly layout
- Color scheme: Saffron (`#FF9933`), White (`#FFFFFF`), Green (`#138808`) — Indian flag colors
- Report card must use a card/container component with clear section dividers
- Safety score badge must be color-coded (green / yellow / red)
- Show a loading spinner while Gemini is processing
- On error, show a friendly message: *"Could not analyze this item. Please try again."*

---

## Step 6 — Deployment

- Include a `Dockerfile` for Google Cloud Run deployment
- App must run on port `8080`
- Use `streamlit run app.py --server.port 8080 --server.address 0.0.0.0` as the container start command
- Include a `requirements.txt` with all dependencies

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Streamlit |
| AI Model | Gemini 2.5 Flash (via Google AI SDK) |
| Image input | Gemini Vision (multimodal) |
| Language | Python 3.11 |
| Deployment | Google Cloud Run |

---

## What NOT to Do

- Do not add user login or database storage
- Do not add multiple pages or tabs beyond what is described
- Do not rewrite working base code — only extend it
- Do not use any paid APIs other than Gemini

---

## Final Deliverable

A single working Streamlit app that:
1. Accepts food name (text) or food photo (image upload)
2. Returns a combined Nutrition + Adulteration report in one card
3. Supports English, Kannada, and Hindi output
4. Is fully deployable to Google Cloud Run with the included Dockerfile

