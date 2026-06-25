"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const countries = [
  { code: "+91", name: "India (+91)" },
  { code: "+971", name: "UAE (+971)" },
  { code: "+966", name: "Saudi Arabia (+966)" },
  { code: "+974", name: "Qatar (+974)" },
  { code: "+965", name: "Kuwait (+965)" },
  { code: "+968", name: "Oman (+968)" },
  { code: "+973", name: "Bahrain (+973)" },
  { code: "+1", name: "United States (+1)" },
  { code: "+44", name: "United Kingdom (+44)" }
];

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    // Validate name
    if (!form.name.trim()) {
      return setMessage("Please enter your full name.");
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setMessage("Please enter a valid email address.");
    }

    // Validate phone number
    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (phoneCountryCode === "+91") {
      if (cleanDigits.length !== 10) {
        return setMessage("For India, the phone number must be exactly 10 digits.");
      }
    } else {
      if (cleanDigits.length < 7 || cleanDigits.length > 15) {
        return setMessage("Please enter a valid phone number (7 to 15 digits).");
      }
    }

    // Validate password
    if (form.password.length < 6) {
      return setMessage("Password must be at least 6 characters.");
    }

    // Validate confirm password
    if (form.password !== form.confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    setLoading(true);
    try {
      await signup(
        form.email.trim(),
        form.password,
        form.name.trim(),
        phoneCountryCode,
        cleanDigits
      );

      // Check if redirect target is present
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTarget = searchParams.get("redirect") || "/account";
      router.push(redirectTarget);
    } catch (err: any) {
      setMessage(err.message || "Signup failed");
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

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-5 sm:p-8 shadow-jewel flex flex-col items-stretch text-center">
        <BrandLogo size={64} className="mb-4 mx-auto" />
        <h1 className="text-3xl font-serif font-semibold text-champagne tracking-wide">Create Account</h1>
        <form onSubmit={submit} className="mt-6 grid gap-4 text-left">
          
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Full Name *</label>
            <input 
              disabled={loading} 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
              placeholder="e.g. Aarav Sharma" 
              className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-3 outline-none text-charcoalBrown focus:border-champagne transition-all disabled:opacity-55 text-sm" 
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Email Address *</label>
            <input 
              disabled={loading} 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              type="email" 
              required 
              placeholder="e.g. aarav@example.com" 
              className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-3 outline-none text-charcoalBrown focus:border-champagne transition-all disabled:opacity-55 text-sm" 
            />
          </div>

          {/* International Phone Input */}
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Phone Number *</label>
            <div className="flex gap-2">
              <select
                disabled={loading}
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className="rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-3 py-3 outline-none text-charcoalBrown focus:border-champagne text-xs w-28 shrink-0 cursor-pointer"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.name.split(" ")[0]})
                  </option>
                ))}
              </select>
              <input 
                disabled={loading} 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} 
                type="tel"
                required 
                placeholder={phoneCountryCode === "+91" ? "10-digit number" : "Phone number"} 
                className="flex-1 rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-3 outline-none text-charcoalBrown focus:border-champagne transition-all disabled:opacity-55 text-sm font-mono" 
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Password *</label>
            <input 
              disabled={loading} 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              type="password" 
              required 
              placeholder="Password (min 6 chars)" 
              className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-3 outline-none text-charcoalBrown focus:border-champagne transition-all disabled:opacity-55 text-sm" 
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-charcoalBrown block mb-1">Confirm Password *</label>
            <input 
              disabled={loading} 
              value={form.confirmPassword} 
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
              type="password" 
              required 
              placeholder="Confirm Password" 
              className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-3 outline-none text-charcoalBrown focus:border-champagne transition-all disabled:opacity-55 text-sm" 
            />
          </div>

          <button 
            disabled={loading} 
            className="mt-2 w-full rounded-full bg-champagne px-5 py-3.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all disabled:opacity-55 flex items-center justify-center gap-2 text-sm shadow-jewel"
          >
            {loading && <Loader className="animate-spin h-4 w-4" />}
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 border-t border-goldBeige/30" />
          <span className="relative bg-white/70 backdrop-blur-md px-4 text-xs text-stoneGray uppercase tracking-wider">Or</span>
        </div>

        <button 
          disabled={loading} 
          onClick={handleGoogleLogin} 
          className="w-full rounded-full border border-goldBeige px-5 py-3 font-semibold text-champagne hover:bg-champagne/5 transition-all disabled:opacity-55 flex items-center justify-center gap-2 text-sm"
        >
          {loading && <Loader className="animate-spin h-4 w-4" />}
          Continue with Google
        </button>

        {message && <p className="mt-4 text-sm text-dustyRose font-medium bg-dustyRose/5 border border-dustyRose/20 p-2.5 rounded-2xl">{message}</p>}
        <p className="mt-6 text-sm text-stoneGray">Already have account? <Link href={`/login${typeof window !== "undefined" && window.location.search ? window.location.search : ""}`} className="text-champagne hover:underline font-semibold">Login</Link></p>
      </div>
    </section>
  );
}
