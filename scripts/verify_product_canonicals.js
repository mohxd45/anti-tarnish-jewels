const http = require('http');

const urls = [
  '/product/real-test-product',
  '/product/real-test-bundle',
  '/product/non-existent-product'
];

async function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verify() {
  for (const u of urls) {
    try {
      const html = await fetchUrl(u);
      const match = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
      if (match) {
        console.log(`[${u}] Canonical: ${match[1]}`);
      } else {
        console.log(`[${u}] Canonical: NOT FOUND`);
      }
    } catch (e) {
      console.error(`[${u}] Error fetching: ${e.message}`);
    }
  }
}

verify();
