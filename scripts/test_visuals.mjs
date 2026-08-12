import { chromium } from "playwright";

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3001/bundles", { waitUntil: "networkidle" });
  await page.screenshot({ path: "desktop-visual-test.png" });
  
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "mobile-visual-test.png" });

  console.log("Screenshots taken.");
  await browser.close();
}

runTests();
