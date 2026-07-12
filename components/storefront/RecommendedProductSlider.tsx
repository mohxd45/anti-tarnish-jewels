"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { getProducts, getSimilarProducts } from "@/lib/firestore";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface RecommendedProductSliderProps {
  closeDrawer?: () => void;
}

export function RecommendedProductSlider({ closeDrawer }: RecommendedProductSliderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { items, addToCart } = useCart();

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      try {
        let recs: Product[] = [];
        
        if (items.length > 0) {
          // Find similar products based on the first item in the cart
          const firstItem = items[0].product;
          if (firstItem.category) {
            recs = await getSimilarProducts(firstItem.category, firstItem.id, 6);
          }
        }
        
        // Fallback to latest/bestseller products
        if (recs.length === 0) {
          const all = await getProducts();
          // Filter out items already in cart
          const cartItemIds = items.map(i => i.product.id);
          recs = all.filter(p => !cartItemIds.includes(p.id) && p.stock > 0).slice(0, 6);
        }

        setProducts(recs);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [items]);

  if (isLoading) {
    return (
      <div className="py-4">
        <h3 className="px-4 text-sm font-semibold text-charcoalBrown mb-3">You May Also Like</h3>
        <div className="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[140px] max-w-[160px] w-[45vw] snap-start animate-pulse bg-stone-100 rounded-xl h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="py-4 border-t border-stone-100 bg-white">
      <h3 className="px-4 text-sm font-bold text-charcoalBrown mb-3 font-serif">You May Also Like</h3>
      <div className="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {products.map(product => (
          <div key={product.id} className="min-w-[140px] max-w-[160px] w-[45vw] snap-start flex flex-col relative group">
            <Link 
              href={`/product/${product.slug}`} 
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-stone-50 border border-stone-100 mb-2 block"
              onClick={closeDrawer}
            >
              <Image
                src={product.images?.[0] || "/images/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105 duration-500"
                sizes="(max-width: 640px) 45vw, 160px"
              />
              {product.salePrice < product.regularPrice && (
                <div className="absolute top-1 left-1 bg-dustyRose text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Sale
                </div>
              )}
            </Link>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link href={`/product/${product.slug}`} onClick={closeDrawer}>
                  <h4 className="text-[11px] font-medium text-charcoalBrown line-clamp-2 leading-tight hover:text-[#c5a059] transition-colors">
                    {product.name}
                  </h4>
                </Link>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-charcoalBrown">
                    {formatPrice ? formatPrice(product.salePrice) : `₹${product.salePrice?.toLocaleString()}`}
                  </span>
                  {product.salePrice < product.regularPrice && (
                    <span className="text-[9px] text-stone-400 line-through">
                      {formatPrice ? formatPrice(product.regularPrice) : `₹${product.regularPrice?.toLocaleString()}`}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => addToCart(product, 1)}
                className="mt-2 w-full flex items-center justify-center gap-1 bg-stone-100 hover:bg-[#c5a059] hover:text-white text-charcoalBrown text-[11px] font-medium py-1.5 rounded-lg transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
