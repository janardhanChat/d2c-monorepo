import { Card, CardDescription, CardTitle } from "@ap/ui";

import { products } from "@/products";

export default function BrandHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Home</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardTitle>{p.name}</CardTitle>
            <CardDescription>{p.description}</CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}
