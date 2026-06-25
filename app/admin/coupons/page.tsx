"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getCoupons, addCoupon, updateCoupon, deleteCoupon } from "@/lib/firestore";
import { Coupon } from "@/types";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Trash2, Edit2, Check, Plus, Calendar, Search, Ticket, CheckCircle, XCircle, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    const data = await getCoupons();
    setCoupons(data);
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
      setMessage("Coupon status updated.");
    } catch (err: any) {
      console.error("Firebase Toggle Error:", err);
      setMessage("Error updating status: " + err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setLoading(true);
    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
      if (editingCoupon && editingCoupon.id === id) {
        handleCancelEdit();
      }
      setMessage("Coupon deleted successfully.");
    } catch (err: any) {
      console.error("Firebase Delete Error:", err);
      setMessage("Error deleting coupon: " + err.message);
    }
    setLoading(false);
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
    setMessage("");
  }

  function handleCancelEdit() {
    setEditingCoupon(null);
    setCode("");
    setType("percentage");
    setValue(0);
    setMinimumOrderAmount(0);
    setMaximumDiscount(0);
    setStartDate("");
    setExpiryDate("");
    setUsageLimit(0);
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || value <= 0) {
      setMessage("Please enter a valid code and value.");
      return;
    }

    const uppercaseCode = code.toUpperCase().replace(/\s+/g, "");
    
    // Check duplicate code (excluding current editing coupon)
    const isDuplicate = coupons.some(
      (c) => c.code === uppercaseCode && (!editingCoupon || c.id !== editingCoupon.id)
    );
    if (isDuplicate) {
      setMessage("Coupon code already exists.");
      return;
    }

    setLoading(true);
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
    }
    if (maximumDiscount > 0) {
      couponData.maximumDiscount = Number(maximumDiscount);
    }
    if (startDate) couponData.startDate = startDate;
    if (expiryDate) couponData.expiryDate = expiryDate;
    if (usageLimit > 0) couponData.usageLimit = Number(usageLimit);

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
        
        setCoupons(
          coupons.map((c) =>
            c.id === editingCoupon.id
              ? { ...c, ...couponData }
              : c
          )
        );
        
        setMessage("Coupon updated successfully!");
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
        
        setCode("");
        setValue(0);
        setMinimumOrderAmount(0);
        setMaximumDiscount(0);
        setStartDate("");
        setExpiryDate("");
        setUsageLimit(0);
        setMessage("Coupon added successfully!");
      }
    } catch (err: any) {
      console.error("Firebase Save Error:", err);
      setMessage("Error saving coupon: " + err.message);
    }
    
    setLoading(false);
  }


  // Filter coupons by search query
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Protected adminOnly>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="border-b border-gold/15 pb-6 mb-8">
          <h1 className="text-4xl font-serif font-semibold text-gold tracking-wide">Discount Coupons</h1>
          <p className="text-sm text-cream/65 mt-1">Manage marketing promotions, percentage discounts, minimum spends, and usage thresholds.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1.4fr]">
          {/* Coupons List */}
          <div className="rounded-[2rem] border border-gold/15 bg-white/[0.04] p-6 h-fit space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gold/10 pb-4">
              <h2 className="font-semibold text-gold text-lg shrink-0">
                Configured Coupons ({filteredCoupons.length})
              </h2>
              {/* Search Bar */}
              <div className="relative max-w-xs w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coupons..."
                  className="w-full rounded-full border border-gold/20 bg-noir pl-9 pr-4 py-2 outline-none text-cream focus:border-gold text-xs"
                />
              </div>
            </div>

            {loading && coupons.length === 0 ? (
              <div className="p-8"><PageLoader text="Loading coupons..." /></div>
            ) : filteredCoupons.length === 0 ? (
              <EmptyStateCard 
                icon={Ticket} 
                text="No coupons found" 
                subtext="No coupons match your query." 
              />
            ) : (
              <div className="divide-y divide-gold/10 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {filteredCoupons.map((coupon) => (
                  <div key={coupon.id} className="py-5 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-cream text-lg tracking-wider font-mono">{coupon.code}</p>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/25 font-semibold">
                          {coupon.type === "percent" || coupon.type === "percentage" 
                            ? `${coupon.value}% Off` 
                            : `${formatPrice(coupon.value)} Off`}
                        </span>
                      </div>
                      
                      {/* Sub-details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-cream/50 pt-1 leading-relaxed">
                        {(coupon.minimumOrderAmount !== undefined || coupon.minOrderValue !== undefined) && (
                          <span>Min Spend: <strong className="text-cream/80">{formatPrice(coupon.minimumOrderAmount ?? coupon.minOrderValue ?? 0)}</strong></span>
                        )}
                        {coupon.maximumDiscount !== undefined && coupon.maximumDiscount > 0 && (
                          <span>Max Discount: <strong className="text-cream/80">{formatPrice(coupon.maximumDiscount)}</strong></span>
                        )}
                        {coupon.startDate && (
                          <span>Starts: <strong className="text-cream/80">{new Date(coupon.startDate).toLocaleDateString()}</strong></span>
                        )}
                        {coupon.expiryDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Expires: <strong className="text-cream/80">{new Date(coupon.expiryDate).toLocaleDateString()}</strong>
                          </span>
                        )}
                        {coupon.usageLimit ? (
                          <span>Usage: <strong className="text-cream/80">{coupon.usedCount ?? coupon.usageCount ?? 0} / {coupon.usageLimit}</strong></span>
                        ) : (
                          <span>Used count: <strong className="text-cream/80">{coupon.usedCount ?? coupon.usageCount ?? 0}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-center shrink-0">
                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          coupon.active
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-rose/10 text-rose hover:bg-rose/20"
                        } transition-colors`}
                        title={coupon.active ? "Deactivate" : "Activate"}
                      >
                        {coupon.active ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        <span className="hidden sm:inline">{coupon.active ? "Active" : "Inactive"}</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-2 rounded-full bg-champagne/10 text-champagne hover:bg-champagne hover:text-noir transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 rounded-full bg-rose/10 text-rose hover:bg-rose hover:text-noir transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Edit Coupon Form */}
          <div className="rounded-[2rem] border border-gold/15 bg-white/[0.04] p-6 h-fit">
            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
              <h2 className="font-semibold text-gold text-lg">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}
              </h2>
              {editingCoupon && (
                <button
                  onClick={handleCancelEdit}
                  className="text-xs text-rose flex items-center gap-0.5 hover:underline"
                >
                  <X size={12} /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  required
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold uppercase font-mono tracking-widest text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "fixed" | "percentage")}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold text-sm cursor-pointer"
                  >
                    <option value="percentage" className="bg-noir text-cream">Percentage (%)</option>
                    <option value="fixed" className="bg-noir text-cream">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Value</label>
                  <input
                    type="number"
                    value={value || ""}
                    onChange={(e) => setValue(Number(e.target.value))}
                    placeholder="e.g. 10"
                    required
                    min={1}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Min Spend Amount (Optional)</label>
                  <input
                    type="number"
                    value={minimumOrderAmount || ""}
                    onChange={(e) => setMinimumOrderAmount(Number(e.target.value))}
                    placeholder="e.g. 999 (₹)"
                    min={0}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Max Discount (Optional)</label>
                  <input
                    type="number"
                    value={maximumDiscount || ""}
                    onChange={(e) => setMaximumDiscount(Number(e.target.value))}
                    placeholder="e.g. 200 (₹)"
                    min={0}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold text-sm cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold text-sm cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-2">Usage Limit (Optional)</label>
                <input
                  type="number"
                  value={usageLimit || ""}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  placeholder="e.g. 100 (0 for unlimited)"
                  min={0}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 outline-none text-cream focus:border-gold text-sm"
                />
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Saving..."
                className="w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-noir hover:bg-gold-light transition-colors flex items-center justify-center gap-2 mt-4 shadow-jewel text-sm"
              >
                {editingCoupon ? <Check size={16} /> : <Plus size={16} />}
                {editingCoupon ? "Save Coupon Changes" : "Create Coupon"}
              </LoadingButton>

              {message && (
                <p className={`text-center text-xs mt-3 ${message.includes("successfully") ? "text-emerald-400" : "text-rose"}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </Protected>
  );
}
