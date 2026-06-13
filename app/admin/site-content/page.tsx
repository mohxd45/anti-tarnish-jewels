"use client";

import { useEffect, useState } from "react";
import { getSiteContent, saveSiteContent } from "@/lib/firestore";
import { SiteContent } from "@/types";
import { Save, AlertCircle, CheckCircle, Loader } from "lucide-react";

type TabId = "home" | "about" | "faq" | "policies";

export default function SiteContentPage() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [form, setForm] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const homeContent = await getSiteContent("home");
        const aboutContent = await getSiteContent("about");
        const faqContent = await getSiteContent("faq");
        const policiesContent = await getSiteContent("policies");
        
        setForm({
          ...homeContent,
          ...aboutContent,
          ...faqContent,
          ...policiesContent
        });
      } catch (err) {
        showToast("error", "Failed to fetch content copy.");
      }
      setLoading(false);
    }
    loadContent();
  }, []);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave(tabId: TabId, keys: (keyof SiteContent)[]) {
    setSaving(true);
    try {
      const dataToSave: Record<string, string> = {};
      keys.forEach((key) => {
        if (form[key] !== undefined) {
          dataToSave[key] = form[key] as string;
        }
      });
      await saveSiteContent(tabId, dataToSave);
      showToast("success", `Content updated for ${tabId} successfully!`);
    } catch (err) {
      showToast("error", "Failed to save contents.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gold">
        <Loader className="animate-spin" size={32} />
        <span className="ml-2 font-medium">Loading content data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
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
        <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Website Content copy</h1>
        <p className="text-sm text-cream/55 mt-1">Manage global website headings, customer statements, FAQs, and policies.</p>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-gold/15 pb-2 gap-6 text-sm font-medium uppercase tracking-wider">
        {[
          { id: "home", label: "Homepage Hero & Footer" },
          { id: "about", label: "About Copy" },
          { id: "faq", label: "FAQ Copy" },
          { id: "policies", label: "Policies Copy" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === tab.id 
                ? "text-gold border-gold" 
                : "text-cream/40 border-transparent hover:text-cream/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forms Area */}
      <div className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-6 md:p-8 shadow-jewel">
        {/* HOMEPAGE TABS */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Homepage Hero Title</label>
              <input
                value={form.heroTitle || ""}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                className="w-full rounded-full border border-gold/20 bg-noir px-5 py-3 outline-none text-cream"
                placeholder="e.g. Next-Gen Tech & Premium Devices"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Homepage Hero Subtitle</label>
              <textarea
                value={form.heroSubtitle || ""}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                rows={3}
                className="w-full rounded-3xl border border-gold/20 bg-noir px-5 py-3.5 outline-none text-cream"
                placeholder="Brief introduction displayed on the banner."
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Hero Button CTA text</label>
                <input
                  value={form.heroCtaText || ""}
                  onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-5 py-3 outline-none text-cream"
                  placeholder="e.g. Shop Electronics"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Promotional Section text</label>
                <input
                  value={form.promotionalText || ""}
                  onChange={(e) => setForm({ ...form, promotionalText: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-5 py-3 outline-none text-cream"
                  placeholder="Additional subtext for sales banner panels"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Footer Description copy</label>
              <textarea
                value={form.footerText || ""}
                onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                rows={2}
                className="w-full rounded-3xl border border-gold/20 bg-noir px-5 py-3.5 outline-none text-cream"
                placeholder="About wording displayed in the bottom footer row."
              />
            </div>

            <button
              onClick={() => handleSave("home", ["heroTitle", "heroSubtitle", "heroCtaText", "promotionalText", "footerText"])}
              disabled={saving}
              className="rounded-full bg-gold px-6 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              Save Homepage Copy
            </button>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">About Page main text</label>
              <textarea
                value={form.aboutText || ""}
                onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                rows={8}
                className="w-full rounded-3xl border border-gold/20 bg-noir px-5 py-4 outline-none text-cream leading-7"
                placeholder="Write about your company history, values, and shipping guarantees..."
              />
            </div>

            <button
              onClick={() => handleSave("about", ["aboutText"])}
              disabled={saving}
              className="rounded-full bg-gold px-6 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              Save About copy
            </button>
          </div>
        )}

        {/* FAQ TAB */}
        {activeTab === "faq" && (
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">FAQ Page Introductory Description</label>
              <textarea
                value={form.faqText || ""}
                onChange={(e) => setForm({ ...form, faqText: e.target.value })}
                rows={6}
                className="w-full rounded-3xl border border-gold/20 bg-noir px-5 py-4 outline-none text-cream leading-7"
                placeholder="Intro text before the questions accordion..."
              />
            </div>

            <button
              onClick={() => handleSave("faq", ["faqText"])}
              disabled={saving}
              className="rounded-full bg-gold px-6 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              Save FAQ Content
            </button>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === "policies" && (
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Return & Refund Policy Description</label>
              <textarea
                value={form.returnPolicyText || ""}
                onChange={(e) => setForm({ ...form, returnPolicyText: e.target.value })}
                rows={6}
                className="w-full rounded-3xl border border-gold/20 bg-noir px-5 py-4 outline-none text-cream leading-7"
                placeholder="Details about shipping thresholds, dynamic exceptions, packaging bounds..."
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Privacy Policy Description</label>
              <textarea
                value={form.privacyPolicyText || ""}
                onChange={(e) => setForm({ ...form, privacyPolicyText: e.target.value })}
                rows={6}
                className="w-full rounded-3xl border border-gold/20 bg-noir px-5 py-4 outline-none text-cream leading-7"
                placeholder="Details about customer profiles and personal information processing..."
              />
            </div>

            <button
              onClick={() => handleSave("policies", ["returnPolicyText", "privacyPolicyText"])}
              disabled={saving}
              className="rounded-full bg-gold px-6 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              Save Policies Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
