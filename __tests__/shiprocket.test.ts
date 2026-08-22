
import assert from "node:assert";
import { getShiprocketEligibility } from "../lib/shiprocketEligibility";
import { buildShiprocketOrderPayload, testableResponseValidation } from "../lib/shiprocketService";

console.log("Running Shiprocket unit tests...");

async function runTests() {
  let testsPassed = 0;

  // --- ELIGIBILITY ---
  assert.strictEqual(getShiprocketEligibility({ status: "Cancelled" }).eligible, false); testsPassed++;
  
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Pending" }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Paid" }).eligible, true); testsPassed++;
  
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "pending", amountPaid: 0 }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "paid", amountPaid: 100, advanceAmount: 100 }).eligible, true); testsPassed++;

  // --- MOCK FIREBASE FOR CONCURRENCY, PAYLOAD, AND IDEMPOTENCY ---
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

  // 1. Missing name rejected
  const orderMissingName = { ...MOCK_ORDER, customerName: "", address: {} };
  assert.throws(() => {
    buildShiprocketOrderPayload(orderMissingName, "1");
  }, /Missing customer name/); testsPassed++;

  // 7. Test Partial COD Correct Mapping
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

  // 8. Test Partial COD - not eligible if unpaid
  const codUnpaid = {
    ...MOCK_ORDER,
    total: 700,
    amountPaid: 0,
    paymentMethod: "cod_with_advance",
    codAdvanceStatus: "pending"
  };
  const payload2 = buildShiprocketOrderPayload(codUnpaid, "1");
  assert.strictEqual(payload2.payment_method, "COD");
  assert.strictEqual(payload2.advance_amount, undefined);
  testsPassed++;

  // 9. Test Partial COD - Financial Mismatch
  const codMismatch = {
    ...MOCK_ORDER,
    total: 700,
    amountPaid: 100,
    payOnDeliveryAmount: 650, 
    paymentMethod: "cod_with_advance",
    codAdvanceStatus: "paid",
    paymentStatus: "advance_paid"
  };
  assert.throws(() => {
    buildShiprocketOrderPayload(codMismatch, "1");
  }, /Partial COD financial amounts are inconsistent with stored payOnDeliveryAmount/); testsPassed++;


  // --- RESPONSE VALIDATION MOCKS ---
  // Success response
  let o1: any = {};
  await testableResponseValidation({ order_id: 123, shipment_id: 456 }, {}, "test-id", o1);
  assert.strictEqual(o1.shiprocketOrderId, 123);
  assert.strictEqual(o1.shiprocketCreationState, "created");
  testsPassed++;

  // HTTP-200 application error
  let o2: any = {};
  await assert.rejects(async () => {
    await testableResponseValidation({ status_code: 400, message: "validation failed" }, {}, "test-id", o2);
  }, /Shiprocket Application Error \(HTTP 200\): validation failed/);
  assert.notStrictEqual(o2.shiprocketCreationState, "created");
  testsPassed++;

  // HTTP-200 duplicate
  let o3: any = {};
  await assert.rejects(async () => {
    await testableResponseValidation({ status_code: 400, message: "order id already exists" }, {}, "test-id", o3);
  }, /Order ID already exists in Shiprocket. Manual reconciliation required/);
  assert.strictEqual(o3.shiprocketCreationState, "reconcile_required");
  testsPassed++;

  console.log(`${testsPassed} REAL test cases passed!`);
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

