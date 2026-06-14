const { execSync } = require('child_process');

const vars = {
  "NEXT_PUBLIC_FIREBASE_API_KEY": "AIzaSyBGiEzEQkuUt4hS-sZF_11_ZkyEzzT3n8c",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "tayba-marketplace.firebaseapp.com",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "tayba-marketplace",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "tayba-marketplace.firebasestorage.app",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "507659416036",
  "NEXT_PUBLIC_FIREBASE_APP_ID": "1:507659416036:web:112c78960af8a1fa1197f1"
};

for (const [key, value] of Object.entries(vars)) {
  try {
    execSync(`npx vercel env rm ${key} production -y`);
  } catch(e) {}
  try {
    execSync(`npx vercel env add ${key} production`, { input: value });
    console.log(`Added ${key}`);
  } catch(e) {
    console.error(`Failed ${key}`);
  }
}
