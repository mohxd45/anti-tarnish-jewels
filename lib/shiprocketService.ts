import { SHIPROCKET_CONFIG, shiprocketFetch, ShiprocketApiError } from './shiprocket';
import { adminDb } from './firebaseAdmin';
import { getShiprocketEligibility } from './shiprocketEligibility';
import crypto from 'crypto';

export interface ShiprocketOrderCreationParams {
  orderId: string;
}

export function buildShiprocketOrderPayload(orderData: any, orderId: string): any {
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

  const orderItems = orderData.items.map((item: any) => {
    const itemName = item.name || item.bundleName || item.product?.name;
    const itemSku = item.sku || item.bundleSku || item.product?.sku;
    const itemPrice = item.price !== undefined ? item.price : item.bundlePrice;
    const itemQty = Number(item.quantity);
    
    if (!itemName || String(itemName).trim() === "") throw new Error("One or more items are missing product name");
    if (!itemSku || String(itemSku).trim() === "") throw new Error("One or more items are missing SKU");
    if (!Number.isFinite(itemQty) || itemQty < 1) throw new Error("Invalid or missing quantity for item");
    if (!Number.isFinite(itemPrice) || itemPrice < 0) throw new Error("Invalid or missing price for item");
    
    return {
      name: itemName,
      sku: itemSku,
      units: itemQty,
      selling_price: itemPrice,
      discount: "",
      tax: ""
    };
  });

  const totalOrderValue = Number(orderData.total);
  if (!Number.isFinite(totalOrderValue) || totalOrderValue < 0) {
    throw new Error("Invalid order total");
  }

  let shiprocketPaymentMethod = "Prepaid";
  let shiprocketSubTotal = totalOrderValue;
  let advanceAmount: number | undefined = undefined;
  let codAmount: number | undefined = undefined;
  
  const rawPaymentMethod = (orderData.paymentMethod || "").toLowerCase();
  
  if (rawPaymentMethod.includes("cod") || rawPaymentMethod === "cash on delivery") {
    shiprocketPaymentMethod = "COD";
    
    if (orderData.paymentStatus === "advance_paid" || orderData.codAdvanceStatus === "paid") {
      const advancePaid = Number(orderData.amountPaid);
      const codRemaining = totalOrderValue - advancePaid;
      
      if (!Number.isFinite(advancePaid) || advancePaid <= 0) {
        throw new Error("Partial COD financial amounts are inconsistent (invalid advance paid).");
      }
      if (!Number.isFinite(codRemaining) || codRemaining <= 0) {
        throw new Error("Partial COD financial amounts are inconsistent (invalid COD remaining).");
      }
      
      const expectedTotal = advancePaid + codRemaining;
      if (Math.abs(totalOrderValue - expectedTotal) > 0.01) {
        throw new Error("Partial COD financial amounts are inconsistent.");
      }
      
      if (orderData.payOnDeliveryAmount !== undefined) {
        const storedCodAmount = Number(orderData.payOnDeliveryAmount);
        if (Math.abs(storedCodAmount - codRemaining) > 0.01) {
          throw new Error("Partial COD financial amounts are inconsistent with stored payOnDeliveryAmount.");
        }
      }
      
      advanceAmount = advancePaid;
      codAmount = codRemaining;
    }
  }
  
  const orderDateObj = orderData.createdAt ? new Date(orderData.createdAt) : new Date();
  const yyyy = orderDateObj.getFullYear();
  const mm = String(orderDateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(orderDateObj.getDate()).padStart(2, '0');
  const hh = String(orderDateObj.getHours()).padStart(2, '0');
  const mins = String(orderDateObj.getMinutes()).padStart(2, '0');
  const orderDate = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mins;

  const payload: any = {
    order_id: orderData.orderNumber || orderId,
    order_date: orderDate,
    pickup_location: SHIPROCKET_CONFIG.pickupLocation,
    billing_customer_name: billName,
    billing_last_name: "",
    billing_address: orderData.address.line1,
    billing_address_2: orderData.address.line2 || "",
    billing_city: orderData.address.city,
    billing_pincode: orderData.address.pincode,
    billing_state: orderData.address.state,
    billing_country: "India",
    billing_email: billEmail,
    billing_phone: billPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: shiprocketPaymentMethod,
    sub_total: shiprocketSubTotal,
    length: SHIPROCKET_CONFIG.defaultLength,
    breadth: SHIPROCKET_CONFIG.defaultBreadth,
    height: SHIPROCKET_CONFIG.defaultHeight,
    weight: SHIPROCKET_CONFIG.defaultWeight
  };

  if (advanceAmount !== undefined) {
    payload.advance_amount = advanceAmount;
  }
  if (codAmount !== undefined) {
    payload.cod_amount = codAmount;
  }

  return payload;
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

      // We call the builder inside the transaction to fail fast on validation
      buildShiprocketOrderPayload(orderData, orderId);

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
    const payload = buildShiprocketOrderPayload(orderData, orderId);

    let res: any;
    try {
      res = await shiprocketFetch("/orders/create/adhoc", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    } catch (apiError: any) {
      if (apiError instanceof ShiprocketApiError) {
        let safeErrorMessage = apiError.message;
        if (apiError.status === 400 && typeof safeErrorMessage === 'string' && safeErrorMessage.includes('order id already exists')) {
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
        
        const financials = {
          payment_method: payload.payment_method,
          sub_total: payload.sub_total,
          advance_amount: payload.advance_amount,
          cod_amount: payload.cod_amount
        };
        throw new Error("Shiprocket API Rejected (Status " + apiError.status + "): " + safeErrorMessage + " | Response: " + JSON.stringify(apiError.safeResponse || {}) + " | Payload Sent: " + JSON.stringify(financials));
      }
      throw apiError;
    }
    
    if (!res || (!res.order_id && !res.status_code)) {
       throw new Error("Shiprocket did not return an order_id");
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
    if (error.message !== "Shiprocket shipment creation is currently in progress for this order." && error.message !== "Order requires manual reconciliation with Shiprocket." && !error.message.includes("Previous creation attempt timed out") && !error.message.includes("Order ID already exists in Shiprocket")) {
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
