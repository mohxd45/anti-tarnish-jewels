"use client";

import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/firestore";
import { SiteSettings } from "@/types";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme is now hardcoded. No more admin overrides.
  return <>{children}</>;
}
