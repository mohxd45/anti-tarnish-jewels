"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, hasFirebaseConfig } from "@/lib/firebase";

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
      
      if (role === "admin" || isAdminEmail) {
        router.push("/admin");
      } else {
        await signOut(auth);
        throw new Error("Access denied. Admin privileges required.");
      }
    } catch (err: any) {
      setMessage(err.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16 w-full">
      <div className="rounded-[2rem] border border-goldBeige bg-warmwhite p-5 sm:p-8 shadow-jewel flex flex-col items-stretch text-center">
        <BrandLogo size={64} className="mb-4 mx-auto" />
        <h1 className="text-3xl font-serif font-semibold text-champagne tracking-wide">Admin Portal</h1>
        <form onSubmit={submit} className="mt-6 grid gap-4 text-left">
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Admin Email *</label>
            <input 
              disabled={loading} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="text" 
              required 
              placeholder="Admin Email" 
              className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 outline-none text-charcoalBrown focus:border-champagne transition-all disabled:opacity-55 text-sm" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Password *</label>
            <input 
              disabled={loading} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              required 
              placeholder="Password" 
              className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 outline-none text-charcoalBrown focus:border-champagne transition-all disabled:opacity-55 text-sm" 
            />
          </div>
          <button 
            disabled={loading} 
            className="w-full rounded-full bg-champagne px-5 py-3.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all disabled:opacity-55 flex items-center justify-center gap-2 text-sm shadow-jewel"
          >
            {loading && <Loader className="animate-spin h-4 w-4" />}
            {loading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
        
        {message && <p className="mt-6 text-sm text-dustyRose font-medium bg-dustyRose/5 border border-dustyRose/20 p-2.5 rounded-2xl">{message}</p>}
      </div>
    </section>
  );
}
