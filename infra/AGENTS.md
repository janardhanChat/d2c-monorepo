# infra/ — rules for deployment files

Root `AGENTS.md` applies. Infrastructure mistakes take production down, so agents propose and humans apply.

## MUST

- Agents may edit `infra/compose`, `infra/gateway`, `infra/docker` and the setup scripts, but MUST say in the reply what will change at deploy time.
- Never edit `infra/supabase/upstream/**` or `infra/postiz/upstream/**` (fetched from upstream; blocked by hook). Put overrides in `docker-compose.override.yml` next to them.
- Never run `docker compose up/down` against production, never `down -v`, never prune volumes.
- The gateway must never route `/internal/*` paths publicly.
- No secrets in compose files or Dockerfiles; use `env_file` and `.env.example`.
- Pin image versions (no `latest` in new services).
