const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let events = new Set();
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('google-analytics.com/g/collect')) {
      const parsedUrl = new URL(url);
      const en = parsedUrl.searchParams.get('en');
      if (en) {
        events.add(en);
        console.log('GA Event:', en);
      }
    }
  });

  try {
    await page.goto('https://lonajewels.com/shop', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // wait for products to load
    
    const productLinks = await page.locator('a[href^="/product/"]').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForTimeout(3000); // wait for view_item
      
      const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        await page.waitForTimeout(3000); // wait for add_to_cart
      }
      
      const checkoutBtn = await page.locator('button:has-text("Checkout")').first();
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
        await page.waitForTimeout(3000); // wait for begin_checkout
      }
    }
  } catch(e) { console.error(e) }
  
  console.log('Events caught:', Array.from(events));
  await browser.close();
})();
