const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to mobile size
  await page.setViewport({ width: 375, height: 812 });
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log('Page loaded. Waiting 2s...');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'C:\\Users\\LG GRAM\\.gemini\\antigravity\\brain\\6ca84693-f56c-4c36-b9de-555c8a6212b1\\mobile_hero_banners.png' });
  console.log('Screenshot saved to mobile_hero_banners.png');
  
  await browser.close();
  console.log('Done.');
})();
