import "server-only";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // EASIEST METHOD: Parse the entire JSON string if provided
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully via JSON.");
    } else {
      // FALLBACK METHOD: Use individual variables
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

      if (privateKey) {
        // Handle newline characters safely if they come in escaped and strip surrounding quotes if present
        privateKey = privateKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
      }

      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        console.log("Firebase Admin SDK initialized successfully via individual vars.");
      } else {
        console.warn("Firebase Admin environment variables missing. Admin SDK not initialized.");
      }
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
