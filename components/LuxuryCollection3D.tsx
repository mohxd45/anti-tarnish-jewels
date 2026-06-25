"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { DepthCard } from "./ui/DepthCard";
import { ParallaxLayer } from "./ui/ParallaxLayer";
import { PublicJewelryBackground } from "./ui/PublicJewelryBackground";

export function LuxuryCollection3D() {
  return (
    <PublicJewelryBackground variant="section" className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-transparent py-24 lg:py-32">

      {/* Spotlight Glow Background Fallback */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-champagne/20 blur-[100px] rounded-full z-0 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Text Block */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, z: -50, y: 30 }}
            whileInView={{ opacity: 1, z: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block mb-4">
              Premium Series
            </span>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-semibold text-charcoalBrown leading-tight mb-6">
              Luxury Anti-Tarnish Collection
            </h2>
            <p className="text-stoneGray leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Experience the pinnacle of craftsmanship. Our luxury anti-tarnish 
              jewellery is designed to withstand time, water, and daily wear without 
              ever losing its signature champagne glow.
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-champagne text-charcoalBrown px-8 py-4 rounded-full font-semibold hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              Explore Collection <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Right Product Showcase (Floating Depth Cards) */}
        <div className="flex-1 relative w-full max-w-md mx-auto">
          <ParallaxLayer speed={0.4} className="relative z-20">
            <DepthCard>
              <div className="group rounded-3xl border border-goldBeige/60 bg-white/70 backdrop-blur-md backdrop-blur-md p-6 shadow-2xl hover:border-champagne/80 transition-all duration-500 overflow-hidden relative">
                {/* Shine Sweep Effect */}
                <div className="absolute inset-0 -translate-x-[150%] skew-x-[-30deg] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shineSweep z-30 pointer-events-none" />
                
                <div className="aspect-[4/5] bg-beige rounded-2xl overflow-hidden relative mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop" 
                    alt="Luxury Ring"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-charcoalBrown text-xs font-bold px-3 py-1.5 rounded-full z-10">
                    Premium
                  </div>
                </div>
                
                <h3 className="text-xl font-serif font-semibold text-charcoalBrown group-hover:text-champagne transition-colors">Eternal Champagne Ring</h3>
                <p className="text-sm text-stoneGray mt-2">18k Gold Plated • Tarnish Free</p>
              </div>
            </DepthCard>
          </ParallaxLayer>

          {/* Secondary smaller floating card */}
          <ParallaxLayer speed={0.8} className="absolute -bottom-10 -left-10 lg:-left-20 z-30 w-48 hidden sm:block">
            <DepthCard>
              <div className="rounded-2xl border border-champagne/40 bg-white/90 backdrop-blur-md p-4 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop" 
                  alt="Luxury Necklace"
                  className="w-full aspect-square object-cover rounded-xl mb-3"
                />
                <h4 className="text-xs font-semibold text-charcoalBrown truncate">Signature Necklace</h4>
              </div>
            </DepthCard>
          </ParallaxLayer>
        </div>
      </div>
    </PublicJewelryBackground>
  );
}
