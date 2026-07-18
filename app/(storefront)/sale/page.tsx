import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sale | LONA JEWELS",
  description: "Shop our latest discounts and offers on premium fashion jewellery.",
};

export default function SalePage() {
  redirect("/shop?category=sale");
}
