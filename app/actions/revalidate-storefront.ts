"use server";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { invalidateStorefrontCache } from "@/lib/server/storefront-cache";

export async function revalidateStorefrontAction(idToken: string) {
  if (!adminAuth || !adminDb) {
    console.error("[Revalidate] Admin SDK not initialized");
    return { success: false, error: "Unauthorized" };
  }
  
  if (!idToken) {
    console.error("[Revalidate] Missing ID token");
    return { success: false, error: "Unauthorized" };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    if (!decodedToken) {
      console.error("[Revalidate] verifyIdToken returned null/undefined");
      return { success: false, error: "Unauthorized" };
    }

    const callerDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
      console.error("[Revalidate] Caller is not an admin or document does not exist");
      return { success: false, error: "Unauthorized" };
    }

    // Call private helper
    invalidateStorefrontCache();
    
    return { success: true };
  } catch (error: any) {
    console.error("[Revalidate] Token verification or cache error:", error.message);
    return { success: false, error: "Unauthorized" };
  }
}
