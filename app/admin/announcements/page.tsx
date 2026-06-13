"use client";

import { useEffect, useState } from "react";
import { getAnnouncements, saveAnnouncements } from "@/lib/firestore";
import { AnnouncementSettings } from "@/types";
import { Save, Loader, Megaphone, CheckCircle, AlertCircle, Truck } from "lucide-react";

export default function AnnouncementsPage() {
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setSettings(data);
    } catch {
      showToast("error", "Failed to fetch announcement settings.");
    }
    setLoading(false);
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await saveAnnouncements(settings);
      showToast("success", "Announcements and support contacts updated successfully!");
    } catch {
      showToast("error", "Failed to save settings.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gold">
        <Loader className="animate-spin" size={32} />
        <span className="ml-2 font-medium">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in pb-10">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg border text-sm transition-all ${
          toast.type === "success" 
            ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/20" 
            : "bg-rose-950/90 text-rose-400 border-rose-500/20"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Announcements & Support</h1>
        <p className="text-sm text-cream/55 mt-1">Configure active sales countdowns, WhatsApp customer hotlines, and announcement headers.</p>
      </div>

      {settings && (
        <form onSubmit={handleSave} className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-6 md:p-8 shadow-jewel space-y-6">
          <div className="flex items-center gap-2 text-gold border-b border-gold/10 pb-3">
            <Megaphone size={18} />
            <h2 className="text-lg font-serif font-semibold">Promotion Toggles</h2>
          </div>

          <div className="space-y-6">
            {/* Announcement bar text */}
            <div className="space-y-3 border-b border-gold/5 pb-4">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.showAnnouncement}
                  onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
                  className="accent-gold h-4 w-4 rounded border-gold/30 bg-noir text-gold"
                />
                <span className="font-semibold">Enable Top Announcement Bar</span>
              </label>

              {settings.showAnnouncement && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Announcement Text</label>
                  <input
                    required
                    value={settings.text}
                    onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                    placeholder="e.g. Free shipping unlocked above ₹999!"
                  />
                </div>
              )}
            </div>

            {/* Countdown timer */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Flash Sale Countdown Timer (Optional)</label>
              <input
                value={settings.countdownTimer || ""}
                onChange={(e) => setSettings({ ...settings, countdownTimer: e.target.value })}
                className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50 font-mono"
                placeholder="ISO format or Date String, e.g. 2026-12-31T23:59:59"
              />
              <span className="text-[10px] text-cream/45 mt-1 block">Countdown timer triggers homepage ticking panels. Leave empty to disable.</span>
            </div>

            {/* WhatsApp support settings */}
            <div className="space-y-4 border-t border-gold/5 pt-6">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.showWhatsAppButton ?? true}
                  onChange={(e) => setSettings({ ...settings, showWhatsAppButton: e.target.checked })}
                  className="accent-gold h-4 w-4 rounded border-gold/30 bg-noir text-gold"
                />
                <span className="font-semibold">Display Floating WhatsApp Support Button</span>
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">WhatsApp Business Number</label>
                  <input
                    value={settings.whatsAppSupport || ""}
                    onChange={(e) => setSettings({ ...settings, whatsAppSupport: e.target.value })}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50 font-mono"
                    placeholder="e.g. 919999999999"
                  />
                  <span className="text-[10px] text-cream/45 mt-1 block">Enter country code and phone number only (no spaces, hyphens, or '+' sign).</span>
                  {!settings.whatsAppSupport?.trim() && (
                    <div className="mt-2 text-xs text-rose-400 bg-rose-950/25 border border-rose-500/25 rounded-2xl p-3.5 flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        <strong>Warning:</strong> No WhatsApp number is configured in admin settings. The floating support button and support CTAs will be hidden on the public site unless a fallback number is configured in your environment settings (Vercel).
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Default WhatsApp Message</label>
                  <input
                    value={settings.whatsAppMessage || ""}
                    onChange={(e) => setSettings({ ...settings, whatsAppMessage: e.target.value })}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                    placeholder="e.g. Hi Anti Tarnish Jewels, I need help with my order."
                  />
                  <span className="text-[10px] text-cream/45 mt-1 block">Message template preloaded in WhatsApp.</span>
                </div>
              </div>
            </div>

            {/* Popup offer panels */}
            <div className="grid gap-6 md:grid-cols-2 border-t border-gold/5 pt-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Popup Banner Offer title</label>
                <input
                  value={settings.popupOfferTitle || ""}
                  onChange={(e) => setSettings({ ...settings, popupOfferTitle: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                  placeholder="e.g. SPECIAL WELCOME OFFER!"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Popup Banner Offer Wording</label>
                <input
                  value={settings.popupOfferText || ""}
                  onChange={(e) => setSettings({ ...settings, popupOfferText: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                  placeholder="e.g. Use code WELCOME50 to unlock 50% discount."
                />
              </div>
            </div>

            {/* Newsletter popup toggle */}
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none border-t border-gold/5 pt-4">
              <input
                type="checkbox"
                checked={settings.showNewsletterPopup}
                onChange={(e) => setSettings({ ...settings, showNewsletterPopup: e.target.checked })}
                className="accent-gold h-4 w-4 rounded border-gold/30 bg-noir text-gold"
              />
              <span className="font-semibold">Display newsletter subscriber popups on user visit</span>
            </label>

            {/* COD & Shipping Settings */}
            <div className="space-y-4 border-t border-gold/5 pt-6 text-cream">
              <div className="flex items-center gap-2 text-gold border-b border-gold/10 pb-3">
                <Truck size={18} />
                <h2 className="text-lg font-serif font-semibold">COD & Shipping Settings</h2>
              </div>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.codEnabled ?? true}
                  onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                  className="accent-gold h-4 w-4 rounded border-gold/30 bg-noir text-gold"
                />
                <span className="font-semibold">Enable Cash on Delivery (COD)</span>
              </label>

              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">COD Risk Warning / Safety Message</label>
                <input
                  value={settings.codRiskWarningText || ""}
                  onChange={(e) => setSettings({ ...settings, codRiskWarningText: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                  placeholder="e.g. Cash on Delivery orders may be verified by phone or WhatsApp before shipping."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Shipping Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.shippingFee ?? 79}
                    onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value ? Number(e.target.value) : 0 })}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50 font-mono"
                    placeholder="e.g. 79"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Free Shipping Threshold (₹) (Optional)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold ?? ""}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50 font-mono"
                    placeholder="e.g. 999 (leave empty to disable free shipping)"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gold px-6 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2"
          >
            {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
            Save Announcement Settings
          </button>
        </form>
      )}
    </div>
  );
}
