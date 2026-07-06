"use client";

import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const { 
    items, 
    subtotal, 
    isDrawerOpen, 
    closeDrawer, 
    increase, 
    decrease, 
    removeFromCart,
    freeShippingThreshold 
  } = useCart();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (isDrawerOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const amountLeftForFreeShipping = freeShippingThreshold ? Math.max(0, freeShippingThreshold - subtotal) : 0;
  const progressPercent = freeShippingThreshold ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;

  return (
    <>
      <div 
        className="fixed inset-0 z-[150] bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />
      
      <div 
        className={`fixed right-0 top-0 z-[160] flex h-screen w-[90%] max-w-[400px] flex-col bg-[#FAF9F6] shadow-2xl transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 p-4 sm:p-6">
          <h2 className="font-serif text-2xl text-charcoalBrown">Your Cart</h2>
          <button 
            onClick={closeDrawer}
            className="rounded-full p-2 text-stoneGray transition hover:bg-stone-200/50 hover:text-charcoalBrown"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {freeShippingThreshold && freeShippingThreshold > 0 && items.length > 0 && (
          <div className="bg-stone-50/80 px-4 py-3 sm:px-6">
            <p className="mb-2 text-xs font-medium text-stoneGray">
              {amountLeftForFreeShipping > 0 
                ? <>You're <span className="text-charcoalBrown font-bold">₹{amountLeftForFreeShipping}</span> away from free shipping!</>
                : <span className="text-emerald-600 font-bold">You've unlocked free shipping!</span>
              }
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div 
                className="h-full bg-champagne transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mb-2 font-serif text-xl text-charcoalBrown">Your cart is empty</h3>
              <p className="mb-6 text-sm text-stoneGray">Looks like you haven't added anything yet.</p>
              <Link 
                href="/shop" 
                onClick={closeDrawer}
                className="btn-primary-gold px-8 py-3 text-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => {
                const p = item.product;
                const isSale = p.regularPrice && p.regularPrice > p.salePrice;
                const img = p.images?.[0] || (p as any).imageUrl || "/placeholder.png";

                return (
                  <div key={p.id} className="flex gap-4">
                    <Link 
                      href={`/product/${p.slug || p.id}`} 
                      onClick={closeDrawer}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                    >
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    </Link>
                    
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link 
                            href={`/product/${p.slug || p.id}`}
                            onClick={closeDrawer} 
                            className="font-serif text-sm text-charcoalBrown hover:text-champagne line-clamp-2"
                          >
                            {p.name}
                          </Link>
                          <button 
                            onClick={() => removeFromCart(p.id)}
                            className="text-stoneGray hover:text-red-500 transition shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 flex items-baseline gap-2 text-sm">
                          {isSale ? (
                            <>
                              <span className="font-semibold text-charcoalBrown">₹{p.salePrice}</span>
                              <span className="text-xs text-stoneGray line-through">₹{p.regularPrice}</span>
                            </>
                          ) : (
                            <span className="font-semibold text-charcoalBrown">₹{p.salePrice}</span>
                          )}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-lg border border-stone-200 px-2 py-1">
                          <button 
                            onClick={() => decrease(p.id)} 
                            className="text-stoneGray hover:text-charcoalBrown"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-medium text-charcoalBrown w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => increase(p.id)} 
                            className="text-stoneGray hover:text-charcoalBrown"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 bg-white p-4 sm:p-6 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-stoneGray">Subtotal</span>
              <span className="font-serif text-xl font-bold text-charcoalBrown">₹{subtotal}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link 
                href="/checkout" 
                onClick={closeDrawer}
                className="btn-primary-gold flex w-full justify-center py-4 text-base"
              >
                Checkout
              </Link>
              <Link 
                href="/cart" 
                onClick={closeDrawer}
                className="btn-liquid flex w-full justify-center py-3.5 text-sm"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
