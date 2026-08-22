import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
initializeApp({ projectId: 'demo-noore-jewels' });
const db = getFirestore();

async function run() {
  console.log('Seeding test orders...');
  
  const d = new Date();
  
  // Format local date part properly since emulator is local. We don't care exactly, just a date string.
  const todayStr = d.toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const oldDateStr = '2025-01-15';

  const orders = [
    {
      // 1. Today Confirmed
      id: 'test-1-today-confirmed',
      orderNumber: 'TEST1',
      createdAt: `${todayStr}T10:00:00.000+05:30`,
      orderStatus: 'Confirmed',
      total: 1000,
      subtotal: 1100,
      discount: 100,
      shippingFee: 0,
      items: [
         { type: 'product', name: 'Product A', sku: 'SKU-A', quantity: 2, price: 550 }
      ]
    },
    {
      // 2. Today Cancelled (should be excluded from Net Sales, but sum in cancelledValue)
      id: 'test-2-today-cancelled',
      orderNumber: 'TEST2',
      createdAt: `${todayStr}T14:00:00.000+05:30`,
      orderStatus: 'Cancelled',
      total: 500,
      subtotal: 500,
      discount: 0,
      shippingFee: 0,
      items: [
         { type: 'product', name: 'Product B', sku: 'SKU-B', quantity: 1, price: 500 }
      ]
    },
    {
      // 3. Exactly 12:00 AM IST Today (Boundary Start)
      id: 'test-3-today-start',
      orderNumber: 'TEST3',
      createdAt: `${todayStr}T00:00:00.000+05:30`,
      orderStatus: 'Pending',
      total: 200,
      subtotal: 150,
      discount: 0,
      shippingFee: 50,
      items: [
         { type: 'product', name: 'Product A', sku: 'SKU-A', quantity: 1, price: 150 }
      ]
    },
    {
      // 4. Exactly 11:59:59 PM IST Today (Boundary End)
      id: 'test-4-today-end',
      orderNumber: 'TEST4',
      createdAt: `${todayStr}T23:59:59.999+05:30`,
      orderStatus: 'Delivered',
      total: 2000,
      subtotal: 2000,
      discount: 0,
      shippingFee: 0,
      items: [
         { type: 'product', name: 'Product C', sku: 'SKU-C', quantity: 1, price: 2000 }
      ]
    },
    {
      // 5. Failed Order (Today) - excluded from all
      id: 'test-5-today-failed',
      orderNumber: 'TEST5',
      createdAt: `${todayStr}T12:00:00.000+05:30`,
      orderStatus: 'Failed',
      total: 9999,
      subtotal: 9999,
      discount: 0,
      shippingFee: 0,
      items: [
         { type: 'product', name: 'Product X', sku: 'SKU-X', quantity: 1, price: 9999 }
      ]
    },
    {
      // 6. Yesterday Bundle Order
      id: 'test-6-yesterday-bundle',
      orderNumber: 'TEST6',
      createdAt: `${yesterdayStr}T15:00:00.000+05:30`,
      orderStatus: 'Packed',
      total: 1500,
      subtotal: 1500,
      discount: 0,
      shippingFee: 0,
      items: [
         { 
           type: 'bundle', 
           name: 'Gift Bundle', 
           sku: 'BUNDLE-1', 
           quantity: 1, 
           price: 1500,
           selectedProducts: [
              { name: 'Item 1', sku: 'IT-1', selectedQuantity: 1 },
              { name: 'Item 2', sku: 'IT-2', selectedQuantity: 1 }
           ]
         }
      ]
    },
    {
      // 7. Old Date Mix & Match Bundle
      id: 'test-7-old-mixmatch',
      orderNumber: 'TEST7',
      createdAt: `${oldDateStr}T10:00:00.000+05:30`,
      orderStatus: 'Shipped',
      total: 2500,
      subtotal: 2500,
      discount: 0,
      shippingFee: 0,
      items: [
         { 
           type: 'mix_and_match_bundle', 
           name: 'Mix Match', 
           sku: 'MIX-1', 
           quantity: 1, 
           price: 2500,
           selectedProducts: [
              { name: 'Choice A', sku: 'CH-A', selectedQuantity: 1 },
              { name: 'Choice B', sku: 'CH-B', selectedQuantity: 1 }
           ]
         }
      ]
    }
  ];

  for (const o of orders) {
     await db.collection('orders').doc(o.id).set(o);
     console.log(`Seeded order ${o.id}`);
  }
  
  console.log('Seeding complete.');
}

run().catch(console.error);
