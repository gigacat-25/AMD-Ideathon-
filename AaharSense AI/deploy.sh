#!/usr/bin/env bash
# ==============================================================
# AaharSense AI — GCP Cloud Run Deployment Script
# One-time bootstrap + deploy
# ==============================================================
set -euo pipefail

# ── CONFIGURATION ─────────────────────────────────────────────
PROJECT_ID="${GCP_PROJECT_ID:-your-gcp-project-id}"
REGION="asia-south1"     # Mumbai
SERVICE_NAME="aaharsense-ai"
REPO_NAME="aaharsense"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
# ──────────────────────────────────────────────────────────────

echo "🚀 AaharSense AI — GCP Cloud Run Deployment"
echo "   Project : ${PROJECT_ID}"
echo "   Region  : ${REGION}"
echo "   Service : ${SERVICE_NAME}"
echo ""

# 1. Authenticate & set project
gcloud config set project "${PROJECT_ID}"

# 2. Enable required APIs
echo "📡 Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  --quiet

# 3. Create Artifact Registry repo (idempotent)
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="AaharSense AI container images" \
  --quiet 2>/dev/null || echo "   (Repository already exists — skipping)"

# 4. Store Gemini API key in Secret Manager
if [[ -n "${GEMINI_API_KEY}" ]]; then
  echo "🔑 Storing Gemini API key in Secret Manager..."
  echo -n "${GEMINI_API_KEY}" | gcloud secrets create GEMINI_API_KEY \
    --data-file=- --quiet 2>/dev/null || \
  echo -n "${GEMINI_API_KEY}" | gcloud secrets versions add GEMINI_API_KEY \
    --data-file=- --quiet
  echo "   ✅ Secret stored"
else
  echo "⚠️  GEMINI_API_KEY env var not set — skipping Secret Manager step."
  echo "   Set it with: export GEMINI_API_KEY=your_key_here"
fi

# 5. Configure Docker auth for Artifact Registry
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# 6. Build React frontend
echo "⚛️  Building React frontend..."
(cd frontend && npm ci && npm run build)

# 7. Build & push Docker image
echo "🐳 Building Docker image..."
docker build -t "${IMAGE_NAME}:latest" .
docker push "${IMAGE_NAME}:latest"

# 8. Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}:latest" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --quiet

# 9. Print the service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --format="value(status.url)")

echo ""
echo "✅ AaharSense AI is live at:"
echo "   ${SERVICE_URL}"
echo ""
echo "🧪 Quick health check:"
curl -s "${SERVICE_URL}/_stcore/health" && echo " — Healthy!" || echo " — Check logs"
