from flask import Blueprint

from app.config.settings import settings
from app.services.supabase_client import get_supabase
from app.utils.responses import success

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    supabase_connected = False
    if settings.is_supabase_configured():
        try:
            client = get_supabase()
            client.table("profiles").select("id").limit(1).execute()
            supabase_connected = True
        except Exception:
            supabase_connected = False

    return success({
        "backend": "running",
        "database_connected": supabase_connected,
        "ai_provider": settings.AI_PROVIDER,
        "demo_mode": settings.DEMO_MODE,
        "features": settings.FEATURES,
    }, message="Service is healthy")
