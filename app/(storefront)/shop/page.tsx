import { Metadata } from "next";
import ShopClientPage from "./client-page";

export const metadata: Metadata = {
  title: "Shop All Collections | LONA JEWELS",
  description: "Browse our entire collection of fashion jewellery, including earrings, necklaces, rings, bracelets, and hair accessories.",
  alternates: {
    canonical: '/shop',
  },
};

export default function ShopPage() {
  return <ShopClientPage />;
}
