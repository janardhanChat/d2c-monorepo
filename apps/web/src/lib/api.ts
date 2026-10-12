/**
 * Browser/server fetch helper for platform APIs (through the gateway).
 * Always sends the session token + tenant headers the services expect.
 */
export interface TenantIds {
  organizationId: string;
  brandId?: string;
}

export async function apiFetch<T>(
  path: string,
  opts: { token: string; tenant?: TenantIds; init?: RequestInit },
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
  const res = await fetch(`${base}${path}`, {
    ...opts.init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.token}`,
      ...(opts.tenant ? { "x-organization-id": opts.tenant.organizationId } : {}),
      ...(opts.tenant?.brandId ? { "x-brand-id": opts.tenant.brandId } : {}),
      ...opts.init?.headers,
    },
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
