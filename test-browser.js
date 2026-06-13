const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`[PAGE ERROR] ${error}`));

  console.log('--- Navigating to /sale ---');
  await page.goto('https://anti-tarnish-jewels-livid.vercel.app/sale', { waitUntil: 'networkidle', timeout: 15000 });
  const saleHtml = await page.content();
  if (saleHtml.includes('Loading Sale Items')) {
    console.log('SALE PAGE IS STUCK ON LOADING!');
  } else if (saleHtml.includes('No products match')) {
    console.log('SALE PAGE SAYS NO PRODUCTS MATCH!');
  } else {
    console.log('SALE PAGE RENDERED PRODUCTS!');
  }

  console.log('--- Navigating to /product/premium-anti-tarnish ---');
  await page.goto('https://anti-tarnish-jewels-livid.vercel.app/product/premium-anti-tarnish', { waitUntil: 'networkidle', timeout: 15000 });
  const prodHtml = await page.content();
  if (prodHtml.includes('Product not found')) {
    console.log('PRODUCT PAGE SAYS NOT FOUND!');
  } else if (prodHtml.includes('Loading')) {
    console.log('PRODUCT PAGE IS STUCK LOADING!');
  } else {
    console.log('PRODUCT PAGE RENDERED!');
  }

  await browser.close();
})();
