"""
OpenAI-compatible provider.

Works with the real OpenAI API, and with any self-hosted or third
party service that implements the same /chat/completions schema
(e.g. many open-weight model servers), by overriding AI_BASE_URL.
"""
import requests

from app.services.ai.base_provider import AIProvider, AIProviderError


class OpenAIProvider(AIProvider):
    name = "openai"

    def __init__(self, api_key: str, model: str, base_url: str = ""):
        self.api_key = api_key
        self.model = model
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")

    def _call(self, input_data: dict) -> dict:
        if not self.api_key:
            raise AIProviderError("AI_API_KEY is not configured for the openai provider")

        prompt = input_data.get("text") or input_data.get("prompt") or ""
        try:
            resp = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=60,
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise AIProviderError(f"OpenAI-compatible request failed: {exc}") from exc

        data = resp.json()
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise AIProviderError("Unexpected response shape from provider") from exc

        return {"summary": content, "raw": data}
