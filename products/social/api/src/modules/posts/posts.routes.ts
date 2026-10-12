import type { Service } from "@ap/service-kit";
import { createPostInput, postSchema } from "@ap/social-domain";
import { z } from "zod";

import type { PostsService } from "./posts.service";

export function registerPostRoutes(app: Service, service: PostsService) {
  const tags = ["posts"];
  const security = [{ bearer: [] }];
  const idParams = z.object({ id: z.uuid() });

  // Every social route is brand-scoped.
  const brandGuard = async (req: { tenant: { brandId: string | null } | null }) => {
    if (!req.tenant?.brandId) throw app.httpErrors.badRequest("x-brand-id header is required");
  };

  app.get(
    "/v1/posts",
    {
      onRequest: [app.authenticate, app.requireTenant("viewer"), brandGuard],
      schema: { tags, security, response: { 200: z.array(postSchema) } },
    },
    async (req) => service.list(req.tenant!),
  );

  app.post(
    "/v1/posts",
    {
      onRequest: [app.authenticate, app.requireTenant("editor"), brandGuard],
      schema: { tags, security, body: createPostInput, response: { 201: postSchema } },
    },
    async (req, reply) =>
      reply.code(201).send(await service.create(req.tenant!, req.user!.id, req.body)),
  );

  app.post(
    "/v1/posts/:id/submit",
    {
      onRequest: [app.authenticate, app.requireTenant("editor"), brandGuard],
      schema: { tags, security, params: idParams, response: { 200: postSchema } },
    },
    async (req) => service.submitForApproval(req.tenant!, req.params.id),
  );

  app.post(
    "/v1/posts/:id/approve",
    {
      onRequest: [app.authenticate, app.requireTenant("admin"), brandGuard],
      schema: { tags, security, params: idParams, response: { 200: postSchema } },
    },
    async (req) => service.approve(req.tenant!, req.params.id),
  );

  app.post(
    "/v1/posts/:id/schedule",
    {
      onRequest: [app.authenticate, app.requireTenant("editor"), brandGuard],
      schema: {
        tags,
        security,
        params: idParams,
        body: z.object({ scheduledAt: z.iso.datetime() }),
        response: { 200: postSchema },
      },
    },
    async (req) => service.schedule(req.tenant!, req.params.id, req.body.scheduledAt),
  );
}
