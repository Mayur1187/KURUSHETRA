"""
DOMAIN MODULE - prompt templates.

Keep every AI prompt in one file so the team can iterate on wording
quickly during the hackathon without hunting through route handlers.
"""

GENERIC_TEMPLATE = (
    "You are a helpful assistant for a hackathon project.\n"
    "Task type: {request_type}\n\n"
    "User input:\n{user_text}\n\n"
    "Respond clearly and concisely."
)


def build_prompt(request_type: str, user_text: str) -> str:
    """Replace this with the real problem-statement prompt once known.
    Consider adding one template per request_type, e.g.:

        TEMPLATES = {
            "classification": CLASSIFICATION_TEMPLATE,
            "summarization": SUMMARY_TEMPLATE,
        }
        return TEMPLATES.get(request_type, GENERIC_TEMPLATE).format(...)
    """
    return GENERIC_TEMPLATE.format(request_type=request_type, user_text=user_text)
