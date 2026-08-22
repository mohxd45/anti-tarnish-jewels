import { SHIPROCKET_CONFIG, shiprocketFetch } from './shiprocket';
import { adminDb } from './firebaseAdmin';
import { getShiprocketEligibility } from './shiprocketEligibility';
import crypto from 'crypto';

export interface ShiprocketOrderCreationParams {
  orderId: string;
}

export async function createShiprocketOrderForDbOrder(orderId: string): Promise<any> {
  const orderRef = adminDb!.collection("orders").doc(orderId);
  const attemptId = crypto.randomUUID();

  try {
    const transactionResult = await adminDb!.runTransaction(async (t) => {
      const orderSnap = await t.get(orderRef);
      if (!orderSnap.exists) {
        throw new Error("Order " + orderId + " not found in database");
      }
      const orderData = orderSnap.data() as any;

      if (orderData.shiprocketOrderId) {
        return {
          success: true,
          message: "Shiprocket order already exists",
          shiprocketOrderId: orderData.shiprocketOrderId,
          shiprocketShipmentId: orderData.shiprocketShipmentId,
          status: orderData.shiprocketStatus
        };
      }

      if (orderData.shiprocketCreationState === 'creating') {
        const lastAttempt = orderData.shiprocketLastAttemptAt ? new Date(orderData.shiprocketLastAttemptAt).getTime() : 0;
        if (Date.now() - lastAttempt < 60000) {
          throw new Error("Shiprocket shipment creation is currently in progress for this order.");
        } else {
          // Expired claim: do not blindly retry.
          t.update(orderRef, {
            shiprocketCreationState: 'reconcile_required',
            shiprocketLastError: 'Previous creation attempt timed out. Manual reconciliation required.'
          });
          throw new Error("Previous creation attempt timed out. Manual reconciliation required.");
        }
      }

      if (orderData.shiprocketCreationState === 'reconcile_required') {
        throw new Error("Order requires manual reconciliation with Shiprocket.");
      }

      const eligibility = getShiprocketEligibility(orderData);
      if (!eligibility.eligible) {
        throw new Error("Order is not eligible for shipment: " + eligibility.reason);
      }

      const billName = orderData.customerName || orderData.address?.fullName;
      if (!billName || String(billName).trim() === "") throw new Error("Missing customer name");
      
      const billEmail = orderData.customerEmail || orderData.address?.email;
      if (!billEmail || String(billEmail).trim() === "") throw new Error("Missing customer email");
      
      const billPhone = orderData.customerPhone || orderData.address?.phone;
      if (!billPhone || String(billPhone).trim() === "") throw new Error("Missing customer phone");

      if (!orderData.address || !orderData.address.line1 || !orderData.address.city || !orderData.address.pincode || !orderData.address.state) {
        throw new Error("Missing essential shipping address fields (line1, city, pincode, state)");
      }
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error("Order has no items");
      }

      orderData.items.forEach((item: any) => {
        if (!item.name || String(item.name).trim() === "") throw new Error("One or more items are missing product name");
        if (!item.sku || String(item.sku).trim() === "") throw new Error("One or more items are missing SKU");
        if (!Number.isFinite(item.quantity) || item.quantity < 1) throw new Error("Invalid or missing quantity for item");
        if (!Number.isFinite(item.price) || item.price < 0) throw new Error("Invalid or missing price for item");
      });

      if (!Number.isFinite(orderData.total) || orderData.total < 0) {
        throw new Error("Invalid order total");
      }

      t.update(orderRef, {
        shiprocketCreationState: 'creating',
        shiprocketCreationAttemptId: attemptId,
        shiprocketLastAttemptAt: new Date().toISOString()
      });

      return { orderData, ready: true };
    });

    if (transactionResult.success) {
      return transactionResult; 
    }

    const { orderData } = transactionResult;
    
    let shiprocketPaymentMethod = "Prepaid";
    let shiprocketSubTotal = orderData.total;
    
    const rawPaymentMethod = (orderData.paymentMethod || "").toLowerCase();
    
    if (rawPaymentMethod.includes("cod") || rawPaymentMethod === "cash on delivery") {
      shiprocketPaymentMethod = "COD";
      if (orderData.advanceRequired || orderData.amountPaid > 0) {
        throw new Error("Shiprocket Create Custom Order API lacks native support for partial-payment/advance. Modifying discount or sub_total corrupts tax invoices. A 'Partial COD' field or 'disable invoice' config is required from Shiprocket.");
      }
    }
    
    const orderItems = orderData.items.map((item: any) => ({
      name: item.name,
      sku: item.sku,
      units: item.quantity,
      selling_price: item.price,
      discount: "",
      tax: ""
    }));

    const orderDateObj = orderData.createdAt ? new Date(orderData.createdAt) : new Date();
    const yyyy = orderDateObj.getFullYear();
    const mm = String(orderDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(orderDateObj.getDate()).padStart(2, '0');
    const hh = String(orderDateObj.getHours()).padStart(2, '0');
    const mins = String(orderDateObj.getMinutes()).padStart(2, '0');
    const orderDate = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mins;

    const payload = {
      order_id: orderData.orderNumber || orderId,
      order_date: orderDate,
      pickup_location: SHIPROCKET_CONFIG.pickupLocation,
      billing_customer_name: orderData.customerName || orderData.address.fullName,
      billing_last_name: "",
      billing_address: orderData.address.line1,
      billing_address_2: orderData.address.line2 || "",
      billing_city: orderData.address.city,
      billing_pincode: orderData.address.pincode,
      billing_state: orderData.address.state,
      billing_country: "India",
      billing_email: orderData.customerEmail || orderData.address.email,
      billing_phone: orderData.customerPhone || orderData.address.phone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: shiprocketPaymentMethod,
      sub_total: shiprocketSubTotal,
      length: SHIPROCKET_CONFIG.defaultLength,
      breadth: SHIPROCKET_CONFIG.defaultBreadth,
      height: SHIPROCKET_CONFIG.defaultHeight,
      weight: SHIPROCKET_CONFIG.defaultWeight
    };

    const res = await shiprocketFetch("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    
    if (!res || (!res.order_id && !res.status_code)) {
       throw new Error("Shiprocket did not return an order_id");
    }
    
    if (res.status_code === 400 && typeof res.message === 'string' && res.message.includes('order id already exists')) {
      await adminDb!.runTransaction(async (t) => {
        const snap = await t.get(orderRef);
        if (snap.exists && snap.data()?.shiprocketCreationAttemptId === attemptId) {
          t.update(orderRef, {
            shiprocketCreationState: 'reconcile_required',
            shiprocketLastError: "Order ID already exists in Shiprocket. Manual reconciliation required."
          });
        }
      });
      throw new Error("Order ID already exists in Shiprocket. Manual reconciliation required.");
    }

    await adminDb!.runTransaction(async (t) => {
      const snap = await t.get(orderRef);
      if (snap.exists && snap.data()?.shiprocketCreationAttemptId === attemptId) {
        t.update(orderRef, {
          shiprocketOrderId: res.order_id,
          shiprocketShipmentId: res.shipment_id || null,
          shiprocketStatus: res.status || "NEW",
          shiprocketCreationState: 'created',
          shiprocketCreatedAt: new Date().toISOString()
        });
      }
    });

    return {
      success: true,
      shiprocketOrderId: res.order_id,
      shiprocketShipmentId: res.shipment_id || null,
      status: res.status || "NEW"
    };

  } catch (error: any) {
    console.error("Shiprocket shipment creation failed for order", orderId, error);
    if (error.message !== "Shiprocket shipment creation is currently in progress for this order." && error.message !== "Order requires manual reconciliation with Shiprocket." && !error.message.includes("Previous creation attempt timed out")) {
      try {
        await adminDb!.runTransaction(async (t) => {
          const snap = await t.get(orderRef);
          if (snap.exists && snap.data()?.shiprocketCreationAttemptId === attemptId) {
            t.update(orderRef, {
              shiprocketCreationState: 'failed',
              shiprocketLastError: error.message || "Unknown error occurred"
            });
          }
        });
      } catch (e) {}
    }
    throw new Error("Failed to create Shiprocket shipment: " + (error.message || "Unknown error"));
  }
}
