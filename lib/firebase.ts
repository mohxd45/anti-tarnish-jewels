import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Only initialize Firebase if real API key is provided
const REAL_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
export const hasRealFirebase = !!(
  REAL_API_KEY &&
  REAL_API_KEY !== "AIzaSyDummyKeyForLocalBuild12345678" &&
  REAL_API_KEY.startsWith("AIza")
);

const firebaseConfig = hasRealFirebase
  ? {
      apiKey: REAL_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    }
  : {
      // Safe dummy config — we gate ALL Firebase calls behind hasRealFirebase
      apiKey: "mock-api-key-12345678901234567890",
      authDomain: "mock-project.firebaseapp.com",
      projectId: "mock-project",
      storageBucket: "mock-project.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:0000000000000000",
    };

// Initialize the app safely (idempotent — will not re-initialize if already done)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
