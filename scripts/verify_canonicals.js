const http = require('http');

const urls = [
  '/',
  '/shop',
  '/shop?category=rings',
  '/bundles'
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
