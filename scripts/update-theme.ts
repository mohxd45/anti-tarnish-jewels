import { readFileSync } from "fs";
import { join } from "path";

// Simple built-in .env.local loader
let projectId = "antitarnishjewel";
try {
  const envPath = join(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.trim().match(/^([\w.\-_]+)\s*=\s*(.*)?$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  }
  console.log("Loaded project ID:", projectId);
} catch (e) {
  console.log("No .env.local found, using default project ID:", projectId);
}

async function main() {
  const settings = {
    brandName: "Anti Tarnish Jewels",
    logoText: "Anti Tarnish Jewels",
    primaryColor: "#B8955E",       // Champagne Gold accent
    secondaryColor: "#B7A28C",     // Soft Taupe secondary accent
    accentColor: "#C98B8B",        // Dusty Rose highlight
    backgroundColor: "#F7ECE9",    // Soft Blush Ivory background
    textColor: "#2E2823",          // Elegant Espresso text
    buttonColor: "#B8955E",        // Champagne Gold buttons
    borderRadius: "1.5rem",
    fontStyle: "serif",
    cardStyle: "rounded",
    darkMode: false
  };

  // Map to Firestore REST API document format
  const restPayload = {
    fields: {
      brandName: { stringValue: settings.brandName },
      logoText: { stringValue: settings.logoText },
      primaryColor: { stringValue: settings.primaryColor },
      secondaryColor: { stringValue: settings.secondaryColor },
      accentColor: { stringValue: settings.accentColor },
      backgroundColor: { stringValue: settings.backgroundColor },
      textColor: { stringValue: settings.textColor },
      buttonColor: { stringValue: settings.buttonColor },
      borderRadius: { stringValue: settings.borderRadius },
      fontStyle: { stringValue: settings.fontStyle },
      cardStyle: { stringValue: settings.cardStyle },
      darkMode: { booleanValue: settings.darkMode }
    }
  };

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/siteSettings/global`;
  console.log(`Sending PATCH request to Firestore REST API: ${url}...`);

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(restPayload)
  });

  const responseText = await response.text();
  if (response.ok) {
    console.log("Successfully updated live siteSettings in Firestore via REST!");
    console.log("Response:", responseText);
  } else {
    console.error("Failed to update siteSettings via REST API.");
    console.error("Status:", response.status, response.statusText);
    console.error("Response:", responseText);
    throw new Error(`REST request failed: ${response.statusText}`);
  }
}

main().catch(console.error);
