"use client";

import React, { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface OrderSuccessCardProps {
  children: ReactNode;
}

export function OrderSuccessCard({ children }: OrderSuccessCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="rounded-[2rem] border border-[#F1CFCF]/50 bg-white/70 backdrop-blur-md p-10 shadow-jewel flex flex-col items-center overflow-hidden relative">
        {children}
      </div>
    );
  }

  return (
    <div className="perspective-1200 w-full relative">
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -10, z: -200 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[2rem] border border-[#F1CFCF]/50 bg-white/70 backdrop-blur-md p-10 shadow-[0_20px_60px_-15px_rgba(224,169,165,0.4)] flex flex-col items-center overflow-hidden preserve-3d will-change-transform relative z-10"
      >
        {children}
      </motion.div>

      {/* CSS-animated sparkles around the card */}
      <div className="absolute -top-6 -left-6 text-champagne/60 float-sparkle hidden sm:block">
        ✨
      </div>
      <div 
        className="absolute -bottom-8 -right-4 text-champagne/40 float-sparkle hidden sm:block"
        style={{ animationDelay: "1s" }}
      >
        ✨
      </div>
      <div 
        className="absolute top-1/2 -right-8 text-champagne/50 float-sparkle hidden sm:block"
        style={{ animationDelay: "2s", fontSize: "1.5rem" }}
      >
        ✦
      </div>
    </div>
  );
}
