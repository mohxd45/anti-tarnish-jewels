"use client";

import { useEffect, useState } from "react";
import { getAnnouncements } from "@/lib/firestore";
import { AnnouncementSettings } from "@/types";
import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function AnnouncementBar() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    loadSettings();
  }, [isAdmin]);

  // Countdown timer logic
  useEffect(() => {
    if (!settings?.countdownTimer) return;

    const targetDate = new Date(settings.countdownTimer).getTime();
    if (isNaN(targetDate)) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft("");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const timeStr = `${days > 0 ? days + "d " : ""}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      setTimeLeft(timeStr);
    }, 1000);

    return () => clearInterval(interval);
  }, [settings?.countdownTimer]);

  async function loadSettings() {
    try {
      const data = await getAnnouncements();
      setSettings(data);
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  }

  if (isAdmin || !visible || !settings || !settings.showAnnouncement) return null;

  const bgStyle = settings.announcementBarColor 
    ? { backgroundColor: settings.announcementBarColor } 
    : {};

  return (
    <div 
      className="bg-champagne text-charcoalBrown text-xs font-semibold py-2.5 px-4 flex items-center justify-between transition-all duration-300 relative z-50 shadow-sm"
      style={bgStyle}
    >
      <div className="flex-1 flex items-center justify-center gap-4 flex-wrap pr-6 sm:pr-0">
        <span>{settings.text}</span>
        
        {/* Countdown Timer */}
        {timeLeft && (
          <span className="bg-charcoalBrown/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider flex items-center gap-1.5 border border-charcoalBrown/10">
            <span className="w-1.5 h-1.5 rounded-full bg-dustyRose animate-ping" />
            Ends in: {timeLeft}
          </span>
        )}

        {/* WhatsApp Help Desk */}
        {settings.whatsAppSupport && (
          <a
            href={`https://wa.me/${settings.whatsAppSupport.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-charcoalBrown/10 px-2 py-0.5 rounded-full text-[10px] hover:bg-charcoalBrown/20 transition-colors"
          >
            <MessageCircle size={10} /> Support
          </a>
        )}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="text-charcoalBrown/65 hover:text-charcoalBrown transition-colors self-center absolute right-3 md:right-5"
        aria-label="Dismiss Announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
