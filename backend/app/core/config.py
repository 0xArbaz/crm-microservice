from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union, Optional
import os
import json


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "CRM Microservice"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    # Do not hardcode the DB URL here. It should be provided via environment
    # variables or a .env file (see Config.env_file). Make this optional so
    # Settings will read it from the environment; we validate it below to
    # give a clear error if it's missing.
    DATABASE_URL: Optional[str] = None

    # JWT Settings
    # Secrets and environment-specific settings should come from the .env
    # or environment variables rather than being hardcoded here.
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: Optional[int] = None  # defaults to 24h if unset

    # CORS
    CORS_ORIGINS: Optional[List[str]] = None

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        # If unset, fall back to a safe local default list
        default = ["http://localhost:3000", "http://127.0.0.1:3000"]
        if v is None:
            return default
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                return parsed
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(',')]
        return v

    @field_validator('SECRET_KEY')
    @classmethod
    def check_secret_key(cls, v):
        if v is None or (isinstance(v, str) and v.strip() == ""):
            raise ValueError(
                "SECRET_KEY must be set in the environment or .env file"
            )
        return v

    @field_validator('ACCESS_TOKEN_EXPIRE_MINUTES')
    @classmethod
    def set_access_token_default(cls, v):
        if v is None:
            return 60 * 24
        return v

    # Webhook Settings
    # Secrets and endpoint URLs should come from environment/.env
    WEBHOOK_SECRET: Optional[str] = None
    ERP_WEBHOOK_URL: Optional[str] = "http://localhost:8001/api/crm-webhook"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @field_validator('WEBHOOK_SECRET')
    @classmethod
    def check_webhook_secret(cls, v):
        if v is None or (isinstance(v, str) and v.strip() == ""):
            raise ValueError(
                "WEBHOOK_SECRET must be set in the environment or .env file"
            )
        return v

    @field_validator('ERP_WEBHOOK_URL')
    @classmethod
    def set_erp_webhook_default(cls, v):
        # Provide a sensible local default if unset
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return "http://localhost:8001/api/crm-webhook"
        return v
    @field_validator('DATABASE_URL')
    @classmethod
    def check_database_url(cls, v):
        if v is None or (isinstance(v, str) and v.strip() == ""):
            raise ValueError(
                "DATABASE_URL must be set in the environment or .env file"
            )
        return v


settings = Settings()
