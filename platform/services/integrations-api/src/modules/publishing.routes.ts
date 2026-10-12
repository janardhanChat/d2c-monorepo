import { requireInternalToken, type Service } from "@ap/service-kit";
import { z } from "zod";

import type { Publisher } from "../publishers/publisher";

/**
 * Called by product services (e.g. social-api's publisher worker), never by browsers.
 * Products send WHAT to publish; this service decides HOW (Postiz, Meta direct, ...).
 */
export function registerPublishingRoutes(
  app: Service,
  deps: { publisher: Publisher; internalToken?: string },
) {
  app.post(
    "/internal/v1/publish",
    {
      onRequest: requireInternalToken(deps.internalToken),
      schema: {
        tags: ["publishing"],
        body: z.object({
          organizationId: z.uuid(),
          brandId: z.uuid(),
          channelIds: z.array(z.string()).min(1),
          caption: z.string().max(5000),
          mediaUrls: z.array(z.url()).default([]),
          scheduledAt: z.iso.datetime().optional(),
          providerSettings: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
        }),
        response: {
          202: z.object({
            publisher: z.string(),
            results: z.array(z.object({ channelId: z.string(), externalPostId: z.string() })),
          }),
        },
      },
    },
    async (req, reply) => {
      const { organizationId: _org, ...request } = req.body;
      const results = await deps.publisher.publish(request);
      return reply.code(202).send({ publisher: deps.publisher.name, results });
    },
  );
}
