# Project Analysis & Current Folder Structure

**Project Name:** D2C Business OS (`automation-platform`)  
**Repository Type:** Polyglot Monorepo (Nx 23 + pnpm 10 Workspaces + Python uv)  
**Primary Tech Stack:** Next.js 16 (React 19), Fastify 5, Python FastAPI, PostgreSQL (Self-Hosted Supabase), Postiz Adapter, Traefik v3.5  
**Document Generated:** October 2026

---

## 1. Executive Summary & Current State

The **D2C Business OS** is a multi-tenant operating system designed for direct-to-consumer (D2C) brands and SMBs to automate marketing, social publishing, omnichannel commerce, CRM, and fulfillment.

### Current Implementation Status

| Subsystem / Area                                          |      Status      | Implementation Details                                                                                                                                                                                                                                       |
| :-------------------------------------------------------- | :--------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo & Tooling**                                    |   **Complete**   | Nx 23, pnpm 10 workspaces, ESLint 9 with strict `@nx/enforce-module-boundaries`, Prettier, Vitest, Husky, Commitlint, and automated policy guard hooks.                                                                                                      |
| **Shared Platform Packages**                              |   **Complete**   | `@ap/service-kit` (Fastify bootstrapper with OpenAPI & Zod), `@ap/tenant` (Org/Brand hierarchy & RLS resolver), `@ap/auth` (Supabase JWT verification), `@ap/product-kit` (Manifest contracts), `@ap/ui` (Tailwind v4 tokens & primitives), `@ap/config`.    |
| **Platform Services**                                     | **Operational**  | **`core-api`** (organizations, brands, RLS membership resolver), **`integrations-api`** (Postiz publisher adapter, brand channel mapping), **`ai-service`** (FastAPI caption generation with `echo` and LLM provider interfaces).                            |
| **Social Product (`products/social`)**                    | **Active (MVP)** | End-to-end implemented: pure domain state machine (`draft -> pending_approval -> approved -> scheduled -> publishing -> published/failed`), festival calendar logic, Fastify API, PostgreSQL migrations with RLS, outbox table, UI components, and manifest. |
| **Pluggable Products (`commerce`, `crm`, `fulfillment`)** |  **Scaffolded**  | Product manifests registered with status `"coming-soon"`, initial domain models, and migration skeletons in place. Ready for feature expansion.                                                                                                              |
| **Connectors (`connectors/postiz`)**                      |   **Complete**   | Fully typed client for Postiz Public API (auth, channels, publishing, analytics) with retry logic and isolation.                                                                                                                                             |
| **Web Shell (`apps/web`)**                                | **Operational**  | Next.js 16 App Router dashboard shell, high-converting landing page with interactive simulator, dynamic sidebar loading from product manifests, auth gating, and multi-tenant routing (`/[orgSlug]/[brandSlug]`).                                            |
| **Infrastructure**                                        |  **Configured**  | Docker compose orchestrator, Dockerfiles for Node services and Next.js, upstream setup scripts for Supabase and Postiz.                                                                                                                                      |

---

## 2. Architectural Blueprint & Request Flow

```mermaid
flowchart TD
    Browser["Next.js Web Shell (apps/web)<br/>Port 3000"]

    subgraph PlatformServices ["Platform Services"]
        CoreAPI["core-api<br/>Port 4000"]
        IntegAPI["integrations-api<br/>Port 4010"]
        AIService["ai-service (Python)<br/>Port 8000"]
    end

    subgraph Products ["Product Services"]
        SocialAPI["social-api<br/>Port 4100"]
        OtherProducts["commerce-api / crm-api<br/>(Future)"]
    end

    subgraph ExternalAndData ["Data & Upstream Engines"]
        Postgres["Supabase PostgreSQL<br/>(core, social schemas with RLS)"]
        Postiz["Postiz Publishing Engine<br/>(Behind Integrations Adapter)"]
        Redis["Redis Cache / Queue"]
    end

    Browser -->|Public HTTP & JWT| CoreAPI
    Browser -->|Public HTTP & JWT| IntegAPI
    Browser -->|Public HTTP & JWT| SocialAPI
    Browser -->|Public HTTP & JWT| AIService

    SocialAPI -->|/internal/v1/publish| IntegAPI
    SocialAPI -->|core.is_member()| Postgres
    IntegAPI -->|Postiz Public API| Postiz
    CoreAPI -->|core schema| Postgres
    IntegAPI -.->|/internal/v1/memberships/resolve| CoreAPI
```

---

## 3. Monorepo Folder Structure

```
d2c-automation-platform/automation-platform/
├── .claude/                                  # Claude agent project settings and hook triggers
├── .cursor/                                  # Cursor IDE rules and config
├── .github/                                  # GitHub Actions CI/CD workflows and CODEOWNERS
├── .husky/                                   # Git hook configurations (pre-commit, commit-msg, pre-push)
├── .vscode/                                  # Visual Studio Code workspace settings
├── apps/
│   └── web/                                  # [@ap/web] Next.js 16 dashboard shell and marketing front
│       ├── src/
│       │   ├── app/                          # App Router pages and layouts
│       │   │   ├── (auth)/login/             # Supabase authentication login screen
│       │   │   ├── (dashboard)/              # Multi-tenant dashboard routes
│       │   │   │   └── [orgSlug]/[brandSlug]/
│       │   │   │       ├── [product]/        # Dynamic catch-all product route
│       │   │   │       ├── automations/      # Cross-product event automation hub
│       │   │   │       └── social/           # Social media management workspace
│       │   │   ├── (onboarding)/             # Brand setup & onboarding wizard
│       │   │   ├── globals.css               # Global CSS & Tailwind imports
│       │   │   ├── layout.tsx                # Root layout
│       │   │   └── page.tsx                  # Public landing page with interactive live simulator
│       │   ├── components/                   # Shell and landing page UI components
│       │   │   ├── landing/                  # Landing page sections (hero, pricing, matrix, nav, footer)
│       │   │   └── shell.tsx                 # Client wrapper connecting AppShell to router
│       │   ├── lib/                          # Client libraries (Supabase server/browser clients, apiFetch)
│       │   ├── products.ts                   # Manifest registry composing all installed products
│       │   └── proxy.ts                      # Next.js 16 request gating proxy
│       ├── next.config.ts                    # Next.js configuration (transpilePackages, etc.)
│       └── package.json
│
├── connectors/                               # Third-party API wrappers (Platform services only)
│   └── postiz/                               # [@ap/connector-postiz] Typed Postiz Public API client
│       ├── analytics/                        # Post and channel metrics retrieval
│       ├── auth/                             # Integration connect URL & validation
│       ├── channels/                         # Connected channels list & disconnect
│       ├── client/                           # Resilient HTTP client with retry logic
│       ├── publishing/                       # Multi-platform post creation & media upload
│       ├── index.ts                          # Unified connector facade
│       └── package.json
│
├── docs/                                     # Architecture documentation and ADRs
│   ├── adr/                                  # Architecture Decision Records
│   │   ├── 0001-nx-monorepo.md               # ADR: Nx monorepo choice
│   │   └── 0002-postiz-behind-publisher-adapter.md # ADR: Postiz adapter strategy
│   ├── architecture.md                       # Core system architecture & layer boundaries
│   └── project_structure.md                  # Comprehensive folder hierarchy and state analysis
│
├── infra/                                    # Deployment, containerization, and networking
│   ├── compose/
│   │   └── docker-compose.yml                # Main Docker Compose stack (services, redis)
│   ├── docker/
│   │   ├── node-service.Dockerfile           # Optimized multi-stage Dockerfile for Fastify services
│   │   └── web.Dockerfile                    # Standalone Next.js Dockerfile
│   ├── postiz/                               # Upstream Postiz deployment scripts and compose overrides
│   └── supabase/                             # Self-hosted Supabase bootstrap scripts
│
├── packages/                                 # Shared monorepo packages (scope:shared)
│   ├── auth/                                 # [@ap/auth] Supabase JWT verification Fastify plugin
│   ├── config/                               # [@ap/config] Shared tsconfig presets
│   │   └── tsconfig/                         # (base.json, nextjs.json, node.json, react-library.json)
│   ├── product-kit/                          # [@ap/product-kit] Product manifest contracts and types
│   ├── service-kit/                          # [@ap/service-kit] Fastify microservice bootstrapper
│   │   └── src/                              # createService, Zod validation, OpenAPI docs, internalToken
│   ├── tenant/                               # [@ap/tenant] Multi-tenant context, role guards, HTTP resolver
│   └── ui/                                   # [@ap/ui] Design tokens (OKLCH) & Tailwind v4 UI primitives
│       ├── .storybook/                       # Storybook 10 configuration
│       ├── src/
│       │   ├── components/                   # Button, Card, Badge, Input, Container, StatCard
│       │   ├── lib/                          # Utility functions (cn, cva)
│       │   └── styles.css                    # Design token definitions
│       └── package.json
│
├── platform/                                 # Core platform foundations
│   ├── frontend/                             # [@ap/platform-frontend] Shared shell components
│   │   └── src/shell/                        # AppShell sidebar, brand switcher, ComingSoon placeholder
│   └── services/                             # Central platform microservices
│       ├── ai-service/                       # Python FastAPI microservice (managed by uv)
│       │   ├── app/
│       │   │   ├── api/captions.py           # AI caption generation endpoints
│       │   │   ├── core/auth.py              # Tenant and JWT auth dependencies
│       │   │   ├── providers/llm.py          # LLMProvider protocol & EchoProvider mock
│       │   │   └── main.py                   # FastAPI application factory
│       │   ├── pyproject.toml                # Python project dependencies
│       │   └── project.json                  # Nx project targets for Python lint/test/typecheck
│       ├── core-api/                         # [@ap/core-api] Tenancy & organization management (Fastify)
│       │   ├── migrations/                   # 0001_core_tenancy.sql (orgs, brands, members, RLS)
│       │   ├── src/modules/
│       │   │   ├── internal/                 # /internal/v1/memberships/resolve endpoint
│       │   │   └── organizations/            # Org & brand CRUD routes, repo, schema, service
│       │   └── package.json
│       └── integrations-api/                 # [@ap/integrations-api] Gateway to external networks
│           ├── src/modules/
│           │   ├── channels.routes.ts        # Channel query routes
│           │   └── publishing.routes.ts      # /internal/v1/publish service endpoint
│           ├── src/publishers/               # Publisher abstraction & PostizPublisher adapter
│           └── package.json
│
├── products/                                 # Pluggable domain modules (Islands)
│   ├── commerce/                             # [@ap/commerce-*] E-commerce product module
│   │   ├── db/migrations/                    # 0001_commerce_schema.sql
│   │   ├── domain/                           # Commerce domain rules & schemas
│   │   └── frontend/src/manifest.ts          # Commerce product manifest ("coming-soon")
│   ├── crm/                                  # [@ap/crm-*] WhatsApp CRM & customer retention module
│   │   ├── db/migrations/                    # CRM schema migrations
│   │   ├── domain/                           # CRM business rules
│   │   └── frontend/src/manifest.ts          # CRM manifest ("coming-soon")
│   ├── fulfillment/                          # [@ap/fulfillment-*] Logistics and shipping module
│   │   ├── db/migrations/                    # Fulfillment schema migrations
│   │   ├── domain/                           # Shipping domain logic
│   │   └── frontend/src/manifest.ts          # Fulfillment manifest ("coming-soon")
│   └── social/                               # [@ap/social-*] Social media automation (Flagship Product)
│       ├── api/                              # Fastify backend service (Port 4100)
│       │   ├── src/modules/posts/            # Post CRUD, approval, scheduling, publishing client
│       │   └── tests/                        # Integration tests for posts and tenancy isolation
│       ├── db/migrations/                    # 0001_social_schema.sql (posts, post_deliveries, outbox)
│       ├── domain/                           # Pure TS: Post schema, lifecycle transitions, festivals
│       └── frontend/                         # React UI (PostCard, FestivalList) & socialManifest
│
├── tools/                                    # Developer tooling, agents guards, and generators
│   ├── agents/                               # Policy enforcement hooks for AI agents
│   │   ├── check-migrations.mjs              # Enforces append-only migration policy
│   │   ├── guard-bash.mjs                    # Restricts destructive shell commands
│   │   ├── guard-edit.mjs                    # Restricts edits on protected configuration files
│   │   ├── policy.mjs                        # Policy definitions (single source of truth)
│   │   └── policy.test.mjs                   # Policy unit tests
│   └── scripts/
│       └── new-product.mjs                   # CLI scaffolding generator for new products
│
├── AGENTS.md                                 # Top-level AI coding agent rules and contracts
├── CLAUDE.md                                 # Claude code assistant instructions
├── CONTRIBUTING.md                           # Developer contribution guidelines
├── README.md                                 # Project overview and quickstart guide
├── commitlint.config.mjs                     # Conventional Commits format enforcement
├── eslint.config.mjs                         # ESLint 9 + Nx module boundary constraint rules
├── lint-staged.config.mjs                    # Git staged files linting configuration
├── nx.json                                   # Nx monorepo build pipeline and cache targets
├── package.json                              # Workspace root scripts and devDependencies
├── pnpm-lock.yaml                            # Pinned pnpm dependencies
└── pnpm-workspace.yaml                       # Pnpm monorepo package glob definitions
```

---

## 4. Key Subsystem Details & Technical Characteristics

### 4.1 Tenancy & Security Model

1. **Hierarchical Scoping:** Every business entity belongs to an `organization_id` and, where applicable, a `brand_id`.
2. **Row-Level Security (RLS):** Tables enable Postgres RLS using the security-definer helper `core.is_member(organization_id)`.
3. **Zero Direct DB Cross-Talk:** Microservices only read and write their own PostgreSQL schema (`core`, `social`, etc.). Any cross-service verification (such as validating user roles) occurs via the internal service route `/internal/v1/memberships/resolve` using a shared `x-internal-token`.
4. **Internal Route Protection:** Service-to-service endpoints under `/internal/*` require a valid `x-internal-token`, guaranteeing they are never exposed to unauthorized callers.

### 4.2 Module Boundaries & Strict Layering

Enforced by ESLint rule `@nx/enforce-module-boundaries`:

- **`products/*`** are completely isolated from each other. Social cannot import Commerce, and Commerce cannot import Social. Communication occurs strictly via HTTP APIs or asynchronous events.
- **`connectors/*`** may only be imported by `platform/services/*`. Products are forbidden from importing connectors directly.
- **`type:domain`** packages are pure TypeScript (zero framework, database, or HTTP dependencies), allowing them to be safely shared between backend services and frontend React applications.
- **`type:service`** cannot import frontend UI code, and frontend UI cannot import service code.

### 4.3 Pluggable Product Architecture

To add a new product (e.g. Loyalty or WhatsApp Campaigns):

1. Run `pnpm new:product <id> "<Name>" "<Description>" [--api]`.
2. The script scaffolds `products/<id>/{domain,frontend,db,api}` with appropriate Nx tags.
3. Add the product manifest export to `apps/web/src/products.ts`.
4. The dashboard automatically renders sidebar navigation, feature gates, and automation blocks without modifying platform shell code.

---

## 5. Development & Verification Guide

### Quick Start Commands

```bash
# Install all JS/TS dependencies and git hooks
pnpm install

# Sync Python environment for AI service
uv sync --directory platform/services/ai-service

# Run all services concurrently (Watch Mode)
pnpm dev

# Run individual services
pnpm nx dev web
pnpm nx dev core-api
pnpm nx dev social-api
pnpm nx dev integrations-api

# Run Storybook design system
pnpm storybook
```

### Verification & CI Checks

```bash
# Run affected checks (matches CI pipeline)
pnpm affected

# Run individual checks across all projects
pnpm lint
pnpm typecheck
pnpm test
```
