import { SHIPROCKET_CONFIG, shiprocketFetch } from './shiprocket';
import { adminDb } from './firebaseAdmin';

export interface ShiprocketOrderCreationParams {
  orderId: string;
}

export async function createShiprocketOrderForDbOrder(orderId: string): Promise<any> {
  const orderRef = adminDb!.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();
  
  if (!orderSnap.exists) {
    throw new Error("Order " + orderId + " not found in database");
  }
  
  const orderData = orderSnap.data() as any;
  
  // 1. Idempotency Check
  if (orderData.shiprocketOrderId || orderData.shiprocketShipmentId) {
    return {
      success: true,
      message: "Shiprocket order already exists",
      shiprocketOrderId: orderData.shiprocketOrderId,
      shiprocketShipmentId: orderData.shiprocketShipmentId,
      status: orderData.shiprocketStatus
    };
  }

  // 2. Validate essential fields
  if (!orderData.address || !orderData.address.line1 || !orderData.address.city || !orderData.address.pincode || !orderData.address.state) {
    throw new Error("Missing essential shipping address fields (line1, city, pincode, state)");
  }
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error("Order has no items");
  }
  const hasMissingSku = orderData.items.some((item: any) => !item.sku);
  if (hasMissingSku) {
    throw new Error("One or more items are missing SKU");
  }

  // 3. Determine Payment Method and Subtotal
  let shiprocketPaymentMethod = "Prepaid";
  let shiprocketSubTotal = orderData.total || 0;
  
  const rawPaymentMethod = (orderData.paymentMethod || "").toLowerCase();
  
  if (rawPaymentMethod.includes("cod") || rawPaymentMethod === "cash on delivery") {
    shiprocketPaymentMethod = "COD";
    if (orderData.advanceRequired && orderData.payOnDeliveryAmount !== undefined) {
      shiprocketSubTotal = orderData.payOnDeliveryAmount;
    }
  }
  
  // 4. Map Order Items
  const orderItems = orderData.items.map((item: any) => {
    return {
      name: item.name || "Jewelry Item",
      sku: item.sku,
      units: item.quantity || 1,
      selling_price: item.price || 0,
      discount: "",
      tax: ""
    };
  });

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
    billing_customer_name: orderData.customerName || orderData.address.fullName || "Customer",
    billing_last_name: "",
    billing_address: orderData.address.line1,
    billing_address_2: orderData.address.line2 || "",
    billing_city: orderData.address.city,
    billing_pincode: orderData.address.pincode,
    billing_state: orderData.address.state,
    billing_country: "India",
    billing_email: orderData.customerEmail || "support@lonajewels.com",
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

  try {
    const res = await shiprocketFetch("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    
    if (!res || !res.order_id) {
       throw new Error("Shiprocket did not return an order_id");
    }

    // Persist result
    await orderRef.update({
      shiprocketOrderId: res.order_id,
      shiprocketShipmentId: res.shipment_id || null,
      shiprocketStatus: res.status || "NEW",
      shiprocketCreatedAt: new Date().toISOString()
    });

    return {
      success: true,
      shiprocketOrderId: res.order_id,
      shiprocketShipmentId: res.shipment_id || null,
      status: res.status || "NEW"
    };

  } catch (error: any) {
    console.error("Shiprocket shipment creation failed for order", orderId, error);
    throw new Error("Failed to create Shiprocket shipment: " + error.message);
  }
}
