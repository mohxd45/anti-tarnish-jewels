import React from "react";
import { motion } from "framer-motion";
import { Gem } from "lucide-react";

export function EmptyStateCard({ text, subtext, icon: Icon = Gem, children }: { text: string; subtext?: string; icon?: any; children?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gold/10 text-center max-w-lg mx-auto"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 p-5 bg-section-bg rounded-full text-dustyRose relative preserve-3d shadow-inner"
      >
        <Icon size={40} strokeWidth={1.5} className="drop-shadow-[0_4px_8px_rgba(224,169,165,0.4)]" />
      </motion.div>
      <h3 className="text-xl font-serif text-charcoalBrown mb-2">{text}</h3>
      {subtext && <p className="text-stoneGray text-sm mb-4">{subtext}</p>}
      {children}
    </motion.div>
  );
}
