"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAnnouncements } from "@/lib/firestore";
import { getWhatsAppNumber, createWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const pathname = usePathname();
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("Hi Anti Tarnish Jewels, I need help.");
  const [showButton, setShowButton] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadSettings() {
      try {
        const announcements = await getAnnouncements();
        if (announcements) {
          setShowButton(announcements.showWhatsAppButton !== false);
          if (announcements.whatsAppMessage) {
            setDefaultMessage(announcements.whatsAppMessage);
          }
        }
        
        // Resolve and sanitize WhatsApp number using shared helper
        const num = await getWhatsAppNumber();
        setWhatsAppNumber(num);
      } catch (err) {
        console.error("Failed to load WhatsApp settings:", err);
      }
    }
    loadSettings();
  }, []);

  // Hydration protection: Do not render anything server-side
  if (!mounted) {
    return null;
  }

  // Whitelist of allowed public pages
  const allowedPrefixes = ["/product/", "/shop"];
  const allowedExact = [
    "/",
    "/shop",
    "/cart",
    "/wishlist",
    "/checkout",
    "/track-order",
    "/contact",
    "/faq",
    "/privacy-policy",
    "/return-policy",
    "/about",
    "/sale",
    "/order-success"
  ];

  const isPolicyPage = pathname.endsWith("-policy") || pathname === "/terms" || pathname.startsWith("/terms-");
  const isAllowed = allowedExact.includes(pathname) || 
                    allowedPrefixes.some(pref => pathname.startsWith(pref)) || 
                    isPolicyPage;

  // Hide button on admin routes, disallowed pages, disabled setting, or if no number configured
  if (!isAllowed || pathname.startsWith("/admin") || !showButton || !whatsAppNumber) {
    return null;
  }

  // Position logic
  const isProductPage = pathname.startsWith("/product/");
  const isCartOrCheckout = pathname === "/cart" || pathname === "/checkout";
  const positionClasses = isProductPage || isCartOrCheckout
    ? "bottom-[100px] right-4 md:bottom-6 md:right-6"
    : "bottom-[80px] right-4 md:bottom-6 md:right-6";

  // Dynamic message handler resolved on interaction
  const handleInteract = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsAppNumber) {
      e.preventDefault();
      return;
    }

    let message = defaultMessage || "Hi Anti Tarnish Jewels, I need help.";

    if (pathname.startsWith("/product/")) {
      const contextEl = document.getElementById("whatsapp-product-context");
      const productName = contextEl?.getAttribute("data-product-name") || document.querySelector("h1")?.textContent?.trim() || "";
      if (productName) {
        message = `Hi Anti Tarnish Jewels, I am interested in ${productName}.`;
      } else {
        message = "Hi Anti Tarnish Jewels, I need help.";
      }
    } else if (pathname === "/track-order") {
      const orderInput = document.querySelector('input[placeholder*="Example: ATJ-"]') as HTMLInputElement;
      const orderValue = orderInput?.value?.trim() || "";
      if (orderValue) {
        message = `Hi Anti Tarnish Jewels, I need help tracking my order. My order/tracking number is: ${orderValue}.`;
      } else {
        message = "Hi Anti Tarnish Jewels, I need help tracking my order.";
      }
    } else if (pathname === "/order-success") {
      const searchParams = new URLSearchParams(window.location.search);
      const orderNumber = searchParams.get("order") || "";
      if (orderNumber) {
        message = `Hi Anti Tarnish Jewels, I want to confirm my COD order ${orderNumber}.`;
      } else {
        message = "Hi Anti Tarnish Jewels, I need help.";
      }
    } else if (pathname === "/cart" || pathname === "/checkout") {
      message = "Hi Anti Tarnish Jewels, I need help with my jewellery order.";
    }

    e.currentTarget.href = createWhatsAppUrl(whatsAppNumber, message);
  };

  const initialUrl = createWhatsAppUrl(whatsAppNumber, defaultMessage);

  return (
    <a
      href={initialUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseDown={handleInteract}
      onClick={handleInteract}
      className={`fixed ${positionClasses} z-[9999] flex items-center gap-2 rounded-full bg-[#25D366] text-white p-3.5 md:px-5 md:py-3 shadow-lg hover:bg-[#20ba56] hover:scale-105 hover:shadow-xl transition-all duration-300 select-none cursor-pointer`}
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 fill-current text-white shrink-0" width="22" height="22">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.13-1.348a9.96 9.96 0 0 0 4.88 1.272h.004c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.178-2.924-7.067C17.197 3.007 14.689 2 12.012 2zm5.727 14.15c-.25.704-1.25 1.285-1.722 1.375-.473.089-1.07.134-3.155-.722-2.667-1.096-4.385-3.806-4.517-3.982-.135-.176-.986-1.313-.986-2.505 0-1.192.622-1.78.844-2.02.223-.242.486-.303.648-.303.163 0 .325.002.467.008.148.006.347-.056.544.417.202.49.69 1.684.75 1.805.06.12.1.262.02.423-.08.162-.12.262-.24.403-.12.14-.253.313-.36.42-.12.12-.247.252-.106.493.14.242.624 1.025 1.336 1.657.918.816 1.69 1.07 1.933 1.19.243.12.385.1.528-.064.142-.164.607-.706.77-.946.162-.24.324-.2.547-.118.223.082 1.417.67 1.66.79.243.12.405.18.466.284.06.104.06.604-.19 1.307z"/>
      </svg>
      <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">Chat with us</span>
    </a>
  );
}
