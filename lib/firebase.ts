import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

const firebaseApiKey = useEmulator ? "AIzaSyDummyKeyForEmulator0000000000000" : (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "");

export const hasFirebaseConfig = useEmulator || Boolean(
  firebaseApiKey &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

const firebaseConfig = useEmulator ? {
  apiKey: firebaseApiKey,
  authDomain: "demo-noore-jewels.firebaseapp.com",
  projectId: "demo-noore-jewels",
  storageBucket: "demo-noore-jewels.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
} : {
  apiKey: firebaseApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const app = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

export const auth = (app ? getAuth(app) : null) as Auth;
export const db = (app ? initializeFirestore(app, { experimentalForceLongPolling: true }) : null) as Firestore;
export const storage = (app ? getStorage(app) : null) as FirebaseStorage;

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  if (auth) connectAuthEmulator(auth, "http://127.0.0.1:9099");
  if (db) connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export const googleProvider = new GoogleAuthProvider();
