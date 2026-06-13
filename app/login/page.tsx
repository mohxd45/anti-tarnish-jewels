"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const { login, loginWithGoogle, forgotPassword } = useAuth();
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
      await login(email, password);
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTarget = searchParams.get("redirect") || "/account";
      router.push(redirectTarget);
    } catch (err: any) {
      setMessage(err.message || "Login failed");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage("");
    try {
      await loginWithGoogle();
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTarget = searchParams.get("redirect") || "/account";
      router.push(redirectTarget);
    } catch (err: any) {
      setMessage(err.message || "Google sign-in failed");
      setLoading(false);
    }
  }

  async function reset() {
    if (!email) return setMessage("Enter your email first.");
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage("Password reset email sent.");
    } catch (err: any) {
      setMessage(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-goldBeige bg-warmwhite p-5 sm:p-8 shadow-jewel flex flex-col items-stretch text-center">
        <BrandLogo size={64} className="mb-4 mx-auto" />
        <h1 className="text-3xl font-serif font-semibold text-champagne tracking-wide">Login</h1>
        <form onSubmit={submit} className="mt-6 grid gap-4 text-left">
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Email or Username *</label>
            <input 
              disabled={loading} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="text" 
              required 
              placeholder="Email or Username" 
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 border-t border-goldBeige/30" />
          <span className="relative bg-warmwhite px-4 text-xs text-stoneGray uppercase tracking-wider">Or</span>
        </div>

        <button 
          disabled={loading} 
          onClick={handleGoogleLogin} 
          className="w-full rounded-full border border-goldBeige px-5 py-3 font-semibold text-champagne hover:bg-champagne/5 transition-all disabled:opacity-55 flex items-center justify-center gap-2 text-sm"
        >
          {loading && <Loader className="animate-spin h-4 w-4" />}
          Continue with Google
        </button>
        
        <button 
          disabled={loading} 
          onClick={reset} 
          className="mt-4 text-sm text-dustyRose hover:underline transition-all disabled:opacity-55"
        >
          Forgot password?
        </button>
        
        {message && <p className="mt-4 text-sm text-dustyRose font-medium bg-dustyRose/5 border border-dustyRose/20 p-2.5 rounded-2xl">{message}</p>}
        <p className="mt-6 text-sm text-stoneGray">No account? <Link href={`/signup${typeof window !== "undefined" && window.location.search ? window.location.search : ""}`} className="text-champagne hover:underline font-semibold">Create one</Link></p>
      </div>
    </section>
  );
}
