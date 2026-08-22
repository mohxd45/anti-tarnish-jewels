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

async function verify() {
  try {
    const html = await fetchUrl('/');
    const title = html.match(/<title>([^<]+)<\/title>/);
    const metaTags = html.match(/<meta[^>]+>/g) || [];
    const linkTags = html.match(/<link[^>]+>/g) || [];

    console.log('Title:', title ? title[1] : 'NOT FOUND');
    
    for (const tag of metaTags) {
      if (tag.includes('description') || tag.includes('og:') || tag.includes('twitter:') || tag.includes('robots')) {
        console.log(tag);
      }
    }
    
    for (const tag of linkTags) {
      if (tag.includes('rel="canonical"')) {
        console.log(tag);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

verify();
