const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin
try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

const db = getFirestore();

async function checkAdmin() {
  console.log("Checking Firestore for admin users...");
  const snapshot = await db.collection("users").get();
  
  let found = false;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.role && data.role.includes("admin")) {
      console.log(`FOUND ADMIN: UID=${doc.id}, Email=${data.email}, Role="${data.role}", Name="${data.name}"`);
      found = true;
    }
    // Also check if they are using the hardcoded email
    if (data.email && data.email.includes("admin@antitarnishjewel.com")) {
      console.log(`FOUND TARGET EMAIL: UID=${doc.id}, Role="${data.role}", Name="${data.name}"`);
      found = true;
    }
  });

  if (!found) {
    console.log("No admins found in the 'users' collection.");
  }
}

checkAdmin().catch(console.error).finally(() => process.exit(0));
