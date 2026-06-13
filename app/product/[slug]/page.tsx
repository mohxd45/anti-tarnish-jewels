import { getProductBySlug, getSimilarProducts } from "@/lib/firestore";
import { ProductDetailsClient } from "@/components/ProductDetailsClient";
import Link from "next/link";
import { Metadata } from "next";

// Optional: Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) {
    return { title: "Product Not Found | Anti Tarnish Jewels" };
  }
  return {
    title: `${product.name} | Anti Tarnish Jewels`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-dustyRose">Product not found</h1>
        <p className="mt-3 text-charcoalBrown/75">The product page could not be located in our inventory.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-champagne px-6 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all">Back to Shop</Link>
      </div>
    );
  }

  const similarProducts = await getSimilarProducts(product.category, product.id, 4);

  return <ProductDetailsClient product={product} initialSimilar={similarProducts} />;
}
