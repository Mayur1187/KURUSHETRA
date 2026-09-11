"""
Thin wrapper around the Supabase Python client.

Everything else in the backend should import `get_supabase()` from
here rather than creating its own client, so there is exactly one
place that holds the service-role key.

IMPORTANT: this client uses the SERVICE ROLE key and therefore bypasses
Row Level Security. It must never be exposed to the frontend, and every
query built with it must manually filter by the authenticated user_id
(see app/middleware/auth_middleware.py).
"""
from app.config.settings import settings

_client = None


def get_supabase():
    """Return a cached Supabase client, or None if not configured.

    Returning None (instead of raising) lets routes fall back to demo
    data when Supabase hasn't been set up yet, which keeps the app
    runnable during early hackathon hours.
    """
    global _client
    if _client is not None:
        return _client

    if not settings.is_supabase_configured():
        return None

    from supabase import create_client

    _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _client
