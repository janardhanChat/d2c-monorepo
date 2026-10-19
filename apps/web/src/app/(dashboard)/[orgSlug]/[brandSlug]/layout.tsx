import type { ReactNode } from "react";

import { Shell } from "@/components/shell";
import { products } from "@/products";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgSlug: string; brandSlug: string }>;
}) {
  const { orgSlug, brandSlug } = await params;

  let orgName = "Default Workspace";
  let brandName = "Default Brand";

  try {
    const supabase = createSupabaseAdminClient();
    const { data: ws } = await supabase
      .schema("core")
      .from("workspaces")
      .select("name")
      .eq("slug", orgSlug)
      .maybeSingle();

    if (ws?.name) {
      orgName = ws.name;
      brandName = ws.name;
    } else {
      const cleanName = orgSlug
        .replace(/-[a-f0-9]{4,}$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      orgName = cleanName || "Default Workspace";
      brandName = orgName;
    }
  } catch {
    const cleanName = orgSlug
      .replace(/-[a-f0-9]{4,}$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    orgName = cleanName || "Default Workspace";
    brandName = orgName;
  }

  const ctx = { orgSlug, brandSlug, orgName, brandName };

  return (
    <Shell ctx={ctx} products={products}>
      {children}
    </Shell>
  );
}
