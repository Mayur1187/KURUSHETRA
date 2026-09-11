"""
Standard API response envelope used by every route.

Keeping this in one place means the frontend can rely on a single
shape for success and error responses, regardless of which endpoint
it calls.
"""
from flask import jsonify


def success(data=None, message="Request completed successfully", status_code=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data if data is not None else {},
    }), status_code


def error(message="Request failed", code="ERROR", details=None, status_code=400):
    return jsonify({
        "success": False,
        "message": message,
        "error": {
            "code": code,
            "details": details if details is not None else {},
        },
    }), status_code


# Common error shortcuts -----------------------------------------------------

def validation_error(details=None, message="Validation failed"):
    return error(message, code="VALIDATION_ERROR", details=details, status_code=422)


def auth_error(message="Authentication required"):
    return error(message, code="AUTH_ERROR", status_code=401)


def forbidden_error(message="You do not have access to this resource"):
    return error(message, code="FORBIDDEN", status_code=403)


def not_found_error(message="Resource not found"):
    return error(message, code="NOT_FOUND", status_code=404)


def server_error(message="Something went wrong on our end"):
    return error(message, code="SERVER_ERROR", status_code=500)


def ai_error(message="AI processing failed"):
    return error(message, code="AI_ERROR", status_code=502)
