import { POST } from "../app/api/orders/create/route.ts";
import { NextRequest } from "next/server";
import { adminDb } from "../lib/firebaseAdmin.ts";

// Mock adminDb
jest.mock("../lib/firebaseAdmin.ts", () => ({
  adminDb: {
    runTransaction: jest.fn(async (callback) => {
      const transaction = {
        get: jest.fn(async (ref) => {
           // Mock getting products based on ref
           return {
             exists: true,
             data: () => ({
               isActive: true,
               stock: 10,
               isBundle: ref.id === "bundle-1",
               bundleType: ref.id === "bundle-1" ? "mix_and_match" : undefined,
               sourceType: ref.id === "bundle-1" ? "existing_products" : undefined,
               selectionLimit: ref.id === "bundle-1" ? 2 : undefined,
               eligibleProductIds: ref.id === "bundle-1" ? ["prod-a", "prod-b"] : [],
             })
           }
        }),
        update: jest.fn(),
        set: jest.fn()
      };
      return await callback(transaction);
    }),
    collection: jest.fn(() => ({
      doc: jest.fn((id) => ({ id }))
    }))
  }
}));

async function runTests() {
  console.log("Running Mocked Validation Tests...\n");

  const baseOrder = {
    customerInfo: { name: "Test", email: "test@example.com", phone: "1234567890", address: "123 Test St", city: "Dubai", pincode: "00000", state: "Dubai" },
    paymentMethod: "cod"
  };

  const cases = [
    {
      name: "Valid existing-products bundle order",
      payload: { ...baseOrder, items: [
        { productId: "bundle-1", quantity: 1, bundleSelections: ["prod-a", "prod-b"] }
      ]}
    },
    {
      name: "Too few selected items",
      payload: { ...baseOrder, items: [
        { productId: "bundle-1", quantity: 1, bundleSelections: ["prod-a"] }
      ]}
    },
    {
      name: "Too many selected items",
      payload: { ...baseOrder, items: [
        { productId: "bundle-1", quantity: 1, bundleSelections: ["prod-a", "prod-b", "prod-c"] }
      ]}
    }
  ];

  for (const c of cases) {
    console.log(`Test: ${c.name}`);
    console.log(`Payload: ${JSON.stringify(c.payload.items)}`);
    
    const req = new NextRequest("http://localhost/api/orders/create", {
      method: "POST",
      body: JSON.stringify(c.payload),
      headers: { "x-test-bypass": "true" }
    });

    const res = await POST(req);
    const json = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(json)}\n`);
  }
}

runTests();
