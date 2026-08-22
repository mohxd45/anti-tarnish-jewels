import fetch from "node-fetch";

const API_URL = "http://localhost:3000/api/orders/create";

async function makeOrderRequest(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-bypass": "true"
    },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  try {
    return { status: res.status, json: JSON.parse(text) };
  } catch(e) {
    return { status: res.status, text };
  }
}

async function runTests() {
  console.log("Starting API Validation Tests...");

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
    console.log(`\nTest: ${c.name}`);
    console.log(`Payload: ${JSON.stringify(c.payload.items)}`);
    const result = await makeOrderRequest(c.payload);
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.json || result.text);
  }
}

runTests();
