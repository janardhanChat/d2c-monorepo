import { defineProduct } from "@ap/product-kit";

export const socialManifest = defineProduct({
  id: "social",
  name: "Social",
  description: "Create, publish, analyze",
  status: "active",
  routes: { web: "/social", api: "/api/social" },
  plans: ["free", "starter", "growth", "pro"],
  requiredConnectors: ["instagram", "facebook"],
  nav: [
    { label: "Calendar", path: "/social" },
    { label: "Approvals", path: "/social/approvals" },
    { label: "Analytics", path: "/social/analytics" },
  ],
  automation: {
    triggers: [
      { id: "post.published.v1", label: "When a post is published" },
      { id: "festival.upcoming.v1", label: "When a festival is coming up" },
    ],
    actions: [
      { id: "social.generate_plan", label: "Generate a 30-day content plan" },
      { id: "social.draft_post", label: "Draft a post" },
    ],
  },
});
