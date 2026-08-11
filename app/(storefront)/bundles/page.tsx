import { Metadata } from "next";
import BundlesClientPage from "./client-page";

export const metadata: Metadata = {
  title: "Bundles & Combos | LONA JEWELS",
  description: "Discover our curated sets and enjoy exclusive savings when you buy them together.",
  alternates: {
    canonical: '/bundles',
  },
};

export default function BundlesPage() {
  return <BundlesClientPage />;
}
