"""
Mock provider - no network calls, always succeeds.

This exists so the entire end-to-end workflow (project -> input ->
processing -> result -> history) can be demoed and developed even
with no API keys and no internet connection, per the "Demo Mode"
requirement.
"""
import random
import time

from app.services.ai.base_provider import AIProvider


class MockProvider(AIProvider):
    name = "mock"
    model = "mock-v1"

    def _call(self, input_data: dict) -> dict:
        # Small artificial delay so the frontend's processing states
        # (Preparing -> Analyzing -> Generating) are visible in demos.
        time.sleep(random.uniform(0.4, 0.9))

        text_input = input_data.get("text", "")
        summary = (
            f"Mock analysis of your input ({len(text_input)} characters). "
            "Replace MockProvider with a real provider in "
            "app/services/ai/ai_service.py once an API key is available."
        )
        return {
            "summary": summary,
            "confidence": round(random.uniform(0.75, 0.98), 2),
            "tags": ["demo", "sample-output"],
            "echo": input_data,
        }
