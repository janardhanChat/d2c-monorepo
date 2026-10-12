# Self-hosted Postiz (publishing engine)

Postiz is AGPL-3.0. We run the **official, unmodified** image as a separate service and talk to it only through its Public API from `integrations-api` (via `connectors/postiz`). No Postiz code lives in this repo. If you ever modify Postiz, publish that fork publicly and get legal review first.

```bash
./infra/postiz/setup.sh                       # clones gitroomhq/postiz-docker-compose into ./upstream
cp infra/postiz/docker-compose.override.yml infra/postiz/upstream/
cd infra/postiz/upstream && docker compose up -d
```

Then in the Postiz UI (internal only): create the workspace, add customer groups, generate an API key → set `POSTIZ_API_KEY` for integrations-api.

Hardening checklist

- `DISABLE_REGISTRATION=true` after the admin account exists.
- Keep it off the public gateway; only `integrations-api` should reach it (shared `ap-net` network).
- Use Cloudflare R2/S3 for uploads, not local disk (Reels fill disks fast).
- Raise `API_LIMIT` if we batch-schedule many posts per hour.
- Sizing: ~3-4 GB RAM for Postiz + Temporal + Elasticsearch; consider its own small VPS.
