"use client";

import { useEffect, useState } from "react";
import { getCoupons, addCoupon, updateCoupon, deleteCoupon } from "@/lib/firestore";
import { Coupon } from "@/types";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit2, Plus, Search, Ticket, X, Save } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { HeartLoader } from "@/components/ui/HeartLoader";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</Label>
      {children}
    </div>
  );
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Editing State
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"fixed" | "percentage">("percentage");
  const [value, setValue] = useState(0);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<number>(0);
  const [maximumDiscount, setMaximumDiscount] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState<number>(0);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch {
      toast.error("Failed to load coupons");
    }
    setLoading(false);
  }

  async function handleToggleActive(coupon: Coupon) {
    const updatedStatus = !coupon.active;
    try {
      await updateCoupon(coupon.id, { active: updatedStatus });
      setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, active: updatedStatus } : c)));
      if (editingCoupon && editingCoupon.id === coupon.id) {
        setEditingCoupon({ ...editingCoupon, active: updatedStatus });
      }
      toast.success("Coupon status updated.");
    } catch (err: any) {
      console.error(err);
      toast.error("Error updating status.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setDeletingId(id);
    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
      if (editingCoupon && editingCoupon.id === id) {
        handleCancelEdit();
      }
      toast.success("Coupon deleted successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error("Error deleting coupon.");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreate() {
    setEditingCoupon(null);
    setCode("");
    setType("percentage");
    setValue(0);
    setMinimumOrderAmount(0);
    setMaximumDiscount(0);
    setStartDate("");
    setExpiryDate("");
    setUsageLimit(0);
    setEditorOpen(true);
  }

  function handleEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    const mappedType = coupon.type === "percent" || coupon.type === "percentage" ? "percentage" : "fixed";
    setType(mappedType);
    setValue(coupon.value);
    setMinimumOrderAmount(coupon.minimumOrderAmount ?? coupon.minOrderValue ?? 0);
    setMaximumDiscount(coupon.maximumDiscount ?? 0);
    setStartDate(coupon.startDate || "");
    setExpiryDate(coupon.expiryDate || "");
    setUsageLimit(coupon.usageLimit || 0);
    setEditorOpen(true);
  }

  function handleCancelEdit() {
    setEditingCoupon(null);
    setEditorOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || value <= 0) {
      toast.error("Please enter a valid code and value.");
      return;
    }

    const uppercaseCode = code.toUpperCase().replace(/\s+/g, "");
    
    const isDuplicate = coupons.some(
      (c) => c.code === uppercaseCode && (!editingCoupon || c.id !== editingCoupon.id)
    );
    if (isDuplicate) {
      toast.error("Coupon code already exists.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    
    const couponData: Partial<Coupon> = {
      code: uppercaseCode,
      type,
      value: Number(value),
      updatedAt: now
    };
    
    if (minimumOrderAmount > 0) {
      couponData.minimumOrderAmount = Number(minimumOrderAmount);
      couponData.minOrderValue = Number(minimumOrderAmount);
    } else {
      couponData.minimumOrderAmount = 0;
      couponData.minOrderValue = 0;
    }
    if (maximumDiscount > 0) {
      couponData.maximumDiscount = Number(maximumDiscount);
    } else {
      couponData.maximumDiscount = 0;
    }
    
    couponData.startDate = startDate || "";
    couponData.expiryDate = expiryDate || "";
    couponData.usageLimit = usageLimit > 0 ? Number(usageLimit) : 0;

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
        setCoupons(
          coupons.map((c) =>
            c.id === editingCoupon.id ? { ...c, ...couponData } : c
          )
        );
        toast.success("Coupon updated successfully!");
        handleCancelEdit();
      } else {
        const newCouponData: Partial<Coupon> = {
          ...couponData,
          active: true,
          usedCount: 0,
          usageCount: 0,
          createdAt: now,
          updatedAt: now
        };

        const res = await addCoupon(newCouponData as Omit<Coupon, "id">);
        setCoupons([...coupons, { ...(newCouponData as Omit<Coupon, "id">), id: res.id }]);
        
        toast.success("Coupon added successfully!");
        handleCancelEdit();
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error saving coupon.");
    }
    
    setSaving(false);
  }

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Discount Coupons</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search codes…"
              className="pl-9 w-48 bg-card/60 rounded-full text-xs"
            />
          </div>
          <Button onClick={openCreate} className="bg-[var(--gradient-rose)] text-white hover:opacity-90 border-none shrink-0 w-fit rounded-full">
            <Plus className="h-4 w-4 mr-1" /> New Coupon
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-muted-foreground">
          <HeartLoader text="Loading coupons..." />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <AdminCard className="p-12 text-center shadow-sm">
          <h3 className="text-xl font-display text-foreground">No Coupons Found</h3>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or add a new coupon.</p>
        </AdminCard>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {filteredCoupons.map((c) => {
            const used = c.usedCount ?? c.usageCount ?? 0;
            const limit = c.usageLimit || 0;
            const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
            
            return (
              <div key={c.id} className="glass-card p-5 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/60 transition-colors shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      <span className="font-mono text-lg font-semibold tracking-wider text-foreground">{c.code}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.expiryDate ? `Expires ${new Date(c.expiryDate).toLocaleDateString()}` : "No Expiry"}
                    </p>
                  </div>
                  <button onClick={() => handleToggleActive(c)}>
                    <StatusBadge status={c.active ? "Active" : "Inactive"} />
                  </button>
                </div>

                <div className="rounded-lg p-3 text-white text-center mt-2 shadow-sm" style={{ background: "var(--gradient-rose)" }}>
                  <p className="text-[10px] uppercase tracking-widest opacity-80">{c.type === "percentage" || c.type === "percent" ? "Percentage" : "Fixed Amount"}</p>
                  <p className="font-display text-2xl font-semibold mt-1">
                    {c.type === "percentage" || c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                  </p>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="tabular-nums font-medium text-foreground">{used.toLocaleString("en-IN")} {limit > 0 ? ` / ${limit.toLocaleString("en-IN")}` : " Used"}</span>
                  </div>
                  {limit > 0 && (
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: "var(--gradient-gold)" }} />
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-auto pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(c)} className="flex-1 rounded-xl h-8 text-xs">
                    <Edit2 className="h-3 w-3 mr-1" />Edit
                  </Button>
                  <Button size="icon" variant="ghost" disabled={deletingId === c.id} onClick={() => handleDelete(c.id)} className="h-8 w-8 rounded-xl text-dustyRose hover:text-dustyRose hover:bg-dustyRose/10">
                    {deletingId === c.id ? <HeartLoader size="sm" text="" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal Drawer */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end animate-in fade-in">
          <div className="fixed inset-0" onClick={handleCancelEdit} />
          <aside className="relative h-full w-[400px] max-w-[100vw] border-l border-border/60 bg-[var(--background)] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right">
            
            <div className="flex justify-between items-center border-b border-border/60 p-5 bg-card/40 backdrop-blur-sm">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Promotion Configurator</span>
                <h3 className="text-xl font-display font-semibold text-foreground mt-1">
                  {editingCoupon ? `Edit: ${editingCoupon.code}` : "New Coupon"}
                </h3>
              </div>
              <button type="button" onClick={handleCancelEdit} className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">
              <form id="coupon-form" onSubmit={handleSubmit} className="space-y-5">
                
                <Field label="Coupon Code">
                  <Input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    className="rounded-xl uppercase font-mono tracking-widest"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Discount Type">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "fixed" | "percentage")}
                      className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </Field>

                  <Field label="Value">
                    <Input
                      type="number"
                      required
                      min={1}
                      value={value || ""}
                      onChange={(e) => setValue(Number(e.target.value))}
                      placeholder={type === "percentage" ? "10" : "500"}
                      className="rounded-xl"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min Spend (₹)">
                    <Input
                      type="number"
                      value={minimumOrderAmount || ""}
                      onChange={(e) => setMinimumOrderAmount(Number(e.target.value))}
                      placeholder="e.g. 999"
                      min={0}
                      className="rounded-xl"
                    />
                  </Field>

                  <Field label="Max Discount (₹)">
                    <Input
                      type="number"
                      value={maximumDiscount || ""}
                      onChange={(e) => setMaximumDiscount(Number(e.target.value))}
                      placeholder="e.g. 500"
                      min={0}
                      className="rounded-xl"
                      disabled={type === "fixed"}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl"
                    />
                  </Field>

                  <Field label="Expiry Date">
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="rounded-xl"
                    />
                  </Field>
                </div>

                <Field label="Usage Limit (0 = Unlimited)">
                  <Input
                    type="number"
                    value={usageLimit || ""}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    placeholder="e.g. 100"
                    min={0}
                    className="rounded-xl"
                  />
                </Field>

                {editingCoupon && (
                  <div className="pt-2">
                    <label className="flex items-center gap-3 text-sm cursor-pointer select-none border border-border/60 bg-card/40 p-3 rounded-xl hover:bg-card/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!editingCoupon.active}
                        onChange={(e) => handleToggleActive(editingCoupon)}
                        className="accent-primary h-4 w-4 rounded border-border text-primary"
                      />
                      <div>
                        <div className="font-medium">Active Status</div>
                        <div className="text-[10px] text-muted-foreground">Customers can apply this code</div>
                      </div>
                    </label>
                  </div>
                )}

              </form>
            </div>

            <div className="border-t border-border/60 p-5 bg-card/40 backdrop-blur-sm flex justify-end gap-3 mt-auto">
              <Button variant="outline" onClick={handleCancelEdit} className="rounded-full">Cancel</Button>
              <Button form="coupon-form" type="submit" disabled={saving} className="rounded-full bg-[var(--gradient-rose)] text-white hover:opacity-90 border-none min-w-[120px]">
                {saving ? <HeartLoader size="sm" text="" /> : <><Save className="h-4 w-4 mr-1" /> {editingCoupon ? "Save Changes" : "Create Coupon"}</>}
              </Button>
            </div>
            
          </aside>
        </div>
      )}
    </div>
  );
}
