import { getAnnouncementsList, getAnnouncements } from "@/lib/firestore";
import Link from "next/link";

export async function AnnouncementTicker() {
  const globalSettings = await getAnnouncements();
  
  if (!globalSettings || !globalSettings.showAnnouncement) {
    return null;
  }

  const list = await getAnnouncementsList();
  const activeAnnouncements = list.filter(a => a.isActive).sort((a, b) => a.order - b.order);
  
  let tickerItems: React.ReactNode[] = [];
  let countdownEl = null;
  
  if (globalSettings.countdownTimer) {
    const target = new Date(globalSettings.countdownTimer).getTime();
    if (target > Date.now()) {
      countdownEl = <span className="ml-4 font-mono bg-black/20 px-2 py-0.5 rounded text-xs animate-pulse">SALE ENDS SOON</span>;
    }
  }

  if (activeAnnouncements.length === 0) {
    const text = globalSettings.text || "Welcome to Anti Tarnish Jewels";
    tickerItems = Array(8).fill(text).map((t, i) => (
      <span key={i} className="mx-8 text-sm text-white">
        {t}
      </span>
    ));
  } else {
    // Repeat active announcements to ensure infinite scroll fills the screen
    const repetitions = Math.max(1, Math.ceil(8 / activeAnnouncements.length));
    const repeated = Array(repetitions).fill(activeAnnouncements).flat();
    
    tickerItems = repeated.map((a, i) => (
      <span key={`${a.id}-${i}`} className="mx-8 flex items-center gap-2 text-sm text-white">
        {a.emoji && <span>{a.emoji}</span>}
        {a.link ? (
          <Link href={a.link} className="hover:underline">
            {a.text}{countdownEl}
          </Link>
        ) : (
          <span>{a.text}</span>
        )}
        {a.couponCode && (
          <span className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold tracking-wider">
            {a.couponCode}
          </span>
        )}
      </span>
    ));
  }

  return (
    <div
      className={`fixed left-0 right-0 top-16 z-40 overflow-hidden py-2 ${
    globalSettings.cardStyle === 'rounded' ? 'm-2 rounded-full shadow-md' : 
    globalSettings.cardStyle === 'glass' ? 'bg-opacity-70 backdrop-blur-md' : ''
  }`}
      style={{ background: "linear-gradient(90deg, #4A3040, #6B4060, #4A3040)" }}
    >
      <div className="ticker-animate flex whitespace-nowrap">
        {tickerItems}
      </div>
    </div>
  );
}
