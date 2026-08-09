"use server";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyAdminAccess, AdminAuthorizationError } from "@/lib/server/admin-auth";
import { invalidateStorefrontCache } from "@/lib/server/storefront-cache";

export async function revalidateStorefrontAction(idToken: string) {
  try {
    await verifyAdminAccess(idToken);
    
    // Call private helper
    invalidateStorefrontCache();
    
    return { success: true };
  } catch (error: any) {
    if (error instanceof AdminAuthorizationError) {
      return { success: false, error: "Unauthorized" };
    }
    console.error("[Revalidate] Unknown cache error:", error.message);
    return { success: false, error: "Unauthorized" };
  }
}
