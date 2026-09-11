"""
Anthropic Claude provider (Messages API).
"""
import requests

from app.services.ai.base_provider import AIProvider, AIProviderError


class ClaudeProvider(AIProvider):
    name = "claude"

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6"):
        self.api_key = api_key
        self.model = model

    def _call(self, input_data: dict) -> dict:
        if not self.api_key:
            raise AIProviderError("AI_API_KEY is not configured for the claude provider")

        prompt = input_data.get("text") or input_data.get("prompt") or ""
        try:
            resp = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "max_tokens": 1024,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=60,
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise AIProviderError(f"Claude request failed: {exc}") from exc

        data = resp.json()
        try:
            content = "".join(
                block.get("text", "") for block in data.get("content", [])
                if block.get("type") == "text"
            )
        except (KeyError, TypeError) as exc:
            raise AIProviderError("Unexpected response shape from Claude") from exc

        return {"summary": content, "raw": data}
