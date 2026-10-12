import { defineProduct } from "@ap/product-kit";

export const fulfillmentManifest = defineProduct({
  id: "fulfillment",
  name: "Fulfillment",
  description: "Shipping, returns",
  status: "coming-soon",
  routes: { web: "/fulfillment", api: "/api/fulfillment" },
  plans: ["growth", "pro"],
  nav: [{ label: "Fulfillment", path: "/fulfillment" }],
  automation: { triggers: [], actions: [] },
});
