import { NextRequest, NextResponse } from "next/server";
import { createShiprocketOrderForDbOrder } from "@/lib/shiprocketService";
import { verifyAdminAccess } from "@/lib/server/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    let adminInfo;
    try {
      adminInfo = await verifyAdminAccess(token);
    } catch (err: any) {
      if (err.name === 'AdminAuthorizationError') {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!adminInfo || !adminInfo.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const result = await createShiprocketOrderForDbOrder(orderId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Shiprocket creation endpoint error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
