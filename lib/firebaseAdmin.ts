import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    // Handle newline characters safely if they come in escaped
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    console.warn("Firebase Admin environment variables missing. Admin SDK not initialized.");
  }
}

export const adminAuth = getApps().length ? getAuth() : null;
export const adminDb = getApps().length ? getFirestore() : null;
