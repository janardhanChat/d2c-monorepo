from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import captions
from app.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="ai-service",
        version="0.1.0",
        docs_url="/docs" if settings.env != "production" else None,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", include_in_schema=False)
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": "ai-service"}

    app.include_router(captions.router)
    return app


app = create_app()
