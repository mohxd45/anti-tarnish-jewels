"use client";

import React, { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number; // >1 = moves faster (foreground), <1 = moves slower (background)
  className?: string;
  disabled?: boolean;
}

export function ParallaxLayer({
  children,
  speed = 0.5,
  className = "",
  disabled = false,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // If disabled, reduced motion, or speed is exactly 1 (no parallax)
  if (disabled || prefersReducedMotion || speed === 1) {
    return <div className={className}>{children}</div>;
  }

  // Calculate parallax offset based on speed
  // Speed 0.5 means it moves at half the scroll speed (good for background)
  // Speed 1.5 means it moves 1.5x the scroll speed (good for foreground)
  const yOffsetMultiplier = (1 - speed) * 100;

  // Track scroll position relative to this element's position in the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Transform scroll progress (0 to 1) into vertical pixels
  const y = useTransform(scrollYProgress, [0, 1], [-yOffsetMultiplier, yOffsetMultiplier]);

  return (
    <div ref={ref} className={`relative overflow-visible ${className}`}>
      <motion.div
        style={{ y }}
        className="w-full h-full will-change-transform hidden md:block"
      >
        {children}
      </motion.div>
      {/* Fallback for mobile/touch devices where parallax can be laggy */}
      <div className="w-full h-full md:hidden">
        {children}
      </div>
    </div>
  );
}
