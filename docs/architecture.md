# Architecture

## Layers

```
apps/web (shell)                 one dashboard; mounts product frontends via manifests
   │  HTTPS + Bearer (Supabase session) + x-organization-id / x-brand-id
   ▼
platform services   core-api (:4000) · integrations-api (:4010) · ai-service (:8000)
product services    social-api (:4100) · (commerce-api · crm-api · fulfillment-api)
         │                       │
         │  /internal/* + x-internal-token (service-to-service)
         ▼
  Postgres (Supabase)   one schema per owner: core, social, commerce, ...
  Postiz (internal)     reached only through integrations-api
```

## Tenancy

- **Organization → Brand.** Every table carries `organization_id` (and `brand_id` where data is brand-specific), with RLS via `core.is_member()`.
- The browser sends `x-organization-id` / `x-brand-id`. `@ap/tenant`'s `requireTenant(role)` checks membership by asking core-api (`/internal/v1/memberships/resolve`, cached 30s), so no service reads another service's tables.
- Roles: `owner > admin > editor > viewer`, optionally overridden per brand.

## Nx tags and rules

| Tag                                                                    | Meaning                                     |
| ---------------------------------------------------------------------- | ------------------------------------------- |
| `scope:shared`                                                         | `packages/*`; usable by everyone            |
| `scope:platform`                                                       | `platform/*`                                |
| `scope:<product>`                                                      | `products/<product>/*`                      |
| `scope:connector`                                                      | `connectors/*`; only platform may import    |
| `scope:shell`                                                          | `apps/web`; composes every product frontend |
| `type:app / service / feature / domain / ui / util / connector / data` | layering                                    |

Key rules (see `eslint.config.mjs`):

- A product imports only its own scope + `scope:shared`.
- Products publish through **integrations-api over HTTP**, never by importing connectors.
- `type:service` can't import `type:feature/ui`; `type:feature` can't import `type:service`.
- `type:domain` is framework-free so api and frontend share the same rules and schemas.

## A product, end to end (social)

1. `social-frontend` exports `socialManifest` (nav, plans, automation triggers/actions) and UI components.
2. `apps/web/src/products.ts` registers the manifest → sidebar, Feature Centre and automation builder pick it up.
3. `social-api` owns the `social` schema; post lifecycle rules come from `social-domain` (`draft → pending_approval → approved → scheduled → publishing → published|failed`).
4. Scheduling calls `integrations-api /internal/v1/publish`, which uses the `Publisher` interface. Today that's `PostizPublisher`; a direct Meta Graph API publisher can replace it without touching social.
5. State changes write to `social.outbox` in the same transaction; a relay publishes events (`post.published.v1`) for automations and analytics.

## Adding things

| Add                           | How                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Module to a service           | new folder in `src/modules/<name>` (routes / schema / service / repo), one line in `app.ts`     |
| Product                       | `pnpm new:product <id> "<Name>" "<desc>" [--api]`, add scope to ESLint rules, register manifest |
| Connector                     | `connectors/<name>` with tags `scope:connector,type:connector`; wire into integrations-api      |
| Python/other-language service | folder + `project.json` with `command` targets (see `ai-service`)                               |
