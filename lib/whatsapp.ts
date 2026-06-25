import { getAnnouncements } from "./firestore";

/**
 * Resolves the configured WhatsApp number from admin settings or environment variable.
 * Sanitizes it by keeping only digits and removing spaces, +, -, brackets, etc.
 */
export async function getWhatsAppNumber(): Promise<string> {
  let rawNumber = "";
  try {
    const announcements = await getAnnouncements();
    if (announcements && announcements.whatsAppSupport) {
      rawNumber = announcements.whatsAppSupport;
    }
  } catch (err) {
    console.warn("Failed to fetch WhatsApp number from announcements:", err);
  }
  
  if (!rawNumber || !rawNumber.trim()) {
    rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917250569370";
  }
  
  // Sanitize: remove spaces, +, -, brackets, keep only digits
  return rawNumber.replace(/[^0-9]/g, "");
}

/**
 * Creates a formatted wa.me URL with sanitized number and encoded message.
 */
export function createWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/[^0-9]/g, "");
  if (!cleanNumber) return "";
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
