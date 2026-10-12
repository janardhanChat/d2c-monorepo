# products/ — rules for product modules

Each product (`social`, `commerce`, `crm`, `fulfillment`, `meta-ads`, `whatsapp`, …) is an island. Root `AGENTS.md` still applies.

## Layout (do not invent new top-level folders inside a product)

```
products/<id>/
  domain/     entities, zod schemas, business rules — pure TS, no Fastify/React/DB imports
  api/        Fastify service: src/app.ts, src/main.ts, src/modules/<module>/{routes,schema,service,repo}.ts
  frontend/   React components + product manifest (src/manifest.ts)
  db/         migrations/NNNN_<what>.sql for the "<id>" Postgres schema only
```

## MUST

- New product → `pnpm new:product <id> "<Name>" "<desc>" [--api]`. Never hand-create the folders. Then STOP and ask a human to add the `scope:<id>` rule to `eslint.config.mjs` (protected file).
- Import only from your own `scope:<id>` projects and `scope:shared` packages (`@ap/ui`, `@ap/tenant`, `@ap/service-kit`, `@ap/product-kit`, `@ap/auth`).
- Reach the platform over HTTP: `integrations-api /internal/v1/*` for publishing and Meta/WhatsApp calls, `core-api` for orgs and members. Use the `x-internal-token` header from env.
- Reach other products only through their HTTP API or events. Never read another product's tables.
- State changes that others care about → write an event to `<schema>.outbox` in the same transaction (name it `<thing>.<happened>.v1`).
- Domain lifecycle changes (statuses, transitions) go in `domain/` with tests; routes call them, never re-implement them.
- Every new route is tenant-scoped and has a cross-tenant test (see root §4).
- Product manifest changes (nav, plans, automation triggers/actions) live in `frontend/src/manifest.ts` only.

## Migrations (`db/migrations/`)

- Append-only. New file = next number: `0002_add_campaign_budget.sql`. Existing files are blocked by the guard hook and CI.
- Only touch your own schema (`social.*` in `products/social`, etc.).
- Every new table: `organization_id`, `brand_id` (if brand data), `created_at`, RLS enabled, a read policy using `core.is_member(organization_id)`.
- Additive only: no `DROP`, no renames, no type narrowing. Need one? Stop and ask.
