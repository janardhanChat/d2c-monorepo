# automation-platform

**D2C Business OS**: a multi-tenant automation platform for D2C brands and SMBs. Social media automation ships first; Commerce, CRM and Fulfillment plug in as products.

Nx + pnpm monorepo · Next.js 16 · Fastify 5 · Python FastAPI · self-hosted Supabase · Postiz (publishing engine, behind an adapter).

## Quick start

```bash
nvm use                 # Node 22
corepack enable         # pnpm 10
pnpm install            # also installs git hooks (husky)
uv sync --directory platform/services/ai-service   # Python deps (needs uv)

cp platform/services/core-api/.env.example platform/services/core-api/.env
cp platform/services/integrations-api/.env.example platform/services/integrations-api/.env
cp products/social/api/.env.example products/social/api/.env
cp apps/web/.env.example apps/web/.env.local

pnpm dev                # every app/service in watch mode
```

| What                  | URL                                      |
| --------------------- | ---------------------------------------- |
| Dashboard (web)       | http://localhost:3000                    |
| core-api docs         | http://localhost:4000/docs               |
| integrations-api docs | http://localhost:4010/docs               |
| social-api docs       | http://localhost:4100/docs               |
| ai-service docs       | http://localhost:8000/docs               |
| Storybook             | `pnpm storybook` → http://localhost:6006 |

Without `DATABASE_URL`, services use in-memory repositories, so you can run everything before Supabase is up.

## Structure

```
apps/web                      Next.js "Business OS" shell (auth, onboarding, org/brand dashboard)
platform/
  services/core-api           orgs, brands, members, roles, feature-center (Fastify)
  services/integrations-api   connector registry + publishing adapter (Postiz today)
  services/ai-service         Python FastAPI: captions, plans, embeddings
  frontend                    shared screens: app shell, automations, settings
products/<name>/
  domain                      entities + rules (framework-free, shared by api & frontend)
  api                         product service (Fastify)
  frontend                    product UI + product manifest
  db                          migrations for the product's own Postgres schema
connectors/postiz             typed Postiz Public API client (client/auth/channels/publishing/analytics)
packages/
  ui                          design system + Storybook
  auth                        Supabase JWT verification (Fastify plugin)
  tenant                      Organization → Brand context, role guard
  service-kit                 one-call Fastify bootstrap (logging, security, zod, OpenAPI, health)
  product-kit                 product manifest contract
  config                      shared tsconfig presets
infra/                        compose, gateway (Traefik), Supabase + Postiz setup, Dockerfiles
tools/scripts                 generators (new product)
```

See [docs/architecture.md](docs/architecture.md) for the rules and request flow.

## Everyday commands

```bash
pnpm dev                          # all services
pnpm nx dev core-api              # one service (project name from `pnpm nx show projects`)
pnpm lint | typecheck | test      # everything
pnpm affected                     # only what your branch changed (what CI runs)
pnpm graph                        # interactive dependency graph
pnpm new:product loyalty "Loyalty" "Points and rewards" --api --port 4300
```

## Guardrails (enforced, not just documented)

- **Module boundaries**: `@nx/enforce-module-boundaries` in `eslint.config.mjs`. Products can't import each other; only platform services can use connectors; services never import frontend code.
- **Git hooks**: pre-commit runs lint-staged (ESLint, Prettier, Ruff), commit-msg enforces Conventional Commits with scopes, and pre-push runs `nx affected` lint/typecheck/test.
- **CI**: format check + `nx affected -t lint typecheck test build`, then Docker builds for affected services on `main`.

## Deploy

```bash
docker network create ap-net
./infra/supabase/setup.sh   # then start Supabase (see infra/supabase/README.md)
./infra/postiz/setup.sh     # then start Postiz (see infra/postiz/README.md)
cp .env.example .env && pnpm infra:up
```
