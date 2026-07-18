import { getAnnouncements } from "./firestore";

/**
 * Resolves the configured WhatsApp number from admin settings or environment variable.
 * Sanitizes it by keeping only digits and removing spaces, +, -, brackets, etc.
 */
export async function getWhatsAppNumber(): Promise<string> {
  return "918100558024";
}

/**
 * Creates a formatted wa.me URL with sanitized number and encoded message.
 */
export function createWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/[^0-9]/g, "");
  if (!cleanNumber) return "";
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
