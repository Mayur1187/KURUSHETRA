"""
Lightweight, dependency-free request validation.

Deliberately simple (Rule 2: don't overengineer) - swap for
Marshmallow/Pydantic later if the domain needs richer schemas.
"""


class ValidationError(Exception):
    def __init__(self, details: dict):
        self.details = details
        super().__init__(str(details))


def require_fields(data: dict, fields: list[str]):
    missing = [f for f in fields if f not in data or data[f] in (None, "")]
    if missing:
        raise ValidationError({f: "This field is required" for f in missing})


def validate_project_payload(data: dict):
    require_fields(data, ["title"])
    if len(data.get("title", "")) > 200:
        raise ValidationError({"title": "Must be 200 characters or fewer"})


def validate_processing_payload(data: dict):
    require_fields(data, ["project_id", "request_type", "input_data"])
    if not isinstance(data.get("input_data"), dict):
        raise ValidationError({"input_data": "Must be an object"})
