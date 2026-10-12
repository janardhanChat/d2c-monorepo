import { defineProduct } from "@ap/product-kit";

export const commerceManifest = defineProduct({
  id: "commerce",
  name: "Commerce",
  description: "Products, orders, sales",
  status: "coming-soon",
  routes: { web: "/commerce", api: "/api/commerce" },
  plans: ["growth", "pro"],
  nav: [{ label: "Commerce", path: "/commerce" }],
  automation: { triggers: [], actions: [] },
});
