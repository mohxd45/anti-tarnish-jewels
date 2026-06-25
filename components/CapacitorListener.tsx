"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function CapacitorListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let appListener: any;

    async function initCapacitor() {
      try {
        const isNative = (window as any).Capacitor?.isNativePlatform();
        if (isNative) {
          const { App } = await import("@capacitor/app");
          appListener = await App.addListener("backButton", (event) => {
            if (event.canGoBack) {
              window.history.back();
            } else {
              // If we are at the root homepage, we can exit
              if (pathname === "/" || pathname === "/shop") {
                App.exitApp();
              } else {
                router.back();
              }
            }
          });
        }
      } catch (err) {
        console.warn("Capacitor failed to load", err);
      }
    }

    initCapacitor();

    return () => {
      if (appListener && typeof appListener.remove === 'function') {
        appListener.remove();
      }
    };
  }, [pathname, router]);

  return null;
}
