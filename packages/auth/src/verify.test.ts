import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";

import { createTokenVerifier, extractBearer } from "./verify";

const secret = "test-secret-at-least-32-characters-long!";

async function sign(claims: Record<string, unknown>, sub = "user-1") {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setAudience("authenticated")
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));
}

describe("createTokenVerifier", () => {
  const verify = createTokenVerifier({ jwtSecret: secret });

  it("accepts a valid Supabase-style token", async () => {
    const user = await verify(await sign({ email: "a@b.in", role: "authenticated" }));
    expect(user).toMatchObject({ id: "user-1", email: "a@b.in", role: "authenticated" });
  });

  it("rejects a tampered token", async () => {
    const token = (await sign({})).slice(0, -2) + "xx";
    await expect(verify(token)).rejects.toThrow("Invalid or expired token");
  });
});

describe("extractBearer", () => {
  it("parses bearer headers", () => {
    expect(extractBearer("Bearer abc")).toBe("abc");
    expect(extractBearer("Basic abc")).toBeNull();
    expect(extractBearer(undefined)).toBeNull();
  });
});
