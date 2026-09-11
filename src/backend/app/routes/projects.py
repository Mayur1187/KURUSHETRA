import uuid
from datetime import datetime, timezone

from flask import Blueprint, g, request

from app.middleware.auth_middleware import require_auth
from app.schemas.validation import ValidationError, validate_project_payload
from app.services.supabase_client import get_supabase
from app.utils.logger import log_error, new_request_id
from app.utils.responses import not_found_error, server_error, success, validation_error
from app.utils.sample_data import SAMPLE_PROJECTS

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


@projects_bp.get("")
@require_auth
def list_projects():
    supabase = get_supabase()
    if not supabase:
        return success(SAMPLE_PROJECTS, message="Demo projects (Supabase not configured)")

    req_id = new_request_id()
    try:
        resp = (
            supabase.table("projects")
            .select("*")
            .eq("user_id", g.user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return success(resp.data)
    except Exception as exc:
        log_error(req_id, "list_projects", exc)
        return server_error("Unable to load projects right now")


@projects_bp.post("")
@require_auth
def create_project():
    data = request.get_json(silent=True) or {}
    try:
        validate_project_payload(data)
    except ValidationError as exc:
        return validation_error(exc.details)

    record = {
        "id": str(uuid.uuid4()),
        "user_id": g.user["id"],
        "title": data["title"],
        "description": data.get("description", ""),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    supabase = get_supabase()
    if not supabase:
        return success(record, message="Project created (demo mode - not persisted)", status_code=201)

    req_id = new_request_id()
    try:
        resp = supabase.table("projects").insert(record).execute()
        return success(resp.data[0], message="Project created", status_code=201)
    except Exception as exc:
        log_error(req_id, "create_project", exc)
        return server_error("Unable to create project right now")


@projects_bp.get("/<project_id>")
@require_auth
def get_project(project_id):
    supabase = get_supabase()
    if not supabase:
        match = next((p for p in SAMPLE_PROJECTS if p["id"] == project_id), None)
        return success(match) if match else not_found_error("Project not found")

    req_id = new_request_id()
    try:
        resp = (
            supabase.table("projects")
            .select("*")
            .eq("id", project_id)
            .eq("user_id", g.user["id"])
            .single()
            .execute()
        )
        if not resp.data:
            return not_found_error("Project not found")
        return success(resp.data)
    except Exception as exc:
        log_error(req_id, "get_project", exc)
        return not_found_error("Project not found")
