export interface ShiprocketConfig {
  pickupLocation: string;
  defaultWeight: number;
  defaultLength: number;
  defaultBreadth: number;
  defaultHeight: number;
}

export const SHIPROCKET_CONFIG: ShiprocketConfig = {
  pickupLocation: "work",
  defaultWeight: 0.5,
  defaultLength: 20,
  defaultBreadth: 15,
  defaultHeight: 5,
};

let cachedToken: string | null = null;
let cachedTokenExpiry: number = 0;

export async function getShiprocketToken(forceRefresh = false): Promise<string> {
  let email = process.env.SHIPROCKET_API_EMAIL || "";
  let password = process.env.SHIPROCKET_API_PASSWORD || "";

  email = email.replace(/^["']/g, "").replace(/["']$/g, "").trim();
  password = password.replace(/^["']/g, "").replace(/["']$/g, "").trim();

  if (!email || !password) {
    throw new Error("Shiprocket credentials missing from server environment");
  }

  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedTokenExpiry > now) {
    return cachedToken;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      throw new Error("Shiprocket authentication failed with status: " + res.status);
    }

    const data = await res.json();
    if (!data || !data.token || typeof data.token !== "string") {
      throw new Error("Invalid Shiprocket authentication response format");
    }

    cachedToken = data.token;
    cachedTokenExpiry = now + (8 * 24 * 60 * 60 * 1000); // cache for 8 days

    return cachedToken as string;
  } catch (err: any) {
    throw new Error("Shiprocket authentication error: " + (err.message || "Unknown error"));
  }
}

export async function shiprocketFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  let token = await getShiprocketToken();
  const baseUrl = "https://apiv2.shiprocket.in/v1/external";
  
  let res = await fetch(baseUrl + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + token,
      ...(options.headers || {})
    }
  });

  if (res.status === 401 || res.status === 403) {
    token = await getShiprocketToken(true);
    res = await fetch(baseUrl + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer " + token,
        ...(options.headers || {})
      }
    });
  }

  if (!res.ok) {
    throw new Error("Shiprocket API error: " + res.status + " " + res.statusText);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  return (isJson ? await res.json() : await res.text()) as T;
}
