"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, saveSiteSettings } from "@/lib/firestore";
import { SiteSettings } from "@/types";
import { Save, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { PageLoader } from "@/components/ui/PageLoader";
import { LoadingButton } from "@/components/ui/LoadingButton";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch {
      showToast("error", "Failed to load system settings.");
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
      await saveSiteSettings(settings);
      showToast("success", "System settings updated successfully!");
    } catch {
      showToast("error", "Failed to save settings.");
    }
    setSaving(false);
  }

  if (loading) {
    return <PageLoader text="Loading settings..." />;
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
        <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">System Settings</h1>
        <p className="text-sm text-cream/55 mt-1">Configure default marketplace currencies, checkout bounds, and store states.</p>
      </div>

      {settings && (
        <form onSubmit={handleSave} className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-6 md:p-8 shadow-jewel space-y-6">
          <div className="flex items-center gap-2 text-gold border-b border-gold/10 pb-3">
            <Settings size={18} />
            <h2 className="text-lg font-serif font-semibold">Store Parameters</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Currency */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Standard Currency Symbol</label>
              <select className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream cursor-pointer">
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
              </select>
            </div>

            {/* Platform status */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Marketplace State</label>
              <select className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream cursor-pointer">
                <option value="live">Live (Processing checkouts)</option>
                <option value="maintenance">Maintenance mode</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gold/15">
            <LoadingButton
              type="submit"
              loading={saving}
              loadingText="Saving..."
              className="rounded-full bg-gold px-6 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2 shadow-jewel"
            >
              <Save size={16} />
              Save System Configurations
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}
