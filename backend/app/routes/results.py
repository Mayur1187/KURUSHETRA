from flask import Blueprint, g

from app.middleware.auth_middleware import require_auth
from app.services.supabase_client import get_supabase
from app.utils.logger import log_error, new_request_id
from app.utils.responses import not_found_error, server_error, success
from app.utils.sample_data import SAMPLE_RESULTS

results_bp = Blueprint("results", __name__, url_prefix="/api/results")


@results_bp.get("")
@require_auth
def list_results():
    supabase = get_supabase()
    if not supabase:
        return success(SAMPLE_RESULTS, message="Demo results (Supabase not configured)")

    req_id = new_request_id()
    try:
        # results are scoped to the user via their processing_requests;
        # a Postgres view or RPC is recommended for production use.
        resp = (
            supabase.table("results")
            .select("*, processing_requests!inner(user_id)")
            .eq("processing_requests.user_id", g.user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return success(resp.data)
    except Exception as exc:
        log_error(req_id, "list_results", exc)
        return server_error("Unable to load results right now")


@results_bp.get("/<result_id>")
@require_auth
def get_result(result_id):
    supabase = get_supabase()
    if not supabase:
        match = next((r for r in SAMPLE_RESULTS if r["id"] == result_id), None)
        return success(match) if match else not_found_error("Result not found")

    req_id = new_request_id()
    try:
        resp = (
            supabase.table("results")
            .select("*, processing_requests!inner(user_id)")
            .eq("id", result_id)
            .eq("processing_requests.user_id", g.user["id"])
            .single()
            .execute()
        )
        if not resp.data:
            return not_found_error("Result not found")
        return success(resp.data)
    except Exception as exc:
        log_error(req_id, "get_result", exc)
        return not_found_error("Result not found")


@results_bp.delete("/<result_id>")
@require_auth
def delete_result(result_id):
    supabase = get_supabase()
    if not supabase:
        return success(message="Result deleted (demo mode)")

    req_id = new_request_id()
    try:
        supabase.table("results").delete().eq("id", result_id).execute()
        return success(message="Result deleted")
    except Exception as exc:
        log_error(req_id, "delete_result", exc)
        return server_error("Unable to delete result right now")
