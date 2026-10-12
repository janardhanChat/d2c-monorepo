import { describe, expect, it } from "vitest";

import { hasRole, parseTenantHeaders } from "./context";

const org = "6f1c2b9e-1a2b-4c3d-8e9f-0a1b2c3d4e5f";

describe("parseTenantHeaders", () => {
  it("reads org and optional brand", () => {
    expect(parseTenantHeaders({ "x-organization-id": org })).toEqual({
      organizationId: org,
      brandId: null,
    });
  });

  it("rejects non-uuid ids", () => {
    expect(parseTenantHeaders({ "x-organization-id": "acme" })).toBeNull();
  });
});

describe("hasRole", () => {
  it("ranks roles", () => {
    expect(hasRole("owner", "admin")).toBe(true);
    expect(hasRole("editor", "admin")).toBe(false);
  });
});
