import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { createOrderSchema } from "@/lib/validation/order";
import { orderRateLimit, checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    // Use IP as identifier
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    const rateLimitResult = await checkRateLimit(orderRateLimit, `order_${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration. Admin SDK not initialized." }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let uid = "";
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (err) {
      console.warn("Invalid token provided for checkout:", err);
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }
    
    let userData: any = null;
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      userData = userSnap.data();
      if (userData?.status === "suspended" || userData?.status === "banned") {
        return NextResponse.json({ error: "User account is not active" }, { status: 403 });
      }
    }

    const rawBody = await req.json();
    
    // Validate with Zod
    const body = createOrderSchema.parse(rawBody);
    const { items, address, giftWrapSelected, giftMessage, couponCode, paymentMethod, notes } = body;

    let subtotal = 0;
    const finalItems: any[] = [];

    // Process items
    for (const item of items) {
      if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
      }

      if (item.productId) {
        const prodSnap = await adminDb.collection("products").doc(item.productId).get();
        if (!prodSnap.exists) {
           return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
        }
        const prod = prodSnap.data() as any;
        if (prod.isActive === false) {
          return NextResponse.json({ error: `Product is not active: ${prod.name}` }, { status: 400 });
        }
        
        const priceToUse = typeof prod.salePrice === "number" && prod.salePrice >= 0 ? prod.salePrice : (prod.regularPrice || 0);
        
        subtotal += priceToUse * item.quantity;
        
        finalItems.push({
          cartItemId: item.cartItemId || `item-${Date.now()}-${Math.random()}`,
          productId: item.productId,
          type: "product",
          name: prod.name,
          sku: prod.sku || "",
          price: priceToUse,
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
          image: prod.images?.[0] || prod.thumbnail || "",
          product: { id: item.productId, ...prod } // Store snapshot
        });

      } else if (item.bundleId) {
        // Fetch bundle from products collection as per rules
        const bundleSnap = await adminDb.collection("products").doc(item.bundleId).get();
        if (!bundleSnap.exists) {
           return NextResponse.json({ error: `Bundle not found: ${item.bundleId}` }, { status: 400 });
        }
        const bundle = bundleSnap.data() as any;
        if (!bundle.isBundle) {
           return NextResponse.json({ error: `Item is not a bundle: ${item.bundleId}` }, { status: 400 });
        }
        if (bundle.isActive === false) {
          return NextResponse.json({ error: `Bundle is not active: ${bundle.name}` }, { status: 400 });
        }

        let selectedProductsData: any[] = [];
        
        if (bundle.bundleType === "mix_and_match") {
          // Strictly validate mix and match selections
          if (item.quantity !== 1) {
            return NextResponse.json({ error: `Mix and Match bundles must have quantity 1. Received: ${item.quantity}` }, { status: 400 });
          }
          if (item.selectedProductIds) {
            if (item.selectedProductIds.length !== bundle.selectionLimit) {
               return NextResponse.json({ error: `Invalid selection count for ${bundle.name}. Expected ${bundle.selectionLimit}, got ${item.selectedProductIds.length}.` }, { status: 400 });
            }
            
            const uniqueSelections = new Set(item.selectedProductIds);
            if (uniqueSelections.size !== item.selectedProductIds.length) {
               return NextResponse.json({ error: `Duplicate selections are not allowed in ${bundle.name}.` }, { status: 400 });
            }
            
            const serverEligibleSnapshots = bundle.eligibleProductsSnapshot || [];
            const allowedIds = new Set([
              ...(bundle.eligibleProductIds || []),
              ...serverEligibleSnapshots.map((s: any) => s.productId || s.id).filter(Boolean)
            ]);
            
            for (const pid of item.selectedProductIds) {
              if (!allowedIds.has(pid)) {
                 return NextResponse.json({ error: `Invalid product selected in bundle ${bundle.name}: ${pid}` }, { status: 400 });
              }
              const snap = serverEligibleSnapshots.find((s: any) => s.productId === pid || s.id === pid);
              if (snap) {
                selectedProductsData.push(snap);
              }
            }
          } else if (item.selectedBundleItemIds) {
            if (item.selectedBundleItemIds.length !== bundle.selectionLimit) {
               return NextResponse.json({ error: `Invalid selection count for ${bundle.name}. Expected ${bundle.selectionLimit}, got ${item.selectedBundleItemIds.length}.` }, { status: 400 });
            }
            
            const uniqueSelections = new Set(item.selectedBundleItemIds);
            if (uniqueSelections.size !== item.selectedBundleItemIds.length) {
               return NextResponse.json({ error: `Duplicate selections are not allowed in ${bundle.name}.` }, { status: 400 });
            }

            // We will resolve and validate bundle items inside the transaction later
            // We just store the IDs for now
            selectedProductsData = item.selectedBundleItemIds.map(id => ({ productId: id }));
          } else {
            return NextResponse.json({ error: `Missing selection for mix and match bundle: ${bundle.name}` }, { status: 400 });
          }
          
          if (selectedProductsData.length !== bundle.selectionLimit) {
            return NextResponse.json({ error: `Failed to resolve all selected products for bundle ${bundle.name}.` }, { status: 400 });
          }
          
          if (selectedProductsData.length !== bundle.selectionLimit) {
            return NextResponse.json({ error: `Failed to resolve all selected products for bundle ${bundle.name}.` }, { status: 400 });
          }
        }

        const priceToUse = typeof bundle.salePrice === "number" && bundle.salePrice >= 0 ? bundle.salePrice : (bundle.regularPrice || 0);
        
        subtotal += priceToUse * item.quantity;
        
        finalItems.push({
          cartItemId: item.cartItemId || `item-${Date.now()}-${Math.random()}`,
          cartLineId: item.cartLineId || undefined,
          bundleId: item.bundleId,
          type: bundle.bundleType === "mix_and_match" ? "mix_and_match_bundle" : "bundle",
          bundleType: bundle.bundleType,
          bundleName: bundle.name,
          bundleSku: bundle.sku || "",
          bundlePrice: priceToUse,
          price: priceToUse,
          quantity: item.quantity,
          includedItems: bundle.includedItems || [],
          selectedProducts: selectedProductsData,
          image: bundle.images?.[0] || bundle.thumbnail || "",
          product: { id: item.bundleId, ...bundle } // Store snapshot
        });
      } else {
        return NextResponse.json({ error: "Invalid cart item, missing productId or bundleId" }, { status: 400 });
      }
    }

    // Process Coupon
    let discount = 0;
    let appliedCouponId: string | null = null;
    let appliedCouponCode: string | null = null;
    let couponRef: FirebaseFirestore.DocumentReference | null = null;

    if (couponCode) {
      const couponsSnap = await adminDb.collection("coupons").where("code", "==", couponCode.toUpperCase()).get();
      if (!couponsSnap.empty) {
        const couponDoc = couponsSnap.docs[0];
        const coupon = couponDoc.data();
        const minOrder = coupon.minimumOrderAmount || coupon.minOrderValue || 0;
        
        if (coupon.active !== false && subtotal >= minOrder) {
          // Check expiry
          let isExpired = false;
          if (coupon.expiryDate) {
            if (new Date(coupon.expiryDate) < new Date()) {
               isExpired = true;
            }
          }

          if (!isExpired) {
            let calcDiscount = 0;
            if (coupon.type === "flat" || coupon.type === "fixed") {
              calcDiscount = Number(coupon.value) || 0;
            } else if (coupon.type === "percent" || coupon.type === "percentage") {
              calcDiscount = (subtotal * (Number(coupon.value) || 0)) / 100;
              const maxDiscount = Number(coupon.maximumDiscount);
              if (maxDiscount && calcDiscount > maxDiscount) {
                calcDiscount = maxDiscount;
              }
            }

            discount = Math.floor(calcDiscount);
            appliedCouponId = couponDoc.id;
            appliedCouponCode = coupon.code;
            couponRef = couponDoc.ref;
          }
        }
      }
    }

    // Settings for shipping
    const settingsSnap = await adminDb.collection("siteSettings").doc("config").get();
    let shippingFee = 79;
    let freeShippingThreshold = 999;
    if (settingsSnap.exists) {
      const s = settingsSnap.data() as any;
      if (s.shippingFee !== undefined && s.shippingFee !== null) shippingFee = Number(s.shippingFee);
      if (s.freeShippingThreshold !== undefined && s.freeShippingThreshold !== null) freeShippingThreshold = Number(s.freeShippingThreshold);
    }

    let shipping = 0;
    if (subtotal > 0 && subtotal < freeShippingThreshold) {
      shipping = shippingFee;
    }

    // Gift Wrap
    const giftWrapPriceConst = 99;
    let giftWrapPrice = 0;
    if (giftWrapSelected === true) {
      giftWrapPrice = giftWrapPriceConst;
    }

    let total = Math.max(subtotal + shipping - discount, 0) + giftWrapPrice;

    // Advanced COD Logic
    let displayPaymentMethod = paymentMethod || "cod";
    if (displayPaymentMethod === "cod") {
      displayPaymentMethod = "Cash on Delivery";
    }

    if (displayPaymentMethod === "Cash on Delivery" && total <= 300) {
      return NextResponse.json({ error: "Minimum order value for Cash on Delivery is ₹301." }, { status: 400 });
    }

    let initialStatus = "Pending";
    let initialDesc = "Your order has been placed successfully.";
    let advanceRequired = false;
    let advanceAmount = 0;
    let amountPaid = 0;
    let payOnDeliveryAmount = total;
    let codAdvanceStatus = "not_required";
    let initialPaymentStatus = "cod_pending";

    if (displayPaymentMethod === "Cash on Delivery") {
      if (total > 300) {
        initialStatus = "Pending Advance";
        initialDesc = "Your order requires a ₹100 advance payment to be confirmed.";
        advanceRequired = true;
        advanceAmount = 100;
        payOnDeliveryAmount = total - 100;
        codAdvanceStatus = "pending";
        initialPaymentStatus = "pending_advance";
        displayPaymentMethod = "cod_with_advance";
      } else {
        initialStatus = "Pending";
        initialDesc = "Your Cash on Delivery order has been received and is pending phone or WhatsApp verification.";
        initialPaymentStatus = "cod_pending";
      }
    }

    const now = new Date().toISOString();
    const orderDocRef = adminDb.collection("orders").doc();
    const orderId = orderDocRef.id;

    // Use a transaction for stock decrements and counter updates
    await adminDb.runTransaction(async (t) => {
      // 1. Resolve and validate bundle items
      const bundlesToProcess = new Map<string, any[]>();
      const existingProductIdsToFetch = new Set<string>();
      
      for (let i = 0; i < finalItems.length; i++) {
        const finalItem = finalItems[i];
        if (finalItem.type === "mix_and_match_bundle") {
          if (!bundlesToProcess.has(finalItem.bundleId)) {
            bundlesToProcess.set(finalItem.bundleId, []);
          }
          bundlesToProcess.get(finalItem.bundleId)!.push(finalItem);

          if (finalItem.product?.sourceType === "existing_products") {
             for (const p of finalItem.selectedProducts) {
                existingProductIdsToFetch.add(p.productId || p.id || p.itemId);
             }
          }
        }
      }

      // Fetch all unique bundles and live products inside transaction
      const bundleRefs = Array.from(bundlesToProcess.keys()).map(id => adminDb!.collection("products").doc(id));
      const existingProductRefs = Array.from(existingProductIdsToFetch).map(id => adminDb!.collection("products").doc(id));
      
      const allRefs = [...bundleRefs, ...existingProductRefs];
      const allSnaps = allRefs.length > 0 ? await t.getAll(...allRefs) : [];
      
      const bundleSnaps = allSnaps.slice(0, bundleRefs.length);
      const existingProductSnaps = allSnaps.slice(bundleRefs.length);
      
      const existingProductsMap = new Map<string, any>();
      existingProductSnaps.forEach(snap => {
         if (snap.exists) {
            existingProductsMap.set(snap.id, snap.data());
         }
      });

      for (let i = 0; i < bundleSnaps.length; i++) {
        const snap = bundleSnaps[i];
        if (!snap.exists) {
          throw new Error(`Bundle not found: ${snap.id}`);
        }
        const bundle = snap.data() as any;
        if (bundle.isBundle !== true) {
          throw new Error(`Item is not a bundle: ${bundle.name}`);
        }
        if (bundle.isActive === false) {
          throw new Error(`Bundle is not active: ${bundle.name}`);
        }

        const relatedFinalItems = bundlesToProcess.get(snap.id)!;
        
        // Verify selection limit strictly
        if (relatedFinalItems.some(f => f.selectedProducts.length !== bundle.selectionLimit)) {
          throw new Error(`Invalid selection count for bundle ${bundle.name}`);
        }

        if (bundle.sourceType === "bundle_items") {
          const independentBundleItems = bundle.independentBundleItems || [];
          if (independentBundleItems.length === 0) {
            throw new Error(`Bundle ${bundle.name} has no items configured.`);
          }
          let updated = false;

          for (const finalItem of relatedFinalItems) {
            const selectedProductsData = finalItem.selectedProducts; 
            for (let j = 0; j < selectedProductsData.length; j++) {
              const pData = selectedProductsData[j];
              const pId = pData.productId || pData.id || pData.itemId;
              
              const itemIndex = independentBundleItems.findIndex((x: any) => (x.id === pId) || (x.productId === pId));
              if (itemIndex === -1) {
                throw new Error(`Bundle item not found in bundle ${bundle.name}: ${pId}`);
              }

              const bItem = independentBundleItems[itemIndex];
              if (bItem.active === false) {
                throw new Error(`Bundle item ${bItem.name || pId} is no longer active`);
              }

              const quantityToDecrement = finalItem.quantity;
              const hasStock = bItem.stock === undefined || bItem.stock === null || Number(bItem.stock) >= quantityToDecrement;
              if (!hasStock) {
                throw new Error(`Bundle item ${bItem.name || pId} is out of stock or insufficient quantity`);
              }

              // Decrement stock
              if (bItem.stock !== undefined && bItem.stock !== null) {
                bItem.stock -= quantityToDecrement;
                if (bItem.stock <= 0) {
                  bItem.active = false;
                }
                updated = true;
              }
              independentBundleItems[itemIndex] = bItem;

              // Hydrate the selected item snapshot cleanly in finalItems
              finalItem.selectedProducts[j] = {
                itemId: pId,
                name: bItem.name,
                sku: bItem.sku || "",
                image: bItem.image || bItem.images?.[0] || "",
                selectedQuantity: quantityToDecrement
              };
            }
          }

          if (updated) {
            t.update(snap.ref, { independentBundleItems });
          }
        } else if (bundle.sourceType === "existing_products") {
          for (const finalItem of relatedFinalItems) {
            const selectedProductsData = finalItem.selectedProducts; 
            for (let j = 0; j < selectedProductsData.length; j++) {
              const pData = selectedProductsData[j];
              const pId = pData.productId || pData.id || pData.itemId;
              
              // Validate product active/stock safely from live product doc
              const liveProduct = existingProductsMap.get(pId);
              if (!liveProduct) {
                throw new Error(`Product not found for bundle ${bundle.name}: ${pId}`);
              }
              if (liveProduct.isActive === false) {
                 throw new Error(`Product ${liveProduct.name || pId} is no longer active`);
              }
              
              const quantityToDecrement = finalItem.quantity;
              const hasStock = liveProduct.stock === undefined || liveProduct.stock === null || Number(liveProduct.stock) >= quantityToDecrement;
              if (!hasStock) {
                 throw new Error(`Product ${liveProduct.name || pId} is out of stock`);
              }

              // Decrement stock for real existing products
              if (liveProduct.stock !== undefined && liveProduct.stock !== null) {
                liveProduct.stock -= quantityToDecrement;
                if (liveProduct.stock <= 0) {
                  liveProduct.isActive = false;
                }
                const pRef = adminDb!.collection("products").doc(pId);
                t.update(pRef, { 
                  stock: liveProduct.stock,
                  isActive: liveProduct.isActive,
                  updatedAt: new Date().toISOString()
                });
              }

              const serverEligibleSnapshots = bundle.eligibleProductsSnapshot || [];
              const eligibleSnap = serverEligibleSnapshots.find((s: any) => s.productId === pId || s.id === pId);
              
              if (!eligibleSnap) {
                const allowedIds = new Set(bundle.eligibleProductIds || []);
                if (!allowedIds.has(pId)) {
                  throw new Error(`Invalid product selected in bundle ${bundle.name}: ${pId}`);
                }
              }

              // Ensure the snapshot has safe formatting for old orders
              finalItem.selectedProducts[j] = {
                itemId: pId,
                name: liveProduct.name || eligibleSnap?.name || pData.name || "",
                sku: liveProduct.sku || eligibleSnap?.sku || pData.sku || "",
                image: liveProduct.images?.[0] || eligibleSnap?.image || eligibleSnap?.images?.[0] || pData.image || pData.images?.[0] || "",
                selectedQuantity: quantityToDecrement
              };
            }
          }
        } else {
           throw new Error(`Unknown bundle source type configured for ${bundle.name}`);
        }
      }

      // 2. Generate Order Number
      const counterRef = adminDb!.collection("counters").doc("orders");
      const countSnap = await t.get(counterRef);
      let orderCount = 1000;
      if (countSnap.exists) {
        orderCount = (countSnap.data()?.count || 1000) + 1;
        t.update(counterRef, { count: orderCount });
      } else {
        t.set(counterRef, { count: orderCount });
      }
      const orderNumber = `LONA${orderCount}`;

      const initialTimeline = [
        {
          status: "Pending",
          title: "Order Placed",
          description: "Your order has been placed successfully.",
          timestamp: now
        },
        {
          status: initialStatus,
          title: initialStatus,
          description: initialDesc,
          timestamp: now
        }
      ];

      const newOrder = {
        id: orderId,
        orderNumber,
        userId: uid,
        customerName: address.fullName,
        customerEmail: userData?.email || "guest@example.com",
        customerPhone: address.phone,
        customerPhoneClean: address.phone.replace(/\D/g, ""),
        shippingAddress: address,
        address: address,
        items: finalItems,
        subtotal,
        shippingFee: shipping,
        shipping: shipping,
        discount,
        couponCode: appliedCouponCode || null,
        couponId: appliedCouponId || null,
        total,
        paymentMethod: displayPaymentMethod,
        advanceRequired,
        advanceAmount,
        amountPaid,
        payOnDeliveryAmount,
        codAdvanceStatus,
        paymentStatus: initialPaymentStatus,
        orderStatus: initialStatus,
        status: initialStatus,
        giftWrapSelected: giftWrapSelected === true,
        giftWrapPrice: giftWrapPrice,
        giftMessage: giftMessage || null,
        timeline: initialTimeline,
        notes: notes || "",
        createdAt: now,
        updatedAt: now
      };

      const cleanObject = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(cleanObject);
        if (obj !== null && typeof obj === 'object') {
          const newObj: any = {};
          for (const [k, v]  of Object.entries(obj)) {
            if (v !== undefined) {
               newObj[k] = cleanObject(v);
            }
          }
          return newObj;
        }
        return obj;
      };

      const cleanOrder = cleanObject(newOrder);

      // Save order
      t.set(orderDocRef, cleanOrder);

      // Save Public Tracking Order
      const publicTrackingOrder = {
        orderId,
        orderNumber,
        orderStatus: initialStatus,
        status: initialStatus,
        paymentMethod: displayPaymentMethod,
        paymentStatus: initialPaymentStatus,
        customerPhoneLast4: address.phone.replace(/\D/g, "").slice(-4),
        timeline: initialTimeline,
        createdAt: now,
        updatedAt: now,
        courierName: "",
        trackingNumber: "",
        trackingUrl: ""
      };
      const ptoRef = adminDb!.collection("publicTrackingOrders").doc(orderId);
      t.set(ptoRef, publicTrackingOrder);

      // Save Order Lookup
      const lookupData = {
        orderId,
        orderNumber,
        customerPhoneLast4: address.phone.replace(/\D/g, "").slice(-4),
        createdAt: now
      };
      const lookupRef = adminDb!.collection("orderLookups").doc(orderId);
      t.set(lookupRef, lookupData);

      // Update coupon
      if (couponRef) {
        t.update(couponRef, {
          usedCount: FieldValue.increment(1)
        });
      }
    });

    return NextResponse.json({ success: true, orderId });

  } catch (err: any) {
    console.error("Order creation API error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request. Please check your details.", issues: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to place order right now. Please contact support." }, { status: 500 });
  }
}
