"""
Every AI provider (OpenAI-compatible, Gemini, Claude, HuggingFace,
a custom model server, ...) implements this interface. The rest of
the app only ever talks to AIProvider, never to a specific SDK, so
swapping providers after the problem statement is known means writing
one new file here - nothing else changes.
"""
import time
from abc import ABC, abstractmethod


class AIProviderError(Exception):
    """Raised by a provider when it cannot produce a result."""


class AIProvider(ABC):
    name = "base"

    @abstractmethod
    def _call(self, input_data: dict) -> dict:
        """Provider-specific call. Return any JSON-serializable dict
        representing the raw model output. Raise AIProviderError on
        failure."""
        raise NotImplementedError

    def process(self, input_data: dict, model: str | None = None) -> dict:
        """Public entry point used by ProcessingService.

        Wraps `_call` with timing and a consistent response envelope
        so every provider looks the same to the rest of the app.
        """
        start = time.time()
        try:
            raw_result = self._call(input_data)
            elapsed = round(time.time() - start, 3)
            return {
                "success": True,
                "result": raw_result,
                "metadata": {
                    "provider": self.name,
                    "model": model or getattr(self, "model", "unknown"),
                    "processing_time": elapsed,
                },
            }
        except AIProviderError as exc:
            elapsed = round(time.time() - start, 3)
            return {
                "success": False,
                "result": None,
                "metadata": {
                    "provider": self.name,
                    "model": model or getattr(self, "model", "unknown"),
                    "processing_time": elapsed,
                },
                "error": str(exc),
            }
