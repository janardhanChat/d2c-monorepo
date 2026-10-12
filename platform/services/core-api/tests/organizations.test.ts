import { SignJWT } from "jose";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app";
import { envSchema } from "../src/env";
import { createInMemoryOrganizationsRepo } from "../src/modules/organizations";

const secret = "test-secret-at-least-32-characters-long!";
const env = envSchema.parse({
  PORT: 4000,
  NODE_ENV: "test",
  LOG_LEVEL: "fatal",
  SUPABASE_JWT_SECRET: secret,
});

const tokenFor = (userId: string) =>
  new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience("authenticated")
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));

describe("organizations module", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let auth: { authorization: string };

  beforeEach(async () => {
    app = await buildApp({ env, organizationsRepo: createInMemoryOrganizationsRepo() });
    auth = { authorization: `Bearer ${await tokenFor("user-1")}` };
  });

  it("rejects anonymous requests", async () => {
    const res = await app.inject({ url: "/v1/organizations" });
    expect(res.statusCode).toBe(401);
  });

  it("creates an org and lists it for its owner", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/v1/organizations",
      headers: auth,
      payload: { name: "Surat Sarees", slug: "surat-sarees" },
    });
    expect(created.statusCode).toBe(201);

    const list = await app.inject({ url: "/v1/organizations", headers: auth });
    expect(list.json()).toHaveLength(1);
  });

  it("rejects duplicate slugs with 409", async () => {
    const payload = { name: "Acme", slug: "acme" };
    await app.inject({ method: "POST", url: "/v1/organizations", headers: auth, payload });
    const dup = await app.inject({
      method: "POST",
      url: "/v1/organizations",
      headers: auth,
      payload,
    });
    expect(dup.statusCode).toBe(409);
  });

  it("enforces tenant membership on scoped routes", async () => {
    const org = (
      await app.inject({
        method: "POST",
        url: "/v1/organizations",
        headers: auth,
        payload: { name: "Acme", slug: "acme" },
      })
    ).json();

    const mine = await app.inject({
      url: "/v1/organizations/current",
      headers: { ...auth, "x-organization-id": org.id },
    });
    expect(mine.statusCode).toBe(200);

    const stranger = await app.inject({
      url: "/v1/organizations/current",
      headers: { authorization: `Bearer ${await tokenFor("user-2")}`, "x-organization-id": org.id },
    });
    expect(stranger.statusCode).toBe(403);
  });
});
