/**
 * Browser/server fetch helper for platform APIs.
 * Directly routes to services based on service-specific environment variables or defaults.
 * Always sends the session token + tenant headers the services expect.
 */
export interface TenantIds {
  organizationId: string;
  brandId?: string;
}

const SERVICE_BASE_URLS: Record<string, string | undefined> = {
  core: process.env.NEXT_PUBLIC_CORE_API_URL,
  integrations: process.env.NEXT_PUBLIC_INTEGRATIONS_API_URL,
  social: process.env.NEXT_PUBLIC_SOCIAL_API_URL,
  ai: process.env.NEXT_PUBLIC_AI_API_URL,
};

const DEFAULT_SERVICE_PORTS: Record<string, number> = {
  core: 4000,
  integrations: 4010,
  social: 4100,
  ai: 8000,
};

export function resolveServiceUrl(path: string): string {
  // If path starts with e.g. /core/v1/... or /social/v1/...
  const match = path.match(/^\/([a-z-]+)(\/.*)$/);
  const service = match?.[1];
  const rest = match?.[2] ?? "";
  if (service) {
    const configuredUrl = SERVICE_BASE_URLS[service];
    if (configuredUrl) {
      return `${configuredUrl}${rest}`;
    }
    const defaultPort = DEFAULT_SERVICE_PORTS[service];
    if (defaultPort) {
      return `http://localhost:${defaultPort}${rest}`;
    }
  }

  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${base}${path}`;
}

export * from "./http";

export async function apiFetch<T>(
  path: string,
  opts: { token: string; tenant?: TenantIds; init?: RequestInit },
): Promise<T> {
  const url = resolveServiceUrl(path);
  const res = await fetch(url, {
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
