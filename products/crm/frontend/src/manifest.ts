import { defineProduct } from "@ap/product-kit";

export const crmManifest = defineProduct({
  id: "crm",
  name: "CRM",
  description: "Customers, retention",
  status: "coming-soon",
  routes: { web: "/crm", api: "/api/crm" },
  plans: ["growth", "pro"],
  nav: [{ label: "CRM", path: "/crm" }],
  automation: { triggers: [], actions: [] },
});
