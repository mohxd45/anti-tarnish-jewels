"use client";

import React, { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion or direction is "none", just fade in
  if (prefersReducedMotion || direction === "none") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration, delay, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  // 3D Directional Reveal
  const getVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 40, rotateX: -15, z: -100 },
          visible: { opacity: 1, y: 0, rotateX: 0, z: 0 },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -40, rotateX: 15, z: -100 },
          visible: { opacity: 1, y: 0, rotateX: 0, z: 0 },
        };
      case "left":
        return {
          hidden: { opacity: 0, x: 40, rotateY: 15, z: -100 },
          visible: { opacity: 1, x: 0, rotateY: 0, z: 0 },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -40, rotateY: -15, z: -100 },
          visible: { opacity: 1, x: 0, rotateY: 0, z: 0 },
        };
      default:
        return {
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`preserve-3d will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
