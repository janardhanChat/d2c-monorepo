import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface AuthUser {
  id: string;
  email?: string;
  role: string;
  /** Raw claims, in case a service needs app_metadata etc. */
  claims: JWTPayload;
}

export interface VerifierOptions {
  /**
   * Supabase JWKS endpoint (asymmetric keys), e.g.
   * https://<supabase-host>/auth/v1/.well-known/jwks.json
   */
  jwksUrl?: string;
  /** Legacy HS256 shared secret (SUPABASE_JWT_SECRET). Used only if jwksUrl is absent. */
  jwtSecret?: string;
  issuer?: string;
  audience?: string;
}

export class AuthError extends Error {
  readonly statusCode = 401;
}

export type TokenVerifier = (token: string) => Promise<AuthUser>;

/** Builds a verifier once at startup; JWKS keys are cached by jose. */
export function createTokenVerifier(opts: VerifierOptions): TokenVerifier {
  const audience = opts.audience ?? "authenticated";

  let key: Parameters<typeof jwtVerify>[1];
  if (opts.jwksUrl) {
    key = createRemoteJWKSet(new URL(opts.jwksUrl));
  } else if (opts.jwtSecret) {
    key = new TextEncoder().encode(opts.jwtSecret);
  } else {
    throw new Error("Auth: set either jwksUrl or jwtSecret");
  }

  return async (token) => {
    try {
      const { payload } = await jwtVerify(token, key, {
        audience,
        ...(opts.issuer ? { issuer: opts.issuer } : {}),
      });
      if (!payload.sub) throw new AuthError("Token has no subject");
      return {
        id: payload.sub,
        email: typeof payload.email === "string" ? payload.email : undefined,
        role: typeof payload.role === "string" ? payload.role : "authenticated",
        claims: payload,
      };
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("Invalid or expired token");
    }
  };
}

export function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}
