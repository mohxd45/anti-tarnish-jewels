"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gem, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { BrandLogo } from "@/components/BrandLogo";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, hasFirebaseConfig } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (!hasFirebaseConfig || !auth || !db) {
        throw new Error("Firebase is not configured for local admin login.");
      }

      // Direct Firebase Auth call, bypassing AuthContext
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Immediately fetch user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        await signOut(auth);
        throw new Error("User record not found. Access denied.");
      }

      const role = userDocSnap.exists() ? userDocSnap.data().role : "customer";
      const isAdminEmail = 
        user.email === "admin@antitarnishjewel.com" || 
        user.email === "anti.tarnish.jewel@gmail.com";
      
      const allowedRoles = ["admin", "owner_admin", "partner_admin", "developer_admin", "staff"];
      
      if (allowedRoles.includes(role) || isAdminEmail) {
        router.push("/admin");
      } else {
        await signOut(auth);
        throw new Error(`Access denied. Admin privileges required. (Current role: ${role})`);
      }
    } catch (err: any) {
      setMessage(err.message || "Login failed");
      setLoading(false);
    }
  }

  const isDevLocal = typeof window !== "undefined" && 
    process.env.NODE_ENV === "development" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  function handlePreviewMode() {
    localStorage.setItem("admin_preview", "true");
    window.location.href = "/admin"; // force reload to trigger auth context
  }

  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-10 bg-background/50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="glass-card p-8 sm:p-10 rounded-[2rem] border border-border/60 bg-card/60 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl grid place-items-center text-white shadow-lg mb-6" style={{ background: "var(--gradient-rose)" }}>
              <Gem className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">LONA JEWELS</h1>
            <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground mt-2">Admin Console</p>
          </div>

          {(!hasFirebaseConfig && isDevLocal) ? (
            <div className="mt-8 space-y-5 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium leading-snug">
                  Firebase is not configured. Since you are running locally, you can enter preview mode.
                </p>
              </div>
              <button
                onClick={handlePreviewMode}
                className="w-full h-12 rounded-xl text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-rose)" }}
              >
                Preview Admin Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Admin Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    required
                    disabled={loading}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="admin@antitarnishjewels.com"
                    className="pl-10 bg-background/50 h-12 rounded-xl border-border/60" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pwd" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="pwd" 
                    type="password" 
                    required
                    disabled={loading}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="pl-10 bg-background/50 h-12 rounded-xl border-border/60" 
                  />
                </div>
              </div>

              {message && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 font-medium animate-in slide-in-from-top-2">
                  {message}
                </div>
              )}

              <LoadingButton 
                loading={loading}
                loadingText="Authenticating..."
                className="w-full h-12 rounded-xl text-white font-medium hover:opacity-90 transition-all mt-6 shadow-md"
                style={{ background: "var(--gradient-rose)" }}
              >
                <span className="flex items-center">Sign in to admin <ArrowRight className="ml-2 h-4 w-4" /></span>
              </LoadingButton>
            </form>
          )}

          <p className="text-center text-[11px] font-medium text-muted-foreground/70 mt-8 uppercase tracking-widest">
            Secured access · Authorized staff only
          </p>
        </div>
      </div>
    </div>
  );
}
