"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
        router.push("/account");
      } else {
        await signup(email, password, name, phoneCode, phone);
        toast.success("Account created successfully!");
        router.push("/account");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Signed in with Google!");
      router.push("/account");
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === "auth/unauthorized-domain") {
        toast.error("Firebase Error: This domain is not authorized in Firebase Console.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        toast.error("An account already exists with the same email address but different sign-in credentials. Please sign in using a password instead.");
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled. Please try again.");
      } else {
        toast.error(err.message || "Google sign-in failed. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-16 pb-32">
      <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
        <h1 className="mb-2 text-center font-serif text-3xl text-charcoalBrown">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mb-6 text-center text-sm text-stoneGray">
          {mode === "login" ? "Log in to continue" : "Join Anti Tarnish Jewels"}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              <input 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="neo-input w-full px-4 py-3 text-sm" 
                placeholder="Full name" 
              />
              <div className="flex gap-2">
                <select 
                  value={phoneCode}
                  onChange={e => setPhoneCode(e.target.value)}
                  className="neo-input w-24 px-2 py-3 text-sm text-center"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+971">+971</option>
                </select>
                <input 
                  required
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="neo-input flex-1 px-4 py-3 text-sm" 
                  placeholder="Phone number" 
                />
              </div>
            </>
          )}
          <input 
            required
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="neo-input w-full px-4 py-3 text-sm" 
            placeholder="Email" 
          />
          <input 
            required
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="neo-input w-full px-4 py-3 text-sm" 
            placeholder="Password" 
          />
          
          <button type="submit" disabled={loading} className="btn-primary-gold w-full py-3">
            {loading ? "Processing..." : (mode === "login" ? "Login" : "Create account")}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-stoneGray">Or</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-xl bg-white border border-stone-200 text-charcoalBrown font-semibold hover:bg-stone-50/50 transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div className="mt-6 text-center text-sm text-stoneGray">
          {mode === "login" ? (
            <>New here?{" "}
              <button onClick={() => setMode("signup")} className="font-semibold text-champagne hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="font-semibold text-champagne hover:underline">
                Log in
              </button>
            </>
          )}
        </div>
        
        {mode === "login" && (
          <div className="mt-2 text-center text-sm">
            <Link href="/reset-password" className="text-stoneGray hover:text-champagne transition-colors">
              Forgot Password?
            </Link>
          </div>
        )}
        
        <p className="mt-4 text-center text-xs text-stoneGray/80">
          By continuing you agree to our <Link href="/privacy-policy" className="underline hover:text-champagne transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
