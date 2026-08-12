import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
initializeApp({ projectId: 'demo-noore-jewels' });
const db = getFirestore();
async function run() {
  const snap = await db.collection('orders').limit(10).get();
  console.log('Found orders:', snap.size);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, typeof data.createdAt, data.createdAt);
  });
}
run().catch(console.error);
