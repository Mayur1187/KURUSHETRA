"""
DOMAIN MODULE - REPLACE THIS AFTER THE PROBLEM STATEMENT IS RELEASED.

This is the one place in the backend where problem-specific logic
should live: shaping the AI prompt, adding domain validation, running
any preprocessing (e.g. parsing an uploaded CSV, resizing an image),
and interpreting results.

The core ProcessingService calls `apply_domain_processing()` and does
not know or care what happens inside it - so the team can rewrite this
file (and domain_prompts.py) freely without touching auth, database,
storage, or the AI provider abstraction.
"""
from app.domain.domain_prompts import build_prompt


def apply_domain_processing(request_type: str, input_data: dict) -> dict:
    """Transform raw user input into whatever shape the AI provider
    needs. Replace the body of this function for your actual problem
    statement.

    Currently: if the input contains raw text, wrap it in a generic
    prompt template. Pass everything else through untouched.
    """
    prepared = dict(input_data)

    if "text" in input_data:
        prepared["text"] = build_prompt(request_type, input_data["text"])

    return prepared


def interpret_result(result_data: dict) -> dict:
    """Optional post-processing hook for turning a raw AI result into
    whatever structure the domain's result components expect
    (e.g. splitting a response into sections, computing a score,
    mapping labels to a rubric). Currently a passthrough."""
    return result_data
