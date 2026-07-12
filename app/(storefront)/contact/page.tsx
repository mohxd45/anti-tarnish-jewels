"use client";
import { useState, useEffect } from "react";
import { saveContactMessage } from "@/lib/firestore";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { MessageSquare, Mail, Clock, Send, MapPin } from "lucide-react";

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

  const sanitizedWhatsApp = whatsAppNumber.replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:pt-16 pb-12">
        
        {/* Contact Hero Card */}
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-8 sm:p-12 text-center mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-[#B8955E]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 bg-[#FFF0F5] rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-widest text-[#B8955E] uppercase">Get In Touch</span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-serif text-[#3A2428]">
              Contact Support
            </h1>
            <p className="mt-4 text-[#3A2428]/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Have a question about our premium collections, or need assistance with your order? 
              Our dedicated team is ready to help you experience true luxury.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Details Column */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* WhatsApp Card */}
            {whatsAppNumber && (
              <a
                href={`https://wa.me/${sanitizedWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block group bg-[#FFF9FB] p-6 rounded-3xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 hover:border-[#B8955E]/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#FFF0F5] flex items-center justify-center group-hover:bg-[#B8955E]/10 transition-colors">
                    <MessageSquare className="w-5 h-5 text-[#B8955E]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-[#3A2428] group-hover:text-[#B8955E] transition-colors">
                      WhatsApp Support
                    </h3>
                    <p className="text-sm text-[#3A2428]/70 mt-1 leading-relaxed">
                      Instant replies for orders, product details, or shipping status.
                    </p>
                  </div>
                </div>
              </a>
            )}

            {/* Email Card */}
            <div className="bg-[#FFF9FB] p-6 rounded-3xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#FFF0F5] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#B8955E]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#3A2428]">Email Us</h3>
                  <p className="text-sm text-[#3A2428]/70 mt-1 leading-relaxed">
                    For bulk orders, custom gifting, or partnership inquiries.
                  </p>
                  <a
                    href="mailto:support@lonajewels.com"
                    className="inline-block mt-2 text-sm font-semibold text-[#B8955E] hover:underline"
                  >
                    support@lonajewels.com
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="bg-[#FFF9FB] p-6 rounded-3xl shadow-[0_4px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#FFF0F5] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#B8955E]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#3A2428]">Business Hours</h3>
                  <p className="text-sm text-[#3A2428]/70 mt-1 leading-relaxed">
                    Our support team is active during these hours:
                  </p>
                  <p className="mt-2 text-sm text-[#3A2428] font-medium">
                    Mon – Sat: 10:00 AM – 7:00 PM (IST)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-[#FFF9FB] p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20">
              <h2 className="text-2xl font-serif text-[#3A2428] mb-2">Send Us a Message</h2>
              <p className="text-sm text-[#3A2428]/70 mb-8">Fill out the form below and we will get back to you within 24 hours.</p>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">
                    Full Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">
                      Email Address
                    </label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      type="email"
                      placeholder="name@email.com"
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">
                      Phone Number
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">
                    Message Details
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    placeholder="Tell us what you need help with..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-[#B8955E] hover:bg-[#A38250] text-white rounded-full font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>

                {sent && (
                  <div className="p-4 mt-4 rounded-xl bg-[#FFF0F5] border border-[#B8955E]/20 text-[#3A2428] text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B8955E]"></span>
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
