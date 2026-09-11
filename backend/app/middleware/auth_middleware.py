"""
Authentication middleware.

Verifies the Supabase-issued JWT sent by the frontend and attaches the
authenticated user to `flask.g.user`. Routes must NEVER trust a
user_id sent in the request body - it must always come from here.
"""
from functools import wraps

import jwt
from flask import g, request

from app.config.settings import settings
from app.utils.responses import auth_error


def _extract_token() -> str | None:
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[len("Bearer "):].strip()
    return None


def _decode_token(token: str) -> dict:
    """Decode and verify a Supabase JWT.

    Supabase signs project JWTs with the project's JWT secret (HS256).
    In demo mode with no secret configured, we fall back to an
    unverified decode so the rest of the workflow can still be
    exercised locally - this path is disabled whenever a real secret
    is present.
    """
    if settings.SUPABASE_JWT_SECRET:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    # Demo / local fallback only - never used once SUPABASE_JWT_SECRET is set.
    return jwt.decode(token, options={"verify_signature": False})


def require_auth(fn):
    """Decorator for protected routes.

    On success, sets g.user = {"id": ..., "email": ...}.
    On failure, returns a standard 401 response and the wrapped view
    is never called.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        if not token:
            return auth_error("Missing authentication token")

        try:
            payload = _decode_token(token)
        except jwt.ExpiredSignatureError:
            return auth_error("Session expired, please log in again")
        except jwt.InvalidTokenError:
            return auth_error("Invalid authentication token")

        user_id = payload.get("sub")
        if not user_id:
            return auth_error("Invalid authentication token")

        g.user = {
            "id": user_id,
            "email": payload.get("email"),
        }
        return fn(*args, **kwargs)

    return wrapper


def optional_auth(fn):
    """Like require_auth, but proceeds (with g.user = None) if no
    token is present. Useful for demo-mode endpoints."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        g.user = None
        if token:
            try:
                payload = _decode_token(token)
                g.user = {"id": payload.get("sub"), "email": payload.get("email")}
            except jwt.InvalidTokenError:
                g.user = None
        return fn(*args, **kwargs)

    return wrapper
