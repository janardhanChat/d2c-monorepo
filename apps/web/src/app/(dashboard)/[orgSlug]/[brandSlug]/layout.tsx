import type { ReactNode } from "react";

import { Shell } from "@/components/shell";
import { products } from "@/products";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgSlug: string; brandSlug: string }>;
}) {
  const { orgSlug, brandSlug } = await params;
  // TODO: load org + brand from core-api (and 404 if the user isn't a member).
  const ctx = { orgSlug, brandSlug, orgName: "Demo Organization", brandName: "Demo Brand" };

  return (
    <Shell ctx={ctx} products={products}>
      {children}
    </Shell>
  );
}
