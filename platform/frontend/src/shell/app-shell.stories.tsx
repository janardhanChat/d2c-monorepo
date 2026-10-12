import { defineProduct } from "@ap/product-kit";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";

const product = (id: string, name: string, status: "active" | "coming-soon") =>
  defineProduct({
    id,
    name,
    description: "",
    status,
    routes: { web: `/${id}`, api: `/api/${id}` },
    plans: ["free"],
    nav: [],
  });

const meta = {
  title: "Platform/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: {
    ctx: {
      orgSlug: "acme",
      brandSlug: "surat-sarees",
      orgName: "Acme Retail",
      brandName: "Surat Sarees",
    },
    activePath: "/acme/surat-sarees/social",
    products: [
      product("social", "Social", "active"),
      product("commerce", "Commerce", "coming-soon"),
      product("crm", "CRM", "coming-soon"),
      product("fulfillment", "Fulfillment", "coming-soon"),
    ],
    children: <p className="text-muted">Page content</p>,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
