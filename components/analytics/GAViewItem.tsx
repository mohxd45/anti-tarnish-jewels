"use client";

import { useEffect, useRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { Product } from "@/types";

export function GAViewItem({ product }: { product: Product }) {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product) return;

    const productId = product.id || product.sku || "unknown";

    if (trackedRef.current === productId) {
      return;
    }

    trackedRef.current = productId;

    const price = typeof product.salePrice === "number" 
      ? product.salePrice 
      : Number(product.regularPrice || 0);

    const itemCategory = product.categorySlug || product.category || (product.isBundle ? "Bundles" : "Jewellery");

    sendGAEvent("event", "view_item", {
      currency: "INR",
      value: price,
      items: [
        {
          item_id: productId,
          item_name: product.name,
          item_brand: "LONA JEWELS",
          item_category: itemCategory,
          price: price,
          quantity: 1
        }
      ]
    });

  }, [product]);

  return null;
}
