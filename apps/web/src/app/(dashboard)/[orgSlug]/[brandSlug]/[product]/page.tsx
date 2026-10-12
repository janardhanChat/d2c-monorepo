import { ComingSoon } from "@ap/platform-frontend";
import { notFound } from "next/navigation";

import { findProduct } from "@/products";

/** Fallback for products that don't have their own route yet (shows "coming soon"). */
export default async function ProductPage({ params }: { params: Promise<{ product: string }> }) {
  const product = findProduct((await params).product);
  if (!product) notFound();
  return <ComingSoon product={product} />;
}
