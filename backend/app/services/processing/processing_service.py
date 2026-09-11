"""
ProcessingService orchestrates the core workflow:

    validate -> create request record -> call AI -> store result

It is deliberately synchronous for now (Rule 2: don't overengineer),
but every step is a separate method so this can be swapped for a
background task queue (Celery/RQ) later without touching routes.
"""
import uuid
from datetime import datetime, timezone

from app.domain.domain_service import apply_domain_processing
from app.services.ai.ai_service import get_ai_service
from app.services.supabase_client import get_supabase


class ProcessingService:
    def __init__(self):
        self.ai_service = get_ai_service()

    # -- Public API -----------------------------------------------------

    def submit(self, user_id: str, project_id: str, request_type: str, input_data: dict) -> dict:
        """Runs the full pipeline and returns the persisted result
        (or an in-memory demo result if Supabase isn't configured)."""
        supabase = get_supabase()

        request_record = self._create_request(supabase, user_id, project_id, request_type, input_data)

        # Domain-specific pre-processing / prompt shaping happens here,
        # kept out of the core service so it's easy to replace.
        prepared_input = apply_domain_processing(request_type, input_data)

        ai_response = self.ai_service.process(prepared_input)

        status = "completed" if ai_response.get("success") else "failed"
        self._update_request_status(supabase, request_record["id"], status)

        result_record = None
        if status == "completed":
            result_record = self._store_result(supabase, request_record["id"], ai_response)

        return {
            "request": {**request_record, "status": status},
            "result": result_record,
            "ai_metadata": ai_response.get("metadata"),
            "error": ai_response.get("error"),
        }

    # -- Internals --------------------------------------------------------

    def _create_request(self, supabase, user_id, project_id, request_type, input_data) -> dict:
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "project_id": project_id,
            "request_type": request_type,
            "status": "processing",
            "input_data": input_data,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        if supabase:
            resp = supabase.table("processing_requests").insert(record).execute()
            if resp.data:
                return resp.data[0]
        return record  # demo-mode fallback: nothing persisted

    def _update_request_status(self, supabase, request_id: str, status: str):
        if supabase:
            supabase.table("processing_requests").update({"status": status}).eq(
                "id", request_id
            ).execute()

    def _store_result(self, supabase, request_id: str, ai_response: dict) -> dict:
        record = {
            "id": str(uuid.uuid4()),
            "request_id": request_id,
            "result_data": ai_response.get("result"),
            "metadata": ai_response.get("metadata"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        if supabase:
            resp = supabase.table("results").insert(record).execute()
            if resp.data:
                return resp.data[0]
        return record


def get_processing_service() -> ProcessingService:
    return ProcessingService()
