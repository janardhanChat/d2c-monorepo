import type { Service } from "@ap/service-kit";
import { z } from "zod";

import { SUPPORTED_PROVIDERS, type Publisher } from "../publishers/publisher";

const channelSchema = z.object({
  id: z.string(),
  provider: z.string(),
  name: z.string(),
  handle: z.string(),
  avatarUrl: z.string(),
  disabled: z.boolean(),
});

function requireBrand(brandId: string | null | undefined): string {
  if (!brandId)
    throw Object.assign(new Error("x-brand-id header is required"), { statusCode: 400 });
  return brandId;
}

export function registerChannelRoutes(app: Service, publisher: Publisher) {
  const tags = ["channels"];
  const security = [{ bearer: [] }];

  app.get(
    "/v1/channels",
    {
      onRequest: [app.authenticate, app.requireTenant("viewer")],
      schema: { tags, security, response: { 200: z.array(channelSchema) } },
    },
    async (req) => publisher.listChannels(requireBrand(req.tenant?.brandId)),
  );

  app.post(
    "/v1/channels/:provider/connect",
    {
      onRequest: [app.authenticate, app.requireTenant("admin")],
      schema: {
        tags,
        security,
        params: z.object({ provider: z.enum(SUPPORTED_PROVIDERS) }),
        response: { 200: z.object({ url: z.url() }) },
      },
    },
    async (req) => ({
      url: await publisher.getConnectUrl(requireBrand(req.tenant?.brandId), req.params.provider),
    }),
  );
}
