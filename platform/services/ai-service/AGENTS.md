# ai-service — rules for the Python service

FastAPI service for captions, plans, audience and copy suggestions. Root `AGENTS.md` applies.

## MUST

- Python 3.12+, managed by `uv`. Add packages with `uv add <pkg>` (never `pip install`, never edit `uv.lock`).
- Every function typed; `uv run mypy` (strict) and `uv run ruff check . && uv run ruff format --check .` must pass. Run all checks with `pnpm exec nx run-many -t lint typecheck test -p ai-service`.
- Routes in `app/api/<name>.py` with an `APIRouter`, pydantic request/response models, and the `CurrentUser` + `CurrentTenant` dependencies from `app/core/auth.py`.
- LLM calls only through the `LLMProvider` protocol in `app/providers/llm.py`. Add a provider class there; never call a vendor SDK from a route.
- Config only through `app/config.py` (`Settings`); new keys go in `.env.example`.
- Tests in `tests/` with `TestClient` and `dependency_overrides`; use the `echo` provider, never a real API key or network call.

## NEVER

- Never send one brand's data (knowledge base, leads, prompts) into another brand's request or cache key. Cache keys include `organization_id` and `brand_id`.
- Never log prompts or completions that contain customer data.
- Never add `# noqa` / `# type: ignore` to pass checks.
