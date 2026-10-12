# Self-hosted Supabase

We run the **official upstream** Docker setup, unmodified, pinned to a release tag. Nothing from upstream is copied into this repo; `setup.sh` fetches it.

```bash
docker network create ap-net         # once, shared with infra/compose
./infra/supabase/setup.sh            # clones supabase/docker at SUPABASE_REF into infra/supabase/upstream
cd infra/supabase/upstream && cp .env.example .env   # set secrets (JWT_SECRET, POSTGRES_PASSWORD, ...)
docker compose up -d
```

Then apply our migrations in order (core first, then each product):

```bash
psql "$DATABASE_URL" -f platform/services/core-api/migrations/0001_core_tenancy.sql
psql "$DATABASE_URL" -f products/social/db/migrations/0001_social_schema.sql
```

Notes

- Use the same `JWT_SECRET` (or the JWKS URL) in every service's `SUPABASE_JWT_SECRET` / `SUPABASE_JWKS_URL`.
- To save RAM, comment out services you don't use (Analytics/Logflare is the heaviest; PostgREST is optional because our services talk to Postgres directly).
- Back up Postgres off-server daily (`pg_dump` to R2/S3).
