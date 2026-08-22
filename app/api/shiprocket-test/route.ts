import { NextResponse } from 'next/server';
import { getShiprocketToken, shiprocketFetch } from '@/lib/shiprocket';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'test-123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = process.env.SHIPROCKET_API_EMAIL || "";
  const password = process.env.SHIPROCKET_API_PASSWORD || "";
  
  const emailExists = !!email;
  const passwordExists = !!password;
  
  const isSensitiveString = email === "[SENSITIVE]";
  const hasAt = email.includes("@");
  
  try {
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
      isSensitiveString,
      hasAt,
      auth: 'PASS',
      tokenReceived: !!token,
      locations,
      locError
    });
  } catch (err: any) {
    return NextResponse.json({
      envEmail: emailExists,
      envPassword: passwordExists,
      isSensitiveString,
      hasAt,
      auth: 'FAIL',
      error: err.message
    });
  }
}
