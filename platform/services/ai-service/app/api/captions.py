from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.config import Settings, get_settings
from app.core.auth import CurrentTenant, CurrentUser
from app.providers.llm import LLMProvider, get_provider

router = APIRouter(prefix="/v1/captions", tags=["captions"])


class CaptionRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=500, examples=["Navratri chaniya choli launch"])
    platform: Literal["instagram", "facebook", "linkedin", "youtube"] = "instagram"
    tone: str = "friendly"
    language: str = "en"
    variants: int = Field(default=3, ge=1, le=5)


class CaptionResponse(BaseModel):
    provider: str
    captions: list[str]


def provider_dep(settings: Annotated[Settings, Depends(get_settings)]) -> LLMProvider:
    return get_provider(settings)


@router.post("/generate", response_model=CaptionResponse)
async def generate_captions(
    body: CaptionRequest,
    _user: CurrentUser,
    tenant: CurrentTenant,
    llm: Annotated[LLMProvider, Depends(provider_dep)],
) -> CaptionResponse:
    # TODO: load brand profile + knowledge base for tenant.brand_id (RAG) into the prompt.
    system = (
        f"You write {body.platform} captions for an Indian D2C brand. "
        f"Tone: {body.tone}. "
        f"Language: {body.language}."
    )
    captions = [
        await llm.complete(system, f"{body.topic} (variant {i + 1})") for i in range(body.variants)
    ]
    return CaptionResponse(provider=llm.name, captions=captions)
