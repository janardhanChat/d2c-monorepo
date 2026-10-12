"use client";

import { AppShell, type ShellContext } from "@ap/platform-frontend";
import type { ProductManifest } from "@ap/product-kit";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Client wrapper so the shared shell can highlight the current route. */
export function Shell(props: {
  ctx: ShellContext;
  products: ProductManifest[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  return <AppShell {...props} activePath={pathname} />;
}
