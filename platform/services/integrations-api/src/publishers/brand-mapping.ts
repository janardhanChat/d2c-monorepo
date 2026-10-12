/**
 * Our brand -> Postiz "customer" group. One Postiz workspace serves every brand,
 * so this mapping IS the tenant isolation boundary for publishing.
 *
 * TODO: persist in Postgres (schema "integrations"), e.g.
 *   integrations.brand_publisher_accounts(brand_id uuid pk, provider text, external_group_id text)
 */
export interface BrandMappingRepo {
  getPostizCustomerId(brandId: string): Promise<string | null>;
  setPostizCustomerId(brandId: string, customerId: string): Promise<void>;
}

export function createInMemoryBrandMappingRepo(): BrandMappingRepo {
  const map = new Map<string, string>();
  return {
    async getPostizCustomerId(brandId) {
      return map.get(brandId) ?? null;
    },
    async setPostizCustomerId(brandId, customerId) {
      map.set(brandId, customerId);
    },
  };
}
