"use client";
import { useAuth } from "@/context/AuthContext";


import { useEffect, useState } from "react";
import { getSiteContent, saveSiteContent , logActivity } from "@/lib/firestore";
import { SiteContent } from "@/types";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/Bits";

type TabId = "home" | "about" | "faq" | "policies";

export default function SiteContentPage() {
  const { user } = useAuth();
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
      <div className="flex h-[50vh] items-center justify-center text-adminMuted">
        <HeartLoader text="Loading content data..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-sm border text-sm transition-all ${
          toast.type === "success" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-serif font-semibold text-adminSidebar tracking-tight">Website Content Copy</h1>
        <p className="text-adminMuted mt-1">Manage global website headings, customer statements, FAQs, and policies.</p>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-adminBorder pb-2 gap-6 text-sm font-medium uppercase tracking-wider overflow-x-auto">
        {[
          { id: "home", label: "Homepage Hero & Footer" },
          { id: "about", label: "About Copy" },
          { id: "faq", label: "FAQ Copy" },
          { id: "policies", label: "Policies Copy" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "text-adminSidebar border-adminGold" 
                : "text-adminMuted border-transparent hover:text-adminSidebar"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forms Area */}
      <div className="max-w-4xl">
        {/* HOMEPAGE TABS */}
        {activeTab === "home" && (
          <AdminCard title="Homepage Copy" className="bg-white border-adminBorder shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Hero Small Title (Above Main)</label>
                <input
                  value={form.heroSmallTitle || ""}
                  onChange={(e) => setForm({ ...form, heroSmallTitle: e.target.value })}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-2.5 outline-none text-adminSidebar"
                  placeholder="e.g. Timeless Elegance"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Homepage Main Heading (H1)</label>
                <input
                  value={form.heroMainHeading || form.heroTitle || ""}
                  onChange={(e) => setForm({ ...form, heroMainHeading: e.target.value, heroTitle: e.target.value })}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-2.5 outline-none text-adminSidebar"
                  placeholder="e.g. Next-Gen Tech & Premium Devices"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Homepage Hero Subtitle</label>
                <textarea
                  value={form.heroSubtitle || ""}
                  onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-2.5 outline-none text-adminSidebar resize-none"
                  placeholder="Brief introduction displayed on the banner."
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Hero Button CTA text</label>
                  <input
                    value={form.heroCtaText || ""}
                    onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
                    className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-2.5 outline-none text-adminSidebar"
                    placeholder="e.g. Shop Now"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Hero Button CTA Link</label>
                  <input
                    value={form.heroCtaLink || ""}
                    onChange={(e) => setForm({ ...form, heroCtaLink: e.target.value })}
                    className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-2.5 outline-none text-adminSidebar"
                    placeholder="e.g. /shop"
                  />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Promotional Section text</label>
                  <input
                    value={form.promotionalText || ""}
                    onChange={(e) => setForm({ ...form, promotionalText: e.target.value })}
                    className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-2.5 outline-none text-adminSidebar"
                    placeholder="Additional subtext for sales banner panels"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Footer Description copy</label>
                <textarea
                  value={form.footerText || ""}
                  onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-2.5 outline-none text-adminSidebar resize-none"
                  placeholder="About wording displayed in the bottom footer row."
                />
              </div>

              <div className="pt-4 border-t border-adminBorder flex justify-end">
                <Button
                  onClick={() => handleSave("home", ["heroSmallTitle", "heroTitle", "heroMainHeading", "heroSubtitle", "heroCtaText", "heroCtaLink", "promotionalText", "footerText"])}
                  disabled={saving}
                  className="rounded-full bg-adminRose text-white hover:bg-adminRose/90 border-none shadow-sm"
                >
                  {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save Homepage Copy</>}
                </Button>
              </div>
            </div>
          </AdminCard>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <AdminCard title="About Page Copy" className="bg-white border-adminBorder shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">About Page main text</label>
                <textarea
                  value={form.aboutText || ""}
                  onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                  rows={12}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-3 outline-none text-adminSidebar leading-7 resize-y"
                  placeholder="Write about your company history, values, and shipping guarantees..."
                />
              </div>

              <div className="pt-4 border-t border-adminBorder flex justify-end">
                <Button
                  onClick={() => handleSave("about", ["aboutText"])}
                  disabled={saving}
                  className="rounded-full bg-adminRose text-white hover:bg-adminRose/90 border-none shadow-sm"
                >
                  {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save About Copy</>}
                </Button>
              </div>
            </div>
          </AdminCard>
        )}

        {/* FAQ TAB */}
        {activeTab === "faq" && (
          <AdminCard title="FAQ Page Copy" className="bg-white border-adminBorder shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">FAQ Page Introductory Description</label>
                <textarea
                  value={form.faqText || ""}
                  onChange={(e) => setForm({ ...form, faqText: e.target.value })}
                  rows={8}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-3 outline-none text-adminSidebar leading-7 resize-y"
                  placeholder="Intro text before the questions accordion..."
                />
              </div>

              <div className="pt-4 border-t border-adminBorder flex justify-end">
                <Button
                  onClick={() => handleSave("faq", ["faqText"])}
                  disabled={saving}
                  className="rounded-full bg-adminRose text-white hover:bg-adminRose/90 border-none shadow-sm"
                >
                  {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save FAQ Content</>}
                </Button>
              </div>
            </div>
          </AdminCard>
        )}

        {/* POLICIES TAB */}
        {activeTab === "policies" && (
          <AdminCard title="Policies Copy" className="bg-white border-adminBorder shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Return & Refund Policy Description</label>
                <textarea
                  value={form.returnPolicyText || ""}
                  onChange={(e) => setForm({ ...form, returnPolicyText: e.target.value })}
                  rows={8}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-3 outline-none text-adminSidebar leading-7 resize-y"
                  placeholder="Details about shipping thresholds, dynamic exceptions, packaging bounds..."
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold block mb-2">Privacy Policy Description</label>
                <textarea
                  value={form.privacyPolicyText || ""}
                  onChange={(e) => setForm({ ...form, privacyPolicyText: e.target.value })}
                  rows={8}
                  className="w-full rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-4 py-3 outline-none text-adminSidebar leading-7 resize-y"
                  placeholder="Details about customer profiles and personal information processing..."
                />
              </div>

              <div className="pt-4 border-t border-adminBorder flex justify-end">
                <Button
                  onClick={() => handleSave("policies", ["returnPolicyText", "privacyPolicyText"])}
                  disabled={saving}
                  className="rounded-full bg-adminRose text-white hover:bg-adminRose/90 border-none shadow-sm"
                >
                  {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save Policies Copy</>}
                </Button>
              </div>
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
