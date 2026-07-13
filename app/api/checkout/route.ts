import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { CartItem, Product, Coupon, Address } from "@/types";

function generateOrderNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ATJ-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { success: false, error: "Server configuration error. Admin SDK not initialized." },
        { status: 500 }
      );
    }

    // 1. Verify Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Missing or invalid authorization header" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      console.error("ID Token verification failed:", err);
      return NextResponse.json({ success: false, error: "Unauthorized access or token expired" }, { status: 401 });
    }
    
    const userId = decodedToken.uid;
    const customerEmail = decodedToken.email || "customer-no-email@example.com";

    // 2. Parse Request Body
    const body = await req.json();
    const { items, address, couponCode, paymentMethod, giftWrap } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }
    if (!address || !address.fullName || !address.city || !address.state || !address.pincode) {
      return NextResponse.json({ success: false, error: "Invalid address details" }, { status: 400 });
    }
    if (paymentMethod !== "cod") {
      return NextResponse.json({ success: false, error: "Only Cash on Delivery is supported right now" }, { status: 400 });
    }

    // 3. Fetch product prices securely from backend
    let subtotal = 0;
    const verifiedItems: CartItem[] = [];

    for (const item of items) {
      const productId = item.productId || item.product?.id;
      if (!productId) continue;

      const productDoc = await adminDb.collection("products").doc(productId).get();
      if (!productDoc.exists) {
        return NextResponse.json({ success: false, error: `Product not found: ${productId}` }, { status: 400 });
      }

      const productData = productDoc.data() as Product;
      const price = productData.salePrice || productData.regularPrice;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      subtotal += price * quantity;
      
      verifiedItems.push({
        product: {
          id: productDoc.id,
          name: productData.name,
          salePrice: price,
          regularPrice: productData.regularPrice,
          images: productData.images || [],
          slug: productData.slug || "",
        } as any,
        quantity,
        selectedSize: item.selectedSize || undefined,
        selectedColor: item.selectedColor || undefined,
      });
    }

    if (verifiedItems.length === 0) {
      return NextResponse.json({ success: false, error: "No valid items in cart" }, { status: 400 });
    }

    // 4. Validate Coupon and Calculate Discount
    let discount = 0;
    let couponId = "";
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const couponsSnap = await adminDb.collection("coupons").where("code", "==", cleanCode).limit(1).get();
      
      if (!couponsSnap.empty) {
        const couponDoc = couponsSnap.docs[0];
        const couponData = couponDoc.data() as Coupon;
        
        // Validation checks
        const minAmount = couponData.minimumOrderAmount ?? couponData.minOrderValue ?? 0;
        const expTime = couponData.expiryDate ? new Date(couponData.expiryDate).getTime() : null;
        const startTime = couponData.startDate ? new Date(couponData.startDate).getTime() : null;
        
        const isExpired = expTime ? Date.now() > expTime : false;
        const isNotStarted = startTime ? Date.now() < startTime : false;
        const isUnderMinAmount = subtotal < minAmount;
        const isLimitReached = (couponData.usageLimit || 0) > 0 && (couponData.usedCount || 0) >= (couponData.usageLimit || 0);

        if (couponData.active && !isExpired && !isNotStarted && !isUnderMinAmount && !isLimitReached) {
          couponId = couponDoc.id;
          
          if (couponData.type === "percent" || couponData.type === "percentage") {
            discount = Math.round(subtotal * (couponData.value / 100));
            if (couponData.maximumDiscount && discount > couponData.maximumDiscount) {
              discount = couponData.maximumDiscount;
            }
          } else {
            discount = couponData.value;
          }
          
          if (discount > subtotal) {
            discount = subtotal;
          }
          if (discount < 0) {
            discount = 0;
          }

          // Securely increment usage count
          await adminDb.collection("coupons").doc(couponId).update({
            usedCount: (couponData.usedCount || 0) + 1
          });
        }
      }
    }

    // 5. Calculate final totals
    let shipping = 0;
    
    // Fetch shipping settings from announcements
    const announcementSnap = await adminDb.collection("siteSettings").doc("announcements").get();
    let shippingFee = 79;
    let freeShippingThreshold = 999;
    
    if (announcementSnap.exists) {
      const settings = announcementSnap.data();
      if (settings?.shippingFee !== undefined) shippingFee = Number(settings.shippingFee);
      if (settings?.freeShippingThreshold !== undefined) freeShippingThreshold = Number(settings.freeShippingThreshold);
    }
    
    if (subtotal > 0 && (freeShippingThreshold === null || subtotal < freeShippingThreshold)) {
      shipping = shippingFee;
    }

    const giftWrapFee = giftWrap ? 49 : 0;
    const finalTotal = Math.max(subtotal + shipping + giftWrapFee - discount, 0);

    // 6. Create Order Document
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();
    
    const orderData = {
      orderNumber,
      userId,
      customerEmail,
      items: verifiedItems,
      subtotal,
      shipping,
      discount,
      total: finalTotal,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "pending",
      address,
      couponCode: couponId ? couponCode.trim().toUpperCase() : "",
      couponId,
      giftWrap: giftWrap || false,
      createdAt: now,
      updatedAt: now,
      timeline: [{ status: "pending", date: now, description: "Order received via Cash on Delivery" }]
    };

    const orderRef = await adminDb.collection("orders").add(orderData);

    // Create public tracking lookup safely via Admin SDK
    try {
      const phoneClean = address.phone ? address.phone.replace(/\D/g, "") : "";
      const phoneLast4 = phoneClean.length >= 4 ? phoneClean.slice(-4) : phoneClean;
      if (phoneLast4) {
        await adminDb.collection("orderLookups").add({
          orderId: orderRef.id,
          orderNumber,
          customerPhoneLast4: phoneLast4,
          createdAt: now
        });
      }
    } catch (err) {
      console.warn("Failed to create order lookup (non-fatal)", err);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: orderRef.id,
      orderNumber,
      total: finalTotal
    });

  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during checkout" },
      { status: 500 }
    );
  }
}
