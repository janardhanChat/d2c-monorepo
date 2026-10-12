# Contributing

## Branches and commits

- Branch from `main`: `feat/social-festival-calendar`, `fix/core-api-slug-check`.
- Conventional Commits with a scope (enforced by commitlint):

  ```
  feat(social): add festival suggestions to calendar
  fix(core-api): reject duplicate organization slugs
  chore(deps): bump fastify
  ```

  Allowed scopes are listed in `commitlint.config.mjs`.

## Before you push

Hooks run automatically, but you can run them yourself:

```bash
pnpm affected        # lint + typecheck + test + build for what you changed
pnpm format          # prettier
```

## Code conventions

- **Services:** `src/app.ts` builds the app from injected dependencies (testable with `app.inject`), `src/main.ts` wires real dependencies. One folder per module: `*.routes.ts`, `*.schema.ts` (zod), `*.service.ts`, `*.repo.ts`.
- **Validation:** zod schemas on every route (body, params, response). They also generate the OpenAPI docs at `/docs`.
- **Tenancy:** tenant-scoped routes use `onRequest: [app.authenticate, app.requireTenant("<role>")]` (onRequest, so unauthenticated calls get 401 before body validation). Repos always filter by `brand_id` / `organization_id`.
- **Env:** validate with `loadEnv(schema)`; add every new variable to the service's `.env.example`.
- **Migrations:** additive and forward-only; each schema has one owning service.
- **UI:** primitives in `packages/ui`, feature components in the product's `frontend/`, both with stories.
