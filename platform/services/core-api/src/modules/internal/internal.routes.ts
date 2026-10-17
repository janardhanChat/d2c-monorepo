import { requireInternalToken, type Service } from "@ap/service-kit";
import { ROLES } from "@ap/tenant";
import { z } from "zod";

import type { OrganizationsRepo } from "../organizations";

/** Service-to-service endpoints. Protected by internal token authentication. */
export function registerInternalRoutes(
  app: Service,
  deps: { repo: OrganizationsRepo; internalToken: string | undefined },
) {
  app.post(
    "/internal/v1/memberships/resolve",
    {
      onRequest: requireInternalToken(deps.internalToken),
      schema: {
        hide: true,
        body: z.object({
          userId: z.string(),
          organizationId: z.uuid(),
          brandId: z.uuid().nullable(),
        }),
        response: { 200: z.object({ role: z.enum(ROLES).nullable() }) },
      },
    },
    async (req) => ({
      role: await deps.repo.getRole(req.body.userId, req.body.organizationId, req.body.brandId),
    }),
  );
}
