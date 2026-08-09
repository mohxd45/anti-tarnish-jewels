"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { getSalesReport, SalesReportData } from "@/app/actions/sales-report";
import { toast } from "sonner";
import { RefreshCw, Search, Calendar, Download, Copy } from "lucide-react";
import { format } from "date-fns";

export default function SalesReportPage() {
  const { user } = useAuth();
  
  // Format YYYY-MM-DD in local browser time for initial state, but user handles Indian time contextually
  const getTodayStr = () => {
    const d = new Date();
    // Default to today in IST by shifting UTC roughly, but simplest is taking local YYYY-MM-DD
    // For exact match, let's just format it as YYYY-MM-DD
    return format(d, "yyyy-MM-dd");
  };
  
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return format(d, "yyyy-MM-dd");
  };

  const [date, setDate] = useState<string>(getTodayStr());
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReport = async (targetDate: string) => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await user.getIdToken(true);
      const res = await getSalesReport(targetDate, token);
      if (!res.success) {
        if (res.error === "Unauthorized") {
          setErrorMsg("You are not authorized to view this report.");
        } else {
          setErrorMsg("Failed to load sales report.");
        }
        setData(null);
      } else {
        setData(res.data || null);
      }
    } catch (err) {
      setErrorMsg("Failed to load sales report.");
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport(date);
  }, [date, user]);

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateOrdersData = () => {
    if (!data || data.orders.length === 0) return null;
    const rows = [];
    for (const order of data.orders) {
      const timeStr = new Date(order.createdAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute:'2-digit' });
      if (!order.items || order.items.length === 0) {
        rows.push([
          date, order.orderNumber, timeStr, order.customerName, order.paymentMethod, order.paymentStatus, order.orderStatus,
          "No Items", "", "", 0, 0, 0, "", order.subtotal, order.discount, order.shippingFee, order.total, "INR"
        ]);
      } else {
        for (const item of order.items) {
          const selectedChildren = item.selectedBundleItems 
            ? item.selectedBundleItems.map((c: any) => `${c.name} x${c.quantity}`).join(", ") 
            : "";
          rows.push([
            date, order.orderNumber, timeStr, order.customerName, order.paymentMethod, order.paymentStatus, order.orderStatus,
            item.name, item.sku || "", item.type || "product", item.quantity, item.unitPrice, item.lineTotal, selectedChildren,
            order.subtotal, order.discount, order.shippingFee, order.total, "INR"
          ]);
        }
      }
    }
    return rows;
  };

  const generateItemsData = () => {
    if (!data || data.itemBreakdown.length === 0) return null;
    return data.itemBreakdown.map(item => [
      date, item.name, item.sku, item.quantity, item.unitPrice, item.totalValue, "INR"
    ]);
  };

  const exportOrdersCsv = () => {
    const rows = generateOrdersData();
    if (!rows) return;
    const headers = [
      "Report Date", "Order Number", "Order Time", "Customer Name", "Payment Method", "Payment Status", "Order Status",
      "Product / Bundle", "SKU", "Item Type", "Quantity", "Unit Price", "Line Total", "Selected Bundle Items",
      "Order Subtotal", "Order Discount", "Shipping", "Final Order Total", "Currency"
    ];
    const csvContent = [headers, ...rows].map(row => row.map(escapeCsv).join(",")).join("\n");
    triggerDownload(`lona-jewels-orders-${date}.csv`, csvContent);
  };

  const copyOrdersTsv = async () => {
    const rows = generateOrdersData();
    if (!rows) return;
    const headers = [
      "Report Date", "Order Number", "Order Time", "Customer Name", "Payment Method", "Payment Status", "Order Status",
      "Product / Bundle", "SKU", "Item Type", "Quantity", "Unit Price", "Line Total", "Selected Bundle Items",
      "Order Subtotal", "Order Discount", "Shipping", "Final Order Total", "Currency"
    ];
    const tsvContent = [headers, ...rows].map(row => row.map(val => String(val).replace(/\t|\n/g, " ")).join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(tsvContent);
      toast.success("Orders copied for Google Sheets");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const exportItemsCsv = () => {
    const rows = generateItemsData();
    if (!rows) return;
    const headers = ["Report Date", "Product / Bundle", "SKU", "Quantity Sold", "Unit Price", "Total Sales Value", "Currency"];
    const csvContent = [headers, ...rows].map(row => row.map(escapeCsv).join(",")).join("\n");
    triggerDownload(`lona-jewels-items-${date}.csv`, csvContent);
  };

  const copyItemsTsv = async () => {
    const rows = generateItemsData();
    if (!rows) return;
    const headers = ["Report Date", "Product / Bundle", "SKU", "Quantity Sold", "Unit Price", "Total Sales Value", "Currency"];
    const tsvContent = [headers, ...rows].map(row => row.map(val => String(val).replace(/\t|\n/g, " ")).join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(tsvContent);
      toast.success("Item summary copied for Google Sheets");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-adminSidebar">Daily Sales Report</h1>
          <p className="text-sm text-adminMuted">View sales and item breakdowns for a specific date (Asia/Kolkata).</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-white text-adminSidebar border-adminBorder"
              onClick={exportOrdersCsv}
              disabled={loading || !data || data.orders.length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Orders CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-white text-adminSidebar border-adminBorder"
              onClick={exportItemsCsv}
              disabled={loading || !data || data.itemBreakdown.length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Item Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-white text-adminSidebar border-adminBorder"
              onClick={copyOrdersTsv}
              disabled={loading || !data || data.orders.length === 0}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Orders
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-white text-adminSidebar border-adminBorder"
              onClick={copyItemsTsv}
              disabled={loading || !data || data.itemBreakdown.length === 0}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Item Summary
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button
             variant={date === getTodayStr() ? "default" : "outline"}
             onClick={() => setDate(getTodayStr())}
             className={date === getTodayStr() ? "bg-adminGold hover:bg-adminGold/90 text-white" : "text-adminSidebar border-adminBorder"}
           >
             Today
           </Button>
           <Button
             variant={date === getYesterdayStr() ? "default" : "outline"}
             onClick={() => setDate(getYesterdayStr())}
             className={date === getYesterdayStr() ? "bg-adminGold hover:bg-adminGold/90 text-white" : "text-adminSidebar border-adminBorder"}
           >
             Yesterday
           </Button>
           <div className="relative">
             <Input
               type="date"
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="w-40 border-adminBorder bg-white"
             />
           </div>
           <Button variant="ghost" size="icon" onClick={() => fetchReport(date)} title="Refresh">
             <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-adminGold" : "text-adminMuted"}`} />
           </Button>
        </div>
      </div>

      {!loading && errorMsg && (
        <AdminCard>
          <div className="p-12 text-center text-adminMuted">
            {errorMsg}
          </div>
        </AdminCard>
      )}

      {loading && !data && (
        <AdminCard>
          <div className="p-12 text-center text-adminMuted animate-pulse">
            Calculating report for {date}...
          </div>
        </AdminCard>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard title="Total Orders" value={data.summary.totalOrders.toString()} />
            <SummaryCard title="Gross Sales" value={formatPrice(data.summary.grossSales)} />
            <SummaryCard title="Discounts" value={`-${formatPrice(data.summary.discounts)}`} valueClass="text-emerald-600" />
            <SummaryCard title="Shipping Charges" value={formatPrice(data.summary.shippingCharges)} />
            <SummaryCard title="Net Sales" value={formatPrice(data.summary.netSales)} valueClass="text-adminGold font-bold" />
            <SummaryCard title="Cancelled/Returned" value={formatPrice(data.summary.cancelledReturnedValue)} valueClass="text-adminRose" />
            <SummaryCard title="Items Sold" value={data.summary.totalItemQuantity.toString()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Item Breakdown Table */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-serif text-adminSidebar flex items-center gap-2">
                 Item Breakdown
              </h2>
              <AdminCard>
                {data.itemBreakdown.length === 0 ? (
                  <div className="p-8 text-center text-sm text-adminMuted">No items sold on this date.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-adminBg text-xs uppercase tracking-wider text-adminMuted">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium">Product / SKU</th>
                          <th className="text-right px-4 py-3 font-medium">Qty</th>
                          <th className="text-right px-4 py-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-adminBorder">
                        {data.itemBreakdown.map((item) => (
                          <tr key={item.id} className="text-adminSidebar hover:bg-adminBg/50">
                            <td className="px-4 py-3">
                              <div className="font-medium">
                                {item.name}
                                {item.isBundleParent && <span className="ml-2 px-1.5 py-0.5 bg-adminGold/10 text-adminGold text-[9px] font-bold uppercase rounded-sm">Bundle</span>}
                              </div>
                              <div className="text-xs text-adminMuted font-mono">{item.sku}</div>
                              {item.childItems.length > 0 && (
                                <div className="mt-1 pl-2 border-l border-adminBorder space-y-0.5">
                                  {item.childItems.map((child, idx) => (
                                    <div key={idx} className="text-[10px] text-adminMuted flex justify-between">
                                      <span>• {child.name}</span>
                                      <span>x{child.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium">{formatPrice(item.totalValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AdminCard>
            </div>

            {/* Orders Table */}
            <div className="lg:col-span-2 space-y-4">
               <h2 className="text-lg font-serif text-adminSidebar">Order History</h2>
               <AdminCard>
                 {data.orders.length === 0 ? (
                   <div className="p-8 text-center text-sm text-adminMuted">No sales found for the selected date.</div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm whitespace-nowrap">
                       <thead className="bg-adminBg text-xs uppercase tracking-wider text-adminMuted">
                         <tr>
                           <th className="text-left px-4 py-3 font-medium">Order ID</th>
                           <th className="text-left px-4 py-3 font-medium">Time (IST)</th>
                           <th className="text-left px-4 py-3 font-medium">Customer</th>
                           <th className="text-left px-4 py-3 font-medium">Payment</th>
                           <th className="text-left px-4 py-3 font-medium">Status</th>
                           <th className="text-right px-4 py-3 font-medium">Total</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-adminBorder">
                         {data.orders.map((o) => (
                           <tr key={o.id} className="text-adminSidebar hover:bg-adminBg/50">
                             <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                             <td className="px-4 py-3 text-xs text-adminMuted">
                               {new Date(o.createdAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute:'2-digit' })}
                             </td>
                             <td className="px-4 py-3">{o.customerName}</td>
                             <td className="px-4 py-3 text-xs uppercase font-mono">{o.paymentMethod}</td>
                             <td className="px-4 py-3"><StatusBadge status={o.orderStatus as any} /></td>
                             <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </AdminCard>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, valueClass = "text-adminSidebar" }: { title: string; value: string; valueClass?: string }) {
  return (
    <AdminCard className="p-4 flex flex-col justify-center">
      <div className="text-xs uppercase tracking-wider text-adminMuted font-semibold mb-1">{title}</div>
      <div className={`text-xl font-serif ${valueClass}`}>{value}</div>
    </AdminCard>
  );
}
