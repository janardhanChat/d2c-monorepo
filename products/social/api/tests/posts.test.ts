import { SignJWT } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../src/app";
import { envSchema } from "../src/env";
import { createInMemoryPostsRepo } from "../src/modules/posts/posts.repo";

const secret = "test-secret-at-least-32-characters-long!";
const ORG = "11111111-1111-4111-8111-111111111111";
const BRAND = "22222222-2222-4222-8222-222222222222";

const token = () =>
  new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user-1")
    .setAudience("authenticated")
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));

describe("social posts", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let headers: Record<string, string>;
  const publish = vi.fn(async () => ({ publisher: "fake", results: [] }));

  beforeEach(async () => {
    publish.mockClear();
    app = await buildApp({
      env: envSchema.parse({ PORT: 1, LOG_LEVEL: "fatal", SUPABASE_JWT_SECRET: secret }),
      postsRepo: createInMemoryPostsRepo(),
      publisher: { publish },
      resolveMembership: async () => "owner",
    });
    headers = {
      authorization: `Bearer ${await token()}`,
      "x-organization-id": ORG,
      "x-brand-id": BRAND,
    };
  });

  it("runs draft -> approval -> scheduled and publishes through the platform", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/v1/posts",
      headers,
      payload: {
        caption: "Navratri collection drops tonight ✨",
        format: "reel",
        platforms: ["instagram"],
        channelIds: ["ch-1"],
        mediaUrls: ["https://cdn.example.com/reel.mp4"],
      },
    });
    expect(created.statusCode).toBe(201);
    const id = created.json().id;

    await app.inject({ method: "POST", url: `/v1/posts/${id}/submit`, headers });
    await app.inject({ method: "POST", url: `/v1/posts/${id}/approve`, headers });
    const scheduled = await app.inject({
      method: "POST",
      url: `/v1/posts/${id}/schedule`,
      headers,
      payload: { scheduledAt: "2026-10-20T13:30:00.000Z" },
    });

    expect(scheduled.json().status).toBe("scheduled");
    expect(publish).toHaveBeenCalledOnce();
  });

  it("rejects scheduling a post that skipped approval", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/v1/posts",
      headers,
      payload: {
        caption: "x",
        format: "image",
        platforms: ["instagram"],
        channelIds: [],
        mediaUrls: [],
      },
    });
    const res = await app.inject({
      method: "POST",
      url: `/v1/posts/${created.json().id}/schedule`,
      headers,
      payload: { scheduledAt: "2026-10-20T13:30:00.000Z" },
    });
    expect(res.statusCode).toBe(409);
    expect(publish).not.toHaveBeenCalled();
  });

  it("requires a brand header", async () => {
    const { "x-brand-id": _b, ...noBrand } = headers;
    const res = await app.inject({ url: "/v1/posts", headers: noBrand });
    expect(res.statusCode).toBe(400);
  });
});
