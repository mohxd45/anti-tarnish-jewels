
import assert from "node:assert";
import { getShiprocketEligibility } from "../lib/shiprocketEligibility";

console.log("Running Shiprocket unit tests...");

try {
  // --- Cancelled ---
  assert.strictEqual(getShiprocketEligibility({ status: "Cancelled" }).eligible, false);

  // --- Prepaid ---
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Pending" }).eligible, false);
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Failed" }).eligible, false);
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Stripe", paymentStatus: "Paid" }).eligible, true);

  // --- COD Advance ---
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "pending", amountPaid: 0 }).eligible, false);
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "paid", amountPaid: 50, advanceAmount: 100 }).eligible, false);
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "cod_with_advance", codAdvanceStatus: "paid", amountPaid: 100, advanceAmount: 100 }).eligible, true);

  // Legacy COD no advance
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Cash on Delivery", status: "Pending" }).eligible, false);
  assert.strictEqual(getShiprocketEligibility({ paymentMethod: "Cash on Delivery", status: "Processing" }).eligible, true);

  console.log("14 test cases passed!");
} catch (err) {
  console.error("Test failed:", err);
  process.exit(1);
}

