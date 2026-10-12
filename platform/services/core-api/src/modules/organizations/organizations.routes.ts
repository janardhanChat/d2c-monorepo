import type { Service } from "@ap/service-kit";
import { z } from "zod";

import { createOrganizationBody, organizationSchema } from "./organizations.schema";
import type { OrganizationsService } from "./organizations.service";

export function registerOrganizationRoutes(app: Service, service: OrganizationsService) {
  const tags = ["organizations"];
  const security = [{ bearer: [] }];

  app.get(
    "/v1/organizations",
    {
      onRequest: app.authenticate,
      schema: { tags, security, response: { 200: z.array(organizationSchema) } },
    },
    async (req) => service.listMine(req.user!.id),
  );

  app.post(
    "/v1/organizations",
    {
      onRequest: app.authenticate,
      schema: {
        tags,
        security,
        body: createOrganizationBody,
        response: { 201: organizationSchema },
      },
    },
    async (req, reply) => reply.code(201).send(await service.create(req.user!.id, req.body)),
  );

  // Tenant-scoped: reads x-organization-id and checks membership.
  app.get(
    "/v1/organizations/current",
    {
      onRequest: [app.authenticate, app.requireTenant("viewer")],
      schema: { tags, security, response: { 200: organizationSchema } },
    },
    async (req) => {
      const org = await service.get(req.tenant!.organizationId);
      if (!org) throw app.httpErrors.notFound();
      return org;
    },
  );
}
