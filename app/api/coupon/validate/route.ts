import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }

    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, error: "Please enter a coupon code." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const couponsSnap = await adminDb.collection("coupons").where("code", "==", cleanCode).limit(1).get();

    if (couponsSnap.empty) {
      return NextResponse.json({ success: false, error: "Invalid coupon code." });
    }

    const couponData = couponsSnap.docs[0].data();

    // Check active
    if (!couponData.active) {
      return NextResponse.json({ success: false, error: "This coupon is inactive." });
    }

    // Check expiry
    if (couponData.expiryDate) {
      const expTime = new Date(couponData.expiryDate).getTime();
      if (!isNaN(expTime) && Date.now() > expTime) {
        return NextResponse.json({ success: false, error: "This coupon has expired." });
      }
    }

    // Check start
    if (couponData.startDate) {
      const startTime = new Date(couponData.startDate).getTime();
      if (!isNaN(startTime) && Date.now() < startTime) {
        return NextResponse.json({ success: false, error: "This coupon is not yet active." });
      }
    }

    // Check minimum spend
    const minAmount = couponData.minimumOrderAmount ?? couponData.minOrderValue ?? 0;
    if (minAmount > 0 && subtotal < minAmount) {
      return NextResponse.json({ success: false, error: `This coupon requires a minimum order of ₹${minAmount}.` });
    }

    // Check usage limits
    const usageLimit = couponData.usageLimit || 0;
    const usedCount = couponData.usedCount || 0;
    if (usageLimit > 0 && usedCount >= usageLimit) {
      return NextResponse.json({ success: false, error: "This coupon has reached its usage limit." });
    }

    // Safely return coupon details (omit internals if any)
    return NextResponse.json({
      success: true,
      coupon: {
        id: couponsSnap.docs[0].id,
        code: couponData.code,
        type: couponData.type,
        value: couponData.value,
        maximumDiscount: couponData.maximumDiscount,
        minimumOrderAmount: minAmount,
        active: true,
      }
    });

  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ success: false, error: "Failed to validate coupon." }, { status: 500 });
  }
}
