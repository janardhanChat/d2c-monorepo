import { commerceManifest } from "@ap/commerce-frontend";
import { crmManifest } from "@ap/crm-frontend";
import { fulfillmentManifest } from "@ap/fulfillment-frontend";
import type { ProductManifest } from "@ap/product-kit";
import { socialManifest } from "@ap/social-frontend";

/**
 * Product registry. The sidebar, Feature Centre and automation builder read this list.
 * New product: `pnpm new:product <id> ...`, then add its manifest here.
 */
export const products: ProductManifest[] = [
  socialManifest,
  commerceManifest,
  crmManifest,
  fulfillmentManifest,
];

export const findProduct = (id: string) => products.find((p) => p.id === id);
