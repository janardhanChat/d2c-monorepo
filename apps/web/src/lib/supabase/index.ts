/**
 * Client-safe Supabase exports for Client Components & shared modules.
 * Note: Server-only utilities (server.ts with `next/headers` and admin.ts with service key)
 * should be imported directly from `@/lib/supabase/server` or `@/lib/supabase/admin`.
 */
export * from "./auth";
export * from "./browser";
export * from "./profiles";
