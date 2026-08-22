import { NextResponse } from 'next/server';
import { getShiprocketToken, shiprocketFetch } from '@/lib/shiprocket';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'test-123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emailExists = !!process.env.SHIPROCKET_API_EMAIL;
  const passwordExists = !!process.env.SHIPROCKET_API_PASSWORD;

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email: process.env.SHIPROCKET_API_EMAIL, password: process.env.SHIPROCKET_API_PASSWORD })
    });
    const status = res.status;
    const body = await res.text();

    const token = await getShiprocketToken(true);
    let locations = null;
    let locError = null;
    try {
      const locResponse = await shiprocketFetch('/settings/company/pickup');
      locations = locResponse?.data?.shipping_address?.map((loc: any) => loc.pickup_location) || [];
    } catch (e: any) {
      locError = e.message;
    }

    return NextResponse.json({
      envEmail: emailExists,
      envPassword: passwordExists,
      auth: 'PASS',
      tokenReceived: !!token,
      locations,
      locError,
      authStatus: status,
      authBody: body
    });
  } catch (err: any) {
    return NextResponse.json({
      envEmail: emailExists,
      envPassword: passwordExists,
      auth: 'FAIL',
      error: err.message,
      // fallback if token error happened inside getShiprocketToken
      stack: err.stack
    });
  }
}
