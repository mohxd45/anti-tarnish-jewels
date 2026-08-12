const fs = require('fs');
const dotenv = require('dotenv');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const envConfig = dotenv.parse(fs.readFileSync('.vercel/.env.production.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

try {
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
  }
  
  console.log("Project ID:", process.env.FIREBASE_ADMIN_PROJECT_ID);
  
  const credential = cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey
  });
  
  initializeApp({ credential });
  const db = getFirestore();
  
  db.collection('products').limit(1).get()
    .then(snap => {
      console.log('Success! Products fetched:', snap.size);
    })
    .catch(e => {
      console.error('Fetch error:', e);
    });
} catch(e) {
  console.error('Init error:', e);
}
