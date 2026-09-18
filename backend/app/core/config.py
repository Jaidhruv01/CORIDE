from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CoRide"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    
    SECRET_KEY: str = "coride-super-secret-production-grade-key-lavender-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for seamless development
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    DATABASE_URL: str = "sqlite:///./coride.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://coride.co.in",
        "https://www.coride.co.in",
        "http://coride.co.in",
        "http://www.coride.co.in",
        "http://localhost:5180",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8001",
        "http://127.0.0.1:5180",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8001",
        "*"
    ]
    
    # Razorpay / Payment settings
    RAZORPAY_KEY_ID: str = "rzp_test_coride2026"
    RAZORPAY_KEY_SECRET: str = "coride_mock_secret_key"
    RAZORPAY_WEBHOOK_SECRET: str = "coride_webhook_secret"
    
    # Platform fees (0% promotional launch - free for all riders and drivers)
    PLATFORM_FEE_PERCENTAGE: float = 0.0  # 0% promotional platform fee
    MIN_PLATFORM_FEE: float = 0.0
    
    # Master Admin Security PIN & Secret Key
    ADMIN_SECURITY_PIN: str = "984210"
    ADMIN_SECURITY_KEY: str = "CORIDE-MASTER-2026-KEY"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()

