
import assert from "node:assert";
import { getShiprocketEligibility } from "../lib/shiprocketEligibility";
import { buildShiprocketOrderPayload, validateShiprocketCreateResponse, _createShiprocketOrderForDbOrder } from "../lib/shiprocketService";

console.log("Running Shiprocket unit tests...");

async function runTests() {
  let testsPassed = 0;

  // --- ELIGIBILITY ---
  assert.strictEqual(getShiprocketEligibility({ status: "Cancelled" }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Pending" }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Paid" }).eligible, true); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "pending", amountPaid: 0 }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "paid", amountPaid: 50, advanceAmount: 100 }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "paid", amountPaid: 100, advanceAmount: 100 }).eligible, true); testsPassed++;

  const MOCK_ORDER: any = {
    shiprocketOrderId: null,
    shiprocketCreationState: null,
    shiprocketCreationAttemptId: null,
    shiprocketLastAttemptAt: null,
    customerName: "Jane Doe",
    customerEmail: "jane@test.com",
    customerPhone: "1234567890",
    address: { line1: "123 St", city: "Mumbai", pincode: "400001", state: "MH" },
    items: [{ name: "Ring", sku: "R1", quantity: 1, price: 100 }],
    total: 100,
    paymentMethod: "Stripe",
    paymentStatus: "Paid"
  };

  // A. Partial COD mapping
  const codOrder = { 
    ...MOCK_ORDER, 
    total: 700, 
    amountPaid: 100, 
    payOnDeliveryAmount: 600, 
    paymentMethod: "cod_with_advance", 
    codAdvanceStatus: "paid",
    paymentStatus: "advance_paid"
  };
  const payload1 = buildShiprocketOrderPayload(codOrder, "1");
  assert.strictEqual(payload1.payment_method, "COD");
  assert.strictEqual(payload1.sub_total, 700);
  assert.strictEqual(payload1.advance_amount, 100);
  assert.strictEqual(payload1.cod_amount, 600);
  testsPassed++;

  // D. financial mismatch
  const codMismatch = {
    ...MOCK_ORDER,
    total: 700,
    amountPaid: 100,
    payOnDeliveryAmount: 650, 
    paymentMethod: "cod_with_advance",
    codAdvanceStatus: "paid",
    paymentStatus: "advance_paid"
  };
  assert.throws(() => buildShiprocketOrderPayload(codMismatch, "1"), /Partial COD financial amounts are inconsistent/); testsPassed++;

  // E. prepaid mapping unchanged
  const prepaidOrder = { ...MOCK_ORDER, total: 999, paymentMethod: "Stripe", paymentStatus: "Paid" };
  const payloadE = buildShiprocketOrderPayload(prepaidOrder, "1");
  assert.strictEqual(payloadE.payment_method, "Prepaid");
  assert.strictEqual(payloadE.sub_total, 999);
  assert.strictEqual(payloadE.advance_amount, undefined);
  testsPassed++;

  // F. bundle mapping
  const bundleOrder = {
    ...MOCK_ORDER,
    items: [
      { bundleName: "Gift Set", bundleSku: "GIFT-1", quantity: 2, bundlePrice: 500 },
      { product: { name: "Nested Prod", sku: "N-1" }, quantity: 1, price: 150 }
    ],
    total: 1150
  };
  const payloadF = buildShiprocketOrderPayload(bundleOrder, "1");
  assert.strictEqual(payloadF.order_items[0].name, "Gift Set");
  assert.strictEqual(payloadF.order_items[1].name, "Nested Prod");
  testsPassed++;

  // --- RESPONSE VALIDATION MOCKS ---
  // G. Shiprocket success
  assert.doesNotThrow(() => validateShiprocketCreateResponse({ order_id: 123, shipment_id: 456 }, {})); testsPassed++;

  // H. HTTP-200 application error
  assert.throws(() => validateShiprocketCreateResponse({ status_code: 400, message: "validation failed" }, {}), /Shiprocket Application Error/); testsPassed++;

  // I. HTTP-200 duplicate
  assert.throws(() => validateShiprocketCreateResponse({ status_code: 400, message: "order id already exists" }, {}), /DUPLICATE_ORDER_ID/); testsPassed++;


  // --- TRANSACTION AND SPY MOCKS ---
  let fetchCallCount = 0;
  
  // Create a mutable wrapper for DB mock
  let currentOrderState: any = null;
  const mockDb = {
    collection: () => ({ doc: () => ({ id: "test-order-1" }) }),
    runTransaction: async (cb: any) => {
      return cb({
        get: async () => ({
          exists: true,
          data: () => currentOrderState
        }),
        update: (ref: any, data: any) => {
          Object.assign(currentOrderState, data);
        }
      });
    }
  };

  let mockFetchResponse: any = null;
  let mockFetchError: any = null;
  const mockFetch = async (url: string, opts: any) => {
    fetchCallCount++;
    if (mockFetchError) throw mockFetchError;
    return mockFetchResponse;
  };

  class ShiprocketApiError extends Error {
    status: number;
    safeResponse: any;
    constructor(status: number, message: string, safeResponse: any) {
      super(message);
      this.status = status;
      this.safeResponse = safeResponse;
    }
  }

  // J. existing Firebase shiprocketOrderId: prove API creation path exits (Spy)
  fetchCallCount = 0;
  currentOrderState = { shiprocketOrderId: "EXISTING_ID", shiprocketCreationState: "created" };
  const resJ = await _createShiprocketOrderForDbOrder("test-order-1", mockDb, mockFetch);
  assert.strictEqual(resJ.message, "Shiprocket order already exists");
  assert.strictEqual(fetchCallCount, 0, "Fetch call count should be 0");
  testsPassed++;

  // K. active creating state
  fetchCallCount = 0;
  currentOrderState = { shiprocketCreationState: "creating", shiprocketLastAttemptAt: new Date().toISOString() };
  await assert.rejects(async () => {
    await _createShiprocketOrderForDbOrder("test-order-1", mockDb, mockFetch);
  }, /Shiprocket shipment creation is currently in progress/);
  assert.strictEqual(fetchCallCount, 0);
  testsPassed++;

  // L. expired creating state
  fetchCallCount = 0;
  currentOrderState = { shiprocketCreationState: "creating", shiprocketLastAttemptAt: new Date(Date.now() - 100000).toISOString() };
  await assert.rejects(async () => {
    await _createShiprocketOrderForDbOrder("test-order-1", mockDb, mockFetch);
  }, /Previous creation attempt timed out/);
  assert.strictEqual(fetchCallCount, 0);
  assert.strictEqual(currentOrderState.shiprocketCreationState, "reconcile_required");
  testsPassed++;

  // Verify successful creation updates db correctly
  fetchCallCount = 0;
  currentOrderState = { ...codOrder, shiprocketOrderId: null, shiprocketCreationState: null };
  mockFetchResponse = { order_id: 999, shipment_id: 888, status: "NEW" };
  const resSuccess = await _createShiprocketOrderForDbOrder("test-order-1", mockDb, mockFetch);
  assert.strictEqual(fetchCallCount, 1);
  assert.strictEqual(currentOrderState.shiprocketOrderId, 999);
  assert.strictEqual(currentOrderState.shiprocketCreationState, "created");
  testsPassed++;

  console.log(`${testsPassed} REAL test cases passed!`);
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

