import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY in .env.local" }, { status: 400 });
  }

  return NextResponse.json({
    message: "Connect Stripe SDK here after adding your live/test keys.",
    checkoutUrl: null
  });
}
