from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "CRM Microservice"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/crm_db"

    # JWT Settings
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Webhook Settings
    WEBHOOK_SECRET: str = "webhook-secret-key"
    ERP_WEBHOOK_URL: str = "http://localhost:8001/api/crm-webhook"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
