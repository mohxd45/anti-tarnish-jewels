"use client";
import { useState, useEffect } from "react";
import { AnnouncementSettings } from "@/types";
import Link from "next/link";

export function HomepageFlashSaleBanner({ settings }: { settings: AnnouncementSettings | null }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!settings?.countdownTimer) return;
    
    const target = new Date(settings.countdownTimer).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings?.countdownTimer]);

  const hasContent = settings?.popupOfferTitle || settings?.popupOfferText || settings?.countdownTimer;
  if (!hasContent) return null;

  if (settings?.countdownTimer && isExpired) {
    return null; // hide completely when expired
  }

  return (
    <div className="bg-[#361A28] py-2 px-4 md:px-6 w-full relative z-10 border-b border-[#E9C8A1]/10">
      {/* Mobile Layout */}
      <div className="flex md:hidden flex-row items-center justify-center gap-2.5 sm:gap-4">
        {settings?.popupOfferTitle && (
          <h2 className="text-[11px] font-semibold tracking-widest text-[#F5ECD5] uppercase text-center line-clamp-1">{settings.popupOfferTitle}</h2>
        )}
        {timeLeft && (
          <div className="flex items-center gap-1 font-mono text-[#F5ECD5]">
            {timeLeft.d > 0 && <span className="text-xs font-medium tracking-wider">{timeLeft.d}d</span>}
            <span className="text-[10px] sm:text-xs opacity-70 px-0.5">•</span>
            <span className="text-xs font-medium tracking-wider">{timeLeft.h.toString().padStart(2, "0")}h</span>
            <span className="text-[10px] sm:text-xs opacity-70 px-0.5">•</span>
            <span className="text-xs font-medium tracking-wider">{timeLeft.m.toString().padStart(2, "0")}m</span>
            <span className="text-[10px] sm:text-xs opacity-70 px-0.5">•</span>
            <span className="text-xs font-medium tracking-wider">{timeLeft.s.toString().padStart(2, "0")}s</span>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex max-w-7xl mx-auto flex-row items-center justify-center gap-6">
        <div className="text-center md:text-left flex items-center justify-center gap-3">
          {settings?.popupOfferTitle && <h2 className="text-sm tracking-widest font-semibold text-[#F5ECD5] uppercase">{settings.popupOfferTitle}</h2>}
          {settings?.popupOfferText && (
            <>
              <span className="text-[#F5ECD5]/50">•</span>
              <p className="text-sm text-[#F5ECD5]/90">{settings.popupOfferText}</p>
            </>
          )}
        </div>
        
        <div className="flex flex-row items-center gap-4">
          {timeLeft && (
            <div className="flex items-center gap-1.5 font-mono">
              {timeLeft.d > 0 && <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded px-1.5 py-0.5 min-w-[36px]"><span className="text-sm font-bold text-[#361A28] leading-tight">{timeLeft.d}</span><span className="text-[9px] uppercase text-[#361A28] opacity-80 tracking-wider">Days</span></div>}
              <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded px-1.5 py-0.5 min-w-[36px]"><span className="text-sm font-bold text-[#361A28] leading-tight">{timeLeft.h.toString().padStart(2, "0")}</span><span className="text-[9px] uppercase text-[#361A28] opacity-80 tracking-wider">Hrs</span></div>
              <div className="text-sm font-bold text-[#F5ECD5] opacity-50">:</div>
              <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded px-1.5 py-0.5 min-w-[36px]"><span className="text-sm font-bold text-[#361A28] leading-tight">{timeLeft.m.toString().padStart(2, "0")}</span><span className="text-[9px] uppercase text-[#361A28] opacity-80 tracking-wider">Min</span></div>
              <div className="text-sm font-bold text-[#F5ECD5] opacity-50">:</div>
              <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded px-1.5 py-0.5 min-w-[36px]"><span className="text-sm font-bold text-[#361A28] leading-tight">{timeLeft.s.toString().padStart(2, "0")}</span><span className="text-[9px] uppercase text-[#361A28] opacity-80 tracking-wider">Sec</span></div>
            </div>
          )}
          <Link 
            href="/collections" 
            className="whitespace-nowrap bg-gradient-to-r from-[#B8955E] to-[#D4AF37] text-white px-5 py-1.5 text-xs rounded-full hover:shadow-[0_2px_10px_rgba(184,149,94,0.3)] transition-all font-semibold shadow-sm border border-[#D4AF37]/50"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
