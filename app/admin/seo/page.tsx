"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getSEOSettings, saveSEOSettings, uploadImage } from "@/lib/firestore";
import { SEOSettings } from "@/types";
import { Save, Upload, Image as ImageIcon } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { AdminCard } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function SEOPage() {
  const [seo, setSeo] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ogFile, setOgFile] = useState<File | null>(null);

  useEffect(() => {
    loadSEOSettings();
  }, []);

  async function loadSEOSettings() {
    setLoading(true);
    try {
      const data = await getSEOSettings();
      setSeo(data);
    } catch (err: any) {
      console.error("SEO Settings fetch error:", err);
      toast.error("Failed to fetch SEO settings. " + (err.message || ""));
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!seo) return;

    setSaving(true);
    try {
      let ogImage = seo.ogImage || "";
      if (ogFile) {
        ogImage = await uploadImage(ogFile);
      }

      const payload = {
        ...seo,
        ogImage
      };

      await saveSEOSettings(payload);
      setSeo(payload);
      setOgFile(null);
      toast.success("SEO configurations updated successfully!");
    } catch {
      toast.error("Failed to save SEO settings.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Protected adminOnly>
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
          <HeartLoader text="Loading SEO metrics..." />
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
              <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">SEO Settings</h1>
              <p className="text-muted-foreground mt-1">Optimize for search engines and social shares</p>
            </div>
            <Button 
              type="submit" 
              disabled={saving}
              className="rounded-full shadow-sm"
              style={{ background: "var(--gradient-rose)", color: "white" }}
            >
              {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save SEO Settings</>}
            </Button>
          </div>

          {seo && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AdminCard title="Homepage SEO">
                  <div className="space-y-5">
                    <Field label="Meta Title" hint="50–60 chars recommended">
                      <Input 
                        value={seo.homepageTitle || ""}
                        onChange={(e) => setSeo({ ...seo, homepageTitle: e.target.value })}
                        required
                        className="bg-card/40"
                      />
                    </Field>
                    <Field label="Meta Description" hint="150–160 chars">
                      <Textarea 
                        rows={3} 
                        value={seo.homepageDescription || ""}
                        onChange={(e) => setSeo({ ...seo, homepageDescription: e.target.value })}
                        required
                        className="bg-card/40 resize-none"
                      />
                    </Field>
                    <Field label="Social Sharing Text" hint="Text displayed when users share links on WhatsApp/Facebook.">
                      <Input 
                        value={seo.socialText || ""}
                        onChange={(e) => setSeo({ ...seo, socialText: e.target.value })}
                        className="bg-card/40"
                      />
                    </Field>
                  </div>
                </AdminCard>

                <AdminCard title="Product Pages Template">
                  <div className="space-y-4">
                    <Field label="Title Pattern" hint="Use '%s' as a placeholder for the product name.">
                      <Input 
                        value={seo.productTitleTemplate || ""}
                        onChange={(e) => setSeo({ ...seo, productTitleTemplate: e.target.value })}
                        required
                        className="bg-card/40"
                      />
                    </Field>
                  </div>
                </AdminCard>

                <AdminCard title="Category Pages Template">
                  <div className="space-y-4">
                    <Field label="Title Pattern" hint="Use '%s' as a placeholder for the category name.">
                      <Input 
                        value={seo.categoryTitleTemplate || ""}
                        onChange={(e) => setSeo({ ...seo, categoryTitleTemplate: e.target.value })}
                        required
                        className="bg-card/40"
                      />
                    </Field>
                  </div>
                </AdminCard>
              </div>

              <div className="space-y-6">
                <AdminCard title="Social Preview">
                  <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">
                    {seo.ogImage || ogFile ? (
                      <div className="aspect-[1.91/1] relative bg-secondary/50">
                        <img 
                          src={ogFile ? URL.createObjectURL(ogFile) : seo.ogImage} 
                          alt="OG Social Preview" 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                    ) : (
                      <div className="aspect-[1.91/1] grid place-items-center text-white" style={{ background: "var(--gradient-rose)" }}>
                        <span className="font-display text-2xl drop-shadow-md tracking-tight">{seo.homepageTitle || "Anti Tarnish Jewels"}</span>
                      </div>
                    )}
                    
                    <div className="p-4 bg-card">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">antitarnishjewels.com</p>
                      <p className="text-sm font-semibold mt-1 leading-tight text-foreground line-clamp-1">{seo.homepageTitle || "Your Website Title"}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{seo.homepageDescription || "Your website description will appear here..."}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">OpenGraph Preview Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={seo.ogImage || ""}
                        onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                        className="flex-1 bg-card/40 text-xs"
                        placeholder="Image URL link"
                      />
                      <Label className="inline-flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 px-4 py-2 text-xs font-semibold text-foreground cursor-pointer transition-colors border border-border/60">
                        <Upload className="mr-2 h-3.5 w-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setOgFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </Label>
                    </div>
                    {ogFile && <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1.5 mt-2"><ImageIcon className="h-3 w-3" /> Pending: {ogFile.name}</p>}
                  </div>
                </AdminCard>
              </div>
            </div>
          )}
        </form>
      </div>
    </Protected>
  );
}
