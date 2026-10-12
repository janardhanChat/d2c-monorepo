import type { ProductManifest } from "@ap/product-kit";
import { Badge, cn } from "@ap/ui";
import type { ReactNode } from "react";

export interface ShellContext {
  orgSlug: string;
  brandSlug: string;
  orgName: string;
  brandName: string;
}

/**
 * Sidebar + content frame for "D2C Business OS".
 * The product list is data (manifests), so adding a product never touches this file.
 */
export function AppShell({
  ctx,
  products,
  activePath,
  children,
}: {
  ctx: ShellContext;
  products: ProductManifest[];
  activePath: string;
  children: ReactNode;
}) {
  const base = `/${ctx.orgSlug}/${ctx.brandSlug}`;
  const platformLinks = [
    { label: "Home", path: "" },
    { label: "Automations", path: "/automations" },
    { label: "Settings", path: "/settings" },
  ];

  const link = (label: string, path: string, extra?: ReactNode) => {
    const href = base + path;
    const active = activePath === href;
    return (
      <a
        key={href}
        href={href}
        className={cn(
          "text-muted hover:bg-surface-2 hover:text-fg flex items-center justify-between rounded-lg px-3 py-2 text-sm",
          active && "bg-surface-2 text-fg",
        )}
      >
        {label}
        {extra}
      </a>
    );
  };

  return (
    <div className="bg-bg text-fg flex min-h-screen">
      <aside className="border-border flex w-64 shrink-0 flex-col gap-6 border-r p-4">
        <div className="rounded-card bg-surface p-3">
          <p className="text-muted text-xs">{ctx.orgName}</p>
          <p className="font-semibold">{ctx.brandName}</p>
        </div>
        <nav className="space-y-1">
          {platformLinks.slice(0, 1).map((l) => link(l.label, l.path))}
        </nav>
        <nav className="space-y-1">
          <p className="text-muted px-3 text-xs tracking-wide uppercase">Products</p>
          {products.map((p) =>
            link(
              p.name,
              p.routes.web,
              p.status !== "active" ? <Badge>{p.status === "beta" ? "Beta" : "Soon"}</Badge> : null,
            ),
          )}
        </nav>
        <nav className="mt-auto space-y-1">
          {platformLinks.slice(1).map((l) => link(l.label, l.path))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
