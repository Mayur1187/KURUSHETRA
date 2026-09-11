"""
AIService is the single entry point the rest of the backend uses for
AI processing. It picks a concrete provider based on configuration
(AI_PROVIDER env var) so routes and the processing service never
import a specific provider directly.

To add a new provider:
  1. Create a new file in app/services/ai/ that subclasses AIProvider.
  2. Register it in _PROVIDERS below.
  3. Set AI_PROVIDER=<your-key> in the environment.
No other code needs to change.
"""
from app.config.settings import settings
from app.services.ai.claude_provider import ClaudeProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.mock_provider import MockProvider
from app.services.ai.openai_provider import OpenAIProvider

_PROVIDERS = {
    "mock": lambda: MockProvider(),
    "openai": lambda: OpenAIProvider(
        api_key=settings.AI_API_KEY, model=settings.AI_MODEL, base_url=settings.AI_BASE_URL
    ),
    "gemini": lambda: GeminiProvider(api_key=settings.AI_API_KEY, model=settings.AI_MODEL),
    "claude": lambda: ClaudeProvider(api_key=settings.AI_API_KEY, model=settings.AI_MODEL),
    # "huggingface": lambda: HuggingFaceProvider(...),
    # "custom": lambda: CustomModelProvider(...),
}


class AIService:
    def __init__(self, provider_key: str | None = None):
        key = (provider_key or settings.AI_PROVIDER).lower()
        factory = _PROVIDERS.get(key, _PROVIDERS["mock"])
        self.provider = factory()

    def process(self, input_data: dict) -> dict:
        return self.provider.process(input_data, model=settings.AI_MODEL)


def get_ai_service() -> AIService:
    return AIService()
