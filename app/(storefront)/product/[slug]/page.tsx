import { getProductBySlug, getSimilarProducts, getBundleItems, getProduct } from "@/lib/firestore";
import { Product } from "@/types";
import { ProductDetailsClient } from "@/components/ProductDetailsClient";
import { BundleDetailsClient } from "@/components/storefront/BundleDetailsClient";
import { MixMatchBundleClient } from "@/components/storefront/MixMatchBundleClient";
import Link from "next/link";
import { Metadata } from "next";

// Optional: Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) {
    return { title: "Product Not Found | LONA JEWELS" };
  }
  return {
    title: `${product.name} | LONA JEWELS`,
    description: product.description.substring(0, 160),
  };
}

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product || product.isActive === false) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-dustyRose">Product not found</h1>
        <p className="mt-3 text-charcoalBrown/75">The product page could not be located in our inventory.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-champagne px-6 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all">Back to Shop</Link>
      </div>
    );
  }

  const similarProducts = await getSimilarProducts(product.category, product.id, 4);

  let fetchedBundleItems: any[] = [];
  let fetchedExistingProducts: Product[] = [];
  
  if (product.isBundle && product.bundleType === "mix_and_match") {
    if (product.sourceType === "bundle_items") {
      fetchedBundleItems = product.independentBundleItems || [];
    } else {
      if (product.eligibleProductsSnapshot && product.eligibleProductsSnapshot.length > 0) {
        fetchedExistingProducts = await Promise.all(
          product.eligibleProductsSnapshot.map(async (snap) => {
            const pId = snap.productId || (snap as any).id;
            if (!pId) return null;
            return await getProduct(pId);
          })
        ).then(res => res.filter(Boolean) as Product[]);
      }
    }
  }

  return (
    <>
      <style>{`
        .whatsapp-button { display: none !important; }
      `}</style>
      <div className="bg-[#FFF0F5] min-h-[100dvh] pb-40 md:pb-24">
        {product.isBundle ? (
          product.bundleType === "mix_and_match" ? (
            product.sourceType === "bundle_items" ? (
              <MixMatchBundleClient product={product} initialBundleItems={fetchedBundleItems} />
            ) : (
              <MixMatchBundleClient product={product} fetchedExistingProducts={fetchedExistingProducts} />
            )
          ) : (
            <BundleDetailsClient product={product} />
          )
        ) : (
          <ProductDetailsClient product={product} initialSimilar={similarProducts} />
        )}
      </div>
    </>
  );
}
