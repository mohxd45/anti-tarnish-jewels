const fs = require('fs');

const pdcContent = `"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { Shield, Droplets, Gem, ShoppingBag, Heart } from "lucide-react";
import { toast } from "sonner";

export function ProductDetailsClient({ product: p, initialSimilar }: { product: Product, initialSimilar: Product[] }) {
  const { dispatch: cartDispatch } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, items: wishlist } = useWishlist();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const images = p.images && p.images.length > 0 ? p.images : ["/placeholder.png"];
  const isWishlisted = wishlist.some(item => item.id === p.id);

  const handleAddToCart = () => {
    cartDispatch({ type: "ADD_ITEM", payload: { product: p, quantity: qty } });
    toast.success("Added to cart!");
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeWishlist(p.id);
      toast.success("Removed from wishlist");
    } else {
      addWishlist(p);
      toast.success("Added to wishlist!");
    }
  };

  const isSale = p.compareAtPrice && p.compareAtPrice > p.price;

  return (
    <div className="bg-[var(--noir)] pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-[4/5] sm:aspect-square bg-[var(--charcoal)] rounded-3xl overflow-hidden relative group shadow-sm">
              <Image 
                src={images[activeImg]} 
                alt={p.name} 
                width={800} 
                height={1000} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <button onClick={toggleWishlist} className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/60 backdrop-blur-sm text-[var(--rose)] hover:bg-white transition-colors shadow-sm">
                <Heart className={\`w-6 h-6 \${isWishlisted ? "fill-current text-red-500" : ""}\`} />
              </button>
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={\`aspect-square rounded-xl overflow-hidden border-2 transition-all \${activeImg === idx ? "border-[var(--gold)] opacity-100 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}\`}
                  >
                    <Image src={img} alt={\`Thumb \${idx}\`} width={150} height={150} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Info Section */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <p className="text-[var(--gold-dark)] text-sm font-semibold tracking-wider uppercase mb-2">{p.category}</p>
              <h1 className="font-display text-4xl md:text-5xl text-[var(--ink)] mb-4">{p.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl text-[var(--ink)] font-bold">₹{p.price}</span>
                {isSale && (
                  <span className="text-xl text-[var(--stoneGray)] line-through">₹{p.compareAtPrice}</span>
                )}
                {isSale && (
                  <span className="bg-[var(--rose)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {Math.round(((p.compareAtPrice! - p.price) / p.compareAtPrice!) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            <p className="text-[var(--stoneGray)] text-base md:text-lg leading-relaxed mb-8">
              {p.description || "Discover waterproof, sweatproof, and life-proof luxury pieces designed for your everyday elegance."}
            </p>

            <div className="flex items-center gap-6 mb-8 p-4 bg-[var(--charcoal)] rounded-2xl border border-[var(--pink-200)]">
              <span className="text-[var(--ink)] font-semibold">Quantity</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn">-</button>
                <span className="text-lg font-bold w-6 text-center text-[var(--ink)]">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="qty-btn">+</button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full btn-primary py-4 text-lg mb-8 flex items-center justify-center gap-3 shadow-glow hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-[var(--pink-200)] pt-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--gold-light)] flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-[var(--ink)]" />
                </div>
                <p className="text-xs font-semibold text-[var(--ink)] uppercase">Anti-Tarnish</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--pink-200)] flex items-center justify-center mx-auto mb-3">
                  <Droplets className="w-6 h-6 text-[var(--ink)]" />
                </div>
                <p className="text-xs font-semibold text-[var(--ink)] uppercase">Waterproof</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--gold-light)] flex items-center justify-center mx-auto mb-3">
                  <Gem className="w-6 h-6 text-[var(--ink)]" />
                </div>
                <p className="text-xs font-semibold text-[var(--ink)] uppercase">Hypoallergenic</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Similar Products */}
        {initialSimilar && initialSimilar.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[var(--pink-200)]">
            <h2 className="font-display text-3xl md:text-4xl text-[var(--ink)] font-medium mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {initialSimilar.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
`;

fs.writeFileSync('components/ProductDetailsClient.tsx', pdcContent);
