"use client";

import { CartItem, Product, Coupon } from "@/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCoupons, getAnnouncements, validateCoupon, getSiteSettings, getCart, saveCart } from "@/lib/firestore";
import { useAuth } from "./AuthContext";

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon: string;
  couponId: string;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  freeShippingThreshold: number | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("atj-cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      try { localStorage.removeItem("atj-cart"); } catch {}
    }
    setMounted(true);
  }, []);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!mounted || !user) return;

    const syncCart = async () => {
      try {
        const remoteItems = await getCart(user.uid);
        
        if (remoteItems.length > 0) {
          const merged = [...remoteItems];
          let updated = false;
          
          items.forEach(localItem => {
            const existing = merged.find(r => r.product.id === localItem.product.id);
            if (existing) {
              if (localItem.quantity > existing.quantity) {
                existing.quantity = localItem.quantity;
                updated = true;
              }
            } else {
              merged.push(localItem);
              updated = true;
            }
          });

          setItems(merged);
          
          if (updated) {
            await saveCart(user.uid, merged);
          }
        } else if (items.length > 0) {
          await saveCart(user.uid, items);
        }
      } catch (err) {
        console.error("Failed to sync cart with cloud:", err);
      }
    };

    syncCart();
  }, [user, mounted]);

  // Persist to local storage AND firestore on any change
  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("atj-cart", JSON.stringify(items));
    } catch {
      // ignore
    }

    if (user) {
      saveCart(user.uid, items).catch(err => {
        console.error("Failed to save cart to cloud:", err);
      });
    }
  }, [items, mounted, user]);

  const [shippingFee, setShippingFee] = useState(79); // safe temporary default
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(999); // default threshold

  useEffect(() => {
    async function loadShippingSettings() {
      try {
        const config = await getSiteSettings();
        if (config) {
          if (config.shippingFee !== undefined && config.shippingFee !== null) {
            setShippingFee(Number(config.shippingFee));
          }
          if (config.freeShippingThreshold !== undefined && config.freeShippingThreshold !== null) {
            setFreeShippingThreshold(Number(config.freeShippingThreshold));
          } else {
            setFreeShippingThreshold(null);
          }
        }
      } catch (err) {
        console.warn("Failed to load shipping settings for cart:", err);
      }
    }
    loadShippingSettings();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    if (freeShippingThreshold !== null && freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
      return 0;
    }
    return shippingFee;
  }, [subtotal, shippingFee, freeShippingThreshold]);

  // Calculate discount dynamically based on the current subtotal and active coupon metadata
  const discount = useMemo(() => {
    if (!activeCoupon || !activeCoupon.active) return 0;
    
    // Check minimum spend limit if set
    const minAmount = activeCoupon.minimumOrderAmount ?? activeCoupon.minOrderValue ?? 0;
    if (minAmount > 0 && subtotal < minAmount) {
      return 0;
    }

    // Check expiration date if set
    if (activeCoupon.expiryDate) {
      const expTime = new Date(activeCoupon.expiryDate).getTime();
      if (!isNaN(expTime) && Date.now() > expTime) {
        return 0;
      }
    }

    // Check start date if set
    if (activeCoupon.startDate) {
      const start = new Date(activeCoupon.startDate).getTime();
      if (!isNaN(start) && Date.now() < start) {
        return 0;
      }
    }

    let val = 0;
    if (activeCoupon.type === "percent" || activeCoupon.type === "percentage") {
      val = Math.round(subtotal * (activeCoupon.value / 100));
      if (activeCoupon.maximumDiscount && val > activeCoupon.maximumDiscount) {
        val = activeCoupon.maximumDiscount;
      }
    } else {
      val = activeCoupon.value;
    }

    if (val > subtotal) {
      val = subtotal;
    }
    if (val < 0) {
      val = 0;
    }
    return val;
  }, [activeCoupon, subtotal]);

  const total = Math.max(subtotal + shipping - discount, 0);

  const value = useMemo<CartContextType>(() => ({
    items,
    addToCart: (product, quantity = 1) => {
      setItems((prev) => {
        const found = prev.find((item) => item.product.id === product.id);
        if (found) {
          return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
        }
        return [...prev, { product, quantity }];
      });
      setIsDrawerOpen(true); // Auto-open drawer when adding to cart
    },
    removeFromCart: (id) => setItems((prev) => prev.filter((item) => item.product.id !== id)),
    increase: (id) => setItems((prev) => prev.map((item) => item.product.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    decrease: (id) => setItems((prev) => prev.map((item) => item.product.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item)),
    clearCart: () => {
      setItems([]);
      setActiveCoupon(null);
    },
    subtotal,
    shipping,
    discount,
    total,
    coupon: activeCoupon ? activeCoupon.code : "",
    couponId: activeCoupon ? activeCoupon.id : "",
    applyCoupon: async (code) => {
      const clean = code.trim().toUpperCase();
      if (!clean) {
        setActiveCoupon(null);
        return { success: false, error: "Please enter a coupon code." };
      }
      try {
        const res = await fetch("/api/coupon/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: clean, subtotal })
        });
        const data = await res.json();
        
        if (data.success && data.coupon) {
          setActiveCoupon(data.coupon);
          return { success: true };
        } else {
          setActiveCoupon(null);
          return { success: false, error: data.error || "Invalid coupon code." };
        }
      } catch (err) {
        console.error("Error applying coupon:", err);
        setActiveCoupon(null);
        return { success: false, error: "Failed to apply coupon." };
      }
    },
    freeShippingThreshold,
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false)
  }), [items, subtotal, shipping, discount, total, activeCoupon, freeShippingThreshold, isDrawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
