import * as fs from 'fs';

const envContent = fs.readFileSync('.env.production.local', 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    let val = values.join('=').trim();
    if (val.startsWith('\"') && val.endsWith('\"')) {
      val = val.substring(1, val.length - 1);
    }
    acc[key.trim()] = val;
  }
  return acc;
}, {} as Record<string, string>);

process.env.SHIPROCKET_API_EMAIL = envVars.SHIPROCKET_API_EMAIL;
process.env.SHIPROCKET_API_PASSWORD = envVars.SHIPROCKET_API_PASSWORD;

console.log('Email exists:', !!process.env.SHIPROCKET_API_EMAIL, process.env.SHIPROCKET_API_EMAIL);
console.log('Password exists:', !!process.env.SHIPROCKET_API_PASSWORD, 'length:', process.env.SHIPROCKET_API_PASSWORD?.length);

import { getShiprocketToken } from './lib/shiprocket';

async function main() {
  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email: process.env.SHIPROCKET_API_EMAIL, password: process.env.SHIPROCKET_API_PASSWORD })
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data keys:', Object.keys(data));
    if (!res.ok) {
        console.log('Error message:', data.message);
    }
  } catch (err: any) {
    console.error('ERROR:', err.message);
  }
}

main();
