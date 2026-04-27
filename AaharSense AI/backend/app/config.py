"""
NutriSense Configuration
Loads environment variables and provides typed settings via Pydantic.
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Gemini API
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    # Firebase / GCP
    firebase_api_key: str = os.getenv("FIREBASE_API_KEY", "")
    firebase_auth_domain: str = os.getenv("FIREBASE_AUTH_DOMAIN", "")
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "")
    firebase_storage_bucket: str = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    gcp_project_id: str = os.getenv("GCP_PROJECT_ID", "")

    # Server
    port: int = int(os.getenv("PORT", "8080"))
    host: str = os.getenv("HOST", "0.0.0.0")
    environment: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
