const fs = require('fs');

const loginContent = `"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Welcome back!");
        router.push("/account");
      } else {
        await signup(email, password, name);
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
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--noir)] pt-32 pb-16 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="glass-dark p-8 md:p-10 rounded-3xl border border-[var(--glass-border)] shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--charcoal)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--pink-200)] shadow-sm">
              <UserIcon className="w-8 h-8 text-[var(--gold-dark)]" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-[var(--ink)] mb-2 font-medium">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-[var(--stoneGray)]">
              {isLogin ? "Sign in to access your orders and wishlist." : "Join our radiant community today."}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-[var(--stoneGray)]" />
                </div>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="neo-input pl-12 pr-4 py-3.5 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                />
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[var(--stoneGray)]" />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="neo-input pl-12 pr-4 py-3.5 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[var(--stoneGray)]" />
              </div>
              <input 
                type="password" 
                placeholder="Password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="neo-input pl-12 pr-4 py-3.5 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <Link href="/reset-password" className="text-xs text-[var(--stoneGray)] hover:text-[var(--rose)] font-medium">
                  Forgot Password?
                </Link>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl shadow-glow mt-2 text-lg flex justify-center items-center"
            >
              {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLogin ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--pink-200)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--charcoal)] text-[var(--stoneGray)]">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 w-full py-3.5 rounded-xl bg-white border border-[var(--pink-200)] text-[var(--ink)] font-semibold hover:bg-[var(--pink-50)] transition-colors flex items-center justify-center gap-3 shadow-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-[var(--stoneGray)] text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-[var(--ink)] font-semibold hover:text-[var(--rose)] transition-colors underline decoration-[var(--pink-300)] decoration-2 underline-offset-4">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/login/page.tsx', loginContent);
