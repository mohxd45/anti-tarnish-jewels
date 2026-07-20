"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/firestore";
import { Product } from "@/types";
import { HeartLoader } from "@/components/ui/HeartLoader";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Package } from "lucide-react";
import Image from "next/image";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const all = await getProducts();
        const activeBundles = all.filter(p => p.isBundle && p.isActive !== false);
        setBundles(activeBundles);
      } catch (err) {
        console.error("Failed to load bundles", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleAddBundle(bundle: Product) {
    if (!bundle.stock || bundle.stock <= 0) {
      toast.error("This bundle is currently out of stock");
      return;
    }
    
    addToCart(bundle, 1, "", "");
    toast.success("Bundle added to cart");
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <HeartLoader />
      </div>
    );
  }

  return (
    <div className="bg-[#FFF9FB] min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl font-medium text-[#3A2428]">Bundles & Combos</h1>
          <p className="text-stoneGray max-w-2xl mx-auto">
            Discover our curated sets and enjoy exclusive savings when you buy them together.
          </p>
        </div>

        {bundles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <Package className="w-12 h-12 text-[#B8955E]/50 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-[#3A2428]">No bundles available right now.</h3>
            <p className="text-stoneGray mt-2">Check back later for new exclusive sets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {bundles.map(bundle => {
              const savings = (bundle.regularPrice || 0) - (bundle.salePrice || 0);
              
              return (
                <div key={bundle.id} className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
                  <Link href={`/product/${bundle.slug}`} className="relative aspect-square block overflow-hidden bg-stone-50">
                    {savings > 0 && (
                      <div className="absolute top-3 left-3 z-10 bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm">
                        Save {formatPrice(savings)}
                      </div>
                    )}
                    {bundle.images?.[0] ? (
                      <Image 
                        src={bundle.images[0]} 
                        alt={bundle.name} 
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.srcset = "";
                          target.src = "/product-stack.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-stone-200" />
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[#B8955E] font-semibold mb-1">
                          Includes {bundle.includedItems?.length || 0} Items
                        </div>
                        <Link href={`/product/${bundle.slug}`}>
                          <h3 className="font-serif text-lg text-[#3A2428] font-medium leading-tight group-hover:text-[#B8955E] transition-colors line-clamp-2">
                            {bundle.name}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 space-y-4">
                      <div className="flex items-end gap-2">
                        <span className="font-serif text-xl font-medium text-[#3A2428]">
                          {formatPrice(bundle.salePrice || 0)}
                        </span>
                        {bundle.regularPrice > (bundle.salePrice || 0) && (
                          <span className="text-sm text-stoneGray line-through mb-0.5">
                            {formatPrice(bundle.regularPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddBundle(bundle)}
                        disabled={!bundle.stock || bundle.stock <= 0}
                        className="w-full py-3 bg-[#3A2428] text-white rounded-xl font-medium tracking-wide hover:bg-[#2A1A1D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {!bundle.stock || bundle.stock <= 0 ? "Out of Stock" : "Add Bundle to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
