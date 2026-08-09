"use server";

import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { verifyAdminAccess, AdminAuthorizationError } from "@/lib/server/admin-auth";

export type SalesSummary = {
  totalOrders: number;
  grossSales: number;
  discounts: number;
  shippingCharges: number;
  cancelledReturnedValue: number;
  netSales: number;
  totalItemQuantity: number;
};

export type ItemBreakdown = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  isBundleParent: boolean;
  childItems: { name: string; quantity: number }[];
};

export type ReportOrderItem = {
  productId?: string;
  name: string;
  sku?: string;
  type?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedBundleItems?: {
    id?: string;
    name: string;
    sku?: string;
    quantity?: number;
  }[];
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO
  customerName: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  quantity: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  items: ReportOrderItem[];
};

export type SalesReportData = {
  summary: SalesSummary;
  itemBreakdown: ItemBreakdown[];
  orders: OrderSummary[];
};

export async function getSalesReport(
  dateString: string, // format: "YYYY-MM-DD"
  idToken: string
): Promise<{ success: boolean; data?: SalesReportData; error?: string }> {
  try {
    if (!adminDb || !adminAuth) {
      return { success: false, error: "Server misconfiguration. Admin SDK not initialized." };
    }

    try {
      await verifyAdminAccess(idToken);
    } catch (err: any) {
      if (err instanceof AdminAuthorizationError) {
        return { success: false, error: "Unauthorized" };
      }
      return { success: false, error: "Failed to load sales report." };
    }

    // Date calculations for Asia/Kolkata boundary (UTC+5:30)
    // For a given YYYY-MM-DD in IST:
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) {
       return { success: false, error: "Invalid date format. Expected YYYY-MM-DD." };
    }
    
    // Construct exact boundary times in ISO string
    // e.g., 2026-08-06T00:00:00.000+05:30
    const startOfKolkataDay = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000+05:30`;
    
    // Next day string (JS Date handles month/year rollovers perfectly)
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + 1);
    const nextYear = d.getFullYear();
    const nextMonth = d.getMonth() + 1;
    const nextDay = d.getDate();
    
    const startOfNextKolkataDay = `${String(nextYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}T00:00:00.000+05:30`;
    
    // Convert them to true UTC ISO strings for comparison with Firestore data
    const startIso = new Date(startOfKolkataDay).toISOString();
    const nextDayIso = new Date(startOfNextKolkataDay).toISOString();

    // Query Firestore
    const ordersSnap = await adminDb.collection("orders")
      .where("createdAt", ">=", startIso)
      .where("createdAt", "<", nextDayIso)
      .get();

    const summary: SalesSummary = {
      totalOrders: 0,
      grossSales: 0,
      discounts: 0,
      shippingCharges: 0,
      cancelledReturnedValue: 0,
      netSales: 0,
      totalItemQuantity: 0
    };

    const itemMap = new Map<string, ItemBreakdown>();
    const orders: OrderSummary[] = [];

    // Inclusion rules
    const includedStatuses = [
      "Pending",
      "Pending Advance",
      "Confirmed",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered"
    ];
    
    const excludedStatuses = [
      "Cancelled",
      "Returned",
      "Failed"
    ];

    ordersSnap.forEach((doc) => {
      const order = doc.data();
      const status = order.orderStatus || order.status;
      
      // Base order parsing
      const orderTotal = typeof order.total === "number" ? order.total : 0;
      const orderSubtotal = typeof order.subtotal === "number" ? order.subtotal : 0;
      const orderDiscount = typeof order.discount === "number" ? order.discount : 0;
      const orderShipping = typeof order.shippingFee === "number" ? order.shippingFee : (order.shipping || 0);

      // Quantities and Normalized Items
      let totalItemQty = 0;
      const normalizedItems: ReportOrderItem[] = [];
      
      if (Array.isArray(order.items)) {
         for (const item of order.items) {
           const qty = typeof item.quantity === "number" ? item.quantity : 1;
           const price = typeof item.price === "number" ? item.price : (item.bundlePrice || 0);
           const sku = item.sku || item.bundleSku || "UNKNOWN-SKU";
           const name = item.name || item.bundleName || "Unknown Item";
           const type = item.type || "product";
           
           totalItemQty += qty;
           
           const isBundleParent = type === "bundle" || type === "mix_and_match_bundle";
           const selectedBundleItems: { id?: string, name: string, sku?: string, quantity?: number }[] = [];
           
           if (isBundleParent && Array.isArray(item.selectedProducts)) {
              for (const child of item.selectedProducts) {
                 const childName = child.name || child.itemName || "Unknown Child";
                 const childQty = (child.selectedQuantity || 1) * qty;
                 selectedBundleItems.push({
                   id: child.id || child.productId,
                   name: childName,
                   sku: child.sku,
                   quantity: childQty
                 });
              }
           }
           
           normalizedItems.push({
             productId: item.productId || item.id,
             name,
             sku,
             type,
             quantity: qty,
             unitPrice: price,
             lineTotal: price * qty,
             ...(selectedBundleItems.length > 0 ? { selectedBundleItems } : {})
           });
         }
      }

      if (excludedStatuses.includes(status)) {
         // Count as Cancelled/Returned Value
         if (status === "Cancelled" || status === "Returned") {
             summary.cancelledReturnedValue += orderTotal;
         }
      } else if (includedStatuses.includes(status)) {
         summary.totalOrders += 1;
         summary.grossSales += orderSubtotal;
         summary.discounts += orderDiscount;
         summary.shippingCharges += orderShipping;
         summary.netSales += orderTotal;
         summary.totalItemQuantity += totalItemQty;

         // Aggregate Items
         for (const item of normalizedItems) {
            const isBundleParent = item.type === "bundle" || item.type === "mix_and_match_bundle";
            const uniqueKey = `${isBundleParent ? 'bundle' : 'product'}_${item.sku}_${item.name}`;

            let existing = itemMap.get(uniqueKey);
            if (!existing) {
              existing = {
                id: uniqueKey,
                name: item.name,
                sku: item.sku || "UNKNOWN-SKU",
                quantity: 0,
                unitPrice: item.unitPrice,
                totalValue: 0,
                isBundleParent,
                childItems: []
              };
              itemMap.set(uniqueKey, existing);
            }

            existing.quantity += item.quantity;
            existing.totalValue += item.lineTotal;

            if (item.selectedBundleItems) {
               for (const child of item.selectedBundleItems) {
                  const existingChild = existing.childItems.find(c => c.name === child.name);
                  if (existingChild) {
                     existingChild.quantity += (child.quantity || 1);
                  } else {
                     existing.childItems.push({ name: child.name, quantity: child.quantity || 1 });
                  }
               }
            }
         }
      }

      // Add to Order List regardless of status to show history
      orders.push({
        id: doc.id,
        orderNumber: order.orderNumber || "UNKNOWN",
        createdAt: order.createdAt || "",
        customerName: order.customerName || "Unknown",
        paymentMethod: order.paymentMethod || "Unknown",
        paymentStatus: order.paymentStatus || "Unknown",
        orderStatus: status || "Unknown",
        quantity: totalItemQty,
        subtotal: orderSubtotal,
        discount: orderDiscount,
        shippingFee: orderShipping,
        total: orderTotal,
        items: normalizedItems
      });
    });

    const itemBreakdown = Array.from(itemMap.values()).sort((a, b) => b.totalValue - a.totalValue);
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: {
        summary,
        itemBreakdown,
        orders
      }
    };
  } catch (error: any) {
    console.error("Error fetching sales report:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
