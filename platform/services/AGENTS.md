# platform/services/ — rules for platform Node services

`core-api` (tenancy, members, roles, features) and `integrations-api` (Meta/WhatsApp/Postiz connections, publishing, token vault) serve every product. A bug here affects every brand, so the bar is higher. Root `AGENTS.md` applies.

## MUST

- Start every service from `createService()` in `@ap/service-kit`. Do not register helmet, CORS, rate limiting, swagger or error handlers yourself.
- Follow the module shape of `core-api/src/modules/organizations`: `*.schema.ts` (zod), `*.repo.ts` (only file that touches storage), `*.service.ts` (rules), `*.routes.ts` (thin), `index.ts`.
- Public routes live under `/v1/…` and use `onRequest: [app.authenticate, app.requireTenant(role)]`.
- Service-to-service routes live under `/internal/v1/…`, are `schema.hide: true`, and use `onRequest: requireInternalToken(env.INTERNAL_SERVICE_TOKEN)`. The gateway never exposes `/internal`.
- Third-party calls go through `connectors/*` clients, wrapped behind an interface in the service (e.g. `Publisher`). Routes never call a connector directly.
- Meta/WhatsApp tokens: stored encrypted, scoped to one brand, never returned in a response, never logged.
- When an account ID (WhatsApp account, ad account, Postiz customer) maps to a brand, check that mapping on every call; a brand may only use its own channels/accounts (see `ChannelNotOwnedError`).
- Env: extend `baseEnvSchema` in `src/env.ts`; add the key to `.env.example`.
- Tests: `tests/*.test.ts` with `buildApp()` + `app.inject`, in-memory repos, mocked connector clients. Cover 401, 403 (other tenant), 400 (validation) and the happy path.

## core-api only

- It owns the `core` schema and `/internal/v1/memberships/resolve`. Changing roles or membership logic affects every service: stop and ask first.
