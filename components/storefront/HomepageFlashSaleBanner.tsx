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
    <div className="bg-[#361A28] border-y border-[#E9C8A1]/20 py-2.5 md:py-8 px-4 md:px-6 shadow-md w-full">
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
      <div className="hidden md:flex max-w-4xl mx-auto flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left flex-1">
          {settings?.popupOfferTitle && <h2 className="text-2xl sm:text-3xl font-serif text-[#F5ECD5] mb-2">{settings.popupOfferTitle}</h2>}
          {settings?.popupOfferText && <p className="text-[#F5ECD5]/80">{settings.popupOfferText}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {timeLeft && (
            <div className="flex items-center gap-2 font-mono">
              {timeLeft.d > 0 && <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#361A28]">{timeLeft.d}</span><span className="text-[10px] uppercase text-[#361A28] opacity-80 tracking-wider">Days</span></div>}
              <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#361A28]">{timeLeft.h.toString().padStart(2, "0")}</span><span className="text-[10px] uppercase text-[#361A28] opacity-80 tracking-wider">Hrs</span></div>
              <div className="text-xl font-bold text-[#F5ECD5] opacity-50">:</div>
              <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#361A28]">{timeLeft.m.toString().padStart(2, "0")}</span><span className="text-[10px] uppercase text-[#361A28] opacity-80 tracking-wider">Min</span></div>
              <div className="text-xl font-bold text-[#F5ECD5] opacity-50">:</div>
              <div className="flex flex-col items-center bg-[#F5ECD5] shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#361A28]">{timeLeft.s.toString().padStart(2, "0")}</span><span className="text-[10px] uppercase text-[#361A28] opacity-80 tracking-wider">Sec</span></div>
            </div>
          )}
          {settings?.popupOfferLinkUrl && (
            <Link 
              href={settings.popupOfferLinkUrl} 
              className="whitespace-nowrap bg-[#F5ECD5] text-[#361A28] px-8 py-3 rounded-full hover:bg-[#F5ECD5]/90 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              {settings.popupOfferLinkText || "Shop Now"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
