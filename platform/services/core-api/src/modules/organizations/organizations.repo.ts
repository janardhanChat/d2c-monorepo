import { randomUUID } from "node:crypto";

import type { Role } from "@ap/tenant";
import type { Sql } from "postgres";

import type { CreateOrganizationInput, Organization } from "./organizations.schema";

/** The only place that touches storage. Services depend on this interface, not on SQL. */
export interface OrganizationsRepo {
  listForUser(userId: string): Promise<Organization[]>;
  create(input: CreateOrganizationInput & { ownerId: string }): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  slugExists(slug: string): Promise<boolean>;
  getRole(userId: string, organizationId: string, brandId: string | null): Promise<Role | null>;
}

/** In-memory implementation for local dev without a database, and for tests. */
export function createInMemoryOrganizationsRepo(): OrganizationsRepo {
  const orgs = new Map<string, Organization>();
  const members = new Map<string, Role>(); // key: `${orgId}:${userId}`

  return {
    async listForUser(userId) {
      return [...orgs.values()].filter((o) => members.has(`${o.id}:${userId}`));
    },
    async create({ name, slug, ownerId }) {
      const org: Organization = {
        id: randomUUID(),
        name,
        slug,
        createdAt: new Date().toISOString(),
      };
      orgs.set(org.id, org);
      members.set(`${org.id}:${ownerId}`, "owner");
      return org;
    },
    async findById(id) {
      return orgs.get(id) ?? null;
    },
    async slugExists(slug) {
      return [...orgs.values()].some((o) => o.slug === slug);
    },
    async getRole(userId, organizationId) {
      return members.get(`${organizationId}:${userId}`) ?? null;
    },
  };
}

/** Postgres implementation (schema: platform/services/core-api/migrations). */
export function createPgOrganizationsRepo(sql: Sql): OrganizationsRepo {
  const toOrg = (r: {
    id: string;
    name: string;
    slug: string;
    created_at: Date;
  }): Organization => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    createdAt: r.created_at.toISOString(),
  });

  return {
    async listForUser(userId) {
      const rows = await sql<{ id: string; name: string; slug: string; created_at: Date }[]>`
        select o.id, o.name, o.slug, o.created_at
        from core.organizations o
        join core.organization_members m on m.organization_id = o.id
        where m.user_id = ${userId}
        order by o.created_at`;
      return rows.map(toOrg);
    },
    async create({ name, slug, ownerId }) {
      return sql.begin(async (tx) => {
        const [row] = await tx<{ id: string; name: string; slug: string; created_at: Date }[]>`
          insert into core.organizations (name, slug) values (${name}, ${slug})
          returning id, name, slug, created_at`;
        if (!row) throw new Error("insert failed");
        await tx`
          insert into core.organization_members (organization_id, user_id, role)
          values (${row.id}, ${ownerId}, 'owner')`;
        return toOrg(row);
      });
    },
    async findById(id) {
      const [row] = await sql<{ id: string; name: string; slug: string; created_at: Date }[]>`
        select id, name, slug, created_at from core.organizations where id = ${id}`;
      return row ? toOrg(row) : null;
    },
    async slugExists(slug) {
      const [row] = await sql`select 1 from core.organizations where slug = ${slug}`;
      return Boolean(row);
    },
    async getRole(userId, organizationId, brandId) {
      // Brand-level role overrides org-level role when present.
      const [row] = await sql<{ role: Role }[]>`
        select coalesce(bm.role, m.role) as role
        from core.organization_members m
        left join core.brand_members bm
          on bm.user_id = m.user_id and bm.brand_id = ${brandId}
        where m.user_id = ${userId} and m.organization_id = ${organizationId}`;
      return row?.role ?? null;
    },
  };
}
