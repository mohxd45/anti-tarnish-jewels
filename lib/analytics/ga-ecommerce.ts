"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { CartItem } from "@/types";

export function trackBeginCheckout({
  items,
  subtotal,
  coupon
}: {
  items: CartItem[];
  subtotal: number;
  coupon?: string;
}) {
  if (!items || items.length === 0) return;

  const gaItems = items.map((item) => {
    const product = item.product;
    const isMixMatch = product.bundleType === "mix_and_match";
    const itemId = product.sku || product.id || "unknown";
    
    const price = typeof product.salePrice === "number" 
      ? product.salePrice 
      : Number(product.regularPrice || 0);

    const itemCategory = product.categorySlug || product.category || (product.isBundle ? "Bundles" : "Jewellery");

    const gaItem: any = {
      item_id: itemId,
      item_name: product.name,
      item_brand: "LONA JEWELS",
      item_category: itemCategory,
      price: price,
      quantity: isMixMatch ? 1 : item.quantity
    };

    const itemVariant = [item.selectedSize, item.selectedColor].filter(Boolean).join(" / ");
    if (itemVariant) {
      gaItem.item_variant = itemVariant;
    }

    return gaItem;
  });

  const payload: any = {
    currency: "INR",
    value: subtotal,
    items: gaItems
  };

  if (coupon) {
    payload.coupon = coupon;
  }

  sendGAEvent("event", "begin_checkout", payload);
}
