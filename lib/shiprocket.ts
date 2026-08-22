export let cachedToken: string | null = null;
export let cachedTokenExpiry: number = 0;

export async function getShiprocketToken(forceRefresh = false): Promise<string> {
  let email = process.env.SHIPROCKET_API_EMAIL || "";
  let password = process.env.SHIPROCKET_API_PASSWORD || "";

  // Strip possible accidental quotes or whitespace
  email = email.replace(/^["']|["']$/g, "").trim();
  password = password.replace(/^["']|["']$/g, "").trim();

  if (!email || !password) {
    throw new Error("Shiprocket credentials missing from server environment");
  }

  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedTokenExpiry > now) {
    return cachedToken;
  }

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error("Shiprocket authentication failed: " + res.status + " " + errorBody);
  }

  const data = await res.json();
  if (!data || !data.token || typeof data.token !== "string") {
    throw new Error("Invalid Shiprocket authentication response");
  }

  cachedToken = data.token;
  cachedTokenExpiry = now + (8 * 24 * 60 * 60 * 1000);

  return cachedToken as string;
}

export async function shiprocketFetch(path: string, options: RequestInit = {}): Promise<any> {
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

  const isJson = res.headers.get("content-type")?.includes("application/json");
  if (!res.ok) {
    throw new Error("Shiprocket API error: " + res.status + " " + res.statusText);
  }

  return isJson ? await res.json() : await res.text();
}
