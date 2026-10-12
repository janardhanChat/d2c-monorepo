import type { ProductManifest } from "@ap/product-kit";
import { Card, CardDescription, CardTitle } from "@ap/ui";

export function ComingSoon({
  product,
}: {
  product: Pick<ProductManifest, "name" | "description">;
}) {
  return (
    <Card className="max-w-md">
      <CardTitle>{product.name}</CardTitle>
      <CardDescription>{product.description}. This module is on the roadmap.</CardDescription>
    </Card>
  );
}
