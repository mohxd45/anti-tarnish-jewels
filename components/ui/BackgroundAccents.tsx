import React from "react";
import { motion } from "framer-motion";

export function BackgroundAccents() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      {/* Soft Radial Pink Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-section-bg/60 to-transparent blur-[120px] opacity-70" />
      
      {/* Champagne Gold Gradient Accent */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-gold/10 to-transparent blur-[100px] opacity-50" />
      
      {/* Floating Pearl Orbs (Hidden on reduced motion) */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] hidden sm:block motion-reduce:hidden"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[30%] left-[10%] w-4 h-4 rounded-full bg-section-bg shadow-[0_0_20px_rgba(255,230,238,0.8)] hidden sm:block motion-reduce:hidden"
      />
    </div>
  );
}
