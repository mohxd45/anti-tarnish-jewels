import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { createOrderSchema } from "@/lib/validation/order";
import { orderRateLimit, checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    // Use IP as identifier
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    const rateLimitResult = await checkRateLimit(orderRateLimit, `order_${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration. Admin SDK not initialized." }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let uid = "";
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (err) {
      console.warn("Invalid token provided for checkout:", err);
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }
    
    let userData: any = null;
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      userData = userSnap.data();
      if (userData?.status === "suspended" || userData?.status === "banned") {
        return NextResponse.json({ error: "User account is not active" }, { status: 403 });
      }
    }

    const rawBody = await req.json();
    
    // Validate with Zod
    const body = createOrderSchema.parse(rawBody);
    const { items, address, giftWrapSelected, giftMessage, couponCode, paymentMethod, notes } = body;

    let subtotal = 0;
    const finalItems = [];

    // Process items
    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
      }

      if (item.productId) {
        const prodSnap = await adminDb.collection("products").doc(item.productId).get();
        if (!prodSnap.exists) {
           return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
        }
        const prod = prodSnap.data() as any;
        if (prod.isActive === false) {
          return NextResponse.json({ error: `Product is not active: ${prod.name}` }, { status: 400 });
        }
        
        const priceToUse = typeof prod.salePrice === "number" && prod.salePrice >= 0 ? prod.salePrice : (prod.regularPrice || 0);
        
        subtotal += priceToUse * item.quantity;
        
        finalItems.push({
          cartItemId: item.cartItemId || `item-${Date.now()}-${Math.random()}`,
          productId: item.productId,
          type: "product",
          name: prod.name,
          sku: prod.sku || "",
          price: priceToUse,
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
          image: prod.images?.[0] || prod.thumbnail || "",
          product: { id: item.productId, ...prod } // Store snapshot
        });

      } else if (item.bundleId) {
        // Fetch bundle from products collection as per rules
        const bundleSnap = await adminDb.collection("products").doc(item.bundleId).get();
        if (!bundleSnap.exists) {
           return NextResponse.json({ error: `Bundle not found: ${item.bundleId}` }, { status: 400 });
        }
        const bundle = bundleSnap.data() as any;
        if (!bundle.isBundle) {
           return NextResponse.json({ error: `Item is not a bundle: ${item.bundleId}` }, { status: 400 });
        }
        if (bundle.isActive === false) {
          return NextResponse.json({ error: `Bundle is not active: ${bundle.name}` }, { status: 400 });
        }

        const priceToUse = typeof bundle.salePrice === "number" && bundle.salePrice >= 0 ? bundle.salePrice : (bundle.regularPrice || 0);
        
        subtotal += priceToUse * item.quantity;
        
        finalItems.push({
          cartItemId: item.cartItemId || `item-${Date.now()}-${Math.random()}`,
          bundleId: item.bundleId,
          type: "bundle",
          bundleName: bundle.name,
          bundleSku: bundle.sku || "",
          bundlePrice: priceToUse,
          price: priceToUse,
          quantity: item.quantity,
          includedItems: bundle.includedItems || [],
          image: bundle.images?.[0] || bundle.thumbnail || "",
          product: { id: item.bundleId, ...bundle } // Store snapshot
        });
      } else {
        return NextResponse.json({ error: "Invalid cart item, missing productId or bundleId" }, { status: 400 });
      }
    }

    // Process Coupon
    let discount = 0;
    let appliedCouponId = null;
    let appliedCouponCode = null;

    if (couponCode) {
      const couponsSnap = await adminDb.collection("coupons").where("code", "==", couponCode.toUpperCase()).get();
      if (!couponsSnap.empty) {
        const couponDoc = couponsSnap.docs[0];
        const coupon = couponDoc.data();
        const minOrder = coupon.minimumOrderAmount || coupon.minOrderValue || 0;
        
        if (coupon.active !== false && subtotal >= minOrder) {
          // Check expiry
          let isExpired = false;
          if (coupon.expiryDate) {
            if (new Date(coupon.expiryDate) < new Date()) {
               isExpired = true;
            }
          }

          if (!isExpired) {
            let calcDiscount = 0;
            if (coupon.type === "flat" || coupon.type === "fixed") {
              calcDiscount = Number(coupon.value) || 0;
            } else if (coupon.type === "percent" || coupon.type === "percentage") {
              calcDiscount = (subtotal * (Number(coupon.value) || 0)) / 100;
              const maxDiscount = Number(coupon.maximumDiscount);
              if (maxDiscount && calcDiscount > maxDiscount) {
                calcDiscount = maxDiscount;
              }
            }

            discount = Math.floor(calcDiscount);
            appliedCouponId = couponDoc.id;
            appliedCouponCode = coupon.code;
            
            // Increment usage count
            await couponDoc.ref.update({
              usedCount: FieldValue.increment(1)
            });
          }
        }
      }
    }

    // Settings for shipping
    const settingsSnap = await adminDb.collection("siteSettings").doc("config").get();
    let shippingFee = 79;
    let freeShippingThreshold = 999;
    if (settingsSnap.exists) {
      const s = settingsSnap.data() as any;
      if (s.shippingFee !== undefined && s.shippingFee !== null) shippingFee = Number(s.shippingFee);
      if (s.freeShippingThreshold !== undefined && s.freeShippingThreshold !== null) freeShippingThreshold = Number(s.freeShippingThreshold);
    }

    let shipping = 0;
    if (subtotal > 0 && subtotal < freeShippingThreshold) {
      shipping = shippingFee;
    }

    // Gift Wrap
    const giftWrapPriceConst = 99;
    let giftWrapPrice = 0;
    if (giftWrapSelected === true) {
      giftWrapPrice = giftWrapPriceConst;
    }

    let total = Math.max(subtotal + shipping - discount, 0) + giftWrapPrice;

    // Advanced COD Logic
    let displayPaymentMethod = paymentMethod || "cod";
    if (displayPaymentMethod === "cod") {
      displayPaymentMethod = "Cash on Delivery";
    }

    if (displayPaymentMethod === "Cash on Delivery" && total <= 300) {
      return NextResponse.json({ error: "Minimum order value for Cash on Delivery is ₹301." }, { status: 400 });
    }

    let initialStatus = "Pending";
    let initialDesc = "Your order has been placed successfully.";
    let advanceRequired = false;
    let advanceAmount = 0;
    let amountPaid = 0;
    let payOnDeliveryAmount = total;
    let codAdvanceStatus = "not_required";
    let initialPaymentStatus = "cod_pending";

    if (displayPaymentMethod === "Cash on Delivery") {
      if (total > 300) {
        initialStatus = "Pending Advance";
        initialDesc = "Your order requires a ₹100 advance payment to be confirmed.";
        advanceRequired = true;
        advanceAmount = 100;
        payOnDeliveryAmount = total;
        codAdvanceStatus = "pending";
        initialPaymentStatus = "pending_advance";
        displayPaymentMethod = "cod_with_advance";
      } else {
        initialStatus = "Pending";
        initialDesc = "Your Cash on Delivery order has been received and is pending phone or WhatsApp verification.";
        initialPaymentStatus = "cod_pending";
      }
    }

    const now = new Date().toISOString();
    
    // Generate Order Number
    const countSnap = await adminDb.collection("counters").doc("orders").get();
    let orderCount = 1000;
    if (countSnap.exists) {
      orderCount = (countSnap.data()?.count || 1000) + 1;
      await adminDb.collection("counters").doc("orders").update({ count: orderCount });
    } else {
      await adminDb.collection("counters").doc("orders").set({ count: orderCount });
    }
    const orderNumber = `LONA${orderCount}`;

    const orderDocRef = adminDb.collection("orders").doc();
    const orderId = orderDocRef.id;

    const initialTimeline = [
      {
        status: "Pending",
        title: "Order Placed",
        description: "Your order has been placed successfully.",
        timestamp: now
      },
      {
        status: initialStatus,
        title: initialStatus,
        description: initialDesc,
        timestamp: now
      }
    ];

    const newOrder = {
      id: orderId,
      orderNumber,
      userId: uid,
      customerName: address.fullName,
      customerEmail: userData?.email || "guest@example.com",
      customerPhone: address.phone,
      customerPhoneClean: address.phone.replace(/\D/g, ""),
      shippingAddress: address,
      address: address, // Fallback
      items: finalItems,
      subtotal,
      shippingFee: shipping,
      shipping: shipping, // Fallback
      discount,
      couponCode: appliedCouponCode || null,
      couponId: appliedCouponId || null,
      total,
      paymentMethod: displayPaymentMethod,
      advanceRequired,
      advanceAmount,
      amountPaid,
      payOnDeliveryAmount,
      codAdvanceStatus,
      paymentStatus: initialPaymentStatus,
      orderStatus: initialStatus,
      status: initialStatus, // Fallback
      giftWrapSelected: giftWrapSelected === true,
      giftWrapPrice: giftWrapPrice,
      giftMessage: giftMessage || null,
      timeline: initialTimeline,
      notes: notes || "",
      createdAt: now,
      updatedAt: now
    };

    // Clean undefined fields recursively
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(cleanObject);
      if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const [k, v]  of Object.entries(obj)) {
          if (v !== undefined) {
             newObj[k] = cleanObject(v);
          }
        }
        return newObj;
      }
      return obj;
    };

    const cleanOrder = cleanObject(newOrder);

    // Save order
    await orderDocRef.set(cleanOrder);

    // Save Public Tracking Order
    const publicTrackingOrder = {
      orderId,
      orderNumber,
      orderStatus: initialStatus,
      status: initialStatus, // fallback
      paymentMethod: displayPaymentMethod,
      paymentStatus: initialPaymentStatus,
      customerPhoneLast4: address.phone.replace(/\D/g, "").slice(-4),
      timeline: initialTimeline,
      createdAt: now,
      updatedAt: now,
      courierName: "",
      trackingNumber: "",
      trackingUrl: ""
    };
    await adminDb.collection("publicTrackingOrders").doc(orderId).set(publicTrackingOrder);

    // Save Order Lookup
    const lookupData = {
      orderId,
      orderNumber,
      customerPhoneLast4: address.phone.replace(/\D/g, "").slice(-4),
      createdAt: now
    };
    await adminDb.collection("orderLookups").doc(orderId).set(lookupData);

    return NextResponse.json({ success: true, orderId });

  } catch (err: any) {
    console.error("Order creation API error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request. Please check your details.", issues: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to place order right now. Please contact support." }, { status: 500 });
  }
}
