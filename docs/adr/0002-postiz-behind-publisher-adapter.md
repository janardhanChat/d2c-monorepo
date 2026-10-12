# ADR 0002: Postiz as an internal publishing engine behind an adapter

- **Status:** Accepted (revisit before scaling past MVP)
- **Date:** 2026-10-12

## Context

Building and maintaining publishing integrations for many networks is slow. Postiz (AGPL-3.0) already handles OAuth, scheduling and per-platform quirks and exposes a Public API.

## Decision

- Run the **official, unmodified** Postiz image as a separate internal service (`infra/postiz`).
- Talk to it only from `integrations-api` through `connectors/postiz`, behind the `Publisher` interface.
- One Postiz workspace for the platform; each brand maps to a Postiz customer group. `integrations-api` enforces that a brand can only use its own channels.
- Products never import the connector; they call `/internal/v1/publish`.

## Consequences

- Fast multi-network publishing for the MVP.
- Extra infrastructure (Temporal, Elasticsearch, Postgres, ~3-4 GB RAM).
- AGPL: no Postiz code in this repo. Any fork of Postiz must be published; get legal review.
- Swappable: a direct Meta Graph API `Publisher` can replace Postiz for Instagram/Facebook without changes to products.
