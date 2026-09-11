from flask import Blueprint, g, request

from app.middleware.auth_middleware import require_auth
from app.schemas.validation import ValidationError, validate_processing_payload
from app.services.processing.processing_service import get_processing_service
from app.services.supabase_client import get_supabase
from app.utils.logger import log_error, new_request_id
from app.utils.responses import ai_error, not_found_error, server_error, success, validation_error

processing_bp = Blueprint("processing", __name__, url_prefix="/api/processing")


@processing_bp.post("")
@require_auth
def submit_processing():
    data = request.get_json(silent=True) or {}
    try:
        validate_processing_payload(data)
    except ValidationError as exc:
        return validation_error(exc.details)

    req_id = new_request_id()
    try:
        service = get_processing_service()
        outcome = service.submit(
            user_id=g.user["id"],
            project_id=data["project_id"],
            request_type=data["request_type"],
            input_data=data["input_data"],
        )
    except Exception as exc:
        log_error(req_id, "submit_processing", exc)
        return server_error("Unable to submit your request right now")

    if outcome["request"]["status"] == "failed":
        return ai_error(outcome.get("error") or "The AI provider could not process this request")

    return success(outcome, message="Processing completed", status_code=201)


@processing_bp.get("/<request_id>")
@require_auth
def get_processing_status(request_id):
    supabase = get_supabase()
    if not supabase:
        return success({"id": request_id, "status": "completed"}, message="Demo mode")

    req_id = new_request_id()
    try:
        resp = (
            supabase.table("processing_requests")
            .select("*")
            .eq("id", request_id)
            .eq("user_id", g.user["id"])
            .single()
            .execute()
        )
        if not resp.data:
            return not_found_error("Processing request not found")
        return success(resp.data)
    except Exception as exc:
        log_error(req_id, "get_processing_status", exc)
        return not_found_error("Processing request not found")
