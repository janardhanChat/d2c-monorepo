import type { PostizClient } from "@ap/connector-postiz";

import type { BrandMappingRepo } from "./brand-mapping";
import type { Channel, Publisher, PublishRequest } from "./publisher";

export class ChannelNotOwnedError extends Error {
  readonly statusCode = 403;
  constructor() {
    super("One or more channels do not belong to this brand");
    this.name = "Forbidden";
  }
}

export function createPostizPublisher(client: PostizClient, mapping: BrandMappingRepo): Publisher {
  async function channelsFor(brandId: string): Promise<Channel[]> {
    const customerId = await mapping.getPostizCustomerId(brandId);
    if (!customerId) return [];
    const list = await client.channels.list(customerId);
    // Defence in depth: filter again even though we passed the group.
    return list
      .filter((i) => i.customer?.id === customerId)
      .map((i) => ({
        id: i.id,
        provider: i.identifier,
        name: i.name,
        handle: i.profile,
        avatarUrl: i.picture,
        disabled: i.disabled,
      }));
  }

  return {
    name: "postiz",

    getConnectUrl: (_brandId, provider) => client.auth.getConnectUrl(provider),

    listChannels: channelsFor,

    async publish(req: PublishRequest) {
      const owned = new Map((await channelsFor(req.brandId)).map((c) => [c.id, c]));
      if (req.channelIds.some((id) => !owned.has(id))) throw new ChannelNotOwnedError();

      const media = await Promise.all(req.mediaUrls.map((u) => client.publishing.uploadFromUrl(u)));

      const created = await client.publishing.create({
        type: req.scheduledAt ? "schedule" : "now",
        date: req.scheduledAt ?? new Date().toISOString(),
        posts: req.channelIds.map((id) => {
          const provider = owned.get(id)!.provider;
          return {
            integration: { id },
            value: [{ content: req.caption, image: media }],
            settings: { __type: provider, ...(req.providerSettings?.[provider] ?? {}) },
          };
        }),
      });

      return created.map((c) => ({ channelId: c.integration, externalPostId: c.postId }));
    },
  };
}
