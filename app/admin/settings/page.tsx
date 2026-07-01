"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getSiteSettings, saveSiteSettings } from "@/lib/firestore";
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
          brandName: "Anti Tarnish Jewels",
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
                    {/* Placeholder upload button since logo image not in schema */}
                    <Button variant="outline" type="button" disabled className="h-9 rounded-xl text-xs"><Store className="h-3.5 w-3.5 mr-2" />Upload Logo (Pro)</Button>
                  </div>
                  
                  <Field label="Store Name">
                    <Input 
                      value={settings.brandName || ""}
                      onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                      required
                      className="bg-card/40"
                    />
                  </Field>
                  
                  <Field label="Logo Initial/Text" hint="Used when logo image is not present">
                    <Input 
                      value={settings.logoText || ""}
                      onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                      maxLength={4}
                      className="bg-card/40"
                    />
                  </Field>

                  <Field label="Currency">
                    <select disabled className="w-full h-10 rounded-xl border border-input bg-card/60 px-3 text-sm opacity-70 cursor-not-allowed">
                      <option>₹ INR — Indian Rupee</option>
                      <option>$ USD</option>
                    </select>
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

              <AdminCard title="Social Links (Upcoming Feature)">
                <div className="space-y-4 opacity-70 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><LinkIcon className="h-4 w-4" /></div>
                    <Input disabled defaultValue="@antitarnishjewels" className="bg-card/40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><LinkIcon className="h-4 w-4" /></div>
                    <Input disabled defaultValue="facebook.com/atjewels" className="bg-card/40" />
                  </div>
                </div>
              </AdminCard>

              <AdminCard title="Admin Profile">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-secondary/30">
                    <div className="h-10 w-10 rounded-full bg-secondary grid place-items-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Admin Access</p>
                      <p className="text-xs text-muted-foreground">Manage user profile from Users tab</p>
                    </div>
                  </div>
                </div>
              </AdminCard>
            </div>
          )}
        </form>
      </div>
    </Protected>
  );
}
