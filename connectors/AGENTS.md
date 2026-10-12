# connectors/ — rules for third-party API clients

A connector is a thin, typed client for one external API (Postiz, Meta Marketing API, WhatsApp Cloud API…). Only `platform/services/*` may import connectors. Root `AGENTS.md` applies.

## MUST

- Layout: `client/` (HTTP, auth header, retries, timeouts, error type), then one folder per API area (`auth/`, `channels/`, `publishing/`, `analytics/`…), and `index.ts` exporting a facade + types.
- Depend on nothing but `scope:shared` util packages. No Fastify, no DB, no env reads: credentials and base URLs are passed in by the caller.
- Every endpoint function documents its HTTP method and path in a comment and returns a typed result.
- Retry only 429 and 5xx, with backoff and a cap. Never retry 4xx.
- Throw the connector's own error class (e.g. `PostizError`) with status and body; never swallow errors.
- Tests mock `fetch`; no real network calls, no real keys.
- When the provider's docs and our types disagree, follow the docs and note the source URL in a comment.

## Postiz specifically

- Postiz is AGPL-3.0 and runs as an unmodified separate service. NEVER copy Postiz source code into this repo.
