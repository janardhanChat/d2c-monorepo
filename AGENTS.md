# AGENTS.md — rules for AI coding agents

This file is the contract for every AI agent working in this repo (Claude Code, Codex, Cursor, Copilot, Gemini, Aider…). Rules marked **MUST** / **NEVER** are not suggestions. Several are enforced by hooks, lint and CI; the rest are reviewed by humans. If a rule blocks the task, **stop and ask** — never work around it.

Nested `AGENTS.md` files add rules for their folder. When two files apply, follow both; the more specific one wins on conflicts.

---

## 1. What this repo is

D2C Business OS: a multi-tenant automation platform for D2C brands and SMBs (Meta Ads, WhatsApp marketing, social automation). Nx + pnpm monorepo:

| Folder                         | Contents                                               | Nested rules                             |
| ------------------------------ | ------------------------------------------------------ | ---------------------------------------- |
| `apps/web`                     | Next.js 16 dashboard shell                             | `apps/web/AGENTS.md`                     |
| `platform/services/*`          | Fastify platform services (core-api, integrations-api) | `platform/services/AGENTS.md`            |
| `platform/services/ai-service` | Python FastAPI service                                 | `platform/services/ai-service/AGENTS.md` |
| `platform/frontend`            | Shared dashboard screens                               | UI section of `packages/AGENTS.md`       |
| `products/<name>/*`            | One product = domain / api / frontend / db             | `products/AGENTS.md`                     |
| `connectors/*`                 | Third-party API clients (Postiz, Meta…)                | `connectors/AGENTS.md`                   |
| `packages/*`                   | Shared libraries (ui, auth, tenant, service-kit)       | `packages/AGENTS.md`                     |
| `infra/*`                      | Docker, gateway, Supabase/Postiz setup                 | `infra/AGENTS.md`                        |

Read `docs/architecture.md` before any change that crosses folders.

---

## 2. Workflow — every task, in this order

1. **Understand first.** Read the files you will touch and the nearest `AGENTS.md`. Find an existing example of the pattern (e.g. `platform/services/core-api/src/modules/organizations`) and copy its shape.
2. **Plan small.** State which files you will change before changing them. One concern per change; no drive-by refactors, renames or reformatting of untouched code.
3. **Change.** Follow the conventions in §4.
4. **Verify** (MUST, before saying "done"):
   ```bash
   pnpm exec nx affected -t lint typecheck test build --base=main
   ```
   For a single project: `pnpm exec nx run-many -t lint typecheck test -p <project>`. Python: `pnpm exec nx run-many -t lint typecheck test -p ai-service`.
5. **Report honestly.** List what you changed, what you ran, and what passed or failed. Never claim tests pass without running them. Never hide a failure.

---

## 3. NEVER (hard rules)

Enforced by `.claude/settings.json` hooks (`tools/agents/`), ESLint, git hooks or CI where noted.

**Secrets and data**

- NEVER read, print, create or edit `.env` / `.env.*` files (only `.env.example`). _(hook + permissions)_
- NEVER hard-code secrets, tokens, API keys, passwords or real customer data. Use env vars validated with `loadEnv`.
- NEVER log tokens, `authorization` headers, phone numbers or message bodies.

**Protected files** — humans only. Propose the change in your reply instead. _(hook)_

- Lockfiles: `pnpm-lock.yaml`, `uv.lock` (change them only through `pnpm add/remove` or `uv add/remove`).
- Guardrails: `eslint.config.mjs`, `nx.json`, `commitlint.config.mjs`, `lint-staged.config.mjs`, `.husky/*`, `.github/**`, `.claude/**`, `.cursor/**`, `tools/agents/**`, every `AGENTS.md` / `CLAUDE.md`, `.github/CODEOWNERS`.
- Existing SQL migrations (`**/migrations/*.sql`). Migrations are append-only: add a new numbered file. _(hook + CI)_
- Fetched upstream infra: `infra/supabase/upstream/**`, `infra/postiz/upstream/**`.
- Generated output: `dist/`, `.next/`, `storybook-static/`, `node_modules/`, `.nx/`, `.venv/`.

**Git** _(hook)_

- NEVER `git push` (any form), `git reset --hard`, `git clean -f`, `git rebase`, `git commit --amend` on shared history, or delete branches.
- NEVER bypass hooks: no `--no-verify`, no `HUSKY=0`.
- Commit only when asked; message must be Conventional Commits with a scope (`feat(social): …`). _(commitlint)_

**Destructive commands** _(hook)_

- NEVER `rm -rf` outside generated folders, `docker compose down -v`, `docker system prune`, `DROP`/`TRUNCATE` SQL, or `curl … | sh`.
- NEVER use `npm` or `yarn`. This repo uses `pnpm` (and `uv` for Python).

**Architecture** _(ESLint `@nx/enforce-module-boundaries`)_

- NEVER import one product from another (`products/social` ↛ `products/commerce`). Talk through HTTP APIs or events.
- NEVER import `connectors/*` from a product. Only `platform/services/*` use connectors.
- NEVER import service code into frontend code or vice versa.
- NEVER disable a lint rule (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `# noqa`, `type: ignore`) to make a check pass. Fix the cause or ask.
- NEVER weaken types with `any`, `as unknown as`, or non-null `!` without a comment explaining why it is safe.

**Scope**

- NEVER add a dependency without saying why in your reply; prefer what is already installed (zod, fastify plugins, jose, postgres, clsx, cva…).
- NEVER delete or skip a failing test to get green. Fix the code, or report the failure.
- NEVER change public API contracts (routes, request/response schemas, event names) without being asked. Version instead (`/v2/…`, `event.v2`).

---

## 4. MUST (conventions)

**Multi-tenancy — the most important rule in this codebase**

- Every business table has `organization_id` (and `brand_id` when brand-specific) and row-level security.
- Every tenant route uses `onRequest: [app.authenticate, app.requireTenant("<role>")]`.
- Every repository query filters by `brand_id` / `organization_id` from `req.tenant` — never from the request body.
- Every queued job and event payload carries `organizationId` and `brandId`.
- A test MUST prove that another tenant gets 403/404 for any new tenant-scoped route.

**TypeScript**

- Strict mode, ESM, `import type` for types. Validate all input with zod schemas (body, params, query, response).
- Services: `app.ts` builds the app from injected deps; `main.ts` wires real deps. Modules = `*.routes.ts`, `*.schema.ts`, `*.service.ts`, `*.repo.ts`.
- Errors carry a `statusCode`; let the service-kit error handler format them. Don't `reply.send` raw errors.
- Business rules live in `products/<name>/domain` (framework-free), not in routes or React components.

**Tests**

- New behaviour = new test. Bug fix = a test that fails before the fix.
- Use `app.inject` for routes, in-memory repos for unit tests. No network calls in tests (mock `fetch`).

**Frontend**

- Use `@ap/ui` primitives and design tokens; no hard-coded colours. New shared component → story in Storybook.

**Python** (`ai-service`): typed (`mypy --strict`), `ruff` clean, FastAPI dependencies for auth/tenant, `uv` for packages.

**Env vars**: add new ones to the service's `env.ts` schema AND `.env.example` with a comment.

---

## 5. When to stop and ask a human

- The task needs a protected file, a new migration on an existing table, a new dependency, or a contract change.
- Requirements are ambiguous, or two rules conflict.
- A check fails and the fix is outside the task's scope.
- Anything touching billing, Meta/WhatsApp tokens, permissions, or deleting data.

Ask with: what you want to change, why, and the exact diff you propose.

---

## 6. Commands

```bash
pnpm install                         # install (never npm/yarn)
pnpm dev                             # run everything
pnpm exec nx show projects           # list projects
pnpm exec nx affected -t lint typecheck test build --base=main   # verify your change
pnpm exec nx run-many -t test -p @ap/core-api                    # one project
pnpm format                          # prettier
pnpm new:product <id> "<Name>" "<desc>" [--api]                  # scaffold a product
uv sync --directory platform/services/ai-service                 # Python deps
```
