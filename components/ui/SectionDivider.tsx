"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className = "" }: SectionDividerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="w-24 h-px bg-champagne/40" />
        <Sparkles className="mx-4 text-champagne/60" size={16} />
        <div className="w-24 h-px bg-champagne/40" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-12 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 96, opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-px bg-gradient-to-r from-transparent to-champagne/40"
      />
      
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -45 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
      >
        <Sparkles className="mx-4 text-champagne/80" size={16} />
      </motion.div>

      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 96, opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-px bg-gradient-to-l from-transparent to-champagne/40"
      />
    </div>
  );
}
