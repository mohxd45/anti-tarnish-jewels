import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initializeFromIndividualVars(): boolean {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    // Handle newline characters safely if they come in escaped and strip surrounding quotes if present
    privateKey = privateKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
  }

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully via individual vars.");
    return true;
  }
  
  return false;
}

if (!getApps().length) {
  try {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "demo-noore-jewels" });
      console.log("Firebase Admin SDK initialized successfully for emulators.");
    } else {
      let jsonInitialized = false;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          initializeApp({
            credential: cert(serviceAccount),
          });
          console.log("Firebase Admin SDK initialized successfully via JSON.");
          jsonInitialized = true;
        } catch (err) {
          console.warn("FIREBASE_SERVICE_ACCOUNT_JSON is invalid; trying individual Firebase Admin variables.");
        }
      }

      if (!jsonInitialized) {
        const individualInitialized = initializeFromIndividualVars();
        if (!individualInitialized) {
          console.warn("Firebase Admin environment variables missing or invalid. Admin SDK not initialized.");
        }
      }
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminAuth = getApps().length ? getAuth() : null;
export const adminDb = getApps().length ? getFirestore() : null;
