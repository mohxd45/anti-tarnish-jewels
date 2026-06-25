"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export function HeartLoader({
  text = "Loading...",
  fullScreen = false,
  size = "md"
}: {
  text?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: 20,
    md: 40,
    lg: 60
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        {/* Sparkles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 flex items-center justify-center text-champagne/40"
        >
          <Sparkles size={currentSize + 20} strokeWidth={1} />
        </motion.div>

        {/* Beating Heart */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Heart 
            size={currentSize} 
            className="fill-dustyRose text-dustyRose drop-shadow-[0_0_12px_rgba(224,169,165,0.6)]" 
          />
        </motion.div>
      </div>

      {text && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`font-semibold tracking-wider text-charcoalBrown/80 ${size === "sm" ? "text-xs" : "text-sm"} uppercase`}
        >
          {text}
        </motion.span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ivory/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex justify-center p-6 w-full">{content}</div>;
}
