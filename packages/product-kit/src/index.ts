/**
 * Every product (social, commerce, crm, fulfillment, ...) exports one manifest.
 * The shell (apps/web) builds the sidebar from it, the Feature Centre gates it by plan,
 * and the automation builder reads its triggers/actions. Adding a product = adding a
 * manifest; nothing in the platform changes.
 */
export type PlanId = "free" | "starter" | "growth" | "pro";

export interface NavItem {
  label: string;
  /** Relative to /[orgSlug]/[brandSlug] */
  path: string;
}

export interface AutomationDescriptor {
  /** Versioned event / action id, e.g. "post.published.v1" */
  id: string;
  label: string;
}

export interface ProductManifest {
  id: string;
  name: string;
  description: string;
  status: "active" | "beta" | "coming-soon";
  /** Base path in the dashboard and API */
  routes: { web: string; api: string };
  plans: PlanId[];
  nav: NavItem[];
  requiredConnectors?: string[];
  automation?: {
    triggers: AutomationDescriptor[];
    actions: AutomationDescriptor[];
  };
}

/** Identity helper that gives type-checking to manifest literals. */
export function defineProduct<const M extends ProductManifest>(manifest: M): M {
  return manifest;
}
