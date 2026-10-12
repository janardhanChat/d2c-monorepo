# ADR 0001: Nx + pnpm monorepo

- **Status:** Accepted
- **Date:** 2026-10-12

## Context

One repo holds a Next.js shell, several Fastify services, a Python AI service, shared packages and future products (commerce, CRM, fulfillment). Products must stay independent and each service must deploy on its own.

## Decision

Use **Nx** on top of **pnpm workspaces**.

- Projects are discovered from `package.json` (`nx.tags`) and `project.json` (Python).
- Boundaries are enforced with `@nx/enforce-module-boundaries` and `scope:*` / `type:*` tags.
- CI runs `nx affected`, so only changed projects (including Python) are checked and built.
- Workspace packages export TypeScript source; services bundle them with tsup, Next.js uses `transpilePackages`.

## Consequences

- One mechanism for change detection across TS and Python.
- More config than Turborepo; Nx upgrades go through `nx migrate`.
- New products/connectors are scaffolded by `tools/scripts/new-product.mjs` (can become an Nx generator later).
