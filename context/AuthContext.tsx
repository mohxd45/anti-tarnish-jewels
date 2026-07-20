"use client";

import { auth, db, googleProvider, hasFirebaseConfig } from "@/lib/firebase";
import { saveUserProfile, getUserProfile } from "@/lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: string | null;
  userStatus: string | null;
  signup: (
    email: string,
    password: string,
    name: string,
    phoneCountryCode: string,
    phoneNumber: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (data: Record<string, any>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Use the reliable hasRealFirebase flag from firebase.ts
// isMock = true means: use localStorage mock fallback, never call Firebase
const ADMIN_EMAIL = "admin@antitarnishjewel.com";
const ADMIN_ENV_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ADMIN_EMAIL;
const ADDITIONAL_ADMIN = "anti.tarnish.jewel@gmail.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  let userRole = profile?.role || null;

  const userStatus = profile?.status || "active";
  const isAdmin = !!(userRole && ["admin", "owner", "owner_admin", "partner_admin", "developer_admin", "staff"].includes(userRole));

  useEffect(() => {
    if (typeof window === "undefined") return;

    // LOCALHOST PREVIEW OVERRIDE
    if (process.env.NODE_ENV !== "production") {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isLocalhost && localStorage.getItem("admin_preview") === "true") {
        setUser({ uid: "preview-admin", email: "admin@preview.local" } as any);
        setProfile({ role: "admin", name: "Local Admin Preview" });
        setLoading(false);
        return;
      }
    }

    if (!hasFirebaseConfig || !auth) {
      setLoading(false);
      return;
    }

    // REAL FIREBASE MODE
    // Capture redirect result to ensure OAuth flow completes and errors are caught
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        setUser(result.user);
        // Profile saving will be handled by onAuthStateChanged
      }
    }).catch((err) => {
      console.error("Firebase getRedirectResult error:", err);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("google_auth_error", err.message || err.code);
      }
    });

    let unsubscribed = false;
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      if (unsubscribed) return;
      if (current) {
        setUser(current);
        
        // Removed local caching

        try {
          let existingProfile = null;
          try {
            existingProfile = await getUserProfile(current.uid);
          } catch (err) {
            console.error("Failed to fetch existing profile during auth state change:", err);
            // If fetch fails (network, permission, etc), do NOT proceed to overwrite.
            setLoading(false);
            return;
          }

          const providerId = current.providerData[0]?.providerId;
          const providerName = providerId === "google.com" ? "google" : providerId === "password" ? "email" : undefined;
          
          const profileData: any = {
            uid: current.uid,
            email: current.email,
            name: current.displayName || existingProfile?.name || current.email?.split("@")[0],
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          
          if (!existingProfile) {
            profileData.role = "customer";
            profileData.status = "active";
            profileData.createdAt = new Date().toISOString();
          } else {
            // Only set safe defaults if explicitly missing. Do NOT overwrite existing fields!
            if (!existingProfile.status) profileData.status = "active";
            if (!existingProfile.createdAt) profileData.createdAt = new Date().toISOString();
            
            // CRITICAL: Guarantee we never accidentally overwrite an existing user's role
            // by explicitly removing the role key from profileData if they already exist.
            delete profileData.role;
          }
          
          // Check for staff invite ONLY if creating a new user or missing a role completely
          if ((!existingProfile || !existingProfile.role) && current.email) {
            try {
              const inviteRef = doc(db, "staffInvites", current.email.toLowerCase());
              const inviteSnap = await getDoc(inviteRef);
              if (inviteSnap.exists()) {
                profileData.role = inviteSnap.data().role || "staff";
                profileData.status = inviteSnap.data().status || "active";
              }
            } catch (err) {
              console.warn("Could not check staff invites:", err);
            }
          }
          
          if (providerName && !existingProfile?.provider) {
            profileData.provider = providerName;
          }
          if (providerName && !existingProfile?.loginMethod) {
            profileData.loginMethod = providerName === "google" ? "Google" : "Email";
          }
          
          // Carry over existing phone if present
          if (existingProfile?.phone) profileData.phone = existingProfile.phone;
          if (existingProfile?.phoneE164) profileData.phoneE164 = existingProfile.phoneE164;
          
          if (process.env.NODE_ENV === "development" || typeof window !== "undefined") {
            console.log("[Auth Debug] UID:", current.uid);
            console.log("[Auth Debug] Email:", current.email);
            console.log("[Auth Debug] Existing Role Before Save:", existingProfile?.role || "none");
            console.log("[Auth Debug] Role to Save:", profileData.role || existingProfile?.role || "none");
          }
          
          await saveUserProfile(current.uid, profileData);
          const finalProfile = await getUserProfile(current.uid);
          setProfile(finalProfile);
        } catch (err) {
          console.warn("Background profile save failed (non-critical):", err);
        }
        setLoading(false);
      } else {
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem("atj_cached_user");
          localStorage.removeItem("mock_user");
        } catch {}
        setLoading(false);
      }
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []); // empty deps — runs once on mount only



  const updateProfile = async (data: Record<string, any>) => {
    if (!user) return;
    await saveUserProfile(user.uid, data);
    const finalProfile = await getUserProfile(user.uid);
    setProfile(finalProfile);
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    profile,
    loading,
    isAdmin,
    userRole,
    userStatus,
    signup: async (email, password, name, phoneCountryCode, phoneNumber) => {
      const phoneClean = (phoneCountryCode + phoneNumber).replace(/[^0-9]/g, "");
      const phoneE164 = phoneCountryCode + phoneNumber;

      

      if (!auth) throw new Error("Firebase is not configured.");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const profileData = {
        uid: cred.user.uid,
        email,
        name,
        role: "customer",
        phoneCountryCode,
        phoneNumber,
        phoneE164,
        phoneClean,
        phone: phoneE164, // explicitly save for admin users table
        provider: "email",
        loginMethod: "Email",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      await saveUserProfile(cred.user.uid, profileData);
    },

    login: async (email, password) => {
      if (!auth) throw new Error("Firebase is not configured.");
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    },

    loginWithGoogle: async () => {
      if (!auth) throw new Error("Firebase is not configured.");
      
      const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
      
      try {
        if (isNative) {
          await signInWithRedirect(auth, googleProvider);
        } else {
          await signInWithPopup(auth, googleProvider);
        }
      } catch (err: any) {
        if (err.code === "auth/popup-closed-by-user") {
          throw err;
        }
        console.warn("Google signInWithPopup failed, attempting redirect fallback:", err);
        // Before redirecting, save a flag so we know we attempted it
        if (typeof window !== "undefined") {
          sessionStorage.setItem("google_redirect_started", "true");
        }
        await signInWithRedirect(auth, googleProvider);
      }
    },

    logout: async () => {
      // Always clear mock/admin session from localStorage
      if (typeof window !== "undefined") {
        try { 
          localStorage.removeItem("mock_user"); 
          localStorage.removeItem("atj_cached_user");
        } catch {}
      }
      setUser(null);
      setProfile(null);
      // Also sign out of real Firebase if applicable
      if (auth) {
        try { await signOut(auth); } catch {}
      }
    },

    forgotPassword: async (email) => {
      if (!auth) throw new Error("Firebase is not configured.");
      
      await sendPasswordResetEmail(auth, email);
    },

    updateProfile
  }), [user, profile, loading, isAdmin, userRole, userStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
