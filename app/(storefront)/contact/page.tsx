"use client";
import { useState, useEffect } from "react";
import { saveContactMessage } from "@/lib/firestore";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { MessageSquare, Mail, Clock, Send, ShieldCheck } from "lucide-react";

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
    <div className="mx-auto max-w-6xl px-4 pt-16 pb-32">
      <div className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest text-stoneGray uppercase">Get In Touch</span>
        <h1 className="mt-2 text-4xl sm:text-5xl font-serif text-charcoalBrown tracking-tight">
          Contact Support
        </h1>
        <p className="mt-4 text-sm text-stoneGray max-w-2xl mx-auto leading-relaxed">
          Have a question about our anti-tarnish waterproof collection, or need assistance with your order? 
          Our dedicated team is ready to help you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          {whatsAppNumber && (
            <a
              href={`https://wa.me/${sanitizedWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block group p-6 rounded-3xl glass hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors border border-green-100">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-charcoalBrown group-hover:text-[color:var(--color-gold)] transition-colors">
                    WhatsApp Support
                  </h3>
                  <p className="text-sm text-stoneGray mt-1">
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

          <div className="p-6 rounded-3xl glass bg-white/80 shadow-sm border border-goldBeige">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-beige/50 rounded-2xl border border-goldBeige">
                <Mail className="w-6 h-6 text-charcoalBrown" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-charcoalBrown">Email Inquiries</h3>
                <p className="text-sm text-stoneGray mt-1">
                  For bulk orders, custom gifting, or partnership inquiries.
                </p>
                <a
                  href="mailto:support@antitarnishjewels.com"
                  className="block mt-2 text-sm font-semibold text-[color:var(--color-gold)] hover:underline"
                >
                  support@antitarnishjewels.com
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass bg-white/80 shadow-sm border border-goldBeige">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-beige/50 rounded-2xl border border-goldBeige">
                <Clock className="w-6 h-6 text-charcoalBrown" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-charcoalBrown">Business Hours</h3>
                <p className="text-sm text-stoneGray mt-1">
                  Our support team is active during these hours:
                </p>
                <p className="mt-2 text-sm text-charcoalBrown font-medium">
                  Monday – Saturday: 10:00 AM – 7:00 PM (IST)
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-5 rounded-3xl bg-[color:var(--color-gold)] text-white flex items-center gap-4 shadow-lg">
            <ShieldCheck className="w-10 h-10 flex-shrink-0 opacity-90" />
            <div>
              <h4 className="font-serif font-semibold text-sm">Lifetime Anti-Tarnish Guarantee</h4>
              <p className="text-xs text-white/80 mt-0.5">All premium pieces are waterproof, sweatproof, and backed by quick support.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="p-6 sm:p-10 rounded-3xl glass bg-white/80 shadow-sm border border-goldBeige">
            <h2 className="text-2xl font-serif text-charcoalBrown mb-2">Send Us a Message</h2>
            <p className="text-sm text-stoneGray mb-8">Fill out the form below and we will get back to you within 24 hours.</p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoalBrown mb-2">
                  Full Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  type="text"
                  placeholder="Enter your name"
                  className="neo-input w-full px-4 py-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoalBrown mb-2">
                    Email Address *
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    type="email"
                    placeholder="name@email.com"
                    className="neo-input w-full px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoalBrown mb-2">
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
                    className="neo-input w-full px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoalBrown mb-2">
                  Message Details *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  placeholder="Tell us what you need help with..."
                  rows={4}
                  className="neo-input w-full px-4 py-3 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary-gold w-full py-4 flex items-center justify-center gap-2"
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
  );
}
