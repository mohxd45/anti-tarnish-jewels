import { db, storage, auth, hasRealFirebase } from "@/lib/firebase";
import {
  Product,
  Order,
  Coupon,
  OrderStatus,
  SiteContent,
  Banner,
  SiteSettings,
  HomepageSection,
  Category,
  SEOSettings,
  AnnouncementSettings,
  ContactMessage,
  CartItem,
  Address
} from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteField,
  where,
  limit
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { sampleProducts } from "@/data/products";

// Consistent mock mode detection
const isMock = !hasRealFirebase;

// Session storage cache helpers
function safeParseJSON<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    const parsed = JSON.parse(jsonStr);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (e) {
    console.warn("JSON parsing failed, returning fallback:", e);
    return fallback;
  }
}

function getSessionCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const parsed = safeParseJSON<{ expiry: number; value: T } | null>(stored, null);
      if (parsed && parsed.expiry && parsed.expiry > Date.now()) {
        return parsed.value;
      }
      sessionStorage.removeItem(key);
    }
  } catch (e) {
    console.warn("Failed to get session cache:", e);
  }
  return null;
}

function setSessionCache<T>(key: string, value: T, ttlMs = 5 * 60 * 1000): void {
  if (typeof window === "undefined") return;
  try {
    const item = {
      value,
      expiry: Date.now() + ttlMs
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn("Failed to set session cache:", e);
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore query timed out")), timeoutMs)
    )
  ]);
}

// Memory Cache Store
let cachedProducts: Product[] | null = null;
let cachedProductBySlug: Record<string, Product> = {};
let cachedCategories: Category[] | null = null;
let cachedCoupons: Coupon[] | null = null;
let cachedBanners: Banner[] | null = null;
let cachedSiteSettings: SiteSettings | null = null;
let cachedHomepageSections: HomepageSection[] | null = null;
let cachedReviews: any[] | null = null;
let cachedSiteContent: Record<string, any> = {};
let cachedAnnouncements: AnnouncementSettings | null = null;
let cachedSEOSettings: SEOSettings | null = null;
let cachedOrders: Order[] | null = null;
let cachedUsers: any[] | null = null;
let cachedContactMessages: ContactMessage[] | null = null;
let cachedCollections: string[] | null = null;

// Helper to clear caches
export function clearAllCaches() {
  cachedProducts = null;
  cachedProductBySlug = {};
  cachedCategories = null;
  cachedCoupons = null;
  cachedBanners = null;
  cachedSiteSettings = null;
  cachedHomepageSections = null;
  cachedReviews = null;
  cachedSiteContent = {};
  cachedAnnouncements = null;
  cachedSEOSettings = null;
  cachedOrders = null;
  cachedUsers = null;
  cachedContactMessages = null;
  cachedCollections = null;

  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("atj_cache_products");
      sessionStorage.removeItem("atj_cache_categories");
      sessionStorage.removeItem("atj_cache_coupons");
      sessionStorage.removeItem("atj_cache_banners");
      sessionStorage.removeItem("atj_cache_site_settings");
      sessionStorage.removeItem("atj_cache_homepage_sections");
      sessionStorage.removeItem("atj_cache_reviews");
      sessionStorage.removeItem("atj_cache_announcements");
      sessionStorage.removeItem("atj_cache_seoSettings");
      sessionStorage.removeItem("atj_cache_orders");
      sessionStorage.removeItem("atj_cache_users");
      sessionStorage.removeItem("atj_cache_contact_messages");
      sessionStorage.removeItem("atj_cache_collections");
      
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith("atj_cache_siteContent_") || key.startsWith("atj_cache_product_slug_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch {}
  }
}

// PRODUCTS
export async function getProducts(forceRefresh = false): Promise<Product[]> {
  if (!forceRefresh) {
    if (cachedProducts) return cachedProducts;

    const sessionCached = getSessionCache<Product[]>("atj_cache_products");
    if (sessionCached) {
      cachedProducts = sessionCached;
      return sessionCached;
    }
  }

  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_products");
      if (stored) {
        const parsed = safeParseJSON<Product[]>(stored, sampleProducts);
        cachedProducts = Array.isArray(parsed) ? parsed : sampleProducts;
        setSessionCache("atj_cache_products", cachedProducts);
        return cachedProducts;
      } else {
        localStorage.setItem("mock_products", JSON.stringify(sampleProducts));
      }
    }
    cachedProducts = sampleProducts;
    setSessionCache("atj_cache_products", cachedProducts);
    return sampleProducts;
  }
  try {
    const snap = await withTimeout(getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))));
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    cachedProducts = products.length ? products : sampleProducts;
    setSessionCache("atj_cache_products", cachedProducts);
    return cachedProducts;
  } catch (err) {
    console.warn("Firestore getProducts failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_products");
      if (stored) {
        const parsed = safeParseJSON<Product[]>(stored, sampleProducts);
        cachedProducts = Array.isArray(parsed) ? parsed : sampleProducts;
        setSessionCache("atj_cache_products", cachedProducts);
        return cachedProducts;
      }
    }
    cachedProducts = sampleProducts;
    setSessionCache("atj_cache_products", cachedProducts);
    return sampleProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (cachedProductBySlug[slug]) return cachedProductBySlug[slug];
  const sessionCached = getSessionCache<Product>(`atj_cache_product_slug_${slug}`);
  if (sessionCached) {
    cachedProductBySlug[slug] = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    const products = await getProducts();
    const found = products.find((p) => p.slug === slug) ?? null;
    if (found) {
      cachedProductBySlug[slug] = found;
      setSessionCache(`atj_cache_product_slug_${slug}`, found);
    }
    return found;
  }
  try {
    const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
    const snap = await withTimeout(getDocs(q));
    if (!snap.empty) {
      const d = snap.docs[0];
      const found = { id: d.id, ...d.data() } as Product;
      cachedProductBySlug[slug] = found;
      setSessionCache(`atj_cache_product_slug_${slug}`, found);
      return found;
    }
    return null;
  } catch (err) {
    console.warn("Firestore getProductBySlug failed, falling back to cache:", err);
    const products = await getProducts();
    const found = products.find((p) => p.slug === slug) ?? null;
    if (found) {
      cachedProductBySlug[slug] = found;
      setSessionCache(`atj_cache_product_slug_${slug}`, found);
    }
    return found;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  if (isMock) {
    const products = await getProducts();
    return products.find((p) => p.id === id) ?? null;
  }
  try {
    const d = await withTimeout(getDoc(doc(db, "products", id)));
    if (d.exists()) {
      return { id: d.id, ...d.data() } as Product;
    }
    return null;
  } catch (err) {
    console.warn("Firestore getProduct failed, falling back to cache:", err);
    const products = await getProducts();
    return products.find((p) => p.id === id) ?? null;
  }
}

export async function getSimilarProducts(category: string, excludeId: string, limitCount = 4): Promise<Product[]> {
  if (isMock) {
    const products = await getProducts();
    let list = products.filter((p) => p.category === category && p.id !== excludeId && p.isActive !== false);
    if (list.length === 0) {
      list = products.filter((p) => p.id !== excludeId && p.isActive !== false);
    }
    return list.slice(0, limitCount);
  }
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      limit(limitCount + 5)
    );
    const snap = await withTimeout(getDocs(q));
    let list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Product))
      .filter((p) => p.id !== excludeId && p.isActive !== false);

    if (list.length === 0) {
      const q2 = query(collection(db, "products"), limit(limitCount + 5));
      const snap2 = await withTimeout(getDocs(q2));
      list = snap2.docs
        .map((d) => ({ id: d.id, ...d.data() } as Product))
        .filter((p) => p.id !== excludeId && p.isActive !== false);
    }
    return list.slice(0, limitCount);
  } catch (err) {
    console.warn("Firestore getSimilarProducts failed, falling back to cache:", err);
    const products = await getProducts();
    let list = products.filter((p) => p.category === category && p.id !== excludeId && p.isActive !== false);
    if (list.length === 0) {
      list = products.filter((p) => p.id !== excludeId && p.isActive !== false);
    }
    return list.slice(0, limitCount);
  }
}

export function getOptimizedImageUrl(url: string, width = 800): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com")) {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex !== -1) {
      const prefix = url.slice(0, uploadIndex + 8);
      const suffix = url.slice(uploadIndex + 8);
      return `${prefix}w_${width},f_auto,q_auto/${suffix}`;
    }
  }
  return url;
}

export async function addProduct(product: Omit<Product, "id">) {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const products = await getProducts();
    const newProduct = { ...product, id: "product-" + Math.random().toString(36).substr(2, 9) } as Product;
    products.unshift(newProduct);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_products", JSON.stringify(products));
    }
    return { id: newProduct.id };
  }
  try {
    // Prevent undefined values from crashing Firestore
    const cleanProduct: any = {};
    Object.entries(product).forEach(([k, v]) => {
      if (v !== undefined) cleanProduct[k] = v;
    });

    const ref = await addDoc(collection(db, "products"), cleanProduct);
    return { id: ref.id };
  } catch (err) {
    console.error("Firestore addProduct failed:", err);
    throw err;
  }
}

export async function updateProduct(id: string, product: Partial<Product>) {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const products = await getProducts();
    const updated = products.map((p) => (p.id === id ? { ...p, ...product } : p));
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_products", JSON.stringify(updated));
    }
    return;
  }
  try {
    const cleanProduct: any = {};
    Object.entries(product).forEach(([k, v]) => {
      if (v !== undefined) cleanProduct[k] = v;
    });
    await updateDoc(doc(db, "products", id), cleanProduct);
  } catch (err) {
    console.error("Firestore updateProduct failed:", err);
    throw err;
  }
}

export async function deleteProduct(id: string) {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const products = await getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_products", JSON.stringify(filtered));
    }
    return;
  }
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (err) {
    console.warn("Firestore deleteProduct failed, falling back to localStorage:", err);
    const products = await getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_products", JSON.stringify(filtered));
    }
  }
}

// PROFILE
export async function saveUserProfile(uid: string, data: Record<string, unknown>) {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    console.log("[Mock] saveUserProfile", uid, data);
    if (typeof window !== "undefined") {
      try {
        const storedKey = `mock_user_profile_${uid}`;
        const existing = localStorage.getItem(storedKey);
        const current = existing ? JSON.parse(existing) : {};
        const updated = { ...current, ...data };
        localStorage.setItem(storedKey, JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to save mock user profile to localStorage:", err);
      }
    }
    return;
  }
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (err) {
    console.error("Error saving user profile to database:", err);
  }
}

export async function getUserProfile(uid: string): Promise<any | null> {
  if (isMock) {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`mock_user_profile_${uid}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.warn("Failed to read mock user profile from localStorage:", err);
      }
    }
    return null;
  }
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
  return null;
}

// ORDERS
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const suffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `ATJ-${year}${month}${date}-${suffix}`;
}

export async function createOrder(orderData: {
  userId: string;
  customerEmail: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  couponCode?: string;
  couponId?: string;
  notes?: string;
}) {
  clearAllCaches(); // Invalidate cache
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();
  
  // Format paymentMethod cleanly
  let displayPaymentMethod = orderData.paymentMethod;
  if (orderData.paymentMethod === "cod") {
    displayPaymentMethod = "Cash on Delivery";
  } else if (orderData.paymentMethod === "stripe") {
    displayPaymentMethod = "Stripe (Card)";
  } else if (orderData.paymentMethod === "razorpay") {
    displayPaymentMethod = "Razorpay (UPI / Net)";
  }

  let initialStatus: OrderStatus = "Pending";
  let initialDesc = "Your order has been placed successfully.";

  if (displayPaymentMethod === "Cash on Delivery") {
    initialStatus = "Pending Verification";
    initialDesc = "Your Cash on Delivery order has been received and is pending phone or WhatsApp verification.";
  }

  const initialTimeline = [
    {
      status: "Pending" as OrderStatus,
      title: "Order Placed",
      description: "Your order has been placed successfully.",
      timestamp: now
    },
    {
      status: "Pending Verification" as OrderStatus,
      title: "Pending Verification",
      description: initialDesc,
      timestamp: now
    }
  ];

  // Merge standard checkout fields into the new required order schema
  const newOrder: Order = {
    id: "", // will be filled below
    orderNumber,
    userId: orderData.userId,
    customerName: orderData.address.fullName || "Guest",
    customerEmail: orderData.customerEmail || "no-email@example.com",
    customerPhone: orderData.address.phone || "",
    customerPhoneClean: (orderData.address.phone || "").replace(/[^0-9]/g, ""),
    shippingAddress: orderData.address,
    address: orderData.address, // fallback
    items: orderData.items,
    subtotal: orderData.subtotal,
    shippingFee: orderData.shipping,
    shipping: orderData.shipping, // fallback
    discount: orderData.discount,
    couponCode: orderData.couponCode || "",
    couponId: orderData.couponId || "",
    total: orderData.total,
    paymentMethod: displayPaymentMethod,
    paymentStatus: "Pending",
    orderStatus: initialStatus,
    status: initialStatus, // fallback
    trackingNumber: "",
    courierName: "",
    trackingUrl: "",
    timeline: initialTimeline,
    notes: orderData.notes || "",
    createdAt: now,
    updatedAt: now
  };

  const cleanPhone = (orderData.address.phone || "").replace(/[^0-9]/g, "");
  const orderDocId = `${orderNumber}_${cleanPhone}`;
  newOrder.id = orderDocId;

  // Safe tracking info schema
  const publicTrackingOrder = {
    id: orderDocId,
    orderNumber,
    orderStatus: initialStatus,
    status: initialStatus, // fallback
    paymentMethod: displayPaymentMethod,
    paymentStatus: "Pending",
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
    timeline: initialTimeline,
    createdAt: now,
    updatedAt: now,
    items: orderData.items.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        images: item.product.images || [],
        salePrice: item.product.salePrice
      },
      quantity: item.quantity
    })),
    total: orderData.total,
    subtotal: orderData.subtotal,
    shippingFee: orderData.shipping,
    discount: orderData.discount,
    shippingAddress: {
      fullName: "",
      phone: "",
      line1: "",
      city: orderData.address.city,
      state: orderData.address.state,
      pincode: ""
    },
    address: {
      fullName: "",
      phone: "",
      line1: "",
      city: orderData.address.city,
      state: orderData.address.state,
      pincode: ""
    }
  };

  // Lookup key schema
  const lookupData = {
    orderId: orderDocId,
    orderNumber,
    customerPhoneLast4: cleanPhone.slice(-4),
    createdAt: now
  };

  if (isMock) {
    if (typeof window !== "undefined") {
      // 1. mock_orders
      const existingOrders = localStorage.getItem("mock_orders");
      const orders = safeParseJSON<Order[]>(existingOrders, []);
      orders.unshift(newOrder);
      localStorage.setItem("mock_orders", JSON.stringify(orders));

      // 2. mock_public_tracking_orders
      const existingTracking = localStorage.getItem("mock_public_tracking_orders");
      const trackingOrders = safeParseJSON<any[]>(existingTracking, []);
      trackingOrders.unshift(publicTrackingOrder);
      localStorage.setItem("mock_public_tracking_orders", JSON.stringify(trackingOrders));

      // 3. mock_order_lookups
      const existingLookups = localStorage.getItem("mock_order_lookups");
      const lookups = safeParseJSON<any[]>(existingLookups, []);
      lookups.unshift(lookupData);
      localStorage.setItem("mock_order_lookups", JSON.stringify(lookups));

      // Increment coupon usage count
      const codeToSearch = newOrder.couponCode;
      if (codeToSearch) {
        const existingCoupons = localStorage.getItem("mock_coupons");
        const mockCoupons = safeParseJSON<Coupon[]>(existingCoupons, defaultCoupons);
        const coupon = mockCoupons.find(c => c.code.toUpperCase() === codeToSearch.toUpperCase());
        if (coupon) {
          const newUsedCount = (coupon.usedCount ?? coupon.usageCount ?? 0) + 1;
          const updated = mockCoupons.map(c => c.id === coupon.id ? { ...c, usedCount: newUsedCount, usageCount: newUsedCount } : c);
          localStorage.setItem("mock_coupons", JSON.stringify(updated));
        }
      }
    }
    return newOrder.orderNumber;
  }

  try {
    await setDoc(doc(db, "orders", orderDocId), newOrder);
    await setDoc(doc(db, "publicTrackingOrders", orderDocId), publicTrackingOrder);
    await setDoc(doc(db, "orderLookups", orderDocId), lookupData);

    // Increment coupon usage count
    const codeToSearch = newOrder.couponCode;
    if (codeToSearch) {
      const coupons = await getCoupons();
      const coupon = coupons.find(c => c.code.toUpperCase() === codeToSearch.toUpperCase());
      if (coupon) {
        const newUsedCount = (coupon.usedCount ?? coupon.usageCount ?? 0) + 1;
        await updateDoc(doc(db, "coupons", coupon.id), {
          usedCount: newUsedCount,
          usageCount: newUsedCount
        });
      }
    }
    return newOrder.orderNumber;
  } catch (err) {
    console.warn("Firestore createOrder failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const existingOrders = localStorage.getItem("mock_orders");
      const orders = safeParseJSON<Order[]>(existingOrders, []);
      orders.unshift(newOrder);
      localStorage.setItem("mock_orders", JSON.stringify(orders));

      const existingTracking = localStorage.getItem("mock_public_tracking_orders");
      const trackingOrders = safeParseJSON<any[]>(existingTracking, []);
      trackingOrders.unshift(publicTrackingOrder);
      localStorage.setItem("mock_public_tracking_orders", JSON.stringify(trackingOrders));

      const existingLookups = localStorage.getItem("mock_order_lookups");
      const lookups = safeParseJSON<any[]>(existingLookups, []);
      lookups.unshift(lookupData);
      localStorage.setItem("mock_order_lookups", JSON.stringify(lookups));

      // Increment coupon usage count
      const codeToSearchFallback = newOrder.couponCode;
      if (codeToSearchFallback) {
        const existingCoupons = localStorage.getItem("mock_coupons");
        const mockCoupons = safeParseJSON<Coupon[]>(existingCoupons, defaultCoupons);
        const coupon = mockCoupons.find(c => c.code.toUpperCase() === codeToSearchFallback.toUpperCase());
        if (coupon) {
          const newUsedCount = (coupon.usedCount ?? coupon.usageCount ?? 0) + 1;
          const updated = mockCoupons.map(c => c.id === coupon.id ? { ...c, usedCount: newUsedCount, usageCount: newUsedCount } : c);
          localStorage.setItem("mock_coupons", JSON.stringify(updated));
        }
      }
    }
    return newOrder.orderNumber;
  }
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  const queryStr = orderNumber.trim();
  if (!queryStr) return null;

  if (isMock) {
    const orders = await getAllOrders();
    const queryLower = queryStr.toLowerCase();
    return orders.find((o) => o.orderNumber && o.orderNumber.toLowerCase() === queryLower) || null;
  }

  const currentUser = auth.currentUser;
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("user_role") === "admin";

  try {
    if (isAdmin) {
      const q = query(
        collection(db, "orders"),
        where("orderNumber", "==", queryStr)
      );
      const snap = await withTimeout(getDocs(q));
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as Order;
      }
    } else if (currentUser) {
      const q1 = query(
        collection(db, "orders"),
        where("orderNumber", "==", queryStr),
        where("userId", "==", currentUser.uid)
      );
      const snap1 = await withTimeout(getDocs(q1));
      if (!snap1.empty) {
        return { id: snap1.docs[0].id, ...snap1.docs[0].data() } as Order;
      }

      if (currentUser.email) {
        const q2 = query(
          collection(db, "orders"),
          where("orderNumber", "==", queryStr),
          where("customerEmail", "==", currentUser.email)
        );
        const snap2 = await withTimeout(getDocs(q2));
        if (!snap2.empty) {
          return { id: snap2.docs[0].id, ...snap2.docs[0].data() } as Order;
        }
      }
    }
  } catch (err) {
    console.warn("Firestore getOrderByOrderNumber query failed:", err);
  }

  return null;
}

export async function getOrderByTrackingNumber(trackingNumber: string): Promise<Order | null> {
  const queryStr = trackingNumber.trim();
  if (!queryStr) return null;

  if (isMock) {
    const orders = await getAllOrders();
    const queryLower = queryStr.toLowerCase();
    return orders.find((o) => o.trackingNumber && o.trackingNumber.toLowerCase() === queryLower) || null;
  }

  const currentUser = auth.currentUser;
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("user_role") === "admin";

  try {
    if (isAdmin) {
      const q = query(
        collection(db, "orders"),
        where("trackingNumber", "==", queryStr)
      );
      const snap = await withTimeout(getDocs(q));
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as Order;
      }
    } else if (currentUser) {
      const q1 = query(
        collection(db, "orders"),
        where("trackingNumber", "==", queryStr),
        where("userId", "==", currentUser.uid)
      );
      const snap1 = await withTimeout(getDocs(q1));
      if (!snap1.empty) {
        return { id: snap1.docs[0].id, ...snap1.docs[0].data() } as Order;
      }

      if (currentUser.email) {
        const q2 = query(
          collection(db, "orders"),
          where("trackingNumber", "==", queryStr),
          where("customerEmail", "==", currentUser.email)
        );
        const snap2 = await withTimeout(getDocs(q2));
        if (!snap2.empty) {
          return { id: snap2.docs[0].id, ...snap2.docs[0].data() } as Order;
        }
      }
    }
  } catch (err) {
    console.warn("Firestore getOrderByTrackingNumber query failed:", err);
  }

  return null;
}

export async function getOrderBySearchValue(value: string): Promise<Order | null> {
  const queryStr = value.trim();
  if (!queryStr) return null;

  const byOrderNumber = await getOrderByOrderNumber(queryStr);
  if (byOrderNumber) return byOrderNumber;

  const byTrackingNumber = await getOrderByTrackingNumber(queryStr);
  if (byTrackingNumber) return byTrackingNumber;

  const allOrders = await getAllOrders();
  const queryLower = queryStr.toLowerCase();
  const found = allOrders.find(
    (o) =>
      (o.id && o.id.toLowerCase() === queryLower) ||
      (o.id && o.id.slice(-6).toLowerCase() === queryLower)
  );
  return found || null;
}

export async function getUserOrders(userId: string, email?: string): Promise<Order[]> {
  const uid = userId.trim();
  if (!uid) return [];

  if (isMock) {
    const orders = await getAllOrders();
    const uidLower = uid.toLowerCase();
    const emailLower = email?.trim().toLowerCase() || "";
    return orders.filter(
      (o) =>
        (o.userId && o.userId.toLowerCase() === uidLower) ||
        (emailLower && o.customerEmail && o.customerEmail.toLowerCase() === emailLower)
    );
  }

  try {
    const q1 = query(
      collection(db, "orders"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snap1 = await withTimeout(getDocs(q1));
    const orders1 = snap1.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

    if (email && email.trim()) {
      const q2 = query(
        collection(db, "orders"),
        where("customerEmail", "==", email.trim()),
        orderBy("createdAt", "desc")
      );
      const snap2 = await withTimeout(getDocs(q2));
      const orders2 = snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      
      const orderMap = new Map<string, Order>();
      orders1.forEach(o => orderMap.set(o.id, o));
      orders2.forEach(o => orderMap.set(o.id, o));
      return Array.from(orderMap.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return orders1;
  } catch (err) {
    console.warn("Firestore getUserOrders failed, falling back to localStorage:", err);
    const orders = await getAllOrders();
    const uidLower = uid.toLowerCase();
    const emailLower = email?.trim().toLowerCase() || "";
    return orders.filter(
      (o) =>
        (o.userId && o.userId.toLowerCase() === uidLower) ||
        (emailLower && o.customerEmail && o.customerEmail.toLowerCase() === emailLower)
    );
  }
}

export async function getOrderForTracking(searchValue: string, phone: string): Promise<any | null> {
  const queryStr = searchValue.trim();
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (!queryStr || !cleanPhone) return null;

  let orderId: string | null = null;

  if (isMock) {
    if (typeof window !== "undefined") {
      const existingLookups = localStorage.getItem("mock_order_lookups");
      const lookups = safeParseJSON<any[]>(existingLookups, []);
      
      // Match orderNumber and phone
      const lookupObj = lookups.find(l => 
        l.orderNumber.toLowerCase() === queryStr.toLowerCase() && 
        (l.orderId.replace(/[^0-9]/g, "").endsWith(cleanPhone) || l.orderId.endsWith(cleanPhone))
      );

      if (lookupObj) {
        orderId = lookupObj.orderId;
      } else {
        const existingMappings = localStorage.getItem("mock_tracking_mappings");
        const mappings = safeParseJSON<any[]>(existingMappings, []);
        const mappingObj = mappings.find(m => 
          m.trackingNumber.toLowerCase() === queryStr.toLowerCase() && 
          (m.orderId.replace(/[^0-9]/g, "").endsWith(cleanPhone) || m.orderId.endsWith(cleanPhone))
        );
        if (mappingObj) {
          orderId = mappingObj.orderId;
        }
      }

      if (orderId) {
        const existingTracking = localStorage.getItem("mock_public_tracking_orders");
        const trackingOrders = safeParseJSON<any[]>(existingTracking, []);
        const foundTracking = trackingOrders.find(t => t.id === orderId);
        if (foundTracking) return foundTracking;
      }
    }
    return null;
  }

  try {
    const lookupDocId = `${queryStr}_${cleanPhone}`;
    const lookupSnap = await withTimeout(getDoc(doc(db, "orderLookups", lookupDocId)));
    if (lookupSnap.exists()) {
      orderId = lookupSnap.data().orderId;
    } else {
      const mappingDocId = `${queryStr}_${cleanPhone}`;
      const mappingSnap = await withTimeout(getDoc(doc(db, "trackingMappings", mappingDocId)));
      if (mappingSnap.exists()) {
        orderId = mappingSnap.data().orderId;
      }
    }

    if (orderId) {
      const trackingSnap = await withTimeout(getDoc(doc(db, "publicTrackingOrders", orderId)));
      if (trackingSnap.exists()) {
        return { id: trackingSnap.id, ...trackingSnap.data() };
      }
    }
  } catch (err) {
    console.error("Firestore getOrderForTracking error:", err);
  }

  return null;
}

export async function getAdminOrders(): Promise<Order[]> {
  return getAllOrders();
}

export async function getAllOrders(forceRefresh = false): Promise<Order[]> {
  if (!forceRefresh) {
    if (cachedOrders) return cachedOrders;

    const sessionCached = getSessionCache<Order[]>("atj_cache_orders");
    if (sessionCached) {
      cachedOrders = sessionCached;
      return sessionCached;
    }
  }

  if (isMock) {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mock_orders");
      const parsed = safeParseJSON<Order[]>(existing, []);
      cachedOrders = Array.isArray(parsed) ? parsed : [];
      setSessionCache("atj_cache_orders", cachedOrders);
      return cachedOrders;
    }
    return [];
  }
  try {
    const snap = await withTimeout(getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    cachedOrders = list;
    setSessionCache("atj_cache_orders", cachedOrders);
    return list;
  } catch (err) {
    console.warn("Firestore getAllOrders failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mock_orders");
      const parsed = safeParseJSON<Order[]>(existing, []);
      cachedOrders = Array.isArray(parsed) ? parsed : [];
      setSessionCache("atj_cache_orders", cachedOrders);
      return cachedOrders;
    }
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extraData?: { notes?: string }
) {
  const now = new Date().toISOString();
  const timelineEvent = {
    status,
    title: getTimelineTitle(status),
    description: getTimelineDescription(status),
    timestamp: now
  };

  const orders = await getAllOrders();
  const existingOrder = orders.find((o) => o.id === orderId);
  const currentTimeline = existingOrder?.timeline || [];
  
  const updatedTimeline = [...currentTimeline];
  if (!updatedTimeline.some((t: any) => t.status === status)) {
    updatedTimeline.push(timelineEvent);
  }

  const updateData: any = {
    status,
    orderStatus: status,
    timeline: updatedTimeline,
    updatedAt: now
  };

  if (status === "Delivered") {
    updateData.paymentStatus = "Paid";
  }

  if (extraData?.notes) {
    updateData.notes = extraData.notes;
  }

  return updateOrder(orderId, updateData);
}

function getTimelineTitle(status: OrderStatus): string {
  switch (status) {
    case "Pending Verification": return "Order Placed";
    case "Pending": return "Order Placed";
    case "Confirmed": return "Order Confirmed";
    case "Packed": return "Order Packed";
    case "Shipped": return "Order Shipped";
    case "Out for Delivery": return "Out for Delivery";
    case "Delivered": return "Order Delivered";
    case "Cancelled": return "Order Cancelled";
    case "Returned": return "Order Returned";
    default: return status;
  }
}

function getTimelineDescription(status: OrderStatus): string {
  switch (status) {
    case "Pending Verification": return "Your Cash on Delivery order has been received and is pending phone or WhatsApp verification.";
    case "Pending": return "Your order has been placed and is pending confirmation.";
    case "Confirmed": return "Seller has confirmed your order.";
    case "Packed": return "Your items have been carefully packed.";
    case "Shipped": return "Your order has been handed over to our courier partner.";
    case "Out for Delivery": return "Our delivery executive is on the way to your address.";
    case "Delivered": return "Your package has been successfully delivered. Enjoy your jewels!";
    case "Cancelled": return "This order has been cancelled.";
    case "Returned": return "This order has been successfully returned.";
    default: return `Order status updated to ${status}.`;
  }
}

export async function updateOrderTracking(
  orderId: string,
  courierName: string,
  trackingNumber: string,
  trackingUrl?: string,
  status?: OrderStatus,
  notes?: string
) {
  clearAllCaches(); // Invalidate cache
  const orders = await getAllOrders();
  const existingOrder = orders.find((o) => o.id === orderId);
  if (!existingOrder) throw new Error("Order not found");

  const now = new Date().toISOString();
  const updateData: any = {
    courierName,
    trackingNumber,
    trackingUrl: trackingUrl || "",
    notes: notes || "",
    updatedAt: now
  };

  const finalStatus = status || existingOrder.status || existingOrder.orderStatus || "Pending";
  if (finalStatus !== existingOrder.status || finalStatus !== existingOrder.orderStatus) {
    const timelineEvent = {
      status: finalStatus,
      title: getTimelineTitle(finalStatus),
      description: getTimelineDescription(finalStatus),
      timestamp: now
    };
    
    const currentTimeline = existingOrder.timeline || [];
    const updatedTimeline = [...currentTimeline];
    
    if (!updatedTimeline.some((t: any) => t.status === finalStatus)) {
      updatedTimeline.push(timelineEvent);
    }
    
    updateData.status = finalStatus;
    updateData.orderStatus = finalStatus;
    updateData.timeline = updatedTimeline;

    if (finalStatus === "Delivered") {
      updateData.paymentStatus = "Paid";
    }
  }

  // Create/update trackingMappings
  const cleanPhone = (existingOrder.customerPhone || "").replace(/[^0-9]/g, "");
  if (trackingNumber && trackingNumber.trim()) {
    const mappingDocId = `${trackingNumber.trim()}_${cleanPhone}`;
    const mappingData = {
      orderId: orderId,
      orderNumber: existingOrder.orderNumber,
      trackingNumber: trackingNumber.trim(),
      customerPhoneLast4: cleanPhone.slice(-4),
      createdAt: now
    };

    if (isMock) {
      if (typeof window !== "undefined") {
        const existingMappings = localStorage.getItem("mock_tracking_mappings");
        const mappings = safeParseJSON<any[]>(existingMappings, []);
        const filtered = mappings.filter(m => m.id !== mappingDocId);
        filtered.unshift({ id: mappingDocId, ...mappingData });
        localStorage.setItem("mock_tracking_mappings", JSON.stringify(filtered));
      }
    } else {
      try {
        await setDoc(doc(db, "trackingMappings", mappingDocId), mappingData);
      } catch (err) {
        console.warn("Firestore setDoc trackingMappings failed:", err);
      }
    }
  }

  await updateOrder(orderId, updateData);
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "Cancelled");
}

export async function updateOrder(orderId: string, data: Partial<Order>) {
  clearAllCaches(); // Invalidate cache

  const publicFields: any = {};
  if (data.status !== undefined) publicFields.status = data.status;
  if (data.orderStatus !== undefined) publicFields.orderStatus = data.orderStatus;
  if (data.paymentStatus !== undefined) publicFields.paymentStatus = data.paymentStatus;
  if (data.courierName !== undefined) publicFields.courierName = data.courierName;
  if (data.trackingNumber !== undefined) publicFields.trackingNumber = data.trackingNumber;
  if (data.trackingUrl !== undefined) publicFields.trackingUrl = data.trackingUrl;
  if (data.timeline !== undefined) publicFields.timeline = data.timeline;
  if (data.updatedAt !== undefined) publicFields.updatedAt = data.updatedAt;
  if (data.items !== undefined) {
    publicFields.items = data.items.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        images: item.product.images || [],
        salePrice: item.product.salePrice
      },
      quantity: item.quantity
    }));
  }
  if (data.shippingAddress !== undefined) {
    publicFields.shippingAddress = {
      fullName: "",
      phone: "",
      line1: "",
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      pincode: ""
    };
    publicFields.address = publicFields.shippingAddress;
  }

  if (isMock) {
    const orders = await getAllOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, ...data } : o));
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_orders", JSON.stringify(updated));

      const existingTracking = localStorage.getItem("mock_public_tracking_orders");
      const trackingOrders = safeParseJSON<any[]>(existingTracking, []);
      const updatedTracking = trackingOrders.map((o) => (o.id === orderId ? { ...o, ...publicFields } : o));
      localStorage.setItem("mock_public_tracking_orders", JSON.stringify(updatedTracking));
    }
    return;
  }

  try {
    await updateDoc(doc(db, "orders", orderId), data);
    if (Object.keys(publicFields).length > 0) {
      await setDoc(doc(db, "publicTrackingOrders", orderId), publicFields, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore updateOrder failed, falling back to localStorage:", err);
    const orders = await getAllOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, ...data } : o));
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_orders", JSON.stringify(updated));

      const existingTracking = localStorage.getItem("mock_public_tracking_orders");
      const trackingOrders = safeParseJSON<any[]>(existingTracking, []);
      const updatedTracking = trackingOrders.map((o) => (o.id === orderId ? { ...o, ...publicFields } : o));
      localStorage.setItem("mock_public_tracking_orders", JSON.stringify(updatedTracking));
    }
  }
}

// COUPONS
const defaultCoupons: Coupon[] = [
  { id: "c1", code: "WELCOME50", type: "percent", value: 50, active: true },
  { id: "c2", code: "ATJ10", type: "percent", value: 10, active: true },
  { id: "c3", code: "ATJ20", type: "percent", value: 20, active: true },
  { id: "c4", code: "WELCOME10", type: "percentage", value: 10, active: true, minimumOrderAmount: 0, usedCount: 0 }
];

export async function getCoupons(): Promise<Coupon[]> {
  if (cachedCoupons) return cachedCoupons;
  const sessionCached = getSessionCache<Coupon[]>("atj_cache_coupons");
  if (sessionCached) {
    cachedCoupons = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mock_coupons");
      if (existing) {
        const parsed = safeParseJSON<Coupon[]>(existing, defaultCoupons);
        cachedCoupons = Array.isArray(parsed) ? parsed : defaultCoupons;
        setSessionCache("atj_cache_coupons", cachedCoupons);
        return cachedCoupons;
      } else {
        localStorage.setItem("mock_coupons", JSON.stringify(defaultCoupons));
      }
    }
    cachedCoupons = defaultCoupons;
    setSessionCache("atj_cache_coupons", cachedCoupons);
    return defaultCoupons;
  }
  try {
    const snap = await withTimeout(getDocs(collection(db, "coupons")));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
    cachedCoupons = list.length ? list : defaultCoupons;
    setSessionCache("atj_cache_coupons", cachedCoupons);
    return cachedCoupons;
  } catch (err) {
    console.warn("Firestore getCoupons failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mock_coupons");
      if (existing) {
        const parsed = safeParseJSON<Coupon[]>(existing, defaultCoupons);
        cachedCoupons = Array.isArray(parsed) ? parsed : defaultCoupons;
        setSessionCache("atj_cache_coupons", cachedCoupons);
        return cachedCoupons;
      }
    }
    cachedCoupons = defaultCoupons;
    setSessionCache("atj_cache_coupons", cachedCoupons);
    return defaultCoupons;
  }
}

export async function addCoupon(coupon: Omit<Coupon, "id">) {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const coupons = await getCoupons();
    const newCoupon = { ...coupon, id: "coupon-" + Math.random().toString(36).substr(2, 9) } as Coupon;
    coupons.push(newCoupon);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_coupons", JSON.stringify(coupons));
    }
    return { id: newCoupon.id };
  }
  try {
    const ref = await addDoc(collection(db, "coupons"), coupon);
    return { id: ref.id };
  } catch (err) {
    console.warn("Firestore addCoupon failed, falling back to localStorage:", err);
    const coupons = await getCoupons();
    const newCoupon = { ...coupon, id: "coupon-" + Math.random().toString(36).substr(2, 9) } as Coupon;
    coupons.push(newCoupon);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_coupons", JSON.stringify(coupons));
    }
    return { id: newCoupon.id };
  }
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>) {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const coupons = await getCoupons();
    const updated = coupons.map((c) => (c.id === id ? { ...c, ...coupon } : c));
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_coupons", JSON.stringify(updated));
    }
    return;
  }
  try {
    await updateDoc(doc(db, "coupons", id), coupon);
  } catch (err) {
    console.warn("Firestore updateCoupon failed, falling back to localStorage:", err);
    const coupons = await getCoupons();
    const updated = coupons.map((c) => (c.id === id ? { ...c, ...coupon } : c));
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_coupons", JSON.stringify(updated));
    }
  }
}

export async function deleteCoupon(id: string) {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const coupons = await getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_coupons", JSON.stringify(filtered));
    }
    return;
  }
  try {
    await deleteDoc(doc(db, "coupons", id));
  } catch (err) {
    console.warn("Firestore deleteCoupon failed, falling back to localStorage:", err);
    const coupons = await getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_coupons", JSON.stringify(filtered));
    }
  }
}

export async function validateCoupon(
  code: string,
  cartItems: CartItem[],
  subtotal: number
): Promise<{ isValid: boolean; error?: string; coupon?: Coupon; discount: number }> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, error: "Please enter a coupon code.", discount: 0 };
  }

  const coupons = await getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { isValid: false, error: "Invalid coupon code.", discount: 0 };
  }

  // Check active state
  if (!coupon.active) {
    return { isValid: false, error: "This coupon is inactive.", discount: 0 };
  }

  const now = new Date();

  // Expiry check
  if (coupon.expiryDate) {
    const exp = new Date(coupon.expiryDate);
    if (!isNaN(exp.getTime()) && now.getTime() > exp.getTime()) {
      return { isValid: false, error: "This coupon has expired.", discount: 0 };
    }
  }

  // Start date check
  if (coupon.startDate) {
    const start = new Date(coupon.startDate);
    if (!isNaN(start.getTime()) && now.getTime() < start.getTime()) {
      return { isValid: false, error: "This coupon is not active yet.", discount: 0 };
    }
  }

  // Minimum order amount met
  const minAmount = coupon.minimumOrderAmount ?? coupon.minOrderValue ?? 0;
  if (minAmount > 0 && subtotal < minAmount) {
    return {
      isValid: false,
      error: `Minimum order amount of ₹${minAmount} is required.`,
      discount: 0
    };
  }

  // Usage limit check
  const used = coupon.usedCount ?? coupon.usageCount ?? 0;
  if (coupon.usageLimit && used >= coupon.usageLimit) {
    return { isValid: false, error: "This coupon has reached its usage limit.", discount: 0 };
  }

  // Applicability to categories/products
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const hasCategoryMatch = cartItems.some(item => 
      item.product.category && coupon.applicableCategories?.includes(item.product.category)
    );
    if (!hasCategoryMatch) {
      return { isValid: false, error: "This coupon is not applicable to items in your cart.", discount: 0 };
    }
  }

  if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
    const hasProductMatch = cartItems.some(item => 
      coupon.applicableProducts?.includes(item.product.id)
    );
    if (!hasProductMatch) {
      return { isValid: false, error: "This coupon is not applicable to products in your cart.", discount: 0 };
    }
  }

  // Value must be valid
  if (coupon.value <= 0) {
    return { isValid: false, error: "Invalid coupon value.", discount: 0 };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === "percent" || coupon.type === "percentage") {
    discount = Math.round(subtotal * (coupon.value / 100));
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = coupon.value;
  }

  // Discount does not exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  if (discount < 0) {
    discount = 0;
  }

  return { isValid: true, coupon, discount };
}

// SITE CONTENT MANAGER
const defaultSiteContent: Record<string, any> = {
  home: {
    heroTitle: "Anti Tarnish Jewels",
    heroSubtitle: "Anti-Tarnish Jewellery for Everyday Shine",
    heroCtaText: "Shop Collection",
    footerText: "Premium anti-tarnish, waterproof, non-fading jewellery for daily wear and special occasions."
  },
  about: {
    aboutText: "Welcome to Anti Tarnish Jewels, your premium destination for anti-tarnish jewellery. We offer carefully curated collections of rings, necklaces, bracelets, earrings, and accessories that stay beautiful forever."
  },
  faq: {
    faqText: "Find answers about shipping, payments, returns, order tracking, product specifications, and account support."
  },
  policies: {
    returnPolicyText: "At Anti Tarnish Jewels, customer satisfaction is our top priority. We offer a 7-day easy return and replacement policy for eligible products.",
    privacyPolicyText: "At Anti Tarnish Jewels, accessible from our online store, one of our main priorities is the privacy of our visitors."
  }
};

export async function getSiteContent(id: string): Promise<any> {
  if (cachedSiteContent[id]) return cachedSiteContent[id];
  const sessionCached = getSessionCache<any>(`atj_cache_siteContent_${id}`);
  if (sessionCached) {
    cachedSiteContent[id] = sessionCached;
    return sessionCached;
  }
  const defaults = defaultSiteContent[id] || {};
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`mock_site_content_${id}`);
      if (stored) {
        cachedSiteContent[id] = safeParseJSON<any>(stored, defaults);
        setSessionCache(`atj_cache_siteContent_${id}`, cachedSiteContent[id]);
        return cachedSiteContent[id];
      }
    }
    cachedSiteContent[id] = defaults;
    setSessionCache(`atj_cache_siteContent_${id}`, cachedSiteContent[id]);
    return defaults;
  }
  try {
    const d = await withTimeout(getDoc(doc(db, "siteContent", id)));
    cachedSiteContent[id] = d.exists() ? d.data() : defaults;
    setSessionCache(`atj_cache_siteContent_${id}`, cachedSiteContent[id]);
    return cachedSiteContent[id];
  } catch (err) {
    console.warn(`Firestore getSiteContent for ${id} failed, falling back to localStorage:`, err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`mock_site_content_${id}`);
      if (stored) {
        cachedSiteContent[id] = safeParseJSON<any>(stored, defaults);
        setSessionCache(`atj_cache_siteContent_${id}`, cachedSiteContent[id]);
        return cachedSiteContent[id];
      }
    }
    cachedSiteContent[id] = defaults;
    setSessionCache(`atj_cache_siteContent_${id}`, cachedSiteContent[id]);
    return defaults;
  }
}

export async function saveSiteContent(id: string, data: any): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`mock_site_content_${id}`, JSON.stringify(data));
    }
    return;
  }
  try {
    await setDoc(doc(db, "siteContent", id), data, { merge: true });
  } catch (err) {
    console.warn(`Firestore saveSiteContent for ${id} failed, falling back to localStorage:`, err);
    if (typeof window !== "undefined") {
      localStorage.setItem(`mock_site_content_${id}`, JSON.stringify(data));
    }
  }
}

// BANNERS MANAGER
const defaultBanners: Banner[] = [
  {
    id: "b1",
    title: "Anti-Tarnish Jewellery for Everyday Shine",
    subtitle: "Premium anti-tarnish, waterproof, non-fading jewellery",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop",
    link: "/shop",
    placement: "hero",
    isActive: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function getBanners(): Promise<Banner[]> {
  if (cachedBanners) return cachedBanners;
  const sessionCached = getSessionCache<Banner[]>("atj_cache_banners");
  if (sessionCached) {
    cachedBanners = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_banners");
      if (stored) {
        const parsed = safeParseJSON<Banner[]>(stored, defaultBanners);
        cachedBanners = Array.isArray(parsed) ? parsed : defaultBanners;
        setSessionCache("atj_cache_banners", cachedBanners);
        return cachedBanners;
      } else {
        localStorage.setItem("mock_banners", JSON.stringify(defaultBanners));
      }
    }
    cachedBanners = defaultBanners;
    setSessionCache("atj_cache_banners", cachedBanners);
    return defaultBanners;
  }
  try {
    const snap = await withTimeout(getDocs(collection(db, "banners")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
    cachedBanners = list.length ? list : defaultBanners;
    setSessionCache("atj_cache_banners", cachedBanners);
    return cachedBanners;
  } catch (err) {
    console.warn("Firestore getBanners failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_banners");
      if (stored) {
        const parsed = safeParseJSON<Banner[]>(stored, defaultBanners);
        cachedBanners = Array.isArray(parsed) ? parsed : defaultBanners;
        setSessionCache("atj_cache_banners", cachedBanners);
        return cachedBanners;
      }
    }
    cachedBanners = defaultBanners;
    setSessionCache("atj_cache_banners", cachedBanners);
    return defaultBanners;
  }
}

export async function addBanner(banner: Omit<Banner, "id">): Promise<string> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getBanners();
    const id = "banner-" + Math.random().toString(36).substr(2, 9);
    list.push({ id, ...banner } as Banner);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_banners", JSON.stringify(list));
    }
    return id;
  }
  try {
    const ref = await addDoc(collection(db, "banners"), banner);
    return ref.id;
  } catch (err) {
    console.warn("Firestore addBanner failed, falling back to localStorage:", err);
    const list = await getBanners();
    const id = "banner-" + Math.random().toString(36).substr(2, 9);
    list.push({ id, ...banner } as Banner);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_banners", JSON.stringify(list));
    }
    return id;
  }
}

export async function updateBanner(id: string, banner: Partial<Banner>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getBanners();
    const updated = list.map(b => b.id === id ? { ...b, ...banner, updatedAt: new Date().toISOString() } : b);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_banners", JSON.stringify(updated));
    }
    return;
  }
  try {
    await updateDoc(doc(db, "banners", id), { ...banner, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Firestore updateBanner failed, falling back to localStorage:", err);
    const list = await getBanners();
    const updated = list.map(b => b.id === id ? { ...b, ...banner, updatedAt: new Date().toISOString() } : b);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_banners", JSON.stringify(updated));
    }
  }
}

export async function deleteBanner(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getBanners();
    const filtered = list.filter(b => b.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_banners", JSON.stringify(filtered));
    }
    return;
  }
  try {
    await deleteDoc(doc(db, "banners", id));
  } catch (err) {
    console.warn("Firestore deleteBanner failed, falling back to localStorage:", err);
    const list = await getBanners();
    const filtered = list.filter(b => b.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_banners", JSON.stringify(filtered));
    }
  }
}

// THEME & SITE SETTINGS
const defaultSiteSettings: SiteSettings = {
  brandName: "Anti Tarnish Jewels",
  logoText: "Anti Tarnish Jewels",
  primaryColor: "#B8955E",
  secondaryColor: "#C79A8B",
  accentColor: "#C98B8B",
  backgroundColor: "#F8EDEE",
  textColor: "#2E2823",
  buttonColor: "#B8955E",
  borderRadius: "1.5rem",
  fontStyle: "serif",
  cardStyle: "rounded",
  darkMode: false
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cachedSiteSettings) return cachedSiteSettings;
  const sessionCached = getSessionCache<SiteSettings>("atj_cache_site_settings");
  if (sessionCached) {
    cachedSiteSettings = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_site_settings");
      if (stored) {
        cachedSiteSettings = safeParseJSON<SiteSettings>(stored, defaultSiteSettings);
        setSessionCache("atj_cache_site_settings", cachedSiteSettings);
        return cachedSiteSettings;
      }
    }
    cachedSiteSettings = defaultSiteSettings;
    setSessionCache("atj_cache_site_settings", cachedSiteSettings);
    return defaultSiteSettings;
  }
  try {
    const d = await withTimeout(getDoc(doc(db, "siteSettings", "global")));
    cachedSiteSettings = d.exists() ? (d.data() as SiteSettings) : defaultSiteSettings;
    setSessionCache("atj_cache_site_settings", cachedSiteSettings);
    return cachedSiteSettings;
  } catch (err) {
    console.warn("Firestore getSiteSettings failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_site_settings");
      if (stored) {
        cachedSiteSettings = safeParseJSON<SiteSettings>(stored, defaultSiteSettings);
        setSessionCache("atj_cache_site_settings", cachedSiteSettings);
        return cachedSiteSettings;
      }
    }
    cachedSiteSettings = defaultSiteSettings;
    setSessionCache("atj_cache_site_settings", cachedSiteSettings);
    return defaultSiteSettings;
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const current = await getSiteSettings();
    const updated = { ...current, ...settings };
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_site_settings", JSON.stringify(updated));
    }
    return;
  }
  try {
    await setDoc(doc(db, "siteSettings", "global"), settings, { merge: true });
  } catch (err) {
    console.warn("Firestore saveSiteSettings failed, falling back to localStorage:", err);
    const current = await getSiteSettings();
    const updated = { ...current, ...settings };
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_site_settings", JSON.stringify(updated));
    }
  }
}

// HOMEPAGE SECTIONS
const defaultHomepageSections: HomepageSection[] = [
  { id: "s1", title: "New Arrivals", type: "new-arrivals", isActive: true, order: 1, maxProducts: 8 },
  { id: "s2", title: "Best Sellers", type: "best-sellers", isActive: true, order: 2, maxProducts: 8 },
  { id: "s3", title: "Waterproof Jewellery", type: "custom-category", isActive: true, order: 3, maxProducts: 8, categoryFilter: "Waterproof Jewellery" },
  { id: "s4", title: "Daily Wear Jewellery", type: "custom-category", isActive: true, order: 4, maxProducts: 8, categoryFilter: "Daily Wear Jewellery" },
  { id: "s5", title: "Office Wear Jewellery", type: "custom-category", isActive: true, order: 5, maxProducts: 8, categoryFilter: "Office Wear Jewellery" },
  { id: "s6", title: "Party Wear Jewellery", type: "custom-category", isActive: true, order: 6, maxProducts: 8, categoryFilter: "Party Wear Jewellery" },
  { id: "s7", title: "Bridal Collection", type: "custom-category", isActive: true, order: 7, maxProducts: 8, categoryFilter: "Bridal Collection" },
  { id: "s8", title: "Shop Under Budget", type: "budget", isActive: true, order: 8, maxProducts: 4 },
  { id: "s9", title: "What Our Customers Say", type: "reviews", isActive: true, order: 9, maxProducts: 3 },
  { id: "s10", title: "Stay In The Loop", type: "newsletter", isActive: true, order: 10, maxProducts: 1 }
];

export async function getHomepageSections(): Promise<HomepageSection[]> {
  if (cachedHomepageSections) return cachedHomepageSections;
  const sessionCached = getSessionCache<HomepageSection[]>("atj_cache_homepage_sections");
  if (sessionCached) {
    cachedHomepageSections = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_homepage_sections");
      if (stored) {
        const parsed = safeParseJSON<HomepageSection[]>(stored, defaultHomepageSections);
        cachedHomepageSections = Array.isArray(parsed) ? parsed : defaultHomepageSections;
        setSessionCache("atj_cache_homepage_sections", cachedHomepageSections);
        return cachedHomepageSections;
      }
    }
    cachedHomepageSections = defaultHomepageSections;
    setSessionCache("atj_cache_homepage_sections", cachedHomepageSections);
    return defaultHomepageSections;
  }
  try {
    const snap = await withTimeout(getDocs(collection(db, "homepageSections")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageSection));
    cachedHomepageSections = list.length ? list.sort((a, b) => a.order - b.order) : defaultHomepageSections;
    setSessionCache("atj_cache_homepage_sections", cachedHomepageSections);
    return cachedHomepageSections;
  } catch (err) {
    console.warn("Firestore getHomepageSections failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_homepage_sections");
      if (stored) {
        const parsed = safeParseJSON<HomepageSection[]>(stored, defaultHomepageSections);
        cachedHomepageSections = Array.isArray(parsed) ? parsed : defaultHomepageSections;
        setSessionCache("atj_cache_homepage_sections", cachedHomepageSections);
        return cachedHomepageSections;
      }
    }
    cachedHomepageSections = defaultHomepageSections;
    setSessionCache("atj_cache_homepage_sections", cachedHomepageSections);
    return defaultHomepageSections;
  }
}

export async function saveHomepageSections(sections: HomepageSection[]): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_homepage_sections", JSON.stringify(sections));
    }
    return;
  }
  try {
    for (const s of sections) {
      await setDoc(doc(db, "homepageSections", s.id), s, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore saveHomepageSections failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_homepage_sections", JSON.stringify(sections));
    }
  }
}

// DYNAMIC CATEGORIES
const defaultCategories: Category[] = [
  { id: "c1", name: "Earrings", slug: "earrings", priority: 1, isActive: true, subcategories: ["Hoop Earrings", "Drop Earrings", "Studs", "Dangle Earrings"] },
  { id: "c2", name: "Rings", slug: "rings", priority: 2, isActive: true, subcategories: ["Solitaires", "Adjustable Rings", "Band Rings"] },
  { id: "c3", name: "Necklaces", slug: "necklaces", priority: 3, isActive: true, subcategories: ["Chains", "Pendant Necklaces", "Layered Necklaces"] },
  { id: "c4", name: "Bracelets", slug: "bracelets", priority: 4, isActive: true, subcategories: ["Tennis Bracelets", "Charm Bracelets", "Chain Bracelets"] },
  { id: "c5", name: "Bangles", slug: "bangles", priority: 5, isActive: true, subcategories: ["Bangle Sets", "Single Bangles"] },
  { id: "c6", name: "Anklets", slug: "anklets", priority: 6, isActive: true, subcategories: ["Anklet Pairs", "Single Anklets"] },
  { id: "c7", name: "Nose Pins", slug: "nose-pins", priority: 7, isActive: true, subcategories: ["Clip-On", "Pierced"] },
  { id: "c8", name: "Chokers", slug: "chokers", priority: 8, isActive: true, subcategories: ["Pearl Chokers", "Kundan Chokers"] },
  { id: "c9", name: "Maang Tikka", slug: "maang-tikka", priority: 9, isActive: true, subcategories: ["Temple Style", "Pearl Style"] },
  { id: "c10", name: "Haathphool", slug: "haathphool", priority: 10, isActive: true, subcategories: ["Bridal Haathphool", "Minimal Haathphool"] },
  { id: "c11", name: "Bridal Sets", slug: "bridal-sets", priority: 11, isActive: true, subcategories: ["Kundan Sets", "Pearl Sets"] }
];

export async function getCategories(): Promise<Category[]> {
  if (cachedCategories) return cachedCategories;
  const sessionCached = getSessionCache<Category[]>("atj_cache_categories");
  if (sessionCached) {
    cachedCategories = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_categories");
      if (stored) {
        const parsed = safeParseJSON<Category[]>(stored, defaultCategories);
        cachedCategories = Array.isArray(parsed) ? parsed : defaultCategories;
        setSessionCache("atj_cache_categories", cachedCategories);
        return cachedCategories;
      } else {
        localStorage.setItem("mock_categories", JSON.stringify(defaultCategories));
      }
    }
    cachedCategories = defaultCategories;
    setSessionCache("atj_cache_categories", cachedCategories);
    return defaultCategories;
  }
  try {
    const snap = await withTimeout(getDocs(collection(db, "categories")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    cachedCategories = list.length ? list.sort((a, b) => a.priority - b.priority) : defaultCategories;
    setSessionCache("atj_cache_categories", cachedCategories);
    return cachedCategories;
  } catch (err) {
    console.warn("Firestore getCategories failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_categories");
      if (stored) {
        const parsed = safeParseJSON<Category[]>(stored, defaultCategories);
        cachedCategories = Array.isArray(parsed) ? parsed : defaultCategories;
        setSessionCache("atj_cache_categories", cachedCategories);
        return cachedCategories;
      }
    }
    cachedCategories = defaultCategories;
    setSessionCache("atj_cache_categories", cachedCategories);
    return defaultCategories;
  }
}

export async function addCategory(category: Omit<Category, "id">): Promise<string> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getCategories();
    const id = "cat-" + Math.random().toString(36).substr(2, 9);
    list.push({ id, ...category } as Category);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_categories", JSON.stringify(list));
    }
    return id;
  }
  try {
    const ref = await addDoc(collection(db, "categories"), category);
    return ref.id;
  } catch (err) {
    console.warn("Firestore addCategory failed, falling back to localStorage:", err);
    const list = await getCategories();
    const id = "cat-" + Math.random().toString(36).substr(2, 9);
    list.push({ id, ...category } as Category);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_categories", JSON.stringify(list));
    }
    return id;
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getCategories();
    const updated = list.map(c => c.id === id ? { ...c, ...category } : c);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_categories", JSON.stringify(updated));
    }
    return;
  }
  try {
    await updateDoc(doc(db, "categories", id), category);
  } catch (err) {
    console.warn("Firestore updateCategory failed, falling back to localStorage:", err);
    const list = await getCategories();
    const updated = list.map(c => c.id === id ? { ...c, ...category } : c);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_categories", JSON.stringify(updated));
    }
  }
}

export async function deleteCategory(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getCategories();
    const filtered = list.filter(c => c.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_categories", JSON.stringify(filtered));
    }
    return;
  }
  try {
    await deleteDoc(doc(db, "categories", id));
  } catch (err) {
    console.warn("Firestore deleteCategory failed, falling back to localStorage:", err);
    const list = await getCategories();
    const filtered = list.filter(c => c.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_categories", JSON.stringify(filtered));
    }
  }
}

// SEO SETTINGS
const defaultSEOSettings: SEOSettings = {
  homepageTitle: "Anti Tarnish Jewels | Waterproof & Tarnish-Free Jewellery Online",
  homepageDescription: "Shop premium anti-tarnish, waterproof, non-fading jewellery for daily wear, office wear, party wear, and bridal occasions.",
  categoryTitleTemplate: "%s | Anti Tarnish Jewels",
  productTitleTemplate: "%s | Buy at Anti Tarnish Jewels",
  socialText: "Shop premium anti-tarnish, waterproof, non-fading jewellery for daily wear, office wear, party wear, and bridal occasions at Anti Tarnish Jewels."
};

export async function getSEOSettings(): Promise<SEOSettings> {
  if (cachedSEOSettings) return cachedSEOSettings;
  const sessionCached = getSessionCache<SEOSettings>("atj_cache_seoSettings");
  if (sessionCached) {
    cachedSEOSettings = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_seo_settings");
      if (stored) {
        cachedSEOSettings = safeParseJSON<SEOSettings>(stored, defaultSEOSettings);
        setSessionCache("atj_cache_seoSettings", cachedSEOSettings);
        return cachedSEOSettings;
      }
    }
    cachedSEOSettings = defaultSEOSettings;
    setSessionCache("atj_cache_seoSettings", cachedSEOSettings);
    return defaultSEOSettings;
  }
  try {
    const d = await withTimeout(getDoc(doc(db, "seoSettings", "global")));
    cachedSEOSettings = d.exists() ? (d.data() as SEOSettings) : defaultSEOSettings;
    setSessionCache("atj_cache_seoSettings", cachedSEOSettings);
    return cachedSEOSettings;
  } catch (err) {
    console.warn("Firestore getSEOSettings failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_seo_settings");
      if (stored) {
        cachedSEOSettings = safeParseJSON<SEOSettings>(stored, defaultSEOSettings);
        setSessionCache("atj_cache_seoSettings", cachedSEOSettings);
        return cachedSEOSettings;
      }
    }
    cachedSEOSettings = defaultSEOSettings;
    setSessionCache("atj_cache_seoSettings", cachedSEOSettings);
    return defaultSEOSettings;
  }
}

export async function saveSEOSettings(seo: Partial<SEOSettings>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const current = await getSEOSettings();
    const updated = { ...current, ...seo };
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_seo_settings", JSON.stringify(updated));
    }
    return;
  }
  try {
    await setDoc(doc(db, "seoSettings", "global"), seo, { merge: true });
  } catch (err) {
    console.warn("Firestore saveSEOSettings failed, falling back to localStorage:", err);
    const current = await getSEOSettings();
    const updated = { ...current, ...seo };
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_seo_settings", JSON.stringify(updated));
    }
  }
}

// ANNOUNCEMENTS
const defaultAnnouncements: AnnouncementSettings = {
  showAnnouncement: true,
  text: "Get 20% off your first order! Use code ATJ20 at checkout.",
  showNewsletterPopup: false,
  whatsAppSupport: "+919876543210"
};

export async function getAnnouncements(): Promise<AnnouncementSettings> {
  if (cachedAnnouncements) return cachedAnnouncements;
  const sessionCached = getSessionCache<AnnouncementSettings>("atj_cache_announcements");
  if (sessionCached) {
    cachedAnnouncements = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_announcements");
      if (stored) {
        cachedAnnouncements = safeParseJSON<AnnouncementSettings>(stored, defaultAnnouncements);
        setSessionCache("atj_cache_announcements", cachedAnnouncements);
        return cachedAnnouncements;
      }
    }
    cachedAnnouncements = defaultAnnouncements;
    setSessionCache("atj_cache_announcements", cachedAnnouncements);
    return defaultAnnouncements;
  }
  try {
    const d = await withTimeout(getDoc(doc(db, "announcements", "global")));
    cachedAnnouncements = d.exists() ? (d.data() as AnnouncementSettings) : defaultAnnouncements;
    setSessionCache("atj_cache_announcements", cachedAnnouncements);
    return cachedAnnouncements;
  } catch (err) {
    console.warn("Firestore getAnnouncements failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_announcements");
      if (stored) {
        cachedAnnouncements = safeParseJSON<AnnouncementSettings>(stored, defaultAnnouncements);
        setSessionCache("atj_cache_announcements", cachedAnnouncements);
        return cachedAnnouncements;
      }
    }
    cachedAnnouncements = defaultAnnouncements;
    setSessionCache("atj_cache_announcements", cachedAnnouncements);
    return defaultAnnouncements;
  }
}

export async function saveAnnouncements(announcements: Partial<AnnouncementSettings>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const current = await getAnnouncements();
    const updated = { ...current, ...announcements };
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_announcements", JSON.stringify(updated));
    }
    return;
  }
  try {
    await setDoc(doc(db, "announcements", "global"), announcements, { merge: true });
  } catch (err) {
    console.warn("Firestore saveAnnouncements failed, falling back to localStorage:", err);
    const current = await getAnnouncements();
    const updated = { ...current, ...announcements };
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_announcements", JSON.stringify(updated));
    }
  }
}

// REVIEWS
const defaultReviews = [
  { id: "r1", name: "Aisha R.", comment: "The Anti-Tarnish Pearl Drop Earrings are stunning! I've been wearing them daily and they look brand new.", rating: 5, active: true, createdAt: new Date().toISOString() },
  { id: "r2", name: "Priya M.", comment: "Absolutely love the waterproof gold hoop earrings. I wear them in the shower and they haven't faded at all!", rating: 5, active: true, createdAt: new Date().toISOString() },
  { id: "r3", name: "Anjali S.", comment: "The bridal Kundan necklace set was the highlight of my wedding. Very premium quality and luxury packaging.", rating: 5, active: true, createdAt: new Date().toISOString() }
];

export async function getReviews(): Promise<any[]> {
  if (cachedReviews) return cachedReviews;
  const sessionCached = getSessionCache<any[]>("atj_cache_reviews");
  if (sessionCached) {
    cachedReviews = sessionCached;
    return sessionCached;
  }
  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_reviews");
      if (stored) {
        const parsed = safeParseJSON<any[]>(stored, defaultReviews);
        cachedReviews = Array.isArray(parsed) ? parsed : defaultReviews;
        setSessionCache("atj_cache_reviews", cachedReviews);
        return cachedReviews;
      } else {
        localStorage.setItem("mock_reviews", JSON.stringify(defaultReviews));
      }
    }
    cachedReviews = defaultReviews;
    setSessionCache("atj_cache_reviews", cachedReviews);
    return defaultReviews;
  }
  try {
    const snap = await withTimeout(getDocs(collection(db, "reviews")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cachedReviews = list.length ? list : defaultReviews;
    setSessionCache("atj_cache_reviews", cachedReviews);
    return cachedReviews;
  } catch (err) {
    console.warn("Firestore getReviews failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_reviews");
      if (stored) {
        const parsed = safeParseJSON<any[]>(stored, defaultReviews);
        cachedReviews = Array.isArray(parsed) ? parsed : defaultReviews;
        setSessionCache("atj_cache_reviews", cachedReviews);
        return cachedReviews;
      }
    }
    cachedReviews = defaultReviews;
    setSessionCache("atj_cache_reviews", cachedReviews);
    return defaultReviews;
  }
}

export async function addReview(review: any): Promise<string> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getReviews();
    const id = "rev-" + Math.random().toString(36).substr(2, 9);
    list.unshift({ id, ...review, createdAt: new Date().toISOString() });
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_reviews", JSON.stringify(list));
    }
    return id;
  }
  try {
    const ref = await addDoc(collection(db, "reviews"), { ...review, createdAt: new Date().toISOString() });
    return ref.id;
  } catch (err) {
    console.warn("Firestore addReview failed, falling back to localStorage:", err);
    const list = await getReviews();
    const id = "rev-" + Math.random().toString(36).substr(2, 9);
    list.unshift({ id, ...review, createdAt: new Date().toISOString() });
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_reviews", JSON.stringify(list));
    }
    return id;
  }
}

export async function updateReview(id: string, review: any): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getReviews();
    const updated = list.map(r => r.id === id ? { ...r, ...review } : r);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_reviews", JSON.stringify(updated));
    }
    return;
  }
  try {
    await updateDoc(doc(db, "reviews", id), review);
  } catch (err) {
    console.warn("Firestore updateReview failed, falling back to localStorage:", err);
    const list = await getReviews();
    const updated = list.map(r => r.id === id ? { ...r, ...review } : r);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_reviews", JSON.stringify(updated));
    }
  }
}

export async function deleteReview(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getReviews();
    const filtered = list.filter(r => r.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_reviews", JSON.stringify(filtered));
    }
    return;
  }
  try {
    await deleteDoc(doc(db, "reviews", id));
  } catch (err) {
    console.warn("Firestore deleteReview failed, falling back to localStorage:", err);
    const list = await getReviews();
    const filtered = list.filter(r => r.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_reviews", JSON.stringify(filtered));
    }
  }
}

// CONTACT MESSAGES
export async function saveContactMessage(msg: { name: string; email: string; phone?: string; message: string }) {
  clearAllCaches(); // Invalidate cache
  const data = { ...msg, createdAt: new Date().toISOString(), isRead: false, isReplied: false };
  if (isMock) {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mock_contact_messages");
      const parsed = safeParseJSON<any[]>(existing, []);
      const list = Array.isArray(parsed) ? parsed : [];
      list.push(data);
      localStorage.setItem("mock_contact_messages", JSON.stringify(list));
    }
    console.log("[Mock] saveContactMessage", data);
    return { id: "mock-message-" + Math.random().toString(36).substr(2, 9) };
  }
  try {
    const ref = await addDoc(collection(db, "contactMessages"), data);
    return { id: ref.id };
  } catch (err) {
    console.warn("Firestore saveContactMessage failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mock_contact_messages");
      const parsed = safeParseJSON<any[]>(existing, []);
      const list = Array.isArray(parsed) ? parsed : [];
      list.push(data);
      localStorage.setItem("mock_contact_messages", JSON.stringify(list));
    }
    return { id: "mock-message-" + Math.random().toString(36).substr(2, 9) };
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (cachedContactMessages) return cachedContactMessages;
  const sessionCached = getSessionCache<ContactMessage[]>("atj_cache_contact_messages");
  if (sessionCached) {
    cachedContactMessages = sessionCached;
    return sessionCached;
  }

  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_contact_messages");
      const parsed = safeParseJSON<ContactMessage[]>(stored, []);
      cachedContactMessages = Array.isArray(parsed) ? parsed : [];
      setSessionCache("atj_cache_contact_messages", cachedContactMessages);
      return cachedContactMessages;
    }
    return [];
  }
  try {
    const snap = await withTimeout(getDocs(query(collection(db, "contactMessages"), orderBy("createdAt", "desc"))));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage));
    cachedContactMessages = list;
    setSessionCache("atj_cache_contact_messages", cachedContactMessages);
    return list;
  } catch (err) {
    console.warn("Firestore getContactMessages failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_contact_messages");
      const parsed = safeParseJSON<ContactMessage[]>(stored, []);
      cachedContactMessages = Array.isArray(parsed) ? parsed : [];
      setSessionCache("atj_cache_contact_messages", cachedContactMessages);
      return cachedContactMessages;
    }
    return [];
  }
}

export async function updateContactMessage(id: string, data: Partial<ContactMessage>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getContactMessages();
    const updated = list.map(m => m.id === id || (m.createdAt === id) ? { ...m, ...data } : m);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_contact_messages", JSON.stringify(updated));
    }
    return;
  }
  try {
    await updateDoc(doc(db, "contactMessages", id), data);
  } catch (err) {
    console.warn("Firestore updateContactMessage failed, falling back to localStorage:", err);
    const list = await getContactMessages();
    const updated = list.map(m => m.id === id || (m.createdAt === id) ? { ...m, ...data } : m);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_contact_messages", JSON.stringify(updated));
    }
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getContactMessages();
    const filtered = list.filter(m => m.id !== id && m.createdAt !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_contact_messages", JSON.stringify(filtered));
    }
    return;
  }
  try {
    await deleteDoc(doc(db, "contactMessages", id));
  } catch (err) {
    console.warn("Firestore deleteContactMessage failed, falling back to localStorage:", err);
    const list = await getContactMessages();
    const filtered = list.filter(m => m.id !== id && m.createdAt !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_contact_messages", JSON.stringify(filtered));
    }
  }
}

// USERS MANAGEMENT
const defaultUsers = [
  { uid: "mock-admin", email: "admin@antitarnishjewel.com", displayName: "Store Admin", role: "admin", totalSpent: 0, blocked: false, createdAt: new Date().toISOString() },
  { uid: "mock-user-123", email: "customer@antitarnishjewel.com", displayName: "Aisha R.", role: "customer", totalSpent: 14999, blocked: false, createdAt: new Date().toISOString() }
];

export async function getUsers(forceRefresh = false): Promise<any[]> {
  if (!forceRefresh) {
    if (cachedUsers) return cachedUsers;
    const sessionCached = getSessionCache<any[]>("atj_cache_users");
    if (sessionCached) {
      cachedUsers = sessionCached;
      return sessionCached;
    }
  }

  if (isMock) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_users");
      const parsed = safeParseJSON<any[]>(stored, defaultUsers);
      cachedUsers = Array.isArray(parsed) ? parsed : defaultUsers;
      setSessionCache("atj_cache_users", cachedUsers);
      return cachedUsers;
    }
    cachedUsers = defaultUsers;
    setSessionCache("atj_cache_users", cachedUsers);
    return defaultUsers;
  }
  try {
    const snap = await withTimeout(getDocs(collection(db, "users")));
    const list = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    cachedUsers = list;
    setSessionCache("atj_cache_users", cachedUsers);
    return list;
  } catch (err) {
    console.warn("Firestore getUsers failed, falling back to localStorage:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mock_users");
      const parsed = safeParseJSON<any[]>(stored, defaultUsers);
      cachedUsers = Array.isArray(parsed) ? parsed : defaultUsers;
      setSessionCache("atj_cache_users", cachedUsers);
      return cachedUsers;
    }
    cachedUsers = defaultUsers;
    setSessionCache("atj_cache_users", cachedUsers);
    return defaultUsers;
  }
}

export async function updateUser(uid: string, data: any): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (isMock) {
    const list = await getUsers();
    const updated = list.map(u => u.uid === uid ? { ...u, ...data } : u);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_users", JSON.stringify(updated));
    }
    return;
  }
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (err) {
    console.warn("Firestore updateUser failed, falling back to localStorage:", err);
    const list = await getUsers();
    const updated = list.map(u => u.uid === uid ? { ...u, ...data } : u);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_users", JSON.stringify(updated));
    }
  }
}

// COLLECTIONS HELPER
export async function getCollections(): Promise<string[]> {
  if (cachedCollections) return cachedCollections;
  const sessionCached = getSessionCache<string[]>("atj_cache_collections");
  if (sessionCached) {
    cachedCollections = sessionCached;
    return sessionCached;
  }

  const products = await getProducts();
  const set = new Set<string>();
  products.forEach(p => {
    if (p.collection && p.collection.trim()) {
      set.add(p.collection.trim());
    }
  });
  const collections = Array.from(set);
  cachedCollections = collections;
  setSessionCache("atj_cache_collections", collections);
  return collections;
}

// HOMEPAGE PRODUCTS HELPER
export async function getHomepageProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(p => p.isActive !== false).slice(0, 30);
}

// PRODUCTS CACHE ONLY HELPER
export function getProductsFromCacheOnly(): Product[] {
  if (cachedProducts) return cachedProducts;
  const sessionCached = getSessionCache<Product[]>("atj_cache_products");
  if (sessionCached) {
    cachedProducts = sessionCached;
    return sessionCached;
  }
  return [];
}


// IMAGE UPLOAD
export async function uploadImage(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Cloudinary upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to Firebase/Local:", err);
    }
  }

  if (isMock) {
    // For mock development, return a base64 DataURL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject("Failed to convert image to Base64");
      reader.readAsDataURL(file);
    });
  }
  try {
    const fileRef = storageRef(storage, `images/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  } catch (err) {
    console.warn("Firebase Storage upload failed, falling back to Base64:", err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject("Failed to convert image to Base64");
      reader.readAsDataURL(file);
    });
  }
}
