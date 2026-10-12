import type { VerifierOptions } from "@ap/auth";

import type { BaseEnv } from "./env";

/** Map the standard SUPABASE_* env vars to auth options (JWKS preferred over shared secret). */
export function authFromEnv(env: BaseEnv): VerifierOptions | undefined {
  if (!env.SUPABASE_JWKS_URL && !env.SUPABASE_JWT_SECRET) return undefined;
  return {
    jwksUrl: env.SUPABASE_JWKS_URL,
    jwtSecret: env.SUPABASE_JWT_SECRET,
    issuer: env.SUPABASE_JWT_ISSUER,
  };
}
