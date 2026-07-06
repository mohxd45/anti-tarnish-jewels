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
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-serif text-3xl text-charcoalBrown md:text-5xl">Return & Exchange Portal</h1>
        <p className="text-stoneGray text-lg">We offer a 7-day hassle-free return and exchange window.</p>
      </div>

      {success ? (
        <div className="bg-[#FAF9F6] border border-stone-200 p-8 rounded-3xl text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-serif text-charcoalBrown mb-4">Request Submitted</h2>
          <p className="text-stoneGray mb-8 leading-relaxed max-w-md mx-auto">
            Your {form.requestType.toLowerCase()} request for order <span className="font-semibold text-charcoalBrown">{form.orderNumber}</span> has been received. Our team will review it and get back to you within 24-48 hours.
          </p>
          <Link href="/shop" className="btn-primary-gold px-8 py-3">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-stone-200">
              <h3 className="font-serif text-xl text-charcoalBrown mb-4">How it works</h3>
              <ul className="space-y-4 text-sm text-stoneGray">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-stone-200 rounded-full p-1"><PackageOpen className="w-4 h-4 text-charcoalBrown" /></div>
                  <p><strong>1. Request</strong><br/>Submit your details using the form.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-stone-200 rounded-full p-1"><ShieldCheck className="w-4 h-4 text-charcoalBrown" /></div>
                  <p><strong>2. Approval</strong><br/>Our team reviews your request within 24-48 hours.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-stone-200 rounded-full p-1"><ArrowRightLeft className="w-4 h-4 text-charcoalBrown" /></div>
                  <p><strong>3. Resolution</strong><br/>Once approved, pack the item securely for pickup or exchange.</p>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-stone-200">
                <p className="text-xs text-stoneGray flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Need help? <a href="mailto:support@antitarnishjewels.com" className="font-semibold hover:underline">Email us</a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block border border-stone-200 rounded-xl p-4 cursor-pointer hover:border-[color:var(--color-gold)] transition has-[:checked]:border-[color:var(--color-gold)] has-[:checked]:bg-[color:var(--color-gold)]/5">
                    <input 
                      type="radio" 
                      name="requestType" 
                      value="Return" 
                      checked={form.requestType === "Return"} 
                      onChange={(e) => setForm({...form, requestType: e.target.value as "Return"})}
                      className="sr-only"
                    />
                    <div className="font-semibold text-charcoalBrown text-center">Return</div>
                  </label>
                  <label className="block border border-stone-200 rounded-xl p-4 cursor-pointer hover:border-[color:var(--color-gold)] transition has-[:checked]:border-[color:var(--color-gold)] has-[:checked]:bg-[color:var(--color-gold)]/5">
                    <input 
                      type="radio" 
                      name="requestType" 
                      value="Exchange" 
                      checked={form.requestType === "Exchange"} 
                      onChange={(e) => setForm({...form, requestType: e.target.value as "Exchange"})}
                      className="sr-only"
                    />
                    <div className="font-semibold text-charcoalBrown text-center">Exchange</div>
                  </label>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-stoneGray mb-1">Order Number *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. ORD-123456"
                      value={form.orderNumber}
                      onChange={(e) => setForm({...form, orderNumber: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:border-[color:var(--color-gold)] focus:ring-1 focus:ring-[color:var(--color-gold)] outline-none transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stoneGray mb-1">Email or Phone Number *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Used during checkout"
                      value={form.identifier}
                      onChange={(e) => setForm({...form, identifier: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:border-[color:var(--color-gold)] focus:ring-1 focus:ring-[color:var(--color-gold)] outline-none transition"
                    />
                    <p className="text-xs text-stone-400 mt-1">We use this to verify your order identity safely.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stoneGray mb-1">Reason *</label>
                    <select 
                      required
                      value={form.reason}
                      onChange={(e) => setForm({...form, reason: e.target.value})}
                      className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:border-[color:var(--color-gold)] focus:ring-1 focus:ring-[color:var(--color-gold)] outline-none transition bg-white"
                    >
                      <option value="" disabled>Select a reason...</option>
                      {reasons.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stoneGray mb-1">Additional Details</label>
                    <textarea 
                      value={form.message}
                      onChange={(e) => setForm({...form, message: e.target.value})}
                      placeholder="Please provide any additional context or details..."
                      className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:border-[color:var(--color-gold)] focus:ring-1 focus:ring-[color:var(--color-gold)] outline-none transition min-h-[100px]"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary-gold w-full py-3.5 mt-6 disabled:opacity-50"
                >
                  {loading ? "Submitting Request..." : `Submit ${form.requestType} Request`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
