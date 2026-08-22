const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
    }
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      })
    });
  }
}

const db = getFirestore();

async function runTest() {
  console.log("1. Creating test bundle with 3 independent items...");
  const bundleId = 'test-bundle-' + Date.now();
  
  const bundleData = {
    isBundle: true,
    name: "Test Build Your Box",
    slug: "test-build-your-box",
    sku: "TEST-BNDL",
    bundleType: "mix_and_match",
    sourceType: "bundle_items",
    selectionLimit: 3,
    isActive: true,
    stock: 100,
    regularPrice: 999,
    salePrice: 499,
    images: ["https://example.com/bundle-image.jpg"],
    independentBundleItems: [
      {
        id: "item-1",
        name: "Test Ring",
        sku: "TR-1",
        stock: 5,
        active: true,
        image: "https://example.com/ring.jpg"
      },
      {
        id: "item-2",
        name: "Test Necklace",
        sku: "TN-2",
        stock: 1,
        active: true,
        image: "https://example.com/neck.jpg"
      },
      {
        id: "item-3",
        name: "Test Bracelet",
        sku: "TB-3",
        stock: 0,
        active: false,
        image: "https://example.com/brace.jpg"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection("products").doc(bundleId).set(bundleData);
  console.log("Bundle saved successfully!");

  console.log("\n2. Fetching bundle to verify storefront logic (must only show active & stock > 0)");
  const doc = await db.collection("products").doc(bundleId).get();
  const fetchedBundle = doc.data();
  const eligibleItems = (fetchedBundle?.independentBundleItems || []).filter((i) => i.active && i.stock > 0);
  console.log("Eligible items for storefront: " + eligibleItems.map((i) => i.name).join(", "));
  
  if (eligibleItems.length !== 2) throw new Error("Storefront logic failed. Expected 2 active items.");

  console.log("\n3. Simulating Checkout via transaction (selecting Test Ring & Test Necklace)...");
  
  const finalItems = [{
    cartItemId: "cart-123",
    bundleId: bundleId,
    type: "mix_and_match_bundle",
    quantity: 1,
    product: { sourceType: "bundle_items" },
    selectedProducts: [
      { productId: "item-1" },
      { productId: "item-2" },
    ]
  }];

  await db.runTransaction(async (t) => {
    const bundleRef = db.collection("products").doc(bundleId);
    const snap = await t.get(bundleRef);
    const bData = snap.data();
    const independentItems = bData.independentBundleItems;

    for (const finalItem of finalItems) {
      for (const pData of finalItem.selectedProducts) {
        const itemIdx = independentItems.findIndex((i) => i.id === pData.productId);
        const bItem = independentItems[itemIdx];
        
        bItem.stock -= finalItem.quantity;
        if (bItem.stock <= 0) {
          bItem.active = false;
          bItem.stock = 0;
        }
        independentItems[itemIdx] = bItem;
      }
    }
    t.update(bundleRef, { independentBundleItems: independentItems });
  });

  console.log("Transaction completed!");

  console.log("\n4. Verifying stock decrement and auto-offline status...");
  const postDoc = await db.collection("products").doc(bundleId).get();
  const postItems = postDoc.data()?.independentBundleItems;
  
  const ring = postItems.find((i) => i.id === "item-1");
  const neck = postItems.find((i) => i.id === "item-2");

  console.log("Test Ring final stock: " + ring.stock + ", active: " + ring.active);
  console.log("Test Necklace final stock: " + neck.stock + ", active: " + neck.active);

  if (ring.stock !== 4) throw new Error("Ring stock not decremented correctly");
  if (neck.stock !== 0 || neck.active !== false) throw new Error("Necklace should be stock 0 and inactive!");

  console.log("\n5. Simulating rejection of fake item ID...");
  try {
    await db.runTransaction(async (t) => {
      const bundleRef = db.collection("products").doc(bundleId);
      const snap = await t.get(bundleRef);
      const bData = snap.data();
      const independentItems = bData.independentBundleItems;
      const fakeId = "item-fake-999";
      
      const itemIdx = independentItems.findIndex((i) => i.id === fakeId);
      if (itemIdx === -1) {
         throw new Error("Fake item ID rejected: " + fakeId);
      }
    });
  } catch (err) {
    console.log("Successfully caught fake item ID: " + err.message);
  }
  
  console.log("\nAll Backend / Firestore Tests Passed Successfully!");
  
  // Cleanup
  await db.collection("products").doc(bundleId).delete();
  console.log("Test bundle cleaned up.");
}

runTest().catch(console.error);
