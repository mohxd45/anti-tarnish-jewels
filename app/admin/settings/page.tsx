"use client";
import { useAuth } from "@/context/AuthContext";


import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getSiteSettings, saveSiteSettings , logActivity } from "@/lib/firestore";
import { SiteSettings } from "@/types";
import { Save, Store, Link as LinkIcon, User } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { AdminCard } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      // Initialize with empty defaults if not present
      if (!data) {
        setSettings({
          brandName: "LONA JEWELS",
          logoText: "A",
          darkMode: true,
        });
      } else {
        setSettings(data);
      }
    } catch {
      toast.error("Failed to load system settings.");
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await saveSiteSettings(settings);
      if (user) {
        await logActivity({
          actorUid: user.uid,
          actorEmail: user.email || "Unknown",
          actorName: user.displayName || user.email || "Unknown",
          actorRole: (user as any).role || "staff",
          action: "update_settings",
          documentChanged: "global",
          section: "settings",
          newValue: "Updated site settings"
        });
      }
      toast.success("System settings updated successfully!");
    } catch {
      toast.error("Failed to save settings.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Protected adminOnly>
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
          <HeartLoader text="Loading settings..." />
        </div>
      </Protected>
    );
  }

  return (
    <Protected adminOnly>
      <div className="space-y-6 animate-in fade-in duration-500">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">System Settings</h1>
              <p className="text-muted-foreground mt-1">Store profile, preferences, and identity</p>
            </div>
            <Button 
              type="submit" 
              disabled={saving}
              className="rounded-full shadow-sm"
              style={{ background: "var(--gradient-rose)", color: "white" }}
            >
              {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save settings</>}
            </Button>
          </div>

          {settings && (
            <div className="grid lg:grid-cols-2 gap-6">
              <AdminCard title="Store Identity">
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl grid place-items-center text-white shadow-sm" style={{ background: "var(--gradient-rose)" }}>
                      <span className="font-display text-2xl">{settings.logoText || (settings.brandName || "A").charAt(0)}</span>
                    </div>
                  </div>
                  
                  <Field label="Brand Name">
                    <Input 
                      value={settings.brandName || ""}
                      onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                      required
                      className="bg-card/40"
                    />
                  </Field>
                  
                  <Field label="Subtitle / Tagline">
                    <Input 
                      value={settings.subtitle || ""}
                      onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                      className="bg-card/40"
                      placeholder="e.g. Elegant Anti-Tarnish Jewelry"
                    />
                  </Field>

                  <Field label="Logo Initial/Text" hint="Used as logo fallback">
                    <Input 
                      value={settings.logoText || ""}
                      onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                      maxLength={4}
                      className="bg-card/40"
                    />
                  </Field>
                  
                  <Field label="Trust Badge Text">
                    <Input 
                      value={settings.trustBadgeText || ""}
                      onChange={(e) => setSettings({ ...settings, trustBadgeText: e.target.value })}
                      placeholder="e.g. Verified quality"
                      className="bg-card/40"
                    />
                  </Field>
                </div>
              </AdminCard>

              <AdminCard title="Contact & Socials">
                <div className="space-y-5">
                  <Field label="WhatsApp Number">
                    <Input 
                      value={settings.whatsAppNumber || ""}
                      onChange={(e) => setSettings({ ...settings, whatsAppNumber: e.target.value })}
                      placeholder="+91..."
                      className="bg-card/40"
                    />
                  </Field>
                  
                  <Field label="Email Address">
                    <Input 
                      type="email"
                      value={settings.email || ""}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="bg-card/40"
                    />
                  </Field>
                  
                  <Field label="Business Address">
                    <Input 
                      value={settings.businessAddress || ""}
                      onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                      className="bg-card/40"
                    />
                  </Field>
                  
                  <Field label="Instagram URL">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><LinkIcon className="h-4 w-4" /></div>
                      <Input 
                        value={settings.socialLinks?.instagram || ""}
                        onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                        placeholder="https://instagram.com/..."
                        className="bg-card/40"
                      />
                    </div>
                  </Field>
                </div>
              </AdminCard>

              <AdminCard title="Store Policies & Delivery">
                <div className="space-y-5">
                  <Field label="Free Delivery Threshold (₹)">
                    <Input 
                      type="number"
                      value={settings.freeDeliveryAmount || ""}
                      onChange={(e) => setSettings({ ...settings, freeDeliveryAmount: Number(e.target.value) })}
                      placeholder="999"
                      className="bg-card/40"
                    />
                  </Field>

                  <Field label="Standard Delivery Fee (₹)">
                    <Input 
                      type="number"
                      value={settings.deliveryFee || ""}
                      onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                      placeholder="100"
                      className="bg-card/40"
                    />
                  </Field>

                  <Field label="Delivery Info Text (Footer)">
                    <Input 
                      value={settings.deliveryText || ""}
                      onChange={(e) => setSettings({ ...settings, deliveryText: e.target.value })}
                      placeholder="Free delivery on prepaid orders"
                      className="bg-card/40"
                    />
                  </Field>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="codEnabled" 
                      checked={settings.codEnabled !== false}
                      onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-600"
                    />
                    <label htmlFor="codEnabled" className="text-sm font-medium text-pink-900">
                      Enable Cash on Delivery (COD)
                    </label>
                  </div>

                  <Field label="COD Risk/Warning Text">
                    <Input 
                      value={settings.codText || ""}
                      onChange={(e) => setSettings({ ...settings, codText: e.target.value })}
                      placeholder="COD is available. Please keep exact change."
                      className="bg-card/40"
                    />
                  </Field>
                  
                  <Field label="Checkout Note">
                    <Input 
                      value={settings.checkoutNote || ""}
                      onChange={(e) => setSettings({ ...settings, checkoutNote: e.target.value })}
                      placeholder="All orders are final."
                      className="bg-card/40"
                    />
                  </Field>
                </div>
              </AdminCard>

              <AdminCard title="Appearance Preferences">
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" disabled className="rounded-xl p-4 text-sm font-medium text-center ring-1 ring-border opacity-70 cursor-not-allowed" style={{ background: "var(--gradient-rose)", color: "white" }}>
                      Rose
                    </button>
                    <button type="button" disabled className="rounded-xl p-4 text-sm font-medium text-center ring-1 ring-border opacity-70 cursor-not-allowed" style={{ background: "var(--gradient-gold)", color: "white" }}>
                      Gold
                    </button>
                    <button type="button" disabled className="rounded-xl p-4 text-sm font-medium text-center ring-1 ring-border opacity-70 cursor-not-allowed" style={{ background: "var(--noir)", color: "var(--cream)" }}>
                      Noir
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Theme color selection is currently locked to default styling.</p>
                </div>
              </AdminCard>
            </div>
          )}
        </form>
      </div>
    </Protected>
  );
}
