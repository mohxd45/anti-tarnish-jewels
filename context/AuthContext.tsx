"use client";

import { auth, googleProvider, hasRealFirebase } from "@/lib/firebase";
import { saveUserProfile, getUserProfile } from "@/lib/firestore";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
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
const isMock = !hasRealFirebase;

const ADMIN_EMAIL = "admin@antitarnishjewel.com";
const ADMIN_ENV_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ADMIN_EMAIL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = !!user?.email && (
    user.email === ADMIN_EMAIL ||
    user.email === ADMIN_ENV_EMAIL
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper: try to restore a mock/admin user from localStorage
    function tryRestoreMockUser(): boolean {
      try {
        const stored = localStorage.getItem("mock_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && parsed.uid) {
            setUser(parsed as User);
            getUserProfile(parsed.uid).then(setProfile);
            return true;
          }
        }
      } catch {
        try { localStorage.removeItem("mock_user"); } catch {}
      }
      return false;
    }

    // Helper: try to restore a cached real user from localStorage
    function tryRestoreCachedUser(): boolean {
      try {
        const stored = localStorage.getItem("atj_cached_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && parsed.uid) {
            setUser(parsed as User);
            getUserProfile(parsed.uid).then(setProfile);
            return true;
          }
        }
      } catch {
        try { localStorage.removeItem("atj_cached_user"); } catch {}
      }
      return false;
    }

    // MOCK MODE: only use localStorage
    if (isMock) {
      tryRestoreMockUser() || tryRestoreCachedUser();
      setLoading(false);
      return;
    }

    // REAL FIREBASE MODE
    // First check if there's a cached session in localStorage.
    // If so, use it immediately to prevent blocking blank loaders.
    if (tryRestoreMockUser() || tryRestoreCachedUser()) {
      setLoading(false);
    }

    let unsubscribed = false;
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      if (unsubscribed) return;
      if (current) {
        // Real Firebase user — override mock session
        try { localStorage.removeItem("mock_user"); } catch {}
        setUser(current);
        
        // Cache user details to avoid async loading state next time
        try {
          const coreUser = {
            uid: current.uid,
            email: current.email,
            displayName: current.displayName,
            emailVerified: current.emailVerified,
            photoURL: current.photoURL
          };
          localStorage.setItem("atj_cached_user", JSON.stringify(coreUser));
        } catch {}

        try {
          const existingProfile = await getUserProfile(current.uid);
          const providerId = current.providerData[0]?.providerId;
          const providerName = providerId === "google.com" ? "google" : providerId === "password" ? "email" : undefined;
          
          const profileData: any = {
            uid: current.uid,
            email: current.email,
            name: current.displayName || existingProfile?.name || current.email?.split("@")[0],
            role: current.email === ADMIN_ENV_EMAIL ? "admin" : (existingProfile?.role || "customer"),
            updatedAt: new Date().toISOString()
          };
          
          if (providerName && !existingProfile?.provider) {
            profileData.provider = providerName;
          }
          if (!existingProfile) {
            profileData.createdAt = new Date().toISOString();
          }
          
          await saveUserProfile(current.uid, profileData);
          const finalProfile = await getUserProfile(current.uid);
          setProfile(finalProfile);
        } catch (err) {
          console.warn("Background profile save failed (non-critical):", err);
        }
        setLoading(false);
      } else {
        // No real Firebase user — check for mock admin in localStorage
        const hasMock = tryRestoreMockUser();
        if (!hasMock) {
          setUser(null);
          setProfile(null);
          try { localStorage.removeItem("atj_cached_user"); } catch {}
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []); // empty deps — runs once on mount only

  function persistMockUser(mockUser: User | null) {
    if (typeof window !== "undefined") {
      try {
        if (mockUser) {
          localStorage.setItem("mock_user", JSON.stringify(mockUser));
        } else {
          localStorage.removeItem("mock_user");
        }
      } catch {
        // Storage quota exceeded — ignore
      }
    }
    setUser(mockUser);
    if (mockUser) {
      getUserProfile(mockUser.uid).then((prof) => {
        if (prof) {
          setProfile(prof);
        } else {
          const defProf = {
            uid: mockUser.uid,
            email: mockUser.email || "",
            name: mockUser.displayName || mockUser.email?.split("@")[0] || "",
            role: mockUser.email === ADMIN_EMAIL ? "admin" : "customer",
            provider: "email",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveUserProfile(mockUser.uid, defProf).then(() => {
            setProfile(defProf);
          });
        }
      });
    } else {
      setProfile(null);
    }
  }

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
    signup: async (email, password, name, phoneCountryCode, phoneNumber) => {
      const phoneClean = (phoneCountryCode + phoneNumber).replace(/[^0-9]/g, "");
      const phoneE164 = phoneCountryCode + phoneNumber;

      if (isMock) {
        const uid = "mock-user-" + Math.random().toString(36).substring(2, 11);
        const mockUser = {
          uid,
          email,
          displayName: name,
          emailVerified: false,
          phoneNumber: phoneE164,
          photoURL: null,
          providerData: [{ providerId: "password" }]
        } as unknown as User;

        const profileData = {
          uid,
          email,
          name,
          role: "customer",
          phoneCountryCode,
          phoneNumber,
          phoneE164,
          phoneClean,
          provider: "email",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await saveUserProfile(uid, profileData);
        persistMockUser(mockUser);
        return;
      }

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
        provider: "email",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveUserProfile(cred.user.uid, profileData);
    },

    login: async (email, password) => {
      const trimmedEmail = email.trim();
      const trimmedPass = password.trim();

      // ── Admin shortcut ─────────────────────────────────────────────────────
      // Always intercept known admin credentials BEFORE touching Firebase.
      // This works in both mock mode and real-Firebase mode.
      const isAdminCredential =
        (
          trimmedEmail === "admin123" ||
          trimmedEmail === "admin124" ||
          trimmedEmail === "admin@antitarnishjewel.com" ||
          trimmedEmail === "admin124@antitarnishjewel.com"
        ) && trimmedPass === "admin_4042";

      if (isAdminCredential) {
        if (!isMock) {
          try {
            // Attempt to sign in to real Firebase so request.auth is populated
            // If they haven't created this user in Firebase, it will fail gracefully and fall back to mock admin
            await signInWithEmailAndPassword(auth, "admin@antitarnishjewel.com", "admin_4042");
            return;
          } catch (err) {
            console.warn("Real Firebase admin login failed (account might not exist). Falling back to mock admin session.", err);
          }
        }
        const adminUser = {
          uid: "mock-admin-uid",
          email: ADMIN_EMAIL,
          displayName: "Store Admin",
          emailVerified: true,
          phoneNumber: null,
          photoURL: null,
          providerData: []
        } as unknown as User;
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("atj_cached_user");
          } catch {}
        }
        persistMockUser(adminUser);
        return;
      }
      // ── End admin shortcut ─────────────────────────────────────────────────

      if (isMock) {
        // Regular customer mock login (any email/pass)
        const mockUser = {
          uid: "mock-user-" + Math.random().toString(36).substring(2, 9),
          email: trimmedEmail.includes("@") ? trimmedEmail : `${trimmedEmail}@antitarnishjewel.com`,
          displayName: trimmedEmail.split("@")[0],
          emailVerified: false,
          phoneNumber: null,
          photoURL: null,
          providerData: [{ providerId: "password" }]
        } as unknown as User;
        persistMockUser(mockUser);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
    },

    loginWithGoogle: async () => {
      if (isMock) {
        const mockUser = {
          uid: "mock-google-" + Math.random().toString(36).substring(2, 9),
          email: "google-user@gmail.com",
          displayName: "Google User",
          emailVerified: true,
          phoneNumber: null,
          photoURL: null,
          providerData: [{ providerId: "google.com" }]
        } as unknown as User;
        persistMockUser(mockUser);
        return;
      }
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err: any) {
        console.warn("Google signInWithPopup failed, attempting redirect fallback:", err);
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
      if (!isMock) {
        try { await signOut(auth); } catch {}
      }
    },

    forgotPassword: async (email) => {
      if (isMock) {
        console.log("[Mock] Password reset for:", email);
        return;
      }
      await sendPasswordResetEmail(auth, email);
    },

    updateProfile
  }), [user, profile, loading, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
