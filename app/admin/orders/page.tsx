"use client";
import { useAuth } from "@/context/AuthContext";


import { useEffect, useMemo, useState } from "react";
import { listenToAllOrders, updateOrderStatus, updateOrderTracking , logActivity } from "@/lib/firestore";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Printer, RefreshCw, Filter, Search, Pencil } from "lucide-react";
import { toast } from "sonner";

const FILTERS: ("All" | OrderStatus)[] = [
  "All",
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned"
];

const STATUSES: OrderStatus[] = [
  "Pending Verification",
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned"
];

export default function ManageOrdersPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const [viewing, setViewing] = useState<Order | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToAllOrders((data) => {
      setList(data);
      setLoading(false);
      
      // Update selected order if it was modified
      setViewing(prev => {
        if (!prev) return null;
        return data.find(o => o.id === prev.id) || prev;
      });
      setEditing(prev => {
        if (!prev) return null;
        return data.find(o => o.id === prev.id) || prev;
      });
    });

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((o) => {
      const status = o.status || o.orderStatus || "Pending";
      if (filter !== "All" && status !== filter) return false;
      if (!q) return true;
      
      const orderId = o.id || "";
      const orderNumber = o.orderNumber || "";
      const customerEmail = o.customerEmail || "";
      const customerPhone = o.customerPhone || o.address?.phone || "";
      const fullName = o.customerName || o.address?.fullName || "";

      return (
        orderId.toLowerCase().includes(q) ||
        orderNumber.toLowerCase().includes(q) ||
        customerEmail.toLowerCase().includes(q) ||
        customerPhone.includes(q) ||
        fullName.toLowerCase().includes(q)
      );
    });
  }, [list, filter, query]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Status set to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleSaveOrder = async (
    orderId: string, 
    status: OrderStatus, 
    courierName: string, 
    trackingNumber: string, 
    trackingUrl: string, 
    adminNotes: string
  ) => {
    try {
      await updateOrderTracking(
        orderId,
        courierName,
        trackingNumber,
        trackingUrl,
        status,
        adminNotes
      );
      toast.success("Order updated successfully");
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    }
  };

  const printOrder = (o: Order) => printInvoice(o);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-full ring-1 ring-inset transition-colors ${
              filter === f
                ? "bg-[rgba(184,149,94,1)] text-white ring-[rgba(184,149,94,1)] shadow-sm"
                : "bg-card/60 text-foreground/70 ring-border hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order…"
              className="pl-9 w-48 bg-card/60 rounded-full text-xs"
            />
          </div>
        </div>
      </div>

      <AdminCard>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="text-left">
                  <th className="px-2 py-2 font-medium">Order ID</th>
                  <th className="px-2 py-2 font-medium">Customer</th>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Payment</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Date</th>
                  <th className="px-2 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((o) => {
                  const addr = o.shippingAddress || o.address;
                  const status = o.status || o.orderStatus || "Pending";
                  return (
                    <tr key={o.id} className="hover:bg-secondary/40">
                      <td className="px-2 py-3 font-mono text-xs">{o.orderNumber || (o.id ? o.id.slice(-6).toUpperCase() : "N/A")}</td>
                      <td className="px-2 py-3">
                        <div className="font-medium">{o.customerName || addr?.fullName || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {addr ? `${addr.city || ""}${addr.state ? `, ${addr.state}` : ""}` : "No address"}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-xs">{o.customerPhone || addr?.phone || "N/A"}</td>
                      <td className="px-2 py-3 tabular-nums font-semibold">
                        {formatPrice(o.total || 0)}
                      </td>
                      <td className="px-2 py-3 text-xs">
                        <div className="uppercase font-mono">{(o.paymentMethod || "COD")}</div>
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-2 py-3 text-xs text-muted-foreground">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Unknown"}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="View"
                            onClick={() => setViewing(o)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Edit / Tracking"
                            onClick={() => setEditing(o)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" title="Update Status">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Set status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  disabled={s === status}
                                  onClick={() => updateStatus(o.id, s)}
                                >
                                  {s}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Print"
                            onClick={() => printOrder(o)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No orders match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <ViewOrderDialog
        order={viewing}
        onClose={() => setViewing(null)}
        onEdit={(o) => {
          setViewing(null);
          setEditing(o);
        }}
        onPrint={printOrder}
      />
      <EditOrderDialog
        order={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveOrder}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}

function ViewOrderDialog({
  order,
  onClose,
  onEdit,
  onPrint,
}: {
  order: Order | null;
  onClose: () => void;
  onEdit: (o: Order) => void;
  onPrint: (o: Order) => void;
}) {
  if (!order) return null;
  const addr = order.shippingAddress || order.address;
  const status = order.status || order.orderStatus || "Pending";

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Order {order.orderNumber || (order.id ? order.id.slice(-6).toUpperCase() : "N/A")}
          </DialogTitle>
          <DialogDescription>
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Unknown"} ·{" "}
            <StatusBadge status={status} />
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 bg-card/40 p-4 rounded-xl border border-border/60">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3 border-b border-border/60 pb-2">
              Customer
            </h3>
            <Row label="Name" value={order.customerName || addr?.fullName} />
            <Row label="Phone" value={order.customerPhone || addr?.phone} />
            <Row label="Email" value={order.customerEmail} />
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3 border-b border-border/60 pb-2">
              Delivery
            </h3>
            <Row label="Address" value={`${addr?.line1 || ""} ${addr?.line2 || ""}`} />
            <Row label="City / State" value={`${addr?.city ?? "—"} ${addr?.state ? `, ${addr?.state}` : ""}`} />
            <Row label="Pincode" value={addr?.pincode} />
          </div>
        </div>

        {order.trackingNumber && (
          <div className="bg-card/40 p-4 rounded-xl border border-border/60">
            <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3 border-b border-border/60 pb-2">
              Tracking & Shipment
            </h3>
            <Row label="Courier" value={order.courierName || "Standard Shipping"} />
            <Row label="Tracking Number" value={<span className="font-mono">{order.trackingNumber}</span>} />
            {order.trackingUrl && (
              <Row label="Tracking URL" value={<a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px] block">{order.trackingUrl}</a>} />
            )}
          </div>
        )}

        <div>
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
            Items
          </h3>
          <div className="rounded-xl border border-border/60 overflow-hidden bg-card/40">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-right px-4 py-3 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(order.items || []).map((it, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium">{it.product?.name || "Unknown Item"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {it.quantity}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(it.product?.salePrice || 0)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatPrice((it.product?.salePrice || 0) * (it.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4 text-sm bg-card/40 p-4 rounded-xl border border-border/60">
            <div className="w-64 space-y-2">
              <Row label="Subtotal" value={formatPrice(order.subtotal || 0)} />
              {order.discount > 0 && <Row label={`Discount ${order.couponCode ? `(${order.couponCode})` : ""}`} value={`-${formatPrice(order.discount)}`} />}
              <Row label="Shipping" value={(order.shippingFee ?? order.shipping ?? 0) === 0 ? "Free" : formatPrice(order.shippingFee ?? order.shipping ?? 0)} />
              <div className="flex items-center justify-between pt-2 border-t border-border/60 font-semibold text-base text-[rgba(184,149,94,1)]">
                <span>Total</span>
                <span>{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {order.notes && (
          <div className="bg-card/40 p-4 rounded-xl border border-border/60">
            <h4 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">
              Admin Notes
            </h4>
            <p className="text-sm italic">{order.notes}</p>
          </div>
        )}
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onPrint(order)} className="rounded-full">
            <Printer className="h-4 w-4 mr-2 text-muted-foreground" /> Print
          </Button>
          <Button onClick={() => onEdit(order)} className="rounded-full bg-[var(--gradient-gold,linear-gradient(135deg,#b8955e,#d8a7b1))] text-white border-none shadow-md">
            <Pencil className="h-4 w-4 mr-2" /> Edit Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditOrderDialog({
  order,
  onClose,
  onSave,
}: {
  order: Order | null;
  onClose: () => void;
  onSave: (id: string, status: OrderStatus, courier: string, tracking: string, url: string, notes: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<OrderStatus>("Pending");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status || order.orderStatus || "Pending");
      setCourierName(order.courierName || "");
      setTrackingNumber(order.trackingNumber || "");
      setTrackingUrl(order.trackingUrl || "");
      setAdminNotes(order.notes || "");
    }
  }, [order]);

  if (!order) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(order.id, status, courierName, trackingNumber, trackingUrl, adminNotes);
    setSaving(false);
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Update Order & Tracking
          </DialogTitle>
          <DialogDescription>
            Update fulfillment status, tracking link, and internal notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <section className="space-y-4">
            <Field label="Order Status">
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as OrderStatus)}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Courier Partner">
                <Input
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Delhivery"
                  className="rounded-xl"
                />
              </Field>
              <Field label="Tracking Number">
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="rounded-xl"
                />
              </Field>
            </div>
            
            <Field label="Tracking URL">
              <Input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </Field>
          </section>

          <section className="space-y-4 pt-4 border-t border-border/60">
            <Field label="Admin Notes (Internal only)">
              <Textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about fulfillment..."
                className="rounded-xl resize-none"
              />
            </Field>
          </section>
        </div>

        <DialogFooter className="gap-2 pt-6">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-full bg-[var(--gradient-gold,linear-gradient(135deg,#b8955e,#d8a7b1))] text-white border-none shadow-md">
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function printInvoice(o: Order) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) {
    toast.error("Please allow popups to print");
    return;
  }
  const itemsHtml = (o.items || [])
    .map(
      (it) => `
      <tr>
        <td>${escapeHtml(it.product?.name || "Unknown Item")}</td>
        <td style="text-align:right">${it.quantity}</td>
        <td style="text-align:right">${formatPrice(it.product?.salePrice || 0)}</td>
        <td style="text-align:right">${formatPrice((it.product?.salePrice || 0) * (it.quantity || 1))}</td>
      </tr>`
    )
    .join("");

  const addr = o.shippingAddress || o.address;
  const status = o.status || o.orderStatus || "Pending";

  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
    <title>${o.orderNumber || o.id} — LONA JEWELS</title>
    <style>
      * { box-sizing: border-box }
      body { font-family: 'Inter', system-ui, sans-serif; color:#1f1a17; padding:32px; max-width:720px; margin:auto }
      h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; margin:0 }
      .muted { color:#7a6f68; font-size:12px }
      .row { display:flex; justify-content:space-between; gap:16px; margin-top:24px }
      .col h3 { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:#7a6f68; margin:0 0 6px }
      table { width:100%; border-collapse:collapse; margin-top:20px; font-size:14px }
      th, td { padding:8px 10px; border-bottom:1px solid #ece4dc; text-align:left }
      th { background:#faf5ef; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#7a6f68 }
      .total { text-align:right; font-weight:600; font-size:16px; margin-top:14px }
      .badge { display:inline-block; padding:2px 10px; border-radius:999px; background:#faf5ef; font-size:11px; text-transform: uppercase; font-weight: 600 }
      .notes { margin-top:18px; font-size:13px }
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <h1>LONA JEWELS</h1>
        <div class="muted">Luxury that never fades</div>
      </div>
      <div style="text-align:right">
        <div><strong>${o.orderNumber || (o.id ? o.id.slice(-6).toUpperCase() : "")}</strong></div>
        <div class="muted">${o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</div>
        <div class="badge" style="margin-top: 4px;">${status}</div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <h3>Customer</h3>
        <div>${escapeHtml(o.customerName || addr?.fullName || "N/A")}</div>
        <div class="muted">${escapeHtml(o.customerPhone || addr?.phone || "")}</div>
        ${o.customerEmail ? `<div class="muted">${escapeHtml(o.customerEmail)}</div>` : ""}
      </div>
      <div class="col" style="text-align:right">
        <h3>Deliver To</h3>
        <div>${escapeHtml(`${addr?.line1 || ""} ${addr?.line2 || ""}`)}</div>
        <div class="muted">${[addr?.city, addr?.state, addr?.pincode].filter(Boolean).map((s) => escapeHtml(String(s))).join(", ")}</div>
      </div>
    </div>
    <table>
      <thead><tr><th>Product</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div class="total">Total: ${formatPrice(o.total || 0)}</div>
    <div class="muted" style="margin-top:6px;text-align:right">Payment: ${escapeHtml((o.paymentMethod || "COD").toUpperCase())}</div>
    ${o.notes ? `<div class="notes"><strong>Admin notes:</strong> ${escapeHtml(o.notes)}</div>` : ""}
    <script>window.onload = () => { window.print(); }</script>
  </body></html>`);
  w.document.close();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c as keyof typeof map]));
}
const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
