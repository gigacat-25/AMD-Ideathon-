# =========================================================
# AaharSense AI — Dockerfile
# Target: Google Cloud Run (port 8080)
# Entry: Streamlit app (app.py) with Gemini AI backend
# =========================================================

FROM python:3.11-slim

# System deps + curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Env vars
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Install Python deps first (caching layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy pre-built React assets into backend static dir so FastAPI can serve them
RUN mkdir -p /app/backend/static
COPY frontend/dist/ /app/backend/static/

# Expose Cloud Run port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s \
    CMD curl --fail http://localhost:8080/_stcore/health || exit 1

# Run Streamlit on 0.0.0.0 so Cloud Run can reach it
CMD ["python", "-m", "streamlit", "run", "app.py", \
    "--server.port", "8080", \
    "--server.address", "0.0.0.0", \
    "--server.headless", "true", \
    "--server.enableCORS", "false", \
    "--server.enableXsrfProtection", "false"]
