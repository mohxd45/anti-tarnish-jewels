"use client";

import { Product } from "@/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, saveWishlist } from "@/lib/firestore";
import { toast } from "sonner";

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
  const { user } = useAuth();

  // Load from local storage initially for fast render
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

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!mounted || !user) return;

    const syncWishlist = async () => {
      try {
        const remoteItems = await getWishlist(user.uid);
        
        // Merge local items that are not in remote yet (e.g. added as guest)
        if (remoteItems.length > 0) {
          const merged = [...remoteItems];
          let updated = false;
          
          items.forEach(localItem => {
            if (!merged.find(r => r.id === localItem.id)) {
              merged.push(localItem);
              updated = true;
            }
          });

          setItems(merged);
          
          // If we had local items to push, save them remote now
          if (updated) {
            await saveWishlist(user.uid, merged);
          }
        } else if (items.length > 0) {
          // No remote wishlist yet, push our local one
          await saveWishlist(user.uid, items);
        }
      } catch (err) {
        console.error("Failed to sync wishlist with cloud:", err);
      }
    };

    syncWishlist();
  }, [user, mounted]);

  // Persist to local storage AND firestore on any change
  useEffect(() => {
    if (!mounted) return;
    
    // Save to local storage
    try {
      localStorage.setItem("atj-wishlist", JSON.stringify(items));
    } catch {
      // Ignore
    }

    // Save to Firestore if user is logged in
    if (user) {
      saveWishlist(user.uid, items).catch(err => {
        console.error("Failed to save wishlist to cloud:", err);
      });
    }
  }, [items, mounted, user]);

  const value = useMemo<WishlistContextType>(() => ({
    items,
    addToWishlist: (product) => setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      toast.success(`${product.name} added to wishlist!`);
      return [...prev, product];
    }),
    removeFromWishlist: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
    toggleWishlist: (product) => setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        toast.success(`${product.name} added to wishlist!`);
        return [...prev, product];
      }
    }),
    isWishlisted: (id) => items.some((p) => p.id === id)
  }), [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
