"use client";
import { useState, useEffect } from "react";

export function FlashSaleCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;
    
    const target = new Date(targetDate).getTime();
    
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
  }, [targetDate]);

  if (isExpired) return <span className="ml-4 font-mono bg-black/20 px-2 py-0.5 rounded text-xs">Sale Expired</span>;
  if (!timeLeft) return null;

  return (
    <span className="ml-4 inline-flex items-center gap-1 font-mono bg-black/20 px-2 py-0.5 rounded text-xs tracking-wider">
      {timeLeft.d > 0 && <span>{timeLeft.d}d</span>}
      <span>{timeLeft.h.toString().padStart(2, "0")}h</span>
      <span>{timeLeft.m.toString().padStart(2, "0")}m</span>
      <span>{timeLeft.s.toString().padStart(2, "0")}s</span>
    </span>
  );
}
