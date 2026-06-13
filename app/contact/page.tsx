"use client";

import { useState, useEffect } from "react";
import { saveContactMessage } from "@/lib/firestore";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { MessageSquare, Mail, Phone, Clock, Send, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  useEffect(() => {
    getWhatsAppNumber().then((num) => {
      setWhatsAppNumber(num);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveContactMessage(form);
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Sanitize WhatsApp number for URL
  const sanitizedWhatsApp = whatsAppNumber.replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#F7ECE9] pt-16 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-[#B8955E] uppercase">Get In Touch</span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-serif font-semibold text-[#2E2823] tracking-tight">
            Contact Support
          </h1>
          <p className="mt-4 text-base text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Have a question about our anti-tarnish waterproof collection, or need assistance with your order? 
            Our dedicated team is ready to help you.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Info Side (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Card */}
            {whatsAppNumber && (
              <a
                href={`https://wa.me/${sanitizedWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block group p-6 rounded-[2rem] border border-[#B8955E]/20 bg-white shadow-[0_4px_20px_-4px_rgba(184,149,94,0.12)] hover:shadow-[0_8px_30px_rgba(184,149,94,0.2)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2E2823] group-hover:text-[#B8955E] transition-colors">
                      WhatsApp Support
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Get instant replies for orders, custom sizes, or shipping status.
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-green-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                      Online: {whatsAppNumber}
                    </span>
                  </div>
                </div>
              </a>
            )}

            {/* Email Support Card */}
            <div className="p-6 rounded-[2rem] border border-gray-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#F7ECE9] rounded-2xl">
                  <Mail className="w-6 h-6 text-[#B8955E]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2E2823]">Email Inquiries</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    For bulk orders, custom gifting, or partnership inquiries.
                  </p>
                  <a
                    href="mailto:support@antitarnishjewels.com"
                    className="block mt-2 text-sm font-semibold text-[#B8955E] hover:underline"
                  >
                    support@antitarnishjewels.com
                  </a>
                </div>
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="p-6 rounded-[2rem] border border-gray-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FDFBF7] rounded-2xl">
                  <Clock className="w-6 h-6 text-[#B8955E]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2E2823]">Business Hours</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Our support team is active during these hours to process queries:
                  </p>
                  <p className="mt-2 text-sm text-[#2E2823] font-medium">
                    Monday – Saturday: 10:00 AM – 7:00 PM (IST)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Guarantee Badge Card */}
            <div className="p-5 rounded-[2.5rem] bg-gradient-to-r from-[#B8955E] to-[#B7A28C] text-white flex items-center gap-4 shadow-lg">
              <ShieldCheck className="w-10 h-10 flex-shrink-0 opacity-90" />
              <div>
                <h4 className="font-serif font-semibold text-sm">Lifetime Anti-Tarnish Guarantee</h4>
                <p className="text-xs text-white/80 mt-0.5">All premium pieces are waterproof, sweatproof, and backed by quick support.</p>
              </div>
            </div>
          </div>

          {/* Form Side (7 columns) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-[2.5rem] border border-[#B8955E]/15 bg-white shadow-[0_10px_30px_rgba(184,149,94,0.08)]">
              <h2 className="text-2xl font-serif font-semibold text-[#2E2823] mb-2">Send Us a Message</h2>
              <p className="text-sm text-gray-500 mb-8">Fill out the form below and we will get back to you within 24 hours.</p>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded-full border border-gray-200 bg-gray-50/50 px-6 py-4 outline-none text-[#2E2823] placeholder-gray-400 focus:bg-white focus:border-[#B8955E] focus:ring-1 focus:ring-[#B8955E]/30 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Email Address *
                    </label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      type="email"
                      placeholder="name@email.com"
                      className="w-full rounded-full border border-gray-200 bg-gray-50/50 px-6 py-4 outline-none text-[#2E2823] placeholder-gray-400 focus:bg-white focus:border-[#B8955E] focus:ring-1 focus:ring-[#B8955E]/30 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Phone Number *
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-full border border-gray-200 bg-gray-50/50 px-6 py-4 outline-none text-[#2E2823] placeholder-gray-400 focus:bg-white focus:border-[#B8955E] focus:ring-1 focus:ring-[#B8955E]/30 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Message Details *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    placeholder="Tell us what you need help with..."
                    rows={4}
                    className="w-full rounded-[2rem] border border-gray-200 bg-gray-50/50 px-6 py-4 outline-none text-[#2E2823] placeholder-gray-400 focus:bg-white focus:border-[#B8955E] focus:ring-1 focus:ring-[#B8955E]/30 transition-all font-sans resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#B8955E] text-white py-4 font-semibold hover:bg-[#A3814C] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-4.5 h-4.5" />
                      Send Message
                    </>
                  )}
                </button>

                {sent && (
                  <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Your message was sent successfully! We will get back to you shortly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
