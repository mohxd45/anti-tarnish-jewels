"use client";

import { ShieldCheck, Truck, RotateCcw, Gift, Award, Clock } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "All products verified genuine",
    accent: "#C9A96B"
  },
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders above ₹999",
    accent: "#C9A96B"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day hassle-free returns",
    accent: "#C98B8B"
  },
  {
    icon: Gift,
    title: "Luxury Packaging",
    description: "Premium gift wrapping included",
    accent: "#C9A96B"
  },
  {
    icon: Award,
    title: "Best Quality",
    description: "Curated premium selections",
    accent: "#C9A96B"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "WhatsApp & email support",
    accent: "#B8A89A"
  }
];

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      {/* Thin divider */}
      <div className="w-16 h-px bg-champagne/40 mx-auto mb-10" />

      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {badges.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl border border-goldBeige/40 bg-warmwhite/60 hover:bg-warmwhite hover:border-champagne/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-champagne/10 flex items-center justify-center mb-3 group-hover:bg-champagne/20 transition-colors">
              <Icon size={18} className="text-champagne" />
            </div>
            <p className="text-xs font-semibold text-charcoalBrown leading-snug">{title}</p>
            <p className="mt-1 text-[10px] text-stoneGray/80 leading-snug">{description}</p>
          </div>
        ))}
      </div>

      {/* Thin divider */}
      <div className="w-16 h-px bg-champagne/40 mx-auto mt-10" />
    </section>
  );
}
