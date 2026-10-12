import type { PostizClient } from "@ap/connector-postiz";
import { describe, expect, it, vi } from "vitest";

import { buildApp } from "../src/app";
import { envSchema } from "../src/env";
import { createInMemoryBrandMappingRepo } from "../src/publishers/brand-mapping";
import { createPostizPublisher } from "../src/publishers/postiz.publisher";

const ORG = "11111111-1111-4111-8111-111111111111";
const BRAND = "22222222-2222-4222-8222-222222222222";
const TOKEN = "internal-token-for-tests";

function fakePostiz() {
  return {
    auth: {
      getConnectUrl: vi.fn(async () => "https://instagram.com/oauth"),
      isApiKeyValid: vi.fn(),
    },
    channels: {
      list: vi.fn(async () => [
        {
          id: "ch-1",
          identifier: "instagram",
          name: "Surat Sarees",
          profile: "@suratsarees",
          picture: "",
          disabled: false,
          customer: { id: "cust-1", name: "Surat Sarees" },
        },
        {
          id: "ch-other",
          identifier: "facebook",
          name: "Other",
          profile: "",
          picture: "",
          disabled: false,
          customer: { id: "cust-2", name: "Other" },
        },
      ]),
      remove: vi.fn(),
    },
    publishing: {
      create: vi.fn(async () => [{ postId: "p-1", integration: "ch-1" }]),
      remove: vi.fn(),
      uploadFromUrl: vi.fn(async (url: string) => ({ id: "m-1", path: url })),
      uploadFile: vi.fn(),
    },
    analytics: { post: vi.fn(), channel: vi.fn() },
  } satisfies PostizClient;
}

async function setup() {
  const postiz = fakePostiz();
  const mapping = createInMemoryBrandMappingRepo();
  await mapping.setPostizCustomerId(BRAND, "cust-1");
  const env = envSchema.parse({ PORT: 1, LOG_LEVEL: "fatal", INTERNAL_SERVICE_TOKEN: TOKEN });
  const app = await buildApp({
    env,
    publisher: createPostizPublisher(postiz, mapping),
    resolveMembership: async () => "owner",
  });
  return { app, postiz };
}

const payload = (channelIds: string[]) => ({
  organizationId: ORG,
  brandId: BRAND,
  channelIds,
  caption: "Navratri collection is live!",
  mediaUrls: ["https://cdn.example.com/reel.mp4"],
  providerSettings: { instagram: { post_type: "reel" } },
});

describe("POST /internal/v1/publish", () => {
  it("requires the internal token", async () => {
    const { app } = await setup();
    const res = await app.inject({
      method: "POST",
      url: "/internal/v1/publish",
      payload: payload(["ch-1"]),
    });
    expect(res.statusCode).toBe(401);
  });

  it("publishes to the brand's own channel via Postiz", async () => {
    const { app, postiz } = await setup();
    const res = await app.inject({
      method: "POST",
      url: "/internal/v1/publish",
      headers: { "x-internal-token": TOKEN },
      payload: payload(["ch-1"]),
    });
    expect(res.statusCode).toBe(202);
    expect(res.json()).toEqual({
      publisher: "postiz",
      results: [{ channelId: "ch-1", externalPostId: "p-1" }],
    });
    const calls = postiz.publishing.create.mock.calls as unknown as Array<
      [{ posts: Array<{ settings: unknown }> }]
    >;
    const sent = calls[0]![0];
    expect(sent.posts[0]!.settings).toEqual({ __type: "instagram", post_type: "reel" });
  });

  it("refuses channels that belong to another brand", async () => {
    const { app } = await setup();
    const res = await app.inject({
      method: "POST",
      url: "/internal/v1/publish",
      headers: { "x-internal-token": TOKEN },
      payload: payload(["ch-other"]),
    });
    expect(res.statusCode).toBe(403);
  });
});
