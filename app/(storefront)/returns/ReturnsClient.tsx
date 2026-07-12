"use client";

import { useState } from "react";
import { submitReturnRequest } from "@/lib/firestore";
import { toast } from "sonner";
import { PackageOpen, ArrowRightLeft, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

export default function ReturnsClient() {
  const [form, setForm] = useState({
    orderNumber: "",
    identifier: "",
    requestType: "Return" as "Return" | "Exchange",
    reason: "",
    message: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReturnRequest(form);
      setSuccess(true);
      toast.success("Request submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const reasons = form.requestType === "Return" ? [
    "Product is defective or damaged",
    "Wrong item received",
    "Product differs from description",
    "Quality not as expected",
    "Other"
  ] : [
    "Wrong size",
    "Product is defective or damaged",
    "Wrong item received",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:pt-16 pb-12">
        
        {/* Header Section */}
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#B8955E]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#FFF0F5] rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-widest text-[#B8955E] uppercase">Returns & Exchanges</span>
            <h1 className="mt-4 mb-4 font-serif text-3xl sm:text-5xl text-[#3A2428]">Return Portal</h1>
            <p className="text-[#3A2428]/70 text-sm sm:text-base max-w-2xl mx-auto">We offer a 7-day hassle-free return and exchange window for our premium collections.</p>
          </div>
        </div>

        {success ? (
          <div className="bg-[#FFF9FB] border border-[#B8955E]/20 p-10 rounded-[2rem] text-center shadow-[0_8px_24px_rgba(58,36,40,0.04)] max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#FFF0F5] text-[#B8955E] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-serif text-[#3A2428] mb-4">Request Submitted</h2>
            <p className="text-[#3A2428]/70 mb-8 leading-relaxed">
              Your {form.requestType.toLowerCase()} request for order <span className="font-semibold text-[#3A2428]">{form.orderNumber}</span> has been received. Our team will review it and get back to you within 24-48 hours.
            </p>
            <Link href="/shop" className="inline-block px-8 py-3.5 bg-[#B8955E] hover:bg-[#A38250] text-white rounded-full font-medium transition-colors shadow-sm">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* How it works Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#FFF9FB] rounded-3xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10">
                <h3 className="font-serif text-xl text-[#3A2428] mb-6">How it works</h3>
                <ul className="space-y-6 text-sm text-[#3A2428]/80">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFF0F5] flex items-center justify-center">
                      <PackageOpen className="w-5 h-5 text-[#B8955E]" />
                    </div>
                    <div>
                      <strong className="text-[#3A2428] block mb-1">1. Request</strong>
                      <span>Submit your details using the form.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFF0F5] flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#B8955E]" />
                    </div>
                    <div>
                      <strong className="text-[#3A2428] block mb-1">2. Approval</strong>
                      <span>Our team reviews your request within 24-48 hours.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFF0F5] flex items-center justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-[#B8955E]" />
                    </div>
                    <div>
                      <strong className="text-[#3A2428] block mb-1">3. Resolution</strong>
                      <span>Once approved, pack the item securely for pickup or exchange.</span>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-8 pt-6 border-t border-[#B8955E]/10">
                  <p className="text-sm text-[#3A2428]/70 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#B8955E]" /> Need help? <a href="mailto:support@lonajewels.com" className="font-semibold text-[#B8955E] hover:underline">Email us</a>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form Column */}
            <div className="lg:col-span-3">
              <div className="bg-[#FFF9FB] rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Type Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`block border rounded-2xl p-4 cursor-pointer transition-all ${
                      form.requestType === "Return" 
                      ? "border-[#B8955E] bg-[#B8955E]/5 shadow-sm" 
                      : "border-stone-200 hover:border-[#B8955E]/50"
                    }`}>
                      <input 
                        type="radio" 
                        name="requestType" 
                        value="Return" 
                        checked={form.requestType === "Return"} 
                        onChange={(e) => setForm({...form, requestType: e.target.value as "Return"})}
                        className="sr-only"
                      />
                      <div className={`font-serif text-center text-lg ${form.requestType === "Return" ? "text-[#B8955E]" : "text-[#3A2428]"}`}>Return</div>
                    </label>
                    <label className={`block border rounded-2xl p-4 cursor-pointer transition-all ${
                      form.requestType === "Exchange" 
                      ? "border-[#B8955E] bg-[#B8955E]/5 shadow-sm" 
                      : "border-stone-200 hover:border-[#B8955E]/50"
                    }`}>
                      <input 
                        type="radio" 
                        name="requestType" 
                        value="Exchange" 
                        checked={form.requestType === "Exchange"} 
                        onChange={(e) => setForm({...form, requestType: e.target.value as "Exchange"})}
                        className="sr-only"
                      />
                      <div className={`font-serif text-center text-lg ${form.requestType === "Exchange" ? "text-[#B8955E]" : "text-[#3A2428]"}`}>Exchange</div>
                    </label>
                  </div>

                  <div className="space-y-5 mt-8">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">Order Number *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. ORD-123456"
                        value={form.orderNumber}
                        onChange={(e) => setForm({...form, orderNumber: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">Email or Phone Number *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Used during checkout"
                        value={form.identifier}
                        onChange={(e) => setForm({...form, identifier: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400"
                      />
                      <p className="text-xs text-[#3A2428]/50 mt-1.5">We use this to verify your order identity safely.</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">Reason *</label>
                      <select 
                        required
                        value={form.reason}
                        onChange={(e) => setForm({...form, reason: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] appearance-none"
                      >
                        <option value="" disabled>Select a reason...</option>
                        {reasons.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">Additional Details</label>
                      <textarea 
                        value={form.message}
                        onChange={(e) => setForm({...form, message: e.target.value})}
                        placeholder="Please provide any additional context or details..."
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400 min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 mt-2 bg-[#B8955E] hover:bg-[#A38250] text-white rounded-full font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Submitting Request..." : `Submit ${form.requestType} Request`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
