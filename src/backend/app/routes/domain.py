"""
DOMAIN MODULE - add problem-specific endpoints here, under /api/domain/*.

Keeping these separate from the core /api/projects, /api/processing,
and /api/results routes means the core API surface never has to
change, no matter what the final problem statement turns out to be.
"""
from flask import Blueprint

from app.middleware.auth_middleware import require_auth
from app.utils.responses import success

domain_bp = Blueprint("domain", __name__, url_prefix="/api/domain")


@domain_bp.get("/ping")
@require_auth
def domain_ping():
    """Example placeholder endpoint - replace with real domain routes."""
    return success({"message": "Domain module is wired up and ready to extend."})
