"use client";

import { useEffect, useState } from "react";
import { getAnnouncements } from "@/lib/firestore";
import { AnnouncementSettings } from "@/types";

export function AnnouncementBar() {
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);

  useEffect(() => {
    async function loadAnnouncements() {
      const data = await getAnnouncements();
      setSettings(data);
    }
    loadAnnouncements();
  }, []);

  if (!settings || !settings.showAnnouncement || !settings.text) return null;

  return (
    <div className="bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold-dark)] text-white text-xs md:text-sm font-semibold py-2.5 overflow-hidden sticky top-0 z-[60] shadow-sm">
      <div className="whitespace-nowrap flex ticker-animate">
        <span className="mx-8 flex items-center">
          <span className="mr-2">✨</span>
          {settings.text}
          <span className="ml-2">✨</span>
        </span>
        <span className="mx-8 flex items-center">
          <span className="mr-2">✨</span>
          {settings.text}
          <span className="ml-2">✨</span>
        </span>
        <span className="mx-8 flex items-center">
          <span className="mr-2">✨</span>
          {settings.text}
          <span className="ml-2">✨</span>
        </span>
        <span className="mx-8 flex items-center">
          <span className="mr-2">✨</span>
          {settings.text}
          <span className="ml-2">✨</span>
        </span>
      </div>
    </div>
  );
}
