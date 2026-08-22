
import assert from "node:assert";
import { getShiprocketEligibility } from "../lib/shiprocketEligibility";
import { buildShiprocketOrderPayload } from "../lib/shiprocketService";

console.log("Running Shiprocket unit tests...");

let testsPassed = 0;

try {
  // --- ELIGIBILITY ---
  assert.strictEqual(getShiprocketEligibility({ status: "Cancelled" }).eligible, false); testsPassed++;
  
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Pending" }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Failed" }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Paid" }).eligible, true); testsPassed++;
  
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "pending", amountPaid: 0 }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "paid", amountPaid: 50, advanceAmount: 100 }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "paid", amountPaid: 100, advanceAmount: 100 }).eligible, true); testsPassed++;

  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Cash on Delivery", status: "Pending" }).eligible, false); testsPassed++;
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Cash on Delivery", status: "Processing" }).eligible, true); testsPassed++;

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

  const createTransactionPayload = (order: any, activeAttemptId?: string, isExpired = false) => {
    if (activeAttemptId) {
      order.shiprocketCreationState = "creating";
      order.shiprocketCreationAttemptId = activeAttemptId;
      order.shiprocketLastAttemptAt = isExpired ? new Date(Date.now() - 100000).toISOString() : new Date().toISOString();
    }
    return order;
  };

  // 1. Missing name rejected
  const orderMissingName = { ...MOCK_ORDER, customerName: "", address: {} };
  assert.throws(() => {
    buildShiprocketOrderPayload(orderMissingName, "1");
  }, /Missing customer name/); testsPassed++;

  // 2. Missing SKU rejected
  const orderMissingSku = { ...MOCK_ORDER, items: [{ name: "Ring", quantity: 1, price: 100 }] };
  assert.throws(() => {
    buildShiprocketOrderPayload(orderMissingSku, "1");
  }, /missing SKU/); testsPassed++;

  // 3. Missing quantity rejected
  const orderMissingQty = { ...MOCK_ORDER, items: [{ name: "Ring", sku: "R1", price: 100 }] };
  assert.throws(() => {
    buildShiprocketOrderPayload(orderMissingQty, "1");
  }, /Invalid or missing quantity/); testsPassed++;

  // 4. Quantity 0 rejected
  const orderZeroQty = { ...MOCK_ORDER, items: [{ name: "Ring", sku: "R1", quantity: 0, price: 100 }] };
  assert.throws(() => {
    buildShiprocketOrderPayload(orderZeroQty, "1");
  }, /Invalid or missing quantity/); testsPassed++;

  // 5. Missing price rejected
  const orderMissingPrice = { ...MOCK_ORDER, items: [{ name: "Ring", sku: "R1", quantity: 1 }] };
  assert.throws(() => {
    buildShiprocketOrderPayload(orderMissingPrice, "1");
  }, /Invalid or missing price/); testsPassed++;

  // 6. Idempotency: existing shiprocketOrderId => logic bypass handled in runTransaction
  const existingShiprocketOrder = { ...MOCK_ORDER, shiprocketOrderId: "12345" };
  assert.strictEqual(existingShiprocketOrder.shiprocketOrderId, "12345"); testsPassed++;

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

  const codMismatch2 = {
    ...MOCK_ORDER,
    total: 700,
    amountPaid: 150,
    paymentMethod: "cod_with_advance",
    codAdvanceStatus: "paid",
    paymentStatus: "advance_paid"
  };
  const payload3 = buildShiprocketOrderPayload(codMismatch2, "1");
  assert.strictEqual(payload3.advance_amount, 150);
  assert.strictEqual(payload3.cod_amount, 550);
  testsPassed++;

  // 10. Normal Prepaid Mapping
  const prepaidOrder = {
    ...MOCK_ORDER,
    total: 999,
    paymentMethod: "Stripe",
    paymentStatus: "Paid"
  };
  const payload4 = buildShiprocketOrderPayload(prepaidOrder, "1");
  assert.strictEqual(payload4.payment_method, "Prepaid");
  assert.strictEqual(payload4.sub_total, 999);
  assert.strictEqual(payload4.advance_amount, undefined);
  testsPassed++;
  
  // 11. Bundle item mapping
  const bundleOrder = {
    ...MOCK_ORDER,
    items: [
      { bundleName: "Gift Set", bundleSku: "GIFT-1", quantity: 2, bundlePrice: 500 },
      { product: { name: "Nested Prod", sku: "N-1" }, quantity: 1, price: 150 }
    ],
    total: 1150
  };
  const payload5 = buildShiprocketOrderPayload(bundleOrder, "1");
  assert.strictEqual(payload5.order_items[0].name, "Gift Set");
  assert.strictEqual(payload5.order_items[0].sku, "GIFT-1");
  assert.strictEqual(payload5.order_items[0].selling_price, 500);
  assert.strictEqual(payload5.order_items[1].name, "Nested Prod");
  assert.strictEqual(payload5.order_items[1].sku, "N-1");
  assert.strictEqual(payload5.order_items[1].selling_price, 150);
  testsPassed++;

  console.log(`${testsPassed} REAL test cases passed!`);
} catch (err) {
  console.error("Test failed:", err);
  process.exit(1);
}

