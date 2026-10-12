# Copilot instructions

Follow `AGENTS.md` at the repo root and the nested `AGENTS.md` in the folder you are editing. They are the single source of truth for AI agents in this repo.

Most important rules:

- pnpm only (never npm/yarn); uv for Python.
- Never edit `.env*`, lockfiles, existing SQL migrations, `eslint.config.mjs`, `nx.json`, `.github/**`, `.husky/**`, `.claude/**`, `tools/agents/**` or any `AGENTS.md`.
- Never import one product from another, or a connector from a product.
- Every tenant route uses `app.authenticate` + `app.requireTenant(role)`, and every query filters by `brand_id` / `organization_id`.
- Validate input with zod; new behaviour needs a test, including a cross-tenant 403 test.
- Never disable lint rules or add `@ts-ignore` to pass checks.
