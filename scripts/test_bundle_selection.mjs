import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log("Navigating to /bundles...");
    await page.goto('http://localhost:3000/bundles', { waitUntil: 'networkidle' });
    
    const mixMatchButton = page.locator('text=Build Bundle').first();
    const count = await mixMatchButton.count();
    
    if (count === 0) {
      console.log("No mix and match bundles found.");
      await browser.close();
      return;
    }
    
    console.log("Clicking Build Bundle...");
    await mixMatchButton.click();
    await page.waitForLoadState('networkidle');
    
    console.log("Current URL:", page.url());
    
    const selectButtons = page.locator('button:has-text("Add")').filter({ hasNotText: 'Bundle' });
    const btnCount = await selectButtons.count();
    console.log(Found  item buttons.);
    
    if (btnCount > 0) {
      console.log("Clicking first item button...");
      await selectButtons.nth(0).click({ force: true });
      await page.waitForTimeout(500);
      
      console.log("Clicking second item button...");
      await selectButtons.nth(1).click({ force: true });
      await page.waitForTimeout(500);
      
      const addedCount = await page.locator('text=Added').count();
      console.log(Number of items showing 'Added': );
      
      const cta = page.locator('button:has-text("Add Bundle to Cart")');
      const ctaCount = await cta.count();
      if (ctaCount > 0) {
        console.log(CTA Disabled: );
      }
    }
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
})();
