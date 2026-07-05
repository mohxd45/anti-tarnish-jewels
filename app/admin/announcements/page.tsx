"use client";
import { useAuth } from "@/context/AuthContext";


import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { 
  getAnnouncements, saveAnnouncements, 
  getAnnouncementsList, addAnnouncement, updateAnnouncement, deleteAnnouncement 
, logActivity } from "@/lib/firestore";
import { AnnouncementSettings, Announcement } from "@/types";
import { Save, AlertCircle, Plus, Trash2, Edit2, Check, X, GripVertical } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { AdminCard } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New announcement state
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    text: "", couponCode: "", link: "", emoji: "", isActive: true, order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [data, list] = await Promise.all([
        getAnnouncements(),
        getAnnouncementsList()
      ]);
      setSettings(data || {} as AnnouncementSettings);
      setAnnouncements(Array.isArray(list) ? list.sort((a, b) => (a.order || 0) - (b.order || 0)) : []);
    } catch {
      toast.error("Failed to fetch settings.");
      setSettings({} as AnnouncementSettings);
      setAnnouncements([]);
    }
    setLoading(false);
  }

  async function handleSaveSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await saveAnnouncements(settings);
      if (user) {
        await logActivity({
          actorUid: user.uid,
          actorEmail: user.email || "Unknown",
          actorName: user.displayName || user.email || "Unknown",
          actorRole: (user as any).role || "staff",
          action: "update_announcements",
          documentChanged: "global",
          section: "announcement",
          newValue: "Updated global announcements"
        });
      }
      toast.success("Settings updated successfully!");
    } catch {
      toast.error("Failed to save settings.");
    }
    setSaving(false);
  }

  async function handleAddAnnouncement() {
    if (!newAnnouncement.text) {
      toast.error("Text is required");
      return;
    }
    try {
      const id = await addAnnouncement({
        text: newAnnouncement.text,
        couponCode: newAnnouncement.couponCode || "",
        link: newAnnouncement.link || "",
        emoji: newAnnouncement.emoji || "",
        isActive: newAnnouncement.isActive ?? true,
        order: announcements.length,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewAnnouncement({ text: "", couponCode: "", link: "", emoji: "", isActive: true, order: 0 });
      loadData();
      toast.success("Announcement added!");
    } catch {
      toast.error("Failed to add announcement");
    }
  }

  async function handleUpdateAnnouncement(id: string, updates: Partial<Announcement>) {
    try {
      await updateAnnouncement(id, updates);
      loadData();
      toast.success("Updated!");
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      loadData();
      toast.success("Deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <Protected adminOnly>
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
          <HeartLoader text="Loading..." />
        </div>
      </Protected>
    );
  }

  return (
    <Protected adminOnly>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Announcements & Support</h1>
            <p className="text-muted-foreground mt-1">Configure scrolling ticker, sales, and WhatsApp hotlines</p>
          </div>
          <Button 
            onClick={() => handleSaveSettings()} 
            disabled={saving}
            className="rounded-full shadow-sm"
            style={{ background: "var(--gradient-rose)", color: "white" }}
          >
            {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save Global Settings</>}
          </Button>
        </div>

        {settings && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              <AdminCard title="Announcement Ticker Items">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Active</p>
                      <p className="text-xs text-muted-foreground">Show top scrolling announcement bar</p>
                    </div>
                    <Switch 
                      checked={settings.showAnnouncement} 
                      onCheckedChange={(checked) => setSettings({ ...settings, showAnnouncement: checked })} 
                    />
                  </div>

                  {settings.showAnnouncement && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      
                      <div className="space-y-3">
                        {announcements.map((a, i) => (
                          <div key={a.id} className="flex items-center gap-3 p-3 bg-card/40 border border-border/50 rounded-lg">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{a.emoji} {a.text}</p>
                              <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                {a.couponCode && <span>Code: {a.couponCode}</span>}
                                {a.link && <span className="truncate">Link: {a.link}</span>}
                              </div>
                            </div>
                            <Switch 
                              checked={a.isActive} 
                              onCheckedChange={(c) => handleUpdateAnnouncement(a.id, { isActive: c })} 
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAnnouncement(a.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {isAdding ? (
                        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Text (Required)">
                              <Input 
                                value={newAnnouncement.text} 
                                onChange={e => setNewAnnouncement({...newAnnouncement, text: e.target.value})} 
                                placeholder="e.g. Free shipping on all orders!"
                              />
                            </Field>
                            <Field label="Emoji (Optional)">
                              <Input 
                                value={newAnnouncement.emoji} 
                                onChange={e => setNewAnnouncement({...newAnnouncement, emoji: e.target.value})} 
                                placeholder="e.g. ✨"
                              />
                            </Field>
                            <Field label="Coupon Code (Optional)">
                              <Input 
                                value={newAnnouncement.couponCode} 
                                onChange={e => setNewAnnouncement({...newAnnouncement, couponCode: e.target.value})} 
                                placeholder="e.g. FREESHIP"
                              />
                            </Field>
                            <Field label="Link URL (Optional)">
                              <Input 
                                value={newAnnouncement.link} 
                                onChange={e => setNewAnnouncement({...newAnnouncement, link: e.target.value})} 
                                placeholder="e.g. /shop"
                              />
                            </Field>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleAddAnnouncement}>Add Item</Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
                          <Plus className="h-4 w-4 mr-2" /> Add Announcement Item
                        </Button>
                      )}

                      <div className="pt-4 border-t border-border/40">
                        <Field label="Fallback Default Text" hint="Used if no items are active.">
                          <Input 
                            value={settings.text || ""}
                            onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                            className="bg-card/40"
                            placeholder="e.g. ✨ Welcome to Anti Tarnish Jewels!"
                          />
                        </Field>
                      </div>

                    </div>
                  )}
                </div>
              </AdminCard>

              <AdminCard title="Popups & Sales">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Newsletter Popup</p>
                      <p className="text-xs text-muted-foreground">Display newsletter subscriber popups on user visit</p>
                    </div>
                    <Switch 
                      checked={settings.showNewsletterPopup} 
                      onCheckedChange={(checked) => setSettings({ ...settings, showNewsletterPopup: checked })} 
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Popup Banner Offer title">
                      <Input 
                        value={settings.popupOfferTitle || ""}
                        onChange={(e) => setSettings({ ...settings, popupOfferTitle: e.target.value })}
                        className="bg-card/40"
                        placeholder="e.g. SPECIAL WELCOME OFFER!"
                      />
                    </Field>
                    <Field label="Popup Banner Offer Wording">
                      <Input 
                        value={settings.popupOfferText || ""}
                        onChange={(e) => setSettings({ ...settings, popupOfferText: e.target.value })}
                        className="bg-card/40"
                        placeholder="e.g. Use code WELCOME50 to unlock 50% discount."
                      />
                    </Field>
                  </div>

                  <div className="pt-2">
                    <Field label="Flash Sale Countdown Timer (Optional)" hint="Countdown timer triggers homepage ticking panels. Leave empty to disable.">
                      <Input 
                        type="datetime-local"
                        value={(() => {
                          if (!settings.countdownTimer) return "";
                          try {
                            const d = new Date(settings.countdownTimer);
                            return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 16);
                          } catch { return ""; }
                        })()}
                        onChange={(e) => {
                          let val = "";
                          if (e.target.value) {
                            try {
                              const d = new Date(e.target.value);
                              if (!isNaN(d.getTime())) val = d.toISOString();
                            } catch {}
                          }
                          setSettings({ ...settings, countdownTimer: val });
                        }}
                        className="bg-card/40 font-mono text-xs"
                      />
                    </Field>
                  </div>
                </div>
              </AdminCard>

              <AdminCard title="WhatsApp Support">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Floating Button</p>
                      <p className="text-xs text-muted-foreground">Display floating WhatsApp support button</p>
                    </div>
                    <Switch 
                      checked={settings.showWhatsAppButton ?? true} 
                      onCheckedChange={(checked) => setSettings({ ...settings, showWhatsAppButton: checked })} 
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Field label="WhatsApp Business Number" hint="Country code and phone number only (no spaces, '+').">
                        <Input 
                          value={settings.whatsAppSupport || ""}
                          onChange={(e) => setSettings({ ...settings, whatsAppSupport: e.target.value })}
                          className="bg-card/40 font-mono text-xs"
                          placeholder="e.g. 919999999999"
                        />
                      </Field>
                      {!settings.whatsAppSupport?.trim() && (
                        <div className="mt-2 text-[10px] text-dustyRose bg-dustyRose/10 border border-dustyRose/20 rounded-xl p-3 flex items-start gap-1.5 leading-snug">
                          <AlertCircle size={12} className="shrink-0 mt-0.5" />
                          <span>No WhatsApp number is configured. The button will be hidden unless a fallback is set.</span>
                        </div>
                      )}
                    </div>
                    <Field label="Default Message" hint="Message template preloaded in WhatsApp.">
                      <Input 
                        value={settings.whatsAppMessage || ""}
                        onChange={(e) => setSettings({ ...settings, whatsAppMessage: e.target.value })}
                        className="bg-card/40"
                        placeholder="e.g. Hi Anti Tarnish Jewels, I need help..."
                      />
                    </Field>
                  </div>
                </div>
              </AdminCard>

            </div>

            <div className="space-y-6">
              <AdminCard title="Preview">
                <div className="rounded-lg overflow-hidden border border-border bg-background shadow-sm">
                  {settings.showAnnouncement ? (
                    <div className="py-2 px-4 text-center text-[11px] font-medium tracking-wide text-white" style={{ background: "var(--gradient-rose)" }}>
                      {announcements.filter(a => a.isActive).length > 0 
                        ? announcements.filter(a => a.isActive)[0].text 
                        : (settings.text || "✨ Welcome to Anti Tarnish Jewels")}
                    </div>
                  ) : null}
                  <div className="bg-card/50 p-6 flex flex-col items-center justify-center border-t border-border/40 relative">
                    <p className="text-xs text-muted-foreground text-center mb-4">— public site preview —</p>
                    
                    {/* Fake WhatsApp Button */}
                    {settings.showWhatsAppButton !== false && (
                      <div className="absolute bottom-4 right-4 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      </div>
                    )}
                  </div>
                </div>
              </AdminCard>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
