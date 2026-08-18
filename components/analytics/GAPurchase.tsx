"use client";

import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

export interface GAPurchaseItem {
  type?: "product" | "bundle" | "mix_and_match_bundle" | string;
  sku?: string;
  bundleSku?: string;
  productId?: string;
  bundleId?: string;
  name?: string;
  bundleName?: string;
  categorySlug?: string;
  category?: string;
  price?: number;
  bundlePrice?: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface GAPurchaseData {
  transaction_id: string;
  subtotal: number;
  discount: number;
  giftWrapSelected: boolean;
  giftWrapPrice: number;
  shipping: number;
  couponCode?: string;
  items: GAPurchaseItem[];
}

export function GAPurchase({ data }: { data: GAPurchaseData }) {
  useEffect(() => {
    if (!data.transaction_id || !data.items || data.items.length === 0) return;

    const storageKey = `lona_ga_purchase_${data.transaction_id}`;

    try {
      if (localStorage.getItem(storageKey) === "1") {
        return;
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    const merchandiseValue = Math.max(Number(data.subtotal || 0) - Number(data.discount || 0), 0);
    const giftWrapValue = data.giftWrapSelected === true ? Number(data.giftWrapPrice || 0) : 0;
    const purchaseValue = merchandiseValue + giftWrapValue;
    
    const shipping = Number(data.shipping || 0);

    const subtotal = Number(data.subtotal || 0);
    const discount = Math.min(Math.max(Number(data.discount || 0), 0), subtotal);

    const gaItems = data.items.map((item) => {
      const quantity = Number(item.quantity || 1);
      const originalUnitPrice = typeof item.price === "number" ? item.price : Number(item.bundlePrice || 0);
      const lineGross = originalUnitPrice * quantity;

      const lineDiscount = subtotal > 0 ? discount * (lineGross / subtotal) : 0;
      const unitDiscount = quantity > 0 ? lineDiscount / quantity : 0;
      const actualUnitPrice = Math.max(originalUnitPrice - unitDiscount, 0);

      const itemId = item.sku || item.bundleSku || item.productId || item.bundleId || "unknown";
      const itemName = item.name || item.bundleName || "Unknown Product";
      const itemCategory = item.categorySlug || item.category || (item.type === "bundle" || item.type === "mix_and_match_bundle" ? "Bundles" : "Jewellery");

      const gaItem: any = {
        item_id: itemId,
        item_name: itemName,
        item_brand: "LONA JEWELS",
        item_category: itemCategory,
        price: actualUnitPrice,
        quantity: item.type === "mix_and_match_bundle" ? 1 : quantity
      };

      if (unitDiscount > 0) {
        gaItem.discount = unitDiscount;
      }

      if (item.type === "product" || !item.type) {
        const variant = [item.selectedSize, item.selectedColor].filter(Boolean).join(" / ");
        if (variant) {
          gaItem.item_variant = variant;
        }
      }

      return gaItem;
    });

    if (data.giftWrapSelected === true && Number(data.giftWrapPrice) > 0) {
      gaItems.push({
        item_id: "LONA-GIFT-WRAP",
        item_name: "Gift Wrap",
        item_brand: "LONA JEWELS",
        item_category: "Add-ons",
        price: Number(data.giftWrapPrice),
        quantity: 1
      });
    }

    const payload: any = {
      transaction_id: data.transaction_id,
      currency: "INR",
      value: purchaseValue,
      shipping: shipping,
      items: gaItems
    };

    if (data.couponCode) {
      payload.coupon = data.couponCode;
    }

    sendGAEvent("event", "purchase", payload);

    try {
      localStorage.setItem(storageKey, "1");
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [data]);

  return null;
}
