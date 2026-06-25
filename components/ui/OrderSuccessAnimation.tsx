"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export function OrderSuccessAnimation() {
  return (
    <div className="relative mb-6 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-champagne text-white shadow-lg"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Check size={48} strokeWidth={3} className="text-ivory" />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute -right-4 -top-4 text-champagne"
      >
        <Sparkles size={32} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute -bottom-2 -left-4 text-dustyRose"
      >
        <Sparkles size={24} />
      </motion.div>
    </div>
  );
}
