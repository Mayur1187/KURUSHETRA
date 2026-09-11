"""
Google Gemini provider (generateContent REST API).
"""
import requests

from app.services.ai.base_provider import AIProvider, AIProviderError


class GeminiProvider(AIProvider):
    name = "gemini"

    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model = model

    def _call(self, input_data: dict) -> dict:
        if not self.api_key:
            raise AIProviderError("AI_API_KEY is not configured for the gemini provider")

        prompt = input_data.get("text") or input_data.get("prompt") or ""
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )
        try:
            resp = requests.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=60,
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise AIProviderError(f"Gemini request failed: {exc}") from exc

        data = resp.json()
        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as exc:
            raise AIProviderError("Unexpected response shape from Gemini") from exc

        return {"summary": content, "raw": data}
