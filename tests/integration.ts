process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demo-noore-jewels";
process.env.FIREBASE_PROJECT_ID = "demo-noore-jewels";

import module from "module";
const originalRequire = (module as any).prototype.require;
(module as any).prototype.require = function(id: string) {
  if (id === "server-only") return {};
  if (id === "next/cache") return { revalidatePath: () => {} };
  return originalRequire.apply(this, arguments);
};

async function loadDependencies() {
  const { adminAuth, adminDb } = await import("../lib/firebaseAdmin");
  const { saveBundleServer } = await import("../app/actions/bundle");
  return { adminAuth, adminDb, saveBundleServer };
}

async function getEmulatorIdToken(email: string) {
  const res = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123", returnSecureToken: true })
  });
  const data = await res.json();
  if (data.error && data.error.message === "EMAIL_EXISTS") {
    const loginRes = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "password123", returnSecureToken: true })
    });
    const loginData = await loginRes.json();
    return { token: loginData.idToken, uid: loginData.localId };
  }
  return { token: data.idToken, uid: data.localId };
}

async function runTests() {
  console.log("Starting Emulator Integration Tests...");
  const { adminAuth, adminDb, saveBundleServer } = await loadDependencies();

  let passed = 0;
  let failed = 0;

  if (!adminDb) {
    console.error("adminDb is null");
    process.exit(1);
  }

  function assertError(promise: Promise<any>, expectedMsg: string, testName: string) {
    return promise.then(() => {
      console.error(`❌ FAIL: ${testName} (Expected error containing "${expectedMsg}", but succeeded)`);
      failed++;
    }).catch(err => {
      if (err.message.includes(expectedMsg)) {
        console.log(`✅ PASS: ${testName}`);
        passed++;
      } else {
        console.error(`❌ FAIL: ${testName} (Got error "${err.message}", expected "${expectedMsg}")`);
        failed++;
      }
    });
  }

  function assertSuccess(promise: Promise<any>, testName: string) {
    return promise.then((res) => {
      console.log(`✅ PASS: ${testName}`);
      passed++;
      return res;
    }).catch(err => {
      console.error(`❌ FAIL: ${testName} (Failed with: ${err.message})`);
      failed++;
    });
  }

  // 1. Setup Auth and Users
  const adminRes = await getEmulatorIdToken("admin@test.com");
  const userRes = await getEmulatorIdToken("user@test.com");
  
  await adminDb.collection("users").doc(adminRes.uid).set({ role: "admin" });
  await adminDb.collection("users").doc(userRes.uid).set({ role: "user" });

  // 2. Setup Products
  const prodRef1 = adminDb.collection("products").doc();
  await prodRef1.set({ name: "Prod 1", isActive: true, isBundle: false, stock: 10 });
  const prodRef2 = adminDb.collection("products").doc();
  await prodRef2.set({ name: "Prod 2", isActive: true, isBundle: false, stock: 5 });
  const inactiveProdRef = adminDb.collection("products").doc();
  await inactiveProdRef.set({ name: "Inactive Prod", isActive: false, isBundle: false, stock: 5 });

  const existingBundleRef = adminDb.collection("products").doc();
  await existingBundleRef.set({ name: "Existing Bundle", isBundle: true, isActive: true });

  // TESTS
  await assertError(saveBundleServer({ name: "Test" }, undefined, ""), "Unauthorized", "Unauthenticated rejected");
  await assertError(saveBundleServer({ name: "Test" }, undefined, userRes.token), "Unauthorized", "Non-admin rejected");

  const validPayload = {
    name: "Valid Bundle",
    slug: "valid-bundle",
    sku: "BNDL-001",
    isActive: true,
    bundleType: "mix_and_match",
    sourceType: "existing_products",
    selectionLimit: 1,
    eligibleProductIds: [prodRef1.id]
  };

  await assertError(saveBundleServer({ ...validPayload, bundleType: "invalid" }, undefined, adminRes.token), "Invalid payload structure", "Invalid bundleType rejected");
  await assertError(saveBundleServer({ ...validPayload, sourceType: "invalid" }, undefined, adminRes.token), "Invalid payload structure", "Invalid sourceType rejected");
  
  await assertError(saveBundleServer(validPayload, prodRef1.id, adminRes.token), "Cannot overwrite a normal product as a bundle", "Normal product cannot be used as update target");
  
  await assertError(saveBundleServer({ ...validPayload, eligibleProductIds: [prodRef1.id, prodRef1.id] }, undefined, adminRes.token), "Duplicate eligible product IDs", "Duplicate eligible IDs rejected");
  await assertError(saveBundleServer({ ...validPayload, eligibleProductIds: [existingBundleRef.id] }, undefined, adminRes.token), "Cannot nest bundle", "Another bundle as child rejected");

  // Selection limit exceeding active in-stock items
  const invalidIndependent = {
    ...validPayload,
    sourceType: "bundle_items",
    selectionLimit: 2,
    independentBundleItems: [
      { id: "1", name: "A", sku: "A", image: "A", stock: 1, active: true },
      { id: "2", name: "B", sku: "B", image: "B", stock: 0, active: true }, // no stock
      { id: "3", name: "C", sku: "C", image: "C", stock: 10, active: false } // inactive
    ]
  };
  await assertError(saveBundleServer(invalidIndependent, undefined, adminRes.token), "exceeds available selectable items", "selectionLimit exceeding active in-stock items rejected");

  await assertError(saveBundleServer({ ...invalidIndependent, independentBundleItems: [{ id: "1", name: "A", sku: "A", image: "A", stock: 1, active: true }, { id: "1", name: "B", sku: "B", image: "B", stock: 1, active: true }] }, undefined, adminRes.token), "Duplicate item ID", "Duplicate independent item IDs rejected");
  
  // 3. Helper to print readback
  async function readbackAndPrint(bundleId: string, testName: string) {
    if (!adminDb) return;
    const snap = await adminDb.collection("products").doc(bundleId).get();
    const data = snap.data();
    console.log(`\n--- Readback: ${testName} ---`);
    console.log(JSON.stringify({
      id: data?.id,
      isBundle: data?.isBundle,
      bundleType: data?.bundleType,
      sourceType: data?.sourceType,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
      // specific fields
      independentBundleItems: data?.independentBundleItems,
      eligibleProductIds: data?.eligibleProductIds,
      includedItems: data?.includedItems,
      clientSpoof: data?.clientSpoof
    }, null, 2));
    console.log(`---------------------------\n`);
  }

  // 4. Missing Tests (Step 2 & 3)
  
  // Duplicate independent SKU rejected, case-insensitive
  const duplicateSkuPayload = {
    ...validPayload,
    sourceType: "bundle_items",
    selectionLimit: 1,
    independentBundleItems: [
      { id: "1", name: "A", sku: "abc", image: "A", stock: 1, active: true },
      { id: "2", name: "B", sku: "ABC", image: "B", stock: 1, active: true }
    ]
  };
  await assertError(saveBundleServer(duplicateSkuPayload, undefined, adminRes.token), "Duplicate SKU", "Duplicate independent SKU rejected (case-insensitive)");

  // invalid selection limits
  await assertError(saveBundleServer({ ...validPayload, selectionLimit: 1.5 }, undefined, adminRes.token), "Invalid payload structure", "Decimal selectionLimit rejected");
  await assertError(saveBundleServer({ ...validPayload, selectionLimit: 0 }, undefined, adminRes.token), "Selection limit must be an integer >= 1", "Zero selectionLimit rejected");
  await assertError(saveBundleServer({ ...validPayload, selectionLimit: -5 }, undefined, adminRes.token), "Invalid payload structure", "Negative selectionLimit rejected");

  // Malformed nested fields
  await assertError(saveBundleServer({ ...validPayload, unknownField: true } as any, undefined, adminRes.token), "Invalid payload structure", "Unknown fields rejected by strict schema");

  // Fixed bundle duplicate / invalid quantities
  await assertError(saveBundleServer({
    ...validPayload,
    bundleType: "fixed",
    includedItems: [
      { productId: prodRef1.id, quantity: 1 },
      { productId: prodRef1.id, quantity: 2 }
    ]
  }, undefined, adminRes.token), "Duplicate included product ID", "Duplicate fixed-bundle product IDs rejected");
  await assertError(saveBundleServer({
    ...validPayload,
    bundleType: "fixed",
    includedItems: [
      { productId: prodRef1.id, quantity: 0 }
    ]
  }, undefined, adminRes.token), "Invalid payload structure", "Invalid fixed-bundle quantities rejected (0)");

  // Readbacks and SourceType clearing tests
  const spoofedPayload = { ...validPayload, isBundle: false, id: "client-id", clientSpoof: true };
  await assertError(saveBundleServer(spoofedPayload as any, undefined, adminRes.token), "Invalid payload structure", "Client spoofed fields rejected by strict schema");

  const res1 = await assertSuccess(saveBundleServer(validPayload, undefined, adminRes.token), "Valid existing-products bundle succeeds");
  if (res1?.bundleId) {
    await readbackAndPrint(res1.bundleId, "existing-products bundle (client spoof ignored)");
    
    // Switch to bundle_items
    const switchPayload1 = {
      ...validPayload,
      sourceType: "bundle_items",
      selectionLimit: 1,
      independentBundleItems: [{ id: "1", name: "A", sku: "A1", image: "A", stock: 10, active: true }]
    };
    await assertSuccess(saveBundleServer(switchPayload1, res1.bundleId, adminRes.token), "Switched to bundle_items succeeds");
    await readbackAndPrint(res1.bundleId, "sourceType switched to bundle_items (clears eligibleProductIds)");

    // Switch back to existing_products
    const switchPayload2 = {
      ...validPayload,
      sourceType: "existing_products",
      selectionLimit: 1,
      eligibleProductIds: [prodRef2.id]
    };
    await assertSuccess(saveBundleServer(switchPayload2, res1.bundleId, adminRes.token), "Switched back to existing_products succeeds");
    await readbackAndPrint(res1.bundleId, "sourceType switched back to existing_products (clears independentBundleItems)");
  }

  // Valid fixed bundle
  const res2 = await assertSuccess(saveBundleServer({
    ...validPayload,
    bundleType: "fixed",
    includedItems: [
      { productId: prodRef1.id, quantity: 1 }
    ]
  }, undefined, adminRes.token), "Valid fixed bundle succeeds");
  if (res2?.bundleId) {
    await readbackAndPrint(res2.bundleId, "fixed bundle");
  }

  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
