import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/firestore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sale | Anti Tarnish Jewels",
  description: "Shop our latest discounts and offers on premium anti-tarnish jewelry.",
};

export const dynamic = "force-dynamic";

export default async function SalePage() {
  const all = await getProducts();
  const active = Array.isArray(all) ? all.filter((p) => p.isActive !== false) : [];
  
  // Apply the exact same logic that the shop uses for "Sale" category and "Discount 50%+" filters
  const saleProducts = active.filter(
    (p) => p.category === "Sale" || p.discountPercentage >= 50
  );

  return <ProductGrid products={saleProducts} title="Sale" />;
}
