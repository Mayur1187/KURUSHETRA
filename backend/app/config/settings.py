"""
Centralized backend configuration.

Everything that is likely to change between hackathons (AI provider,
demo mode, feature flags) is read from environment variables here, so
no other module should call os.environ directly.
"""
import os


def _bool(name: str, default: bool = False) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


class Settings:
    # --- Flask ---
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = FLASK_ENV != "production"
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")
    PORT = int(os.environ.get("FLASK_PORT", 5000))
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

    # --- Supabase ---
    SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")

    # --- AI ---
    AI_PROVIDER = os.environ.get("AI_PROVIDER", "mock").lower()
    AI_MODEL = os.environ.get("AI_MODEL", "gpt-4o-mini")
    AI_API_KEY = os.environ.get("AI_API_KEY", "")
    AI_BASE_URL = os.environ.get("AI_BASE_URL", "")

    # --- Demo mode ---
    DEMO_MODE = _bool("DEMO_MODE", True)

    # --- Feature flags (mirrors frontend config/projectConfig.js) ---
    FEATURES = {
        "fileUpload": _bool("FEATURE_FILE_UPLOAD", True),
        "history": _bool("FEATURE_HISTORY", True),
        "export": _bool("FEATURE_EXPORT", False),
        "admin": _bool("FEATURE_ADMIN", False),
        "demoMode": DEMO_MODE,
    }

    @classmethod
    def is_supabase_configured(cls) -> bool:
        return bool(cls.SUPABASE_URL and cls.SUPABASE_SERVICE_ROLE_KEY)


settings = Settings()
