import { db, storage, auth, hasFirebaseConfig } from "@/lib/firebase";
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
  Address,
  Announcement,
  UserProfile,
  UserRole,
  UserStatus,
  AuditLog,
  Review
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
  limit,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// Consistent mock mode detection
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

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore query timed out")), timeoutMs)
    )
  ]);
}

// Memory Cache Store
const isServer = typeof window === undefined;
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
    if (!isServer && cachedProducts) return cachedProducts;

    const sessionCached = getSessionCache<Product[]>("atj_cache_products");
    if (sessionCached) {
      cachedProducts = sessionCached;
      return sessionCached;
    }
  }

  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const isDev = process.env.NODE_ENV === "development";
  const isPreviewMode = isDev && isLocalhost && typeof window !== "undefined" && localStorage.getItem("admin_preview") === "true";

  if (!hasFirebaseConfig || !db) {
    if (isPreviewMode) {
      return [
        { id: "mock-1", slug: "mock-1", name: "Luxury Rose Necklace", category: "Necklaces", price: 1999, originalPrice: 2499, description: "Beautiful mock necklace", images: ["/images/necklace.jpg"], inStock: true, isBestseller: true },
        { id: "mock-2", slug: "mock-2", name: "Diamond Accent Ring", category: "Rings", price: 999, originalPrice: 1299, description: "Beautiful mock ring", images: ["/images/ring.jpg"], inStock: true, isBestseller: false },
      ] as unknown as Product[];
    }
    return [];
  }

  try {
    const snap = await withTimeout(getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))));
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    
    cachedProducts = products;
    setSessionCache("atj_cache_products", cachedProducts);
    return cachedProducts;
  } catch (err) {
    console.warn("Firestore getProducts failed:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isServer && cachedProductBySlug[slug]) return cachedProductBySlug[slug];
  const sessionCached = getSessionCache<Product>(`atj_cache_product_slug_${slug}`);
  if (sessionCached) {
    cachedProductBySlug[slug] = sessionCached;
    return sessionCached;
  }
  
  if (!hasFirebaseConfig || !db) {
    return null;
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
    console.warn("Firestore getProductBySlug failed:", err);
    return null;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!hasFirebaseConfig || !db) return null;
  
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
  if (!hasFirebaseConfig || !db) return [];
  
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
  
  try {
    // Deep sanitize and prevent undefined/NaN from crashing Firestore
    const cleanProduct: any = {};
    Object.entries(product).forEach(([k, v]) => {
      if (v === undefined) return;
      if (typeof v === "number" && isNaN(v)) return; // Do not allow NaN
      if (typeof v === "string" && v === "") return; // Optional empty string check (business logic handles required fields)
      cleanProduct[k] = v;
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
  
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// PROFILE
export async function saveUserProfile(uid: string, data: Record<string, unknown>) {
  clearAllCaches(); // Invalidate cache
  
  try {
    const cleanProfile: any = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) cleanProfile[k] = v;
    });

    await setDoc(doc(db, "users", uid), cleanProfile, { merge: true });
  } catch (err) {
    console.error("Error saving user profile to database:", err);
    throw err;
  }
}

export async function getUserProfile(uid: string): Promise<any | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() };
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

export async function createOrder(orderData: any) {
  throw new Error("Client-side order creation is deprecated and blocked for security reasons. Please use the /api/orders/create Server API route.");
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  const queryStr = orderNumber.trim();
  if (!queryStr) return null;

  

  const currentUser = auth?.currentUser;
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

  

  const currentUser = auth?.currentUser;
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

  

  try {
    let orders1: Order[] = [];
    try {
      const q1 = query(
        collection(db, "orders"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snap1 = await withTimeout(getDocs(q1));
      orders1 = snap1.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    } catch (err1) {
      console.warn("getUserOrders: query q1 failed (likely missing index), falling back to unordered:", err1);
      const q1Fallback = query(collection(db, "orders"), where("userId", "==", uid));
      const snap1Fallback = await withTimeout(getDocs(q1Fallback));
      orders1 = snap1Fallback.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      orders1.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    if (email && email.trim()) {
      try {
        let orders2: Order[] = [];
        try {
          const q2 = query(
            collection(db, "orders"),
            where("customerEmail", "==", email.trim()),
            orderBy("createdAt", "desc")
          );
          const snap2 = await withTimeout(getDocs(q2));
          orders2 = snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        } catch (err2) {
          console.warn("getUserOrders: query q2 failed, falling back to unordered:", err2);
          const q2Fallback = query(collection(db, "orders"), where("customerEmail", "==", email.trim()));
          const snap2Fallback = await withTimeout(getDocs(q2Fallback));
          orders2 = snap2Fallback.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        }
        
        const orderMap = new Map<string, Order>();
        orders1.forEach(o => orderMap.set(o.id, o));
        orders2.forEach(o => orderMap.set(o.id, o));
        return Array.from(orderMap.values()).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      } catch (emailErr) {
        console.warn("getUserOrders: Fetching by email failed completely (possibly due to rules). Returning userId orders only.", emailErr);
        return orders1;
      }
    }

    return orders1;
  } catch (err) {
    console.error("Firestore operation failed in getUserOrders:", err);
    throw err;
  }
}

export async function getOrderForTracking(searchValue: string, phone: string): Promise<any | null> {
  const queryStr = searchValue.trim();
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (!queryStr || !cleanPhone) return null;

  let orderId: string | null = null;

  

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
    if (!isServer && cachedOrders) return cachedOrders;

    const sessionCached = getSessionCache<Order[]>("atj_cache_orders");
    if (sessionCached) {
      cachedOrders = sessionCached;
      return sessionCached;
    }
  }
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const isDev = process.env.NODE_ENV === "development";
  const isPreviewMode = isDev && isLocalhost && typeof window !== "undefined" && localStorage.getItem("admin_preview") === "true";

  if (!hasFirebaseConfig || !db) {
    if (isPreviewMode) {
      return [
        {
          id: "mock-order-1",
          orderNumber: "ATJ-20261025-1234",
          userId: "mock-user",
          customerName: "Jane Doe",
          customerEmail: "jane@example.com",
          customerPhone: "+91 9876543210",
          shippingAddress: {
            fullName: "Jane Doe",
            phone: "+91 9876543210",
            street: "123 Mock St",
            city: "Mumbai",
            state: "MH",
            pincode: "400001",
            country: "India"
          },
          items: [{ id: "mock-1", title: "Luxury Rose Necklace", quantity: 1, price: 1999 }],
          total: 1999,
          paymentMethod: "Stripe",
          paymentStatus: "Paid",
          status: "Processing",
          orderStatus: "Processing",
          createdAt: new Date().toISOString()
        } as unknown as Order
      ];
    }
    return [];
  }
  try {
    console.log("getAllOrders: Querying 'orders' collection ordered by 'createdAt' desc");
    let snap;
    try {
      snap = await withTimeout(getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))));
    } catch (err) {
      console.warn("getAllOrders: orderBy createdAt failed, falling back to unordered fetch:", err);
      snap = await withTimeout(getDocs(collection(db, "orders")));
    }
    
    console.log("getAllOrders: Received", snap.docs.length, "documents");
    let list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    
    // If we fell back, sort client-side
    list.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    cachedOrders = list;
    setSessionCache("atj_cache_orders", cachedOrders);
    return list;
  } catch (err) {
    console.error("getAllOrders: Firestore operation failed:", err);
    throw err;
  }
}

export function listenToAllOrders(callback: (orders: Order[]) => void): () => void {
  console.log("listenToAllOrders: Attaching listener to 'orders' collection");
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    console.log("listenToAllOrders: Received snapshot with", snap.docs.length, "documents");
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    cachedOrders = list;
    setSessionCache("atj_cache_orders", cachedOrders);
    callback(list);
  }, (err) => {
    console.error("listenToAllOrders: Firestore listener failed:", err);
  });
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

    
      try {
        await setDoc(doc(db, "trackingMappings", mappingDocId), mappingData);
      } catch (err) {
        console.warn("Firestore setDoc trackingMappings failed:", err);
      }
    
  }

  await updateOrder(orderId, updateData);
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "Cancelled");
}

export async function updateOrder(orderId: string, data: Partial<Order>) {
  clearAllCaches(); // Invalidate cache

  // Clean data of undefined values before saving to Firestore
  const cleanData: any = {};
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined) {
      cleanData[k] = v;
    }
  });

  const publicFields: any = {};
  if (cleanData.status !== undefined) publicFields.status = cleanData.status;
  if (cleanData.orderStatus !== undefined) publicFields.orderStatus = cleanData.orderStatus;
  if (cleanData.paymentStatus !== undefined) publicFields.paymentStatus = cleanData.paymentStatus;
  if (cleanData.courierName !== undefined) publicFields.courierName = cleanData.courierName;
  if (cleanData.trackingNumber !== undefined) publicFields.trackingNumber = cleanData.trackingNumber;
  if (cleanData.trackingUrl !== undefined) publicFields.trackingUrl = cleanData.trackingUrl;
  if (cleanData.timeline !== undefined) publicFields.timeline = cleanData.timeline;
  if (cleanData.updatedAt !== undefined) publicFields.updatedAt = cleanData.updatedAt;
  if (cleanData.items !== undefined) {
    publicFields.items = cleanData.items.map((item: any) => ({
      product: {
        id: item.product?.id || item.productId,
        name: item.product?.name || item.name,
        slug: item.product?.slug || "",
        images: item.product?.images || (item.image ? [item.image] : []),
        salePrice: item.product?.salePrice || item.price,
        sku: item.sku || item.product?.sku || ""
      },
      quantity: item.quantity,
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
      sku: item.sku || item.product?.sku || ""
    }));
  }
  if (cleanData.shippingAddress !== undefined) {
    publicFields.shippingAddress = {
      fullName: "",
      phone: "",
      line1: "",
      city: cleanData.shippingAddress.city,
      state: cleanData.shippingAddress.state,
      pincode: ""
    };
    publicFields.address = publicFields.shippingAddress;
  }

  

  try {
    await updateDoc(doc(db, "orders", orderId), cleanData);
    if (Object.keys(publicFields).length > 0) {
      await setDoc(doc(db, "publicTrackingOrders", orderId), publicFields, { merge: true });
    }
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
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
  if (!isServer && cachedCoupons) return cachedCoupons;
  const sessionCached = getSessionCache<Coupon[]>("atj_cache_coupons");
  if (sessionCached) {
    cachedCoupons = sessionCached;
    return sessionCached;
  }
  
  try {
    const snap = await withTimeout(getDocs(collection(db, "coupons")));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
    cachedCoupons = list.length ? list : defaultCoupons;
    setSessionCache("atj_cache_coupons", cachedCoupons);
    return cachedCoupons;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function addCoupon(coupon: Omit<Coupon, "id">) {
  clearAllCaches(); // Invalidate cache
  
  try {
    const ref = await addDoc(collection(db, "coupons"), coupon);
    return { id: ref.id };
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>) {
  clearAllCaches(); // Invalidate cache
  
  try {
    await updateDoc(doc(db, "coupons", id), coupon);
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function deleteCoupon(id: string) {
  clearAllCaches(); // Invalidate cache
  
  try {
    await deleteDoc(doc(db, "coupons", id));
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
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
    heroTitle: "LONA JEWELS",
    heroSubtitle: "Anti-Tarnish Jewellery for Everyday Shine",
    heroCtaText: "Shop Collection",
    footerText: "Premium anti-tarnish, waterproof, non-fading jewellery for daily wear and special occasions."
  },
  about: {
    aboutText: "Welcome to LONA JEWELS, your premium destination for anti-tarnish jewellery. We offer carefully curated collections of rings, necklaces, bracelets, earrings, and accessories that stay beautiful forever."
  },
  faq: {
    faqText: "Find answers about shipping, payments, returns, order tracking, product specifications, and account support."
  },
  policies: {
    returnPolicyText: "At LONA JEWELS, customer satisfaction is our top priority. We offer a 7-day easy return and replacement policy for eligible products.",
    privacyPolicyText: "At LONA JEWELS, accessible from our online store, one of our main priorities is the privacy of our visitors."
  }
};

export async function getSiteContent(id: string): Promise<any> {
  if (!isServer && cachedSiteContent[id]) return cachedSiteContent[id];
  const sessionCached = getSessionCache<any>(`atj_cache_siteContent_${id}`);
  if (sessionCached) {
    cachedSiteContent[id] = sessionCached;
    return sessionCached;
  }
  const defaults = defaultSiteContent[id] || {};
    if (!hasFirebaseConfig || !db) return defaults;
  
  try {
    const d = await withTimeout(getDoc(doc(db, "siteContent", id)));
    cachedSiteContent[id] = d.exists() ? d.data() : defaults;
    setSessionCache(`atj_cache_siteContent_${id}`, cachedSiteContent[id]);
    return cachedSiteContent[id];
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function saveSiteContent(id: string, data: any): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await setDoc(doc(db, "siteContent", id), data, { merge: true });
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
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
    placement: "hero-banner",
    isActive: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function getBanners(): Promise<Banner[]> {
  if (!isServer && cachedBanners) return cachedBanners;
  const sessionCached = getSessionCache<Banner[]>("atj_cache_banners");
  if (sessionCached) {
    cachedBanners = sessionCached;
    return sessionCached;
  }
  if (!hasFirebaseConfig || !db) return defaultBanners;
  
  try {
    const snap = await withTimeout(getDocs(collection(db, "banners")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
    cachedBanners = list.length ? list : defaultBanners;
    setSessionCache("atj_cache_banners", cachedBanners);
    return cachedBanners;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function getBannerBySlug(slug: string): Promise<Banner | null> {
  const allBanners = await getBanners();
  const found = allBanners.find(b => b.slug === slug);
  return found || null;
}

export async function addBanner(banner: Omit<Banner, "id">): Promise<string> {
  clearAllCaches(); // Invalidate cache
  
  try {
    const cleanBanner = Object.fromEntries(Object.entries(banner).filter(([_, v]) => v !== undefined));
    const ref = await addDoc(collection(db, "banners"), cleanBanner);
    return ref.id;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function updateBanner(id: string, banner: Partial<Banner>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    const cleanBanner = Object.fromEntries(Object.entries(banner).filter(([_, v]) => v !== undefined));
    await updateDoc(doc(db, "banners", id), { ...cleanBanner, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function deleteBanner(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await deleteDoc(doc(db, "banners", id));
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// THEME & SITE SETTINGS
const defaultSiteSettings: SiteSettings = {
  brandName: "LONA JEWELS",
  logoText: "LONA JEWELS",
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
  if (!isServer && cachedSiteSettings) return cachedSiteSettings;
  const sessionCached = getSessionCache<SiteSettings>("atj_cache_site_settings");
  if (sessionCached) {
    cachedSiteSettings = sessionCached;
    return sessionCached;
  }
  if (!hasFirebaseConfig || !db) return defaultSiteSettings;
  
  try {
    const d = await withTimeout(getDoc(doc(db, "siteSettings", "global")));
    cachedSiteSettings = d.exists() ? (d.data() as SiteSettings) : defaultSiteSettings;
    setSessionCache("atj_cache_site_settings", cachedSiteSettings);
    return cachedSiteSettings;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await setDoc(doc(db, "siteSettings", "global"), settings, { merge: true });
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
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
  if (!isServer && cachedHomepageSections) return cachedHomepageSections;
  const sessionCached = getSessionCache<HomepageSection[]>("atj_cache_homepage_sections");
  if (sessionCached) {
    cachedHomepageSections = sessionCached;
    return sessionCached;
  }
  if (!hasFirebaseConfig || !db) return defaultHomepageSections;
  
  try {
    const snap = await withTimeout(getDocs(collection(db, "homepageSections")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageSection));
    cachedHomepageSections = list.length ? list.sort((a, b) => a.order - b.order) : defaultHomepageSections;
    setSessionCache("atj_cache_homepage_sections", cachedHomepageSections);
    return cachedHomepageSections;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function saveHomepageSections(sections: HomepageSection[]): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    for (const s of sections) {
      await setDoc(doc(db, "homepageSections", s.id), s, { merge: true });
    }
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
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
  if (!isServer && cachedCategories) return cachedCategories;
  const sessionCached = getSessionCache<Category[]>("atj_cache_categories");
  if (sessionCached) {
    cachedCategories = sessionCached;
    return sessionCached;
  }
  if (!hasFirebaseConfig || !db) return defaultCategories;
  
  try {
    const snap = await withTimeout(getDocs(collection(db, "categories")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    cachedCategories = list.length ? list.sort((a, b) => a.priority - b.priority) : defaultCategories;
    setSessionCache("atj_cache_categories", cachedCategories);
    return cachedCategories;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function addCategory(category: Omit<Category, "id">): Promise<string> {
  clearAllCaches(); // Invalidate cache
  
  try {
    const ref = await addDoc(collection(db, "categories"), category);
    return ref.id;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await updateDoc(doc(db, "categories", id), category);
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await deleteDoc(doc(db, "categories", id));
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// SEO SETTINGS
const defaultSEOSettings: SEOSettings = {
  homepageTitle: "LONA JEWELS | Waterproof & Tarnish-Free Jewellery Online",
  homepageDescription: "Shop premium anti-tarnish, waterproof, non-fading jewellery for daily wear, office wear, party wear, and bridal occasions.",
  categoryTitleTemplate: "%s | LONA JEWELS",
  productTitleTemplate: "%s | Buy at LONA JEWELS",
  socialText: "Shop premium anti-tarnish, waterproof, non-fading jewellery for daily wear, office wear, party wear, and bridal occasions at LONA JEWELS."
};

export async function getSEOSettings(): Promise<SEOSettings> {
  if (!isServer && cachedSEOSettings) return cachedSEOSettings;
  const sessionCached = getSessionCache<SEOSettings>("atj_cache_seoSettings");
  if (sessionCached) {
    cachedSEOSettings = sessionCached;
    return sessionCached;
  }
  if (!hasFirebaseConfig || !db) return defaultSEOSettings;
  
  try {
    const d = await withTimeout(getDoc(doc(db, "seoSettings", "global")));
    cachedSEOSettings = d.exists() ? (d.data() as SEOSettings) : defaultSEOSettings;
    setSessionCache("atj_cache_seoSettings", cachedSEOSettings);
    return cachedSEOSettings;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function saveSEOSettings(seo: Partial<SEOSettings>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await setDoc(doc(db, "seoSettings", "global"), seo, { merge: true });
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// ANNOUNCEMENTS
const defaultAnnouncements: AnnouncementSettings = {
  showAnnouncement: true,
  text: "Get 20% off your first order! Use code ATJ20 at checkout.",
  showNewsletterPopup: false,
  whatsAppSupport: "917250569370"
};

export async function getAnnouncements(): Promise<AnnouncementSettings> {
  if (!isServer && cachedAnnouncements) return cachedAnnouncements;
  const sessionCached = getSessionCache<AnnouncementSettings>("atj_cache_announcements");
  if (sessionCached) {
    cachedAnnouncements = sessionCached;
    return sessionCached;
  }
  if (!hasFirebaseConfig || !db) return defaultAnnouncements;
  
  try {
    const d = await withTimeout(getDoc(doc(db, "announcements", "global")));
    // Force bust cache visually by always resolving fresh

    cachedAnnouncements = d.exists() ? (d.data() as AnnouncementSettings) : defaultAnnouncements;
    setSessionCache("atj_cache_announcements", cachedAnnouncements);
    return cachedAnnouncements;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function saveAnnouncements(announcements: Partial<AnnouncementSettings>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await setDoc(doc(db, "announcements", "global"), announcements, { merge: true });
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// REVIEWS
const defaultReviews = [
  { id: "r1", name: "Aisha R.", comment: "The Anti-Tarnish Pearl Drop Earrings are stunning! I've been wearing them daily and they look brand new.", rating: 5, active: true, createdAt: new Date().toISOString() },
  { id: "r2", name: "Priya M.", comment: "Absolutely love the waterproof gold hoop earrings. I wear them in the shower and they haven't faded at all!", rating: 5, active: true, createdAt: new Date().toISOString() },
  { id: "r3", name: "Anjali S.", comment: "The bridal Kundan necklace set was the highlight of my wedding. Very premium quality and luxury packaging.", rating: 5, active: true, createdAt: new Date().toISOString() }
];

export async function getReviews(): Promise<any[]> {
  if (!isServer && cachedReviews) return cachedReviews;
  const sessionCached = getSessionCache<any[]>("atj_cache_reviews");
  if (sessionCached) {
    cachedReviews = sessionCached;
    return sessionCached;
  }
  if (!hasFirebaseConfig || !db) return defaultReviews;
  
  try {
    const snap = await withTimeout(getDocs(collection(db, "reviews")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cachedReviews = list.length ? list : defaultReviews;
    setSessionCache("atj_cache_reviews", cachedReviews);
    return cachedReviews;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function addReview(review: any): Promise<string> {
  clearAllCaches(); // Invalidate cache
  
  try {
    const ref = await addDoc(collection(db, "reviews"), { ...review, createdAt: new Date().toISOString() });
    return ref.id;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function updateReview(id: string, review: any): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await updateDoc(doc(db, "reviews", id), review);
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function deleteReview(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await deleteDoc(doc(db, "reviews", id));
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// CONTACT MESSAGES
export async function saveContactMessage(msg: { name: string; email: string; phone?: string; message: string }) {
  clearAllCaches(); // Invalidate cache
  const data = { ...msg, createdAt: new Date().toISOString(), isRead: false, isReplied: false };
  
  try {
    const ref = await addDoc(collection(db, "contactMessages"), data);
    return { id: ref.id };
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!isServer && cachedContactMessages) return cachedContactMessages;
  const sessionCached = getSessionCache<ContactMessage[]>("atj_cache_contact_messages");
  if (sessionCached) {
    cachedContactMessages = sessionCached;
    return sessionCached;
  }

  
  try {
    const snap = await withTimeout(getDocs(query(collection(db, "contactMessages"), orderBy("createdAt", "desc"))));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage));
    cachedContactMessages = list;
    setSessionCache("atj_cache_contact_messages", cachedContactMessages);
    return list;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function updateContactMessage(id: string, data: Partial<ContactMessage>): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await updateDoc(doc(db, "contactMessages", id), data);
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  clearAllCaches(); // Invalidate cache
  
  try {
    await deleteDoc(doc(db, "contactMessages", id));
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// USERS MANAGEMENT
const defaultUsers = [
  { uid: "mock-admin", email: "admin@antitarnishjewel.com", displayName: "Store Admin", role: "admin", totalSpent: 0, blocked: false, createdAt: new Date().toISOString() },
  { uid: "mock-user-123", email: "customer@antitarnishjewel.com", displayName: "Aisha R.", role: "customer", totalSpent: 14999, blocked: false, createdAt: new Date().toISOString() }
];

export async function getUsers(forceRefresh = false): Promise<any[]> {
  if (!forceRefresh) {
    if (!isServer && cachedUsers) return cachedUsers;
    const sessionCached = getSessionCache<any[]>("atj_cache_users");
    if (sessionCached) {
      cachedUsers = sessionCached;
      return sessionCached;
    }
  }

  if (!hasFirebaseConfig || !db) return defaultUsers;

  
  try {
    const snap = await withTimeout(getDocs(collection(db, "users")));
    const list = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    cachedUsers = list;
    setSessionCache("atj_cache_users", cachedUsers);
    return list;
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

export async function updateUser(uid: string, data: any): Promise<void> {
  clearAllCaches(); // Invalidate cache
  if (!hasFirebaseConfig || !db) return;

  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (err) {
    console.error("Firestore operation failed:", err);
    throw err;
  }
}

// COLLECTIONS HELPER
export async function getCollections(): Promise<string[]> {
  if (!isServer && cachedCollections) return cachedCollections;
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
  if (!isServer && cachedProducts) return cachedProducts;
  const sessionCached = getSessionCache<Product[]>("atj_cache_products");
  if (sessionCached) {
    cachedProducts = sessionCached;
    return sessionCached;
  }
  return [];
}


// IMAGE UPLOAD
export async function uploadImage(file: File, folderName: string = "product-images"): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Validate file type and size before any upload attempt
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Only images are allowed.");
  }
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
  }

  // Cloudinary fallback if configured
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
      console.warn("Cloudinary upload failed, falling back to Firebase:", err);
    }
  }

  if (!hasFirebaseConfig || !storage) {
    throw new Error("Firebase Storage is not configured. Cannot upload image.");
  }

  try {
    // Sanitize filename
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const tempId = Date.now().toString();
    
    // Upload to specified folder
    const fileRef = storageRef(storage, `${folderName}/${tempId}/${safeFileName}`);
    let fileToUpload = file; if (typeof window !== "undefined") { try { const imageCompression = (await import("browser-image-compression")).default; fileToUpload = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true, initialQuality: 0.8, fileType: file.type === "image/png" ? "image/png" : "image/webp" }); } catch(e){} } await uploadBytes(fileRef, fileToUpload, { cacheControl: "public, max-age=31536000, immutable" });
    return await getDownloadURL(fileRef);
  } catch (err: any) {
    console.error("Firebase Storage upload error:", err);
    throw new Error(err.message || "Failed to upload image to Firebase Storage.");
  }
}

export async function getAnnouncementsList(): Promise<Announcement[]> {
  if (!hasFirebaseConfig || !db) return [];
  try {
    const snap = await withTimeout(getDocs(query(collection(db, "announcementsList"), orderBy("order", "asc"))));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
  } catch (err) {
    console.error("Firestore getAnnouncementsList failed:", err);
    return [];
  }
}

export async function addAnnouncement(data: Omit<Announcement, "id">) {
  clearAllCaches();
  const ref = await addDoc(collection(db, "announcementsList"), data);
  return ref.id;
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>) {
  clearAllCaches();
  await updateDoc(doc(db, "announcementsList", id), data);
}

export async function deleteAnnouncement(id: string) {
  clearAllCaches();
  await deleteDoc(doc(db, "announcementsList", id));
}


export async function getStaffUsers(): Promise<UserProfile[]> {
  if (!db) return [];
  const q = query(
    collection(db, "users"),
    where("role", "in", ["admin", "owner_admin", "partner_admin", "developer_admin", "staff"])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
}

export async function getStaffInvites(): Promise<any[]> {
  if (!db) return [];
  const q = query(collection(db, "staffInvites"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ email: doc.id, ...doc.data() }));
}

export async function addStaffInvite(email: string, role: UserRole, addedBy: string): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "staffInvites", email.toLowerCase()), {
    role,
    addedBy,
    createdAt: serverTimestamp()
  });
}

export async function revokeStaffInvite(email: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "staffInvites", email.toLowerCase()));
}

export async function updateStaffRole(uid: string, role: UserRole, status: UserStatus): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), {
    role,
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function logActivity(log: Omit<AuditLog, "id" | "createdAt">): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, "auditLogs"), {
    ...log,
    createdAt: serverTimestamp()
  });
}

export async function getAuditLogs(actorRoleFilter?: string): Promise<AuditLog[]> {
  if (!db) return [];
  let q;
  if (actorRoleFilter === "staff") {
    q = query(collection(db, "auditLogs"), where("actorRole", "==", "staff"), orderBy("createdAt", "desc"), limit(100));
  } else {
    q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(100));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
}

// Wishlist functions
export async function getWishlist(userId: string): Promise<Product[]> {
  if (!db) return [];
  const docRef = doc(db, "users", userId);
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().wishlist) {
    return snap.data().wishlist as Product[];
  }
  return [];
}

export async function saveWishlist(userId: string, wishlist: Product[]): Promise<void> {
  if (!db) return;
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, { wishlist });
}

// Cart functions
export async function getCart(userId: string): Promise<CartItem[]> {
  if (!db) return [];
  const docRef = doc(db, "users", userId);
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().cart) {
    return snap.data().cart as CartItem[];
  }
  return [];
}

export async function saveCart(userId: string, cart: CartItem[]): Promise<void> {
  if (!db) return;
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, { cart });
}

// Reviews
export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
}

export async function submitProductReview(reviewData: Omit<Review, "id" | "createdAt">): Promise<void> {
  if (!db) return;
  try {
    const reviewRef = doc(collection(db, "reviews"));
    await setDoc(reviewRef, {
      ...reviewData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}

export async function submitReturnRequest(data: {
  orderNumber: string;
  identifier: string;
  requestType: "Return" | "Exchange";
  reason: string;
  message: string;
}) {
  if (!db) throw new Error("Firebase not initialized");
  
  // Find order
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("orderNumber", "==", data.orderNumber));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error("Order not found. Please check your order number.");
  }
  
  const orderDoc = snapshot.docs[0];
  const orderData = orderDoc.data();
  
  const ident = data.identifier.toLowerCase().trim();
  const emailMatch = (orderData.customerEmail || "").toLowerCase() === ident;
  // Clean phone numbers to digits only for comparison
  const cleanDbPhone = (orderData.customerPhone || "").replace(/\D/g, '');
  const cleanInputPhone = ident.replace(/\D/g, '');
  const phoneMatch = cleanDbPhone && cleanInputPhone && cleanDbPhone.includes(cleanInputPhone);
  
  if (!emailMatch && !phoneMatch) {
    throw new Error("Email or Phone does not match the order details.");
  }
  
  const requestRef = doc(collection(db, "returnRequests"));
  await setDoc(requestRef, {
    orderNumber: data.orderNumber,
    orderId: orderDoc.id,
    customerEmail: orderData.customerEmail || "",
    customerPhone: orderData.customerPhone || "",
    requestType: data.requestType,
    reason: data.reason,
    message: data.message,
    status: "pending",
    createdAt: new Date().toISOString()
  });
}

export async function markAdvancePaid(orderId: string, total: number) {
  clearAllCaches();
  const updateData: any = {
    amountPaid: 100,
    payOnDeliveryAmount: total - 100,
    paymentStatus: 'advance_paid',
    codAdvanceStatus: 'paid',
    orderStatus: 'Confirmed',
    status: 'Confirmed'
  };
  await updateOrder(orderId, updateData);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!hasFirebaseConfig || !db) return null;
  try {
    const d = await withTimeout(getDoc(doc(db, 'orders', id)));
    if (d.exists()) {
      return { id: d.id, ...d.data() } as Order;
    }
  } catch (err) {}
  return null;
}
