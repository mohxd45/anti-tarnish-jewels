const https = require('https');

https.get('https://lonajewels.com/sitemap.xml', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    if (res.statusCode !== 200) {
      console.log('Error fetching sitemap');
      return;
    }

    const matches = data.match(/<loc>(.*?)<\/loc>/g) || [];
    const urls = matches.map(m => m.replace(/<\/?loc>/g, ''));
    
    let staticCount = 0;
    let productCount = 0;
    
    let exampleProduct = null;

    urls.forEach(url => {
      if (url.includes('/product/')) {
        productCount++;
        if (!exampleProduct) exampleProduct = url;
      } else {
        staticCount++;
      }
    });

    console.log('Total URLs:', urls.length);
    console.log('Static URLs:', staticCount);
    console.log('Dynamic Product/Bundle URLs:', productCount);
    console.log('Example Product URL:', exampleProduct);
    
    if (productCount === 0) {
      console.log('WARNING: No products found in the sitemap!');
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
