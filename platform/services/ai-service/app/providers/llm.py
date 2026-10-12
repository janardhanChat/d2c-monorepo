"""LLM provider seam. Routes depend on the protocol, never on a vendor SDK."""

from typing import Protocol

from app.config import Settings


class LLMProvider(Protocol):
    name: str

    async def complete(self, system: str, prompt: str) -> str: ...


class EchoProvider:
    """Offline stub so the service runs and tests pass without API keys."""

    name = "echo"

    async def complete(self, system: str, prompt: str) -> str:
        return f"[draft] {prompt[:200]}"


def get_provider(settings: Settings) -> LLMProvider:
    if settings.llm_provider == "echo":
        return EchoProvider()
    # Add real providers here (OpenAI, Anthropic, Gemini ...) behind the same protocol.
    raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")
