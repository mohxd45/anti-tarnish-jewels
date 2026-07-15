"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Package, ShieldCheck, Truck, ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function BundleDetailsClient({ product: bundle }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const savings = (bundle.regularPrice || 0) - (bundle.salePrice || 0);
  const outOfStock = !bundle.stock || bundle.stock <= 0;

  function handleAdd() {
    if (outOfStock) {
      toast.error("This bundle is currently out of stock.");
      return;
    }
    setIsAdding(true);
    addToCart(bundle, 1, "", "");
    setTimeout(() => {
      setIsAdding(false);
      toast.success("Bundle added to cart!");
    }, 500);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-stoneGray hover:text-[#3A2428] transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <div className="relative aspect-square sm:aspect-[4/5] md:aspect-auto md:h-[480px] rounded-[24px] overflow-hidden bg-[#FFF9FB] border border-[#E8D7C8]/50 shadow-sm flex items-center justify-center p-4">
            {savings > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-[#B8955E] text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
                Save {formatPrice(savings)}
              </div>
            )}
            {bundle.images?.[0] ? (
              <img 
                src={bundle.images[0]} 
                onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }}
                alt={bundle.name} 
                className="w-full h-full object-contain mix-blend-multiply" 
              />
            ) : (
              <img 
                src="/product-stack.jpg" 
                alt="Fallback bundle" 
                className="w-full h-full object-contain mix-blend-multiply" 
              />
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col">
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="rounded-full bg-[#3A2428] border border-[#3A2428] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
              Special Bundle
            </span>
          </div>
          
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#B8955E]">Jewelry Combo</p>
            {bundle.sku && (
              <>
                <span className="text-[#E8D7C8]">•</span>
                <p className="text-[10px] font-mono tracking-wider text-[#8F817B]">Item Code: {bundle.sku}</p>
              </>
            )}
          </div>

          <h1 className="mb-4 font-serif text-[28px] md:text-[34px] text-[#3A2428] font-medium leading-tight">
            {bundle.name}
          </h1>

          <div className="mb-6 flex items-end gap-3">
            <span className="text-3xl font-serif font-medium text-[#3A2428] md:text-4xl">
              {formatPrice(bundle.salePrice || 0)}
            </span>
            {bundle.regularPrice > (bundle.salePrice || 0) && (
              <>
                <span className="text-base font-medium text-[#8F817B] line-through mb-1">
                  {formatPrice(bundle.regularPrice)}
                </span>
                <span className="mb-1.5 rounded-md bg-[#B8955E]/10 border border-[#B8955E]/20 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#B8955E]">
                  {Math.round(((bundle.regularPrice - (bundle.salePrice || 0)) / bundle.regularPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {bundle.description && (
            <div className="mb-8 text-[#3A2428]/80 text-sm leading-relaxed whitespace-pre-wrap">
              {bundle.description}
            </div>
          )}

          {/* Included Items */}
          <div className="mb-8 space-y-4">
            <h3 className="font-serif text-lg text-[#3A2428] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#B8955E]" /> This Bundle Includes:
            </h3>
            <div className="space-y-3 bg-[#FFF9FB] p-4 rounded-2xl border border-[#E8D7C8]/50 shadow-sm">
              {bundle.includedItems?.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex items-center gap-4 py-2 border-b border-[#E8D7C8]/40 last:border-0 last:pb-0">
                  <div className="w-14 h-14 shrink-0 rounded-[12px] overflow-hidden bg-white border border-[#E8D7C8]/50 p-1">
                    {item.image ? (
                      <img src={item.image} onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <Package className="w-6 h-6 m-auto mt-3 text-[#E8D7C8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`} className="text-[#3A2428] font-semibold text-[13px] hover:text-[#B8955E] transition-colors truncate block">
                      {item.quantity}x {item.name}
                    </Link>
                    <div className="text-[11px] text-[#8F817B] mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-mono tracking-wide">{item.sku}</span>
                      {(item.selectedSize || item.selectedColor) && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{item.selectedSize} {item.selectedColor}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock || isAdding}
            className="w-full py-4 mb-8 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] text-white shadow-[#B8955E]/20 hover:opacity-90 uppercase"
          >
            {isAdding ? "Adding..." : outOfStock ? "Out of Stock" : "Add Bundle to Cart"}
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-6 border-t border-[#E8D7C8]/50 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FFF9FB] border border-[#E8D7C8]/60 p-4 shadow-sm text-center">
              <div className="mb-2 flex justify-center text-[#B8955E]"><ShieldCheck className="h-5 w-5" /></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#3A2428]">100% Authentic</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FFF9FB] border border-[#E8D7C8]/60 p-4 shadow-sm text-center">
              <div className="mb-2 flex justify-center text-[#B8955E]"><Truck className="h-5 w-5" /></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#3A2428]">Fast Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
