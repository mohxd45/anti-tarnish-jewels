import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const requiredEnvs = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY"
];

let missingEnv = null;
for (const env of requiredEnvs) {
  // If the admin version is missing, check the fallback version
  const fallbackEnv = env.replace("_ADMIN", "");
  if (!process.env[env] && !process.env[fallbackEnv]) {
    missingEnv = env;
    break;
  }
}

if (missingEnv) {
  console.error(`Missing environment variable: ${missingEnv}`);
  process.exit(1);
}

// Wait we moved storage bucket down

function stripBrackets(str) {
  let s = str.trim();
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  if (s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1);
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1);
  if (s.startsWith("gs://")) s = s.replace("gs://", "");
  return s.trim();
}

let storageBucket = stripBrackets(process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "");
if (!storageBucket || storageBucket === "SENSITIVE" || storageBucket === "[SENSITIVE]") {
  console.error(`Missing environment variable: FIREBASE_STORAGE_BUCKET`);
  process.exit(1);
}

let rawPk = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || "";
rawPk = stripBrackets(rawPk);

function formatPrivateKey(key) {
  let k = key.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\r/g, '').trim();
  
  const header = "-----BEGIN PRIVATE KEY-----";
  const footer = "-----END PRIVATE KEY-----";
  
  if (!k.includes(header) || !k.includes(footer)) return k;
  
  let body = k.replace(header, "").replace(footer, "").replace(/\\n/g, "").replace(/\s+/g, "");
  const lines = body.match(/.{1,64}/g) || [];
  return `${header}\n${lines.join('\n')}\n${footer}\n`;
}

let privateKey = formatPrivateKey(rawPk);
let clientEmail = stripBrackets(process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL || "");
let projectId = stripBrackets(process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
    storageBucket: storageBucket,
  });
}

const bucket = admin.storage().bucket();
const BATCH_SIZE = 50;

async function run() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`Starting metadata update ${isDryRun ? "(DRY RUN)" : ""}...`);

  // Directories to scan based on project structure
  const folders = ["product-images", "bundle-images", "bundles", "banner-images", "category-images", "categories"];
  let updatedCount = 0;
  let skippedCount = 0;

  for (const folder of folders) {
    console.log(`\nScanning folder: ${folder}/`);
    
    // List files with prefix
    const [files] = await bucket.getFiles({ prefix: folder + "/" });
    
    for (const file of files) {
      // Skip if it's just a folder placeholder
      if (file.name.endsWith("/")) continue;

      try {
        const [metadata] = await file.getMetadata();
        
        // Check if cacheControl is already set
        if (metadata.cacheControl === "public, max-age=31536000, immutable") {
          skippedCount++;
          if (isDryRun) console.log(`[SKIPPED] ${file.name} (already has cacheControl)`);
          continue;
        }

        if (isDryRun) {
          console.log(`[DRY RUN] Would update: ${file.name}`);
        } else {
          // Update metadata
          await file.setMetadata({
            cacheControl: "public, max-age=31536000, immutable"
          });
          console.log(`[UPDATED] ${file.name}`);
        }
        updatedCount++;
      } catch (err) {
        console.error(`[ERROR] Failed to process ${file.name}:`, err.message);
      }
    }
  }

  console.log("\n=================================");
  console.log(`Summary ${isDryRun ? "(DRY RUN)" : ""}`);
  console.log(`Updated files: ${updatedCount}`);
  console.log(`Skipped files: ${skippedCount}`);
  console.log("=================================\n");
}

run().catch(console.error);
