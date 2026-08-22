// These tests serve as permanent documentation and validation
// for Shiprocket payload rules as requested by Task 13B.

export const shiprocketTests = {
  "pickup_location": "work",
  "default_package": {
    "length": 20,
    "breadth": 15,
    "height": 5,
    "weight": 0.5
  },
  "rules": {
    "missing_address": "rejected",
    "missing_sku": "rejected",
    "prepaid_unpaid": "no shipment created (button hidden)",
    "prepaid_verified": "eligible",
    "cod_gt_300_unpaid_advance": "no shipment created (button hidden)",
    "cod_gt_300_verified_advance": "eligible, sub_total = remaining amount",
    "cod_lte_300": "eligible after approved/Processing",
    "duplicate_invocation": "one Shiprocket order only (idempotency check)",
    "api_failure": "website order preserved, admin retry possible",
    "credentials_exposure": "never returned to client"
  }
};
