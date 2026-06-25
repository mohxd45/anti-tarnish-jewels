"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { Address } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader, ShieldCheck, Truck, RotateCcw, Lock, ArrowLeft } from "lucide-react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PublicJewelryBackground } from "@/components/ui/PublicJewelryBackground";

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

export default function CheckoutPage() {
  return (
    <PublicJewelryBackground variant="subtle" intensity="low" className="min-h-screen">
      <CheckoutInner />
    </PublicJewelryBackground>
  );
}

function CheckoutInner() {
  const { user, profile, login, signup, loginWithGoogle, updateProfile } = useAuth();
  const cart = useCart();
  const router = useRouter();
  const [paymentMethod] = useState<"cod">("cod");
  const [giftWrap, setGiftWrap] = useState(false);
  const [address, setAddress] = useState<Address & { landmark?: string }>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });
  const [email, setEmail] = useState("");
  const [confirmedDetails, setConfirmedDetails] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState(cart.coupon || "");
  const [couponMsg, setCouponMsg] = useState(cart.coupon ? "Coupon applied!" : "");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Phone input states for checkout
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Inline Auth mode states
  const [authMode, setAuthMode] = useState<"options" | "login" | "signup">("options");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhoneCountryCode, setAuthPhoneCountryCode] = useState("+91");
  const [authPhoneNumber, setAuthPhoneNumber] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.email) {
        setEmail(user.email);
      }
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || profile?.name || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      if (profile.phoneCountryCode) setPhoneCountryCode(profile.phoneCountryCode);
      if (profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.name || ""
      }));
    }
  }, [profile]);

  async function handleApplyCoupon() {
    if (!couponCode) return;
    const res = await cart.applyCoupon(couponCode);
    if (res.success) {
      setCouponMsg("Coupon applied successfully!");
    } else {
      setCouponMsg(res.error || "Invalid or inactive coupon code.");
    }
  }

  function handleRemoveCoupon() {
    cart.applyCoupon("");
    setCouponCode("");
    setCouponMsg("");
  }

  async function placeOrder(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!user) return setError("Please sign in to place your order.");
    if (!cart.items.length) return setError("Cart is empty.");

    setError("");
    
    // Validate name
    if (!address.fullName.trim()) {
      setError("Full Name is required.");
      return;
    }
    
    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (phoneCountryCode === "+91") {
      if (cleanPhone.length !== 10) {
        setError("Please enter a valid 10-digit Indian phone number.");
        return;
      }
    } else {
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        setError("Please enter a valid phone number (7 to 15 digits).");
        return;
      }
    }
    
    // Validate address line 1
    if (!address.line1.trim()) {
      setError("Address Line 1 is required.");
      return;
    }
    
    // Validate city
    if (!address.city.trim()) {
      setError("City is required.");
      return;
    }
    
    // Validate state
    if (!address.state.trim()) {
      setError("State is required.");
      return;
    }
    
    // Validate pincode (6 digits for India address)
    const cleanPincode = address.pincode.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleanPincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    // Validate email if provided
    const finalEmail = email.trim() || user.email || "customer-no-email@example.com";
    if (finalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check payment method
    if (paymentMethod !== "cod") {
      setError("Cash on Delivery is currently the only supported payment method.");
      return;
    }

    // Check COD checkbox
    if (!confirmedDetails) {
      setError("Please check the confirmation checkbox to place your order.");
      return;
    }

    const finalTotal = cart.total + (giftWrap ? 49 : 0);
    const fullPhone = phoneCountryCode + cleanPhone;

    setPlacingOrder(true);
    setError("");
    try {
      // Save phone details to user profile if missing
      if (!profile?.phoneClean || !profile?.phoneNumber) {
        await updateProfile({
          phoneCountryCode,
          phoneNumber: cleanPhone,
          phoneE164: fullPhone,
          phoneClean: fullPhone.replace(/[^0-9]/g, "")
        });
      }

      const id = await createOrder({
        userId: user.uid,
        customerEmail: finalEmail,
        items: cart.items,
        address: {
          ...address,
          phone: fullPhone
        },
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        discount: cart.discount,
        total: finalTotal,
        paymentMethod: "cod",
        couponCode: cart.coupon || "",
        couponId: cart.couponId || "",
        notes: ""
      });

      cart.clearCart();
      router.push(`/order-success?order=${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
      setPlacingOrder(false);
    }
  }

  // Auth Submit logic (Email Login)
  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      await login(authEmail, authPassword);
      // Success triggers auth change, user state will update automatically
    } catch (err: any) {
      setAuthError(err.message || "Login failed. Please check your credentials.");
      setAuthLoading(false);
    }
  }

  // Auth Submit logic (Email Signup)
  async function handleInlineSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");

    if (!authName.trim()) {
      return setAuthError("Please enter your full name.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail.trim())) {
      return setAuthError("Please enter a valid email address.");
    }
    const cleanDigits = authPhoneNumber.replace(/\D/g, "");
    if (authPhoneCountryCode === "+91") {
      if (cleanDigits.length !== 10) {
        return setAuthError("For India, the phone number must be exactly 10 digits.");
      }
    } else {
      if (cleanDigits.length < 7 || cleanDigits.length > 15) {
        return setAuthError("Please enter a valid phone number (7 to 15 digits).");
      }
    }
    if (authPassword.length < 6) {
      return setAuthError("Password must be at least 6 characters.");
    }
    if (authPassword !== authConfirmPassword) {
      return setAuthError("Passwords do not match.");
    }

    setAuthLoading(true);
    try {
      await signup(
        authEmail.trim(),
        authPassword,
        authName.trim(),
        authPhoneCountryCode,
        cleanDigits
      );
    } catch (err: any) {
      setAuthError(err.message || "Signup failed");
      setAuthLoading(false);
    }
  }

  async function handleInlineGoogleLogin() {
    setAuthLoading(true);
    setAuthError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in failed");
      setAuthLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:py-10 pb-20 lg:grid-cols-[1fr_380px]">
      <div className="rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-4 sm:p-6 md:p-8 shadow-jewel">
        <div className="flex items-center gap-3 border-b border-goldBeige/20 pb-4">
          <Lock className="text-champagne w-6 h-6" />
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-charcoalBrown">Secure Checkout</h1>
        </div>

        {!user ? (
          /* Authentication Required Barrier */
          <div className="mt-8 py-4 flex flex-col items-stretch text-center max-w-md mx-auto">
            <h2 className="text-xl font-serif font-semibold text-champagne tracking-wide">
              Please sign in to place your order.
            </h2>
            <p className="text-xs text-stoneGray mt-1.5 mb-6">
              Create an account or login to checkout your anti-tarnish premium jewellery safely.
            </p>

            {authMode === "options" && (
              <div className="flex flex-col gap-3.5">
                <LoadingButton
                  type="button"
                  loading={authLoading}
                  loadingText="Connecting..."
                  onClick={handleInlineGoogleLogin}
                  className="rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-6 py-3.5 font-semibold text-champagne hover:bg-champagne/5 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Continue with Google
                </LoadingButton>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className="rounded-full bg-champagne px-6 py-3.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all text-sm shadow-jewel"
                >
                  Login with Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                  }}
                  className="rounded-full border border-goldBeige px-6 py-3.5 font-semibold text-stoneGray hover:bg-goldBeige/10 transition-all text-sm"
                >
                  Create Account
                </button>
              </div>
            )}

            {authMode === "login" && (
              <form onSubmit={handleInlineLogin} className="text-left space-y-4">
                <div>
                  <label className="text-xs font-semibold text-charcoalBrown block mb-1">Email *</label>
                  <input
                    disabled={authLoading}
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. aarav@example.com"
                    className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoalBrown block mb-1">Password *</label>
                  <input
                    disabled={authLoading}
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <LoadingButton
                    loading={authLoading}
                    loadingText="Logging in..."
                    className="w-full rounded-full bg-champagne py-3.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-jewel"
                  >
                    Login
                  </LoadingButton>
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => setAuthMode("options")}
                    className="w-full rounded-full border border-goldBeige py-3.5 font-semibold text-stoneGray hover:bg-goldBeige/10 transition-all flex items-center justify-center gap-1.5 text-xs"
                  >
                    <ArrowLeft size={14} /> Back to Sign In options
                  </button>
                </div>
              </form>
            )}

            {authMode === "signup" && (
              <form onSubmit={handleInlineSignup} className="text-left space-y-4">
                <div>
                  <label className="text-xs font-semibold text-charcoalBrown block mb-1">Full Name *</label>
                  <input
                    disabled={authLoading}
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoalBrown block mb-1">Email Address *</label>
                  <input
                    disabled={authLoading}
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. aarav@example.com"
                    className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoalBrown block mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <select
                      disabled={authLoading}
                      value={authPhoneCountryCode}
                      onChange={(e) => setAuthPhoneCountryCode(e.target.value)}
                      className="rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-2 py-2.5 outline-none text-charcoalBrown focus:border-champagne text-xs w-24 shrink-0 cursor-pointer"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      disabled={authLoading}
                      required
                      value={authPhoneNumber}
                      onChange={(e) => setAuthPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={authPhoneCountryCode === "+91" ? "10-digit number" : "Phone number"}
                      className="flex-1 rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm font-mono disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoalBrown block mb-1">Password *</label>
                  <input
                    disabled={authLoading}
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Password (min 6 chars)"
                    className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoalBrown block mb-1">Confirm Password *</label>
                  <input
                    disabled={authLoading}
                    type="password"
                    required
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <LoadingButton
                    loading={authLoading}
                    loadingText="Creating account..."
                    className="w-full rounded-full bg-champagne py-3.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-jewel"
                  >
                    Create Account
                  </LoadingButton>
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => setAuthMode("options")}
                    className="w-full rounded-full border border-goldBeige py-3.5 font-semibold text-stoneGray hover:bg-goldBeige/10 transition-all flex items-center justify-center gap-1.5 text-xs"
                  >
                    <ArrowLeft size={14} /> Back to Sign In options
                  </button>
                </div>
              </form>
            )}

            {authError && (
              <p className="mt-4 text-xs text-dustyRose font-medium bg-dustyRose/5 border border-dustyRose/20 p-2.5 rounded-2xl">
                {authError}
              </p>
            )}
          </div>
        ) : (
          /* Address Collection & Order Placement Checkout Form */
          <form onSubmit={placeOrder}>
            <h2 className="mt-6 text-lg font-serif font-semibold text-charcoalBrown">Shipping Address</h2>
            <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">Full Name *</label>
                <input 
                  required 
                  disabled={placingOrder}
                  value={address.fullName} 
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })} 
                  placeholder="e.g. Aarav Sharma" 
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50" 
                />
              </div>

              {/* International Phone Input */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">Phone Number *</label>
                <div className="flex gap-2">
                  <select
                    disabled={placingOrder}
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-3 py-3 outline-none text-charcoalBrown focus:border-champagne text-xs w-28 shrink-0 cursor-pointer"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                  <input 
                    required 
                    type="tel"
                    disabled={placingOrder}
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} 
                    placeholder={phoneCountryCode === "+91" ? "10-digit number" : "Phone number"} 
                    className="flex-1 rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50 font-mono" 
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">Email Address *</label>
                <input 
                  type="email"
                  required
                  disabled={placingOrder}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g. aarav@example.com" 
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50" 
                />
              </div>

              {/* Address Line 1 */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">Address Line 1 *</label>
                <input 
                  required 
                  disabled={placingOrder}
                  value={address.line1} 
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })} 
                  placeholder="Flat, House no., Building, Company, Apartment" 
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50" 
                />
              </div>

              {/* Address Line 2 */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">Address Line 2 (Optional)</label>
                <input 
                  disabled={placingOrder}
                  value={address.line2 || ""} 
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })} 
                  placeholder="Area, Street, Sector, Village" 
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50" 
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">Landmark (Optional)</label>
                <input 
                  disabled={placingOrder}
                  value={address.landmark || ""} 
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })} 
                  placeholder="e.g. near Apollo Hospital" 
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50" 
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">6-Digit Pincode *</label>
                <input 
                  required 
                  maxLength={6}
                  disabled={placingOrder}
                  value={address.pincode} 
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })} 
                  placeholder="e.g. 110001" 
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50 font-mono" 
                />
              </div>

              {/* City */}
              <div>
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">City *</label>
                <input 
                  required 
                  disabled={placingOrder}
                  value={address.city} 
                  onChange={(e) => setAddress({ ...address, city: e.target.value })} 
                  placeholder="e.g. New Delhi" 
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50" 
                />
              </div>

              {/* State */}
              <div>
                <label className="text-xs font-semibold text-charcoalBrown block mb-1">State *</label>
                <select
                  required
                  disabled={placingOrder}
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3 text-sm text-charcoalBrown outline-none focus:border-champagne transition-all disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Select State</option>
                  {[
                    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
                    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
                    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
                    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
                    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
                    "Ladakh", "Lakshadweep", "Puducherry"
                  ].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="mt-8 text-lg font-serif font-semibold text-charcoalBrown">Payment Method</h2>
            
            {/* COD Risk Warning / Safety Message */}
            <p className="text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl mt-2">
              💡 <strong>Cash on Delivery Safety:</strong> Cash on Delivery orders need customer identity and phone verification before shipping.
            </p>

            <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-3 font-serif">
              {/* COD Option */}
              <label 
                className="flex items-center gap-3 rounded-2xl border p-4 cursor-pointer hover:bg-champagne/5 transition-all border-champagne bg-champagne/5 shadow-jewel"
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={true}
                  readOnly
                  className="accent-champagne h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-charcoalBrown text-xs md:text-sm">Cash on Delivery</span>
                  <span className="text-[10px] text-stoneGray font-sans">Pay with cash upon delivery</span>
                </div>
              </label>

              {/* Stripe Option */}
              <label 
                className="flex items-center gap-3 rounded-2xl border border-goldBeige bg-white/70 backdrop-blur-md p-4 opacity-50 cursor-not-allowed select-none"
              >
                <input 
                  type="radio" 
                  name="payment" 
                  disabled={true}
                  checked={false} 
                  className="accent-champagne h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-stoneGray text-xs md:text-sm">Stripe (Card)</span>
                  <span className="text-[10px] text-dustyRose font-bold font-sans">Coming Soon</span>
                </div>
              </label>

              {/* Razorpay Option */}
              <label 
                className="flex items-center gap-3 rounded-2xl border border-goldBeige bg-white/70 backdrop-blur-md p-4 opacity-50 cursor-not-allowed select-none"
              >
                <input 
                  type="radio" 
                  name="payment" 
                  disabled={true}
                  checked={false} 
                  className="accent-champagne h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-stoneGray text-xs md:text-sm">Razorpay (UPI / Net)</span>
                  <span className="text-[10px] text-dustyRose font-bold font-sans">Coming Soon</span>
                </div>
              </label>
            </div>

            {/* Gift Wrapping options */}
            <div className="mt-6 border-t border-goldBeige/20 pt-6">
              <label className={`flex items-start gap-3 text-stoneGray text-sm cursor-pointer select-none ${placingOrder ? "opacity-50 cursor-not-allowed" : ""}`}>
                <input 
                  type="checkbox" 
                  disabled={placingOrder}
                  checked={giftWrap} 
                  onChange={(e) => setGiftWrap(e.target.checked)} 
                  className="accent-champagne h-4 w-4 mt-0.5" 
                />
                <span className="leading-tight">
                  Add premium velvet jewellery gift pouch & personalized hand-written card for <strong className="text-charcoalBrown">{formatPrice(49)}</strong>
                </span>
              </label>
            </div>

            {/* COD Confirmation Checkbox */}
            <div className="mt-6 border-t border-goldBeige/25 pt-6 space-y-4">
              <label className="flex items-start gap-3 text-stoneGray text-xs md:text-sm cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  disabled={placingOrder}
                  checked={confirmedDetails} 
                  onChange={(e) => setConfirmedDetails(e.target.checked)} 
                  className="accent-champagne h-4 w-4 mt-0.5" 
                />
                <span className="leading-tight text-charcoalBrown font-medium">
                  I confirm my phone number and delivery address are correct. I understand fake or wrong COD orders may be cancelled. <span className="text-dustyRose">*</span>
                </span>
              </label>
            </div>

            {error && <p className="mt-5 rounded-2xl border border-dustyRose/40 p-3 text-sm text-dustyRose bg-dustyRose/5">{error}</p>}

            <LoadingButton
              type="button"
              onClick={placeOrder}
              disabled={placingOrder || !confirmedDetails}
              loading={placingOrder}
              loadingText="Placing Order..."
              className="mt-8 w-full sm:w-auto rounded-full bg-champagne px-8 py-4 font-semibold text-charcoalBrown hover:opacity-90 transition-all text-center shadow-jewel"
            >
              Place Order Securely
            </LoadingButton>

            {/* Trust Guarantees */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-goldBeige/25 pt-6 text-stoneGray text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-champagne shrink-0" size={16} />
                <span>100% Secure SSL Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="text-champagne shrink-0" size={16} />
                <span>Insured Premium Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="text-champagne shrink-0" size={16} />
                <span>7 Days Return Policy</span>
              </div>
            </div>
          </form>
        )}
      </div>

      <aside className="h-fit rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-4 sm:p-6 shadow-jewel space-y-6">
        <div>
          <h2 className="text-xl font-serif font-semibold text-champagne border-b border-goldBeige/20 pb-3">Order Summary</h2>
          <div className="mt-4 divide-y divide-goldBeige/25 max-h-[220px] overflow-y-auto pr-2">
            {cart.items.map((item) => (
              <div key={item.product.id} className="py-2.5 flex justify-between gap-4 text-xs md:text-sm text-stoneGray">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-charcoalBrown truncate block">{item.product.name}</span>
                  <span className="text-[10px] text-stoneGray/60">Qty: {item.quantity}</span>
                </div>
                <span className="font-semibold text-charcoalBrown shrink-0">{formatPrice(item.product.salePrice * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Input Box */}
        <div className="border-t border-goldBeige/20 pt-4">
          <label className="text-xs uppercase tracking-wider text-champagne font-semibold block mb-2">Have a coupon code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="e.g. WELCOME10"
              className="flex-1 rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2 text-sm outline-none text-charcoalBrown focus:border-champagne transition-all"
              disabled={!!cart.coupon}
            />
            {cart.coupon ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="rounded-full bg-dustyRose/25 hover:bg-dustyRose/40 px-4 py-2 text-xs font-semibold text-dustyRose transition-all"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="rounded-full bg-champagne px-4 py-2 text-xs font-semibold text-charcoalBrown hover:opacity-90 transition-all"
              >
                Apply
              </button>
            )}
          </div>
          {couponMsg && (
            <p className={`text-xs mt-2 ${couponMsg.includes("success") || couponMsg.includes("applied") ? "text-emerald-600" : "text-dustyRose"}`}>
              {couponMsg}
            </p>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-goldBeige/20 pt-4 space-y-2.5 text-sm text-stoneGray">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-charcoalBrown font-medium">{formatPrice(cart.subtotal)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-dustyRose">
              <span>Coupon Discount ({cart.coupon})</span>
              <span className="font-semibold">-{formatPrice(cart.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-charcoalBrown font-medium">{cart.shipping === 0 ? "Free" : formatPrice(cart.shipping)}</span>
          </div>
          {giftWrap && (
            <div className="flex justify-between text-champagne">
              <span>Premium Gift Wrap</span>
              <span className="font-semibold">{formatPrice(49)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-goldBeige/20 pt-4 text-lg font-serif font-semibold text-champagne">
            <span>Total</span>
            <span>{formatPrice(cart.total + (giftWrap ? 49 : 0))}</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
