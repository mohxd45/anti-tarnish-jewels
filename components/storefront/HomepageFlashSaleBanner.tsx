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
    return (
      <div className="bg-black/5 border-y border-black/10 py-6 text-center">
        <h2 className="text-xl font-serif text-charcoalBrown opacity-50">Offer Ended</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] border-y border-[#BCA37F]/20 py-8 px-4 sm:px-6 shadow-sm">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left flex-1">
          {settings?.popupOfferTitle && <h2 className="text-2xl sm:text-3xl font-serif text-[#333333] mb-2">{settings.popupOfferTitle}</h2>}
          {settings?.popupOfferText && <p className="text-[#666666]">{settings.popupOfferText}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {timeLeft && (
            <div className="flex items-center gap-2 font-mono">
              {timeLeft.d > 0 && <div className="flex flex-col items-center bg-white shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#BCA37F]">{timeLeft.d}</span><span className="text-[10px] uppercase text-[#666666] tracking-wider">Days</span></div>}
              <div className="flex flex-col items-center bg-white shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#BCA37F]">{timeLeft.h.toString().padStart(2, "0")}</span><span className="text-[10px] uppercase text-[#666666] tracking-wider">Hrs</span></div>
              <div className="text-xl font-bold text-[#BCA37F] opacity-50">:</div>
              <div className="flex flex-col items-center bg-white shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#BCA37F]">{timeLeft.m.toString().padStart(2, "0")}</span><span className="text-[10px] uppercase text-[#666666] tracking-wider">Min</span></div>
              <div className="text-xl font-bold text-[#BCA37F] opacity-50">:</div>
              <div className="flex flex-col items-center bg-white shadow-sm rounded-lg px-3 py-2 min-w-[60px]"><span className="text-xl font-bold text-[#BCA37F]">{timeLeft.s.toString().padStart(2, "0")}</span><span className="text-[10px] uppercase text-[#666666] tracking-wider">Sec</span></div>
            </div>
          )}
          {settings?.popupOfferLinkUrl && (
            <Link 
              href={settings.popupOfferLinkUrl} 
              className="whitespace-nowrap bg-[#BCA37F] text-white px-8 py-3 rounded-full hover:bg-[#BCA37F]/90 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              {settings.popupOfferLinkText || "Shop Now"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
