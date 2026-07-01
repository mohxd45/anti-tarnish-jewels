const fs = require('fs');

const annContent = `"use client";

import { useEffect, useState } from "react";
import { getAnnouncements } from "@/lib/firestore";

interface Announcement {
  id: string;
  text: string;
  active: boolean;
  order: number;
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function loadAnnouncements() {
      const data = await getAnnouncements();
      setAnnouncements(data.filter(a => a.active));
    }
    loadAnnouncements();
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold-dark)] text-white text-xs md:text-sm font-semibold py-2.5 overflow-hidden sticky top-0 z-[60] shadow-sm">
      <div className="whitespace-nowrap flex ticker-animate">
        {announcements.map((ann, idx) => (
          <span key={idx} className="mx-8 flex items-center">
            <span className="mr-2">✨</span>
            {ann.text}
            <span className="ml-2">✨</span>
          </span>
        ))}
        {/* Repeat for seamless ticker effect */}
        {announcements.map((ann, idx) => (
          <span key={\`repeat-\${idx}\`} className="mx-8 flex items-center">
            <span className="mr-2">✨</span>
            {ann.text}
            <span className="ml-2">✨</span>
          </span>
        ))}
        {announcements.map((ann, idx) => (
          <span key={\`repeat2-\${idx}\`} className="mx-8 flex items-center">
            <span className="mr-2">✨</span>
            {ann.text}
            <span className="ml-2">✨</span>
          </span>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('components/AnnouncementBar.tsx', annContent);
