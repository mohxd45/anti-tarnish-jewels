"use client";
import { useState, useEffect } from "react";
import { AnnouncementSettings } from "@/types";
import { X } from "lucide-react";

export function PromoPopup({ settings }: { settings: AnnouncementSettings | null }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!settings?.showNewsletterPopup) return;
    
    // Check if user already saw it in THIS session
    const hasSeen = sessionStorage.getItem("atj_seen_popup");
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  if (!isOpen || !settings) return null;

  const close = () => {
    setIsOpen(false);
    sessionStorage.setItem("atj_seen_popup", "true");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#FAF9F6] relative rounded-2xl w-full max-w-md p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={close} className="absolute top-4 right-4 text-stoneGray hover:text-charcoalBrown">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-serif text-charcoalBrown mb-2">{settings.popupOfferTitle || "Join Our Newsletter"}</h2>
        <p className="text-stoneGray mb-6 text-sm">{settings.popupOfferText || "Sign up for exclusive offers and updates."}</p>
        {settings.popupOfferLinkUrl ? (
          <a 
            href={settings.popupOfferLinkUrl} 
            onClick={close}
            className="inline-block bg-[color:var(--color-gold)] text-white px-8 py-3 rounded-full hover:bg-[color:var(--color-gold)]/90 transition-colors font-medium shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            {settings.popupOfferLinkText || "Shop Now"}
          </a>
        ) : (
          <div className="flex gap-2">
            <input type="email" placeholder="Email address" className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-[color:var(--color-gold)] focus:outline-none" />
            <button onClick={close} className="btn-primary-gold px-6 py-2 whitespace-nowrap">Subscribe</button>
          </div>
        )}
      </div>
    </div>
  );
}
