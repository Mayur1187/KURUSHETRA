"""
Thin wrapper around Supabase Storage.

Centralizes bucket names, file validation, and ownership-scoped paths
so upload logic doesn't get duplicated across routes.
"""
import uuid

from app.services.supabase_client import get_supabase

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf", "csv", "txt", "json", "xlsx", "docx"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20MB

BUCKETS = {
    "uploads": "uploads",
    "user_files": "user-files",
    "generated_results": "generated-results",
    "reports": "reports",
}


class StorageError(Exception):
    pass


def validate_file(filename: str, size_bytes: int):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise StorageError(f"File type '.{ext}' is not supported")
    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise StorageError("File exceeds the 20MB size limit")


def upload_file(user_id: str, bucket: str, filename: str, file_bytes: bytes) -> str:
    """Uploads a file scoped to the user's own folder and returns its path.

    Path convention: {bucket}/{user_id}/{uuid}_{filename}
    RLS policies on the storage.objects table should check that the
    first path segment matches the authenticated user's id.
    """
    supabase = get_supabase()
    safe_name = f"{uuid.uuid4().hex[:8]}_{filename}"
    path = f"{user_id}/{safe_name}"

    if not supabase:
        # Demo mode: pretend the upload succeeded.
        return f"demo://{bucket}/{path}"

    supabase.storage.from_(bucket).upload(path, file_bytes)
    return path


def get_public_url(bucket: str, path: str) -> str:
    supabase = get_supabase()
    if not supabase:
        return f"demo://{bucket}/{path}"
    return supabase.storage.from_(bucket).get_public_url(path)


def delete_file(bucket: str, path: str):
    supabase = get_supabase()
    if not supabase:
        return
    supabase.storage.from_(bucket).remove([path])
