const http = require('http');

async function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verifySitemap() {
  try {
    const xml = await fetchUrl('/sitemap.xml');
    console.log(xml);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

verifySitemap();
