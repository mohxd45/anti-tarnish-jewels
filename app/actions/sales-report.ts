"use server";

import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

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

export type OrderSummary = {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO
  customerName: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  quantity: number;
  total: number;
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

    if (!idToken) {
      return { success: false, error: "Unauthorized" };
    }

    try {
      // Verify token
      const decodedToken = await adminAuth.verifyIdToken(idToken, true);
      const userRef = adminDb.collection("users").doc(decodedToken.uid);
      const userSnap = await userRef.get();
      const userData = userSnap.data();
      
      // Strict role check matching existing project rules
      if (!userSnap.exists || (userData?.role !== "admin" && userData?.role !== "owner")) {
        return { success: false, error: "Unauthorized" };
      }
    } catch (err: any) {
      console.warn("Sales report auth error:", err.message);
      return { success: false, error: "Unauthorized" };
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

      // Quantities
      let totalItemQty = 0;
      if (Array.isArray(order.items)) {
         for (const item of order.items) {
           totalItemQty += (item.quantity || 1);
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
         if (Array.isArray(order.items)) {
            for (const item of order.items) {
               const qty = typeof item.quantity === "number" ? item.quantity : 1;
               const price = typeof item.price === "number" ? item.price : (item.bundlePrice || 0);
               const sku = item.sku || item.bundleSku || "UNKNOWN-SKU";
               const name = item.name || item.bundleName || "Unknown Item";
               const type = item.type || "product";
               
               const isBundleParent = type === "bundle" || type === "mix_and_match_bundle";
               const uniqueKey = `${isBundleParent ? 'bundle' : 'product'}_${sku}_${name}`;

               let existing = itemMap.get(uniqueKey);
               if (!existing) {
                 existing = {
                   id: uniqueKey,
                   name,
                   sku,
                   quantity: 0,
                   unitPrice: price,
                   totalValue: 0,
                   isBundleParent,
                   childItems: []
                 };
                 itemMap.set(uniqueKey, existing);
               }

               existing.quantity += qty;
               existing.totalValue += (price * qty);

               // Extract child items if it's a mix & match bundle
               if (isBundleParent && Array.isArray(item.selectedProducts)) {
                  for (const child of item.selectedProducts) {
                     const childName = child.name || child.itemName || "Unknown Child";
                     // Do not double count price, just register existence/qty
                     const childQty = (child.selectedQuantity || 1) * qty;
                     const existingChild = existing.childItems.find(c => c.name === childName);
                     if (existingChild) {
                        existingChild.quantity += childQty;
                     } else {
                        existing.childItems.push({ name: childName, quantity: childQty });
                     }
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
        total: orderTotal
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
