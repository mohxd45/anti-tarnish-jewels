import React from "react";
import { HeartLoader } from "./HeartLoader";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingOverlay({ active, text = "Processing..." }: { active: boolean; text?: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory/60 backdrop-blur-[2px]"
        >
          <div className="bg-white/80 p-8 rounded-[2rem] shadow-xl border border-gold/20 backdrop-blur-md">
            <HeartLoader size="lg" text={text} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
