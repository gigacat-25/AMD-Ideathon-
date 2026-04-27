# ===================================
# AaharSense AI - Dockerfile
# Optimized for Google Cloud Run
# ===================================

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code
COPY . .

# Expose port for Cloud Run
EXPOSE 8080

# Health check (Streamlit handles its own health check, but we can do a simple curl or skip it)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD curl --fail http://localhost:8080/_stcore/health || exit 1

# Run with Streamlit
CMD ["streamlit", "run", "app.py", "--server.port", "8080", "--server.address", "0.0.0.0"]
