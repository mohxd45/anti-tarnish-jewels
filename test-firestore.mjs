import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBGiEzEQkuUt4hS-sZF_11_ZkyEzzT3n8c",
  authDomain: "tayba-marketplace.firebaseapp.com",
  projectId: "tayba-marketplace",
  storageBucket: "tayba-marketplace.firebasestorage.app",
  messagingSenderId: "507659416036",
  appId: "1:507659416036:web:112c78960af8a1fa1197f1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testCreateOrder() {
  try {
    const orderDocId = "test-order-1234";
    const newOrder = {
      id: orderDocId,
      orderNumber: "ATJ-123",
      userId: "guest",
      customerName: "Test User",
      customerEmail: "test@example.com",
      customerPhone: "9876543210",
      customerPhoneClean: "9876543210",
      shippingAddress: { city: "Test", state: "Test", line1: "Test", phone: "123", fullName: "Test", pincode: "123" },
      address: { city: "Test", state: "Test", line1: "Test", phone: "123", fullName: "Test", pincode: "123" },
      items: [],
      subtotal: 100,
      shippingFee: 0,
      shipping: 0,
      discount: 0,
      couponCode: "",
      couponId: "",
      total: 100,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      status: "Pending",
      trackingNumber: "",
      courierName: "",
      trackingUrl: "",
      timeline: [],
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("Attempting to write order...");
    await setDoc(doc(db, "orders", orderDocId), newOrder);
    console.log("Success!");
  } catch (err) {
    console.error("Firestore Error:", err);
  }
}

testCreateOrder();
