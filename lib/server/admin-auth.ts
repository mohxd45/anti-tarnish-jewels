import "server-only";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export class AdminAuthorizationError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

// TODO: In the future, we may want capability-based access (e.g. sales-report viewing vs bundle editing),
// so `staff` does not automatically need every sensitive admin capability forever.
// For now, restoring parity with AuthContext.tsx.
const ADMIN_ROLES = [
  "admin",
  "owner",
  "owner_admin",
  "partner_admin",
  "developer_admin",
  "staff",
] as const;

export async function verifyAdminAccess(idToken?: string) {
  if (!idToken) {
    console.error("[AdminAuth] Missing ID token");
    throw new AdminAuthorizationError();
  }

  if (!adminAuth || !adminDb) {
    console.error("[AdminAuth] Admin SDK not initialized");
    throw new AdminAuthorizationError();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    const callerDoc = await adminDb.collection("users").doc(decodedToken.uid).get();

    if (!callerDoc.exists) {
      console.error(`[AdminAuth] Caller document does not exist for uid: ${decodedToken.uid}`);
      throw new AdminAuthorizationError();
    }

    const userData = callerDoc.data();
    const role = userData?.role;

    if (!role || !ADMIN_ROLES.includes(role)) {
      console.error(`[AdminAuth] Caller ${decodedToken.uid} has invalid role: ${role}`);
      throw new AdminAuthorizationError();
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role
    };
  } catch (error: any) {
    if (error instanceof AdminAuthorizationError) {
      throw error;
    }
    console.error("[AdminAuth] Token verification or DB fetch failed:", error);
    throw new AdminAuthorizationError();
  }
}
