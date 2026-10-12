import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createService } from "./create-service";

describe("createService", () => {
  it("serves /health", async () => {
    const app = await createService({ name: "test", logLevel: "silent", docs: false });
    const res = await app.inject({ url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", service: "test" });
  });

  it("returns the standard validation error shape", async () => {
    const app = await createService({ name: "test", logLevel: "silent", docs: false });
    app.post(
      "/echo",
      { schema: { body: z.object({ name: z.string().min(2) }) } },
      async (req) => req.body,
    );
    const res = await app.inject({ method: "POST", url: "/echo", payload: { name: "a" } });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("ValidationError");
  });
});
