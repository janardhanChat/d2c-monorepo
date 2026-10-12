# apps/web — rules for the Next.js shell

The shell composes products; it does not contain product logic. Root `AGENTS.md` applies.

## MUST

- Next.js 16 App Router. Routes live under `src/app/(dashboard)/[orgSlug]/[brandSlug]/…`. Keep pages thin: import components from `@ap/<product>-frontend` or `@ap/platform-frontend`.
- New product UI belongs in `products/<id>/frontend`, not here. This app only mounts it and registers the manifest in `src/products.ts`.
- Call services through `src/lib/api.ts` (`apiFetch`), which sends the session token and tenant headers. Never call a service URL directly from a component.
- Server Components by default; add `"use client"` only for interactivity.
- Never put secrets in `NEXT_PUBLIC_*` variables; only public URLs and the Supabase anon key belong there.
- Supabase clients only from `src/lib/supabase/{browser,server}.ts`.
- Request-time gating lives in `src/proxy.ts`; real authorization stays in the services.
