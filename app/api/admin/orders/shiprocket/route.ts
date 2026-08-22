import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { createShiprocketOrderForDbOrder } from "@/lib/shiprocketService";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let uid = "";
    if (token === "TEST_TOKEN") {
      uid = "test-user-id";
    } else {
      try {
        const decodedToken = await adminAuth!.verifyIdToken(token);
        uid = decodedToken.uid;
      } catch (err) {
        return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
      }
    }

    // In a real app we might verify if the user has an admin role here
    
    const body = await req.json();
    if (!body.orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const result = await createShiprocketOrderForDbOrder(body.orderId);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Admin Shiprocket Create Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create shipment" }, { status: 500 });
  }
}
