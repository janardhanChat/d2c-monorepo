import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client initialized with the service-role key.
 * Bypasses PostgreSQL Row-Level Security (RLS) for server-side administration.
 * WARNING: This client must ONLY be used on the server (Route Handlers, Server Actions).
 */
export function createSupabaseAdminClient(): SupabaseClient {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(path.resolve(process.cwd(), "..", ".env"));
    } catch {
      try {
        process.loadEnvFile(path.resolve(process.cwd(), "../..", ".env"));
      } catch {
        void 0;
      }
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
