"use client";

import { Sparkles, Gem, Gift } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:pt-16 pb-12">
        
        {/* Hero Card */}
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10 relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#B8955E]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#FFF0F5] rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-widest text-[#B8955E] uppercase">Our Story</span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-serif text-[#3A2428]">
              About LONA JEWELS
            </h1>
            <p className="mt-6 text-[#3A2428]/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Welcome to LONA JEWELS, your premium destination for exquisite jewellery that seamlessly blends luxury aesthetics with daily utility. 
              Our mission is to offer beautifully crafted rings, necklaces, bracelets, and earrings that stay radiant forever.
            </p>
            <p className="mt-4 text-[#3A2428]/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              With express shipping, secure payment checkouts, and premium packaging, we ensure every shopping experience is as memorable as the pieces themselves.
            </p>
          </div>
        </div>

        {/* Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#FFF9FB] rounded-3xl p-6 sm:p-8 text-center shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 flex flex-col items-center group hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F5] flex items-center justify-center mb-4 group-hover:bg-[#B8955E]/10 transition-colors">
              <Sparkles className="w-6 h-6 text-[#B8955E]" />
            </div>
            <h3 className="text-lg font-serif text-[#3A2428] mb-2">Elegant Designs</h3>
            <p className="text-sm text-[#3A2428]/70 leading-relaxed">
              Timeless and contemporary pieces curated to elevate your everyday style with effortless grace.
            </p>
          </div>

          <div className="bg-[#FFF9FB] rounded-3xl p-6 sm:p-8 text-center shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 flex flex-col items-center group hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F5] flex items-center justify-center mb-4 group-hover:bg-[#B8955E]/10 transition-colors">
              <Gem className="w-6 h-6 text-[#B8955E]" />
            </div>
            <h3 className="text-lg font-serif text-[#3A2428] mb-2">Affordable Luxury</h3>
            <p className="text-sm text-[#3A2428]/70 leading-relaxed">
              Premium quality and craftsmanship offered at price points that make luxury accessible.
            </p>
          </div>

          <div className="bg-[#FFF9FB] rounded-3xl p-6 sm:p-8 text-center shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 flex flex-col items-center group hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F5] flex items-center justify-center mb-4 group-hover:bg-[#B8955E]/10 transition-colors">
              <Gift className="w-6 h-6 text-[#B8955E]" />
            </div>
            <h3 className="text-lg font-serif text-[#3A2428] mb-2">Made for Every Occasion</h3>
            <p className="text-sm text-[#3A2428]/70 leading-relaxed">
              Whether gifting a loved one or treating yourself, our jewellery is crafted for unforgettable moments.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
