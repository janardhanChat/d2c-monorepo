import { describe, expect, it } from "vitest";

import { upcomingFestivals, SAMPLE_FESTIVALS } from "./festivals";
import { canTransition, transition, validateForPlatform, type Post } from "./post";

const base: Post = {
  id: "8c5d1f2e-3a4b-4c5d-8e6f-7a8b9c0d1e2f",
  organizationId: "11111111-1111-4111-8111-111111111111",
  brandId: "22222222-2222-4222-8222-222222222222",
  caption: "Diwali drop",
  format: "reel",
  platforms: ["instagram"],
  channelIds: ["ch-1"],
  mediaUrls: [],
  status: "draft",
  scheduledAt: null,
  festivalId: null,
  createdBy: "user-1",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

describe("post lifecycle", () => {
  it("allows draft -> pending_approval -> approved", () => {
    const p = transition(transition(base, "pending_approval"), "approved");
    expect(p.status).toBe("approved");
  });

  it("blocks skipping approval", () => {
    expect(canTransition("draft", "scheduled")).toBe(false);
    expect(() => transition(base, "published")).toThrow(/Cannot move/);
  });

  it("requires a time before scheduling", () => {
    const approved = { ...base, status: "approved" as const };
    expect(() => transition(approved, "scheduled")).toThrow();
    expect(
      transition({ ...approved, scheduledAt: "2026-11-01T10:00:00.000Z" }, "scheduled").status,
    ).toBe("scheduled");
  });
});

describe("validateForPlatform", () => {
  it("flags too many Instagram hashtags", () => {
    const caption = Array.from({ length: 31 }, (_, i) => `#tag${i}`).join(" ");
    expect(validateForPlatform(caption, "instagram")).toHaveLength(1);
  });
});

describe("upcomingFestivals", () => {
  it("includes national and the brand's regional festivals", () => {
    const list = upcomingFestivals(SAMPLE_FESTIVALS, {
      region: "IN-GJ",
      from: new Date("2026-10-01"),
      days: 120,
    });
    expect(list.map((f) => f.name)).toEqual(["Diwali", "Uttarayan", "Republic Day"]);
  });
});
