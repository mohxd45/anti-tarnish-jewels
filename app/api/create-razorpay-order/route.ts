import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.RAZORPAY_KEY_SECRET || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    return NextResponse.json({ error: "Missing Razorpay keys in .env.local" }, { status: 400 });
  }

  return NextResponse.json({
    message: "Connect Razorpay order creation here after adding your keys.",
    orderId: null
  });
}
