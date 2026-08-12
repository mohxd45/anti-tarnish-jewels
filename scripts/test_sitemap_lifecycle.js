require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const http = require('http');

async function main() {
  console.log("Setting up Firebase Admin...");
  // Connect to emulator
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  
  if (!getApps().length) {
    initializeApp({ projectId: "demo-noore-jewels" });
  }
  const adminDb = getFirestore();
  
  console.log("Seeding test records...");
  const pRef = adminDb.collection('products').doc('test-product');
  await pRef.set({
    slug: 'test-product',
    name: 'Test Product',
    isActive: true,
    isBundle: false,
    updatedAt: new Date().toISOString()
  });

  const bRef = adminDb.collection('products').doc('test-bundle');
  await bRef.set({
    slug: 'test-bundle',
    name: 'Test Bundle',
    isActive: true,
    isBundle: true,
    updatedAt: new Date().toISOString()
  });

  console.log("Fetching sitemap...");
  const fetchSitemap = () => new Promise((resolve, reject) => {
    http.get('http://localhost:3000/sitemap.xml', res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });

  let sitemap = await fetchSitemap();
  console.log("Sitemap status:", sitemap.status);
  console.log("Contains test-product:", sitemap.data.includes('test-product'));
  console.log("Contains test-bundle:", sitemap.data.includes('test-bundle'));

  console.log("Making test-product inactive and deleting test-bundle...");
  await pRef.update({ isActive: false });
  await bRef.delete();

  console.log("Fetching sitemap again...");
  sitemap = await fetchSitemap();
  console.log("Contains test-product:", sitemap.data.includes('test-product'));
  console.log("Contains test-bundle:", sitemap.data.includes('test-bundle'));
  
  // Cleanup
  await pRef.delete();
  console.log("Lifecycle test completed.");
}

main().catch(console.error);
