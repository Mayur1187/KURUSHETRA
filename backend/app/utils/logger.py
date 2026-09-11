"""
Very small logging helper.

Development mode logs full detail (including tracebacks); production
mode logs a compact line so we never leak internals to log aggregators
that might be less trusted than the app itself.
"""
import logging
import sys
import uuid

from app.config.settings import settings

logger = logging.getLogger("hackathon_platform")
logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    fmt = "%(asctime)s [%(levelname)s] %(message)s"
    handler.setFormatter(logging.Formatter(fmt))
    logger.addHandler(handler)


def new_request_id() -> str:
    return uuid.uuid4().hex[:12]


def log_error(request_id: str, context: str, exc: Exception):
    if settings.DEBUG:
        logger.exception(f"[{request_id}] {context}: {exc}")
    else:
        logger.error(f"[{request_id}] {context}: {type(exc).__name__}")
