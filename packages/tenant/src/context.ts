import { z } from "zod";

/** Headers every tenant-scoped request must carry (set by apps/web from the URL slugs). */
export const TENANT_HEADERS = {
  organization: "x-organization-id",
  brand: "x-brand-id",
} as const;

export const ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export interface TenantContext {
  organizationId: string;
  /** Optional: org-level endpoints (billing, members) have no brand. */
  brandId: string | null;
  role: Role;
}

const tenantHeadersSchema = z.object({
  [TENANT_HEADERS.organization]: z.uuid(),
  [TENANT_HEADERS.brand]: z.uuid().optional(),
});

export function parseTenantHeaders(
  headers: Record<string, unknown>,
): { organizationId: string; brandId: string | null } | null {
  const parsed = tenantHeadersSchema.safeParse(headers);
  if (!parsed.success) return null;
  return {
    organizationId: parsed.data[TENANT_HEADERS.organization],
    brandId: parsed.data[TENANT_HEADERS.brand] ?? null,
  };
}

const rank: Record<Role, number> = { viewer: 0, editor: 1, admin: 2, owner: 3 };

export function hasRole(actual: Role, required: Role): boolean {
  return rank[actual] >= rank[required];
}
