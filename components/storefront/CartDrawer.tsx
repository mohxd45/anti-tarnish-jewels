"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { SavingsBanner } from "./SavingsBanner";
import { CouponSection } from "./CouponSection";
import { GiftAddon } from "./GiftAddon";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { CartItemCard } from "./CartItemCard";
import { CartRewardTracker } from "./CartRewardTracker";
import { RecommendedProductSlider } from "./RecommendedProductSlider";
import { StickyCartSummaryBar } from "./StickyCartSummaryBar";

export function CartDrawer() {
  const { 
    items, 
    isDrawerOpen, 
    closeDrawer, 
    subtotal, 
    increase,
    decrease,
    removeFromCart
  } = useCart();
  
  // Hide WhatsApp button when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add('cart-drawer-open');
    } else {
      document.body.classList.remove('cart-drawer-open');
    }
    return () => document.body.classList.remove('cart-drawer-open');
  }, [isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[420px] bg-brandMainBg z-[150] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#FFF9FB] border-b border-[#E8D7C8]/50 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-[18px] w-[18px] text-[#B8955E]" />
                <h2 className="text-base font-semibold text-[#3A2428] font-serif">Your Cart</h2>
                <span className="bg-white border border-[#E8D7C8] text-[#3A2428] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {items.length}
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1.5 -mr-1.5 text-stone-400 hover:text-[#3A2428] hover:bg-stone-50 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
            
            {/* Reward Tracker */}
            <div className="shrink-0">
              <CartRewardTracker subtotal={subtotal} />
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-brandMainBg">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
                  <div className="h-20 w-20 rounded-full bg-brandCardBg border border-stone-200 flex items-center justify-center mb-4 shadow-sm">
                    <ShoppingBag className="h-8 w-8 text-stone-300" />
                  </div>
                  <p className="text-lg font-semibold text-brandEspresso font-serif">Your cart is empty</p>
                  <p className="text-sm text-stone-500 mt-2 mb-6">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <button
                    onClick={closeDrawer}
                    className="bg-brandEspresso text-white px-8 py-3 rounded-xl font-semibold hover:bg-stone-800 transition-colors shadow-md"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="px-4 pt-2 pb-4 space-y-3">
                    {items.map((item) => (
                      <CartItemCard 
                        key={item.cartItemId || item.product.id} 
                        item={item} 
                        increase={increase}
                        decrease={decrease}
                        removeFromCart={removeFromCart}
                        closeDrawer={closeDrawer}
                      />
                    ))}
                  </div>

                  {/* Coupon Section inside scrollable area to save sticky space */}
                  <div className="px-4 pb-4 flex flex-col gap-3">
                    <SavingsBanner />
                    <CouponSection compact />
                    <GiftAddon compact />
                  </div>

                  <div className="mt-auto">
                    <RecommendedProductSlider closeDrawer={closeDrawer} />
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            {items.length > 0 && (
              <div className="shrink-0 z-10">
                <StickyCartSummaryBar closeDrawer={closeDrawer} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
