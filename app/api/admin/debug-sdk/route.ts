import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    let importError = null;
    let authModule = null;
    try {
      authModule = await import("firebase-admin/auth");
    } catch (e: any) {
      importError = e?.message || String(e);
    }

    return NextResponse.json({
      message: "Debug SDK Route loaded successfully",
      importError,
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.length : 0,
      privateKeyStarts: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.substring(0, 30) : null,
    });
  } catch (err: any) {
    return NextResponse.json({
      error: "CRASH",
      message: err?.message || String(err),
      stack: err?.stack
    }, { status: 500 });
  }
}
