const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log("Navigating to /bundles...");
    await page.goto('http://localhost:3000/bundles', { waitUntil: 'networkidle' });
    
    // Find a mix and match bundle
    const mixMatchButton = page.locator('text=Build Bundle').first();
    const count = await mixMatchButton.count();
    
    if (count === 0) {
      console.log("No mix and match bundles found on /bundles page.");
      await browser.close();
      return;
    }
    
    console.log("Found Mix & Match bundle. Clicking...");
    await mixMatchButton.click();
    await page.waitForLoadState('networkidle');
    
    console.log("Current URL:", page.url());
    
    // Check eligible items
    const selectDivs = page.locator('div.group');
    const divCount = await selectDivs.count();
    console.log(`Found ${divCount} eligible items.`);
    
    if (divCount > 0) {
      console.log("Clicking the first item's button...");
      const btn1 = selectDivs.nth(0).locator('button');
      await btn1.click({ force: true });
      await page.waitForTimeout(500);
      
      let addedCount = await page.locator('text=Added').count();
      console.log(`Number of items showing 'Added' after 1st click: ${addedCount}`);
      
      console.log("Clicking the second item's div directly...");
      await selectDivs.nth(1).click({ force: true });
      await page.waitForTimeout(500);
      
      addedCount = await page.locator('text=Added').count();
      console.log(`Number of items showing 'Added' after 2nd click: ${addedCount}`);
      
      // Let's check selectionLimit
      const limitText = await page.locator('span:has-text("Selected")').textContent();
      console.log(`Selection Limit Text: ${limitText}`);
      
      // Select until full
      const match = limitText.match(/Selected \d+\/(\d+)/);
      if (match) {
        const limit = parseInt(match[1]);
        console.log(`Limit is ${limit}. Selecting up to limit...`);
        for (let i = 2; i < limit && i < divCount; i++) {
          await selectDivs.nth(i).click({ force: true });
          await page.waitForTimeout(200);
        }
      }
      
      const ctaText = await page.locator('button', { hasText: /Add Bundle to Cart/i }).first().textContent();
      const ctaDisabled = await page.locator('button', { hasText: /Add Bundle to Cart/i }).first().isDisabled();
      console.log(`CTA Text: ${ctaText}, Disabled: ${ctaDisabled}`);
      
      if (!ctaDisabled) {
         console.log("Clicking final CTA...");
         await page.locator('button', { hasText: /Add Bundle to Cart/i }).first().click();
         await page.waitForTimeout(1000);
         
         const cartToast = await page.locator('text=Bundle added to cart').count();
         console.log(`Cart Toast visible: ${cartToast > 0}`);
      }
    }
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
})();
