import type { Role } from "./context";
import type { MembershipResolver } from "./plugin";

export interface HttpResolverOptions {
  /** e.g. http://core-api:4000 */
  coreApiUrl: string;
  /** Shared secret for service-to-service calls (INTERNAL_SERVICE_TOKEN). */
  internalToken: string;
  /** Cache positive and negative answers briefly to avoid a call per request. */
  ttlMs?: number;
}

/**
 * Membership resolver for every service except core-api: asks core-api, which owns
 * the members tables. Keeps services from reading another service's schema.
 */
export function createHttpMembershipResolver(opts: HttpResolverOptions): MembershipResolver {
  const ttl = opts.ttlMs ?? 30_000;
  const cache = new Map<string, { role: Role | null; expires: number }>();

  return async ({ userId, organizationId, brandId }) => {
    const key = `${userId}:${organizationId}:${brandId ?? ""}`;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.role;

    const res = await fetch(`${opts.coreApiUrl}/internal/v1/memberships/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-token": opts.internalToken },
      body: JSON.stringify({ userId, organizationId, brandId }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) throw new Error(`membership lookup failed: ${res.status}`);
    const { role } = (await res.json()) as { role: Role | null };

    cache.set(key, { role, expires: Date.now() + ttl });
    return role;
  };
}
