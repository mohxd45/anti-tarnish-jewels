
const fs = require(fs);
let text = fs.readFileSync(components/storefront/AnnouncementTicker.tsx, utf8);
text = text.replace(import Link from next/link;, import Link from next/link;
import { FlashSaleCountdown } from ./FlashSaleCountdown;);
text = text.replace( if (globalSettings.countdownTimer) {
 const target = new Date(globalSettings.countdownTimer).getTime();
 if (target > Date.now()) {
 countdownEl = <span className="ml-4 font-mono bg-black/20 px-2 py-0.5 rounded text-xs animate-pulse">SALE ENDS SOON</span>;
 }
 },  if (globalSettings.countdownTimer) {
 countdownEl = <FlashSaleCountdown targetDate={globalSettings.countdownTimer} />;
 });
fs.writeFileSync(components/storefront/AnnouncementTicker.tsx, text);

