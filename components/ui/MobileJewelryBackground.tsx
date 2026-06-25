"use client";

import { motion } from "framer-motion";

interface MobileJewelryBackgroundProps {
  className?: string;
}

export function MobileJewelryBackground({ className = "" }: MobileJewelryBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-champagne/20 blur-[70px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-dustyRose/20 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-champagne/15 blur-[90px] rounded-full pointer-events-none" />

      {/* Ring with Gem */}
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] left-[10%] w-14 h-14 opacity-30"
      >
        <svg viewBox="0 0 40 40" fill="none">
          {/* Ring Band */}
          <ellipse cx="20" cy="20" rx="14" ry="10" stroke="#D4AF37" strokeWidth="2.5" transform="rotate(-15 20 20)" />
          {/* Gem Base */}
          <polygon points="17,11 23,11 20,15" fill="#D4AF37" transform="rotate(-15 20 20)" />
          {/* Diamond */}
          <polygon points="16,8 24,8 20,12" fill="#FFF" stroke="#E0A9A5" strokeWidth="0.5" transform="rotate(-15 20 20)" />
        </svg>
      </motion.div>
      
      {/* Diamond/Gem */}
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[45%] right-[12%] w-10 h-10 opacity-35"
      >
        <svg viewBox="0 0 40 40" fill="none">
          {/* Pink Diamond */}
          <polygon points="20,8 30,16 20,32 10,16" fill="url(#pink-grad)" stroke="#C98484" strokeWidth="1" />
          <polygon points="15,16 25,16 20,32" fill="rgba(255,255,255,0.4)" />
          <polygon points="20,8 25,16 15,16" fill="rgba(255,255,255,0.6)" />
          <defs>
            <linearGradient id="pink-grad" x1="10" y1="8" x2="30" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F7DADA" />
              <stop offset="100%" stopColor="#E0A9A5" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      
      {/* Pearl */}
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[25%] right-[25%] w-8 h-8 opacity-40"
      >
        <svg viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="12" fill="url(#pearl-grad)" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.1))" />
          {/* Shine highlight */}
          <ellipse cx="16" cy="16" rx="4" ry="2" fill="#FFFFFF" opacity="0.8" transform="rotate(-45 16 16)" />
          <defs>
            <radialGradient id="pearl-grad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FDFBF7" />
              <stop offset="100%" stopColor="#E6DCC8" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
      
      {/* Bracelet / Bangle */}
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[35%] left-[15%] w-16 h-16 opacity-30"
      >
        <svg viewBox="0 0 60 60" fill="none">
          <ellipse cx="30" cy="30" rx="22" ry="14" stroke="#D4AF37" strokeWidth="2" transform="rotate(20 30 30)" />
          <ellipse cx="30" cy="30" rx="20" ry="12" stroke="#E0A9A5" strokeWidth="1.5" transform="rotate(20 30 30)" />
          {/* Small gems on bangle */}
          <circle cx="10" cy="23" r="2" fill="#FFF" transform="rotate(20 30 30)" />
          <circle cx="50" cy="37" r="2" fill="#FFF" transform="rotate(20 30 30)" />
          <circle cx="25" cy="17" r="2" fill="#FFF" transform="rotate(20 30 30)" />
        </svg>
      </motion.div>

      {/* Earring (Hoop with Pearl) */}
      <motion.div 
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[18%] right-[20%] w-12 h-12 opacity-35"
      >
        <svg viewBox="0 0 40 40" fill="none">
          {/* Hoop */}
          <circle cx="20" cy="14" r="8" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="20" cy="14" r="6" stroke="#E0A9A5" strokeWidth="0.5" />
          {/* Connector */}
          <line x1="20" y1="22" x2="20" y2="26" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Hanging Pearl */}
          <circle cx="20" cy="30" r="5" fill="url(#earring-pearl)" />
          <defs>
            <radialGradient id="earring-pearl" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E6DCC8" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Necklace/Pendant */}
      <motion.div 
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="absolute top-[65%] left-[25%] w-16 h-16 opacity-25"
      >
        <svg viewBox="0 0 60 60" fill="none">
          {/* Chain Arc */}
          <path d="M 10 20 Q 30 45 50 20" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 1" />
          {/* Pendant */}
          <circle cx="30" cy="33" r="4" fill="#E0A9A5" stroke="#D4AF37" strokeWidth="1" />
          <polygon points="30,37 33,42 27,42" fill="#FFF" />
        </svg>
      </motion.div>

    </div>
  );
}
