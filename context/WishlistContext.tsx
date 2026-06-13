"use client";

import { Product } from "@/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type WishlistContextType = {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("atj-wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      localStorage.removeItem("atj-wishlist");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("atj-wishlist", JSON.stringify(items));
    } catch {
      // Storage quota exceeded — ignore silently
    }
  }, [items, mounted]);

  const value = useMemo<WishlistContextType>(() => ({
    items,
    addToWishlist: (product) => setItems((prev) => prev.find((p) => p.id === product.id) ? prev : [...prev, product]),
    removeFromWishlist: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
    toggleWishlist: (product) => setItems((prev) => prev.find((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]),
    isWishlisted: (id) => items.some((p) => p.id === id)
  }), [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
