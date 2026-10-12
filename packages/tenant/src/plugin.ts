// Brings in the `request.user` type augmentation from the auth plugin.
import type {} from "@ap/auth";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { hasRole, parseTenantHeaders, type Role, type TenantContext } from "./context";

/**
 * Looks up the caller's role in the org (and brand, if given).
 * Return null when the user is not a member. Each service supplies its own
 * implementation (core-api queries Postgres; others call core-api or read a cached claim).
 */
export type MembershipResolver = (input: {
  userId: string;
  organizationId: string;
  brandId: string | null;
}) => Promise<Role | null>;

export interface TenantPluginOptions {
  resolveMembership: MembershipResolver;
}

declare module "fastify" {
  interface FastifyRequest {
    tenant: TenantContext | null;
  }
  interface FastifyInstance {
    /** onRequest hook factory: requires auth + tenant headers + at least `role`. */
    requireTenant: (role?: Role) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const tenantPluginImpl: FastifyPluginAsync<TenantPluginOptions> = async (app, opts) => {
  app.decorateRequest("tenant", null);

  app.decorate("requireTenant", (role: Role = "viewer") => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = req.user?.id;
      if (!userId) {
        await reply.code(401).send({ error: "Unauthorized" });
        return;
      }
      const ids = parseTenantHeaders(req.headers);
      if (!ids) {
        await reply
          .code(400)
          .send({ error: "BadRequest", message: "x-organization-id header (uuid) is required" });
        return;
      }
      const actual = await opts.resolveMembership({ userId, ...ids });
      if (!actual || !hasRole(actual, role)) {
        await reply.code(403).send({ error: "Forbidden" });
        return;
      }
      req.tenant = { ...ids, role: actual };
    };
  });
};

export const tenantPlugin = fp(tenantPluginImpl, {
  name: "@ap/tenant",
  fastify: "5.x",
  dependencies: ["@ap/auth"],
});
