"use server";

import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { invalidateStorefrontCache } from "@/lib/server/storefront-cache";
import { z } from "zod";
import { DocumentSnapshot } from "firebase-admin/firestore";

import { verifyAdminAccess } from "@/lib/server/admin-auth";

// --- Zod Schemas ---
const IndependentItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  image: z.string().trim().min(1),
  stock: z.number().int().min(0),
  active: z.boolean(),
  sortOrder: z.number().optional()
});

const IncludedItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional()
});

const BundleMutationSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().min(1),
  sku: z.string().trim().min(1),
  description: z.string().optional().default(""),
  category: z.string().optional().default(""),
  regularPrice: z.number().min(0).default(0),
  salePrice: z.number().min(0).default(0),
  discountPercentage: z.number().optional().default(0),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()).optional().default([]),
  thumbnail: z.string().optional().default(""),
  isActive: z.boolean(),
  isFeatured: z.boolean().optional().default(false),

  bundleType: z.enum(["fixed", "mix_and_match"]),
  sourceType: z.enum(["existing_products", "bundle_items"]).optional(),
  selectionLimit: z.number().int().min(0).optional(),
  
  eligibleProductIds: z.array(z.string()).optional(),
  independentBundleItems: z.array(IndependentItemSchema).optional(),
  includedItems: z.array(IncludedItemSchema).optional()
});

export async function saveBundleServer(rawPayload: any, bundleId?: string, idToken?: string) {
  if (!adminDb || !adminAuth) {
    throw new Error("Admin SDK not initialized");
  }

  // 1. Authenticate caller
  const adminUser = await verifyAdminAccess(idToken);

  // 2. Base Validation
  const parseResult = BundleMutationSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    console.error("[saveBundleServer] Validation error:", JSON.stringify(parseResult.error.format(), null, 2));
    throw new Error(`Validation Error: Invalid payload structure`);
  }
  const payload = parseResult.data;

  // 3. Update Target Validation
  let existingCreatedAt = new Date().toISOString();
  if (bundleId) {
    const docSnap = await adminDb.collection("products").doc(bundleId).get();
    if (!docSnap.exists) {
      throw new Error("Update target not found");
    }
    const data = docSnap.data();
    if (data?.isBundle !== true) {
      throw new Error("Cannot overwrite a normal product as a bundle");
    }
    existingCreatedAt = data?.createdAt || existingCreatedAt;
  }

  // 4. Construct Final Sanitized Payload
  const sanitizedPayload: any = {
    isBundle: true,
    name: payload.name,
    slug: payload.slug,
    sku: payload.sku,
    description: payload.description,
    category: payload.category,
    regularPrice: payload.regularPrice,
    salePrice: payload.salePrice,
    discountPercentage: payload.discountPercentage,
    stock: payload.stock,
    images: payload.images,
    thumbnail: payload.thumbnail,
    isActive: payload.isActive,
    isFeatured: payload.isFeatured,
    bundleType: payload.bundleType,
    updatedAt: new Date().toISOString()
  };

  // 5. Structure Validations
  if (payload.bundleType === "mix_and_match") {
    if (payload.sourceType !== "existing_products" && payload.sourceType !== "bundle_items") {
      throw new Error("Validation Error: Invalid sourceType for mix_and_match bundle");
    }
    sanitizedPayload.sourceType = payload.sourceType;
    sanitizedPayload.includedItems = []; // clear opposite

    if (typeof payload.selectionLimit !== "number" || payload.selectionLimit < 1 || !Number.isInteger(payload.selectionLimit)) {
      throw new Error("Validation Error: Selection limit must be an integer >= 1");
    }
    sanitizedPayload.selectionLimit = payload.selectionLimit;

    if (payload.sourceType === "existing_products") {
      const allowedIds = payload.eligibleProductIds || [];
      const uniqueIds = new Set(allowedIds);
      if (uniqueIds.size !== allowedIds.length) {
         throw new Error("Validation Error: Duplicate eligible product IDs");
      }
      if (uniqueIds.size < payload.selectionLimit) {
        throw new Error("Validation Error: selectionLimit exceeds unique eligible products");
      }

      const snapshots = [];
      for (const pId of uniqueIds) {
        if (bundleId && pId === bundleId) {
          throw new Error("Validation Error: Bundle cannot contain itself");
        }
        const docSnap = await adminDb.collection("products").doc(pId).get();
        if (!docSnap.exists) {
           throw new Error(`Validation Error: Product not found: ${pId}`);
        }
        const data = docSnap.data();
        if (data?.isActive !== true) {
           throw new Error(`Validation Error: Product is not active: ${pId}`);
        }
        if (data?.isBundle === true) {
           throw new Error(`Validation Error: Cannot nest bundle: ${pId}`);
        }
        snapshots.push({
          productId: pId,
          name: data?.name || "",
          sku: data?.sku || "",
          image: data?.images?.[0] || data?.thumbnail || "",
          price: typeof data?.salePrice === "number" && data?.salePrice >= 0 ? data.salePrice : (data?.regularPrice || 0),
          quantity: 1
        });
      }

      sanitizedPayload.eligibleProductIds = Array.from(uniqueIds);
      sanitizedPayload.eligibleProductsSnapshot = snapshots;
      sanitizedPayload.independentBundleItems = [];
    }

    if (payload.sourceType === "bundle_items") {
      const items = payload.independentBundleItems || [];
      
      const itemIds = new Set<string>();
      const itemSkus = new Set<string>();
      let selectableCount = 0;

      for (const item of items) {
        if (itemIds.has(item.id)) throw new Error(`Validation Error: Duplicate item ID: ${item.id}`);
        itemIds.add(item.id);

        const lowerSku = item.sku.toLowerCase();
        if (itemSkus.has(lowerSku)) throw new Error(`Validation Error: Duplicate SKU: ${item.sku}`);
        itemSkus.add(lowerSku);

        if (item.active && item.stock > 0) {
          selectableCount++;
        }
      }

      if (selectableCount < payload.selectionLimit) {
        throw new Error(`Validation Error: selectionLimit (${payload.selectionLimit}) exceeds available selectable items (${selectableCount})`);
      }

      sanitizedPayload.independentBundleItems = items;
      sanitizedPayload.eligibleProductIds = [];
      sanitizedPayload.eligibleProductsSnapshot = [];
    }
  } else if (payload.bundleType === "fixed") {
    sanitizedPayload.sourceType = "existing_products";
    sanitizedPayload.selectionLimit = 0;
    sanitizedPayload.eligibleProductIds = [];
    sanitizedPayload.eligibleProductsSnapshot = [];
    sanitizedPayload.independentBundleItems = [];
    
    const items = payload.includedItems || [];
    const itemIds = new Set<string>();
    const validatedIncludedItems = [];

    for (const item of items) {
      if (itemIds.has(item.productId)) {
        throw new Error(`Validation Error: Duplicate included product ID: ${item.productId}`);
      }
      itemIds.add(item.productId);

      if (bundleId && item.productId === bundleId) {
        throw new Error("Validation Error: Bundle cannot contain itself");
      }
      const docSnap = await adminDb.collection("products").doc(item.productId).get();
      if (!docSnap.exists) {
         throw new Error(`Validation Error: Product not found: ${item.productId}`);
      }
      const data = docSnap.data();
      if (data?.isActive !== true) {
         throw new Error(`Validation Error: Product is not active: ${item.productId}`);
      }
      if (data?.isBundle === true) {
         throw new Error(`Validation Error: Cannot nest bundle: ${item.productId}`);
      }
      validatedIncludedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        name: data?.name || "",
        sku: data?.sku || "",
        image: data?.images?.[0] || data?.thumbnail || "",
        price: typeof data?.salePrice === "number" && data?.salePrice >= 0 ? data.salePrice : (data?.regularPrice || 0),
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      });
    }
    sanitizedPayload.includedItems = validatedIncludedItems;
  }

  // 6. Database Save
  let finalId = bundleId;
  try {
    if (finalId) {
      const ref = adminDb.collection("products").doc(finalId);
      await ref.update({ ...sanitizedPayload });
    } else {
      const ref = adminDb.collection("products").doc();
      finalId = ref.id;
      await ref.set({
        ...sanitizedPayload,
        id: finalId,
        createdAt: existingCreatedAt
      });
    }
  } catch (err: any) {
    console.error("[saveBundleServer] DB Error:", err);
    throw new Error("Internal Server Error: Failed to save bundle");
  }

  // 7. Cache Invalidation
  try {
    invalidateStorefrontCache();
  } catch (err) {
    console.error("[saveBundleServer] Cache Invalidation Error:", err);
  }
  
  return { success: true, bundleId: finalId, slug: sanitizedPayload.slug };
}

export async function deleteBundleServer(bundleId: string, idToken?: string) {
  if (!adminDb || !adminAuth) {
    throw new Error("Admin SDK not initialized");
  }
  if (!idToken) throw new Error("Unauthorized");
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    const callerDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
      throw new Error("Unauthorized");
    }
  } catch (error: any) {
    throw new Error("Unauthorized");
  }

  const docSnap = await adminDb.collection("products").doc(bundleId).get();
  if (!docSnap.exists) throw new Error("Bundle not found");
  if (docSnap.data()?.isBundle !== true) throw new Error("Target is not a bundle");

  try {
    await adminDb.collection("products").doc(bundleId).delete();
  } catch (error) {
    throw new Error("Internal Server Error: Failed to delete bundle");
  }

  try {
    invalidateStorefrontCache();
  } catch (err) {}

  return { success: true };
}
