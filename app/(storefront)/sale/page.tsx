import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sale | Anti Tarnish Jewels",
  description: "Shop our latest discounts and offers on premium anti-tarnish jewelry.",
};

export default function SalePage() {
  redirect("/shop?category=sale");
}
