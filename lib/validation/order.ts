import { z } from "zod";

export const orderAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  line1: z.string().min(5, "Address line 1 is required").max(200, "Address is too long"),
  line2: z.string().max(200, "Address line 2 is too long").optional(),
  city: z.string().min(2, "City is required").max(100, "City name is too long"),
  state: z.string().min(2, "State is required").max(100, "State name is too long"),
  pincode: z.string().min(4, "Pincode is too short").max(10, "Pincode is too long"),
}).strip(); // Use strip to ignore extra fields instead of strict which throws error

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  bundleId: z.string().optional(),
  cartItemId: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer").max(100, "Quantity limit exceeded"),
  selectedSize: z.string().max(50).nullable().optional(),
  selectedColor: z.string().max(50).nullable().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  // Ignore other fields that the frontend might be sending
}).strip().refine(data => data.productId || data.bundleId, {
  message: "Either productId or bundleId is required"
});

// We use .strip() on the root object so we don't reject the payload if frontend sends extra fields
// but we safely ONLY extract the safe fields defined here.
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  address: orderAddressSchema,
  giftWrapSelected: z.boolean().optional().default(false),
  giftMessage: z.string().max(250, "Gift message cannot exceed 250 characters").optional(),
  couponCode: z.string().max(50, "Coupon code is too long").optional(),
  paymentMethod: z.string().optional().default("cod"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
}).strip();
