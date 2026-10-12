from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven config, validated at startup (mirrors service-kit's loadEnv)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "development"
    log_level: str = "info"
    cors_origins: str = "http://localhost:3000"

    supabase_jwt_secret: str | None = None
    supabase_jwt_audience: str = "authenticated"

    # LLM provider: "echo" (offline stub) | "openai" | "anthropic" | ...
    llm_provider: str = "echo"
    llm_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
