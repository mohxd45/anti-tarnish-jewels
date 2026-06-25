"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export function FloatingAccents() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Different parallax speeds for the orbs
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  if (prefersReducedMotion) {
    // If reduced motion, just show the soft background gradients but NO floating orbs
    return (
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-section-bg/60 to-transparent blur-[120px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-gold/10 to-transparent blur-[100px] opacity-50" />
      </div>
    );
  }

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden hidden md:block">
      {/* Soft Radial Pink Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-section-bg/60 to-transparent blur-[120px] opacity-70" />
      
      {/* Champagne Gold Gradient Accent */}
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-gold/10 to-transparent blur-[100px] opacity-50" />
      
      {/* Floating Pearl Orbs (Scroll linked, not time-based infinite loop) */}
      <motion.div
        style={{ y: y1 }}
        className="fixed top-[20%] right-[15%] w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] opacity-60"
      />
      <motion.div
        style={{ y: y2 }}
        className="fixed top-[40%] left-[10%] w-4 h-4 rounded-full bg-section-bg shadow-[0_0_20px_rgba(255,230,238,0.8)] opacity-50"
      />
      <motion.div
        style={{ y: y3 }}
        className="fixed top-[70%] right-[25%] w-2.5 h-2.5 rounded-full bg-gold/20 shadow-[0_0_12px_rgba(184,149,94,0.4)] opacity-40"
      />
      <motion.div
        style={{ y: y4 }}
        className="fixed top-[85%] left-[20%] w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.7)] opacity-50"
      />
    </div>
  );
}
