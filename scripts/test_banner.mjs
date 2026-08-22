import { chromium } from "playwright";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

if (getApps().length === 0) {
  initializeApp({ projectId: "demo-noore-jewels" });
}
const db = getFirestore();

const URL = "http://localhost:3000/bundles";
let browser;
let page;

async function setup() {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
}

async function cleanupBanners() {
  const snapshot = await db.collection("banners").where("placement", "==", "bundles-page").get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function setBanner(data) {
  await cleanupBanners();
  const docRef = await db.collection("banners").add({
    placement: "bundles-page",
    ...data
  });
  return docRef.id;
}

async function runTests() {
  await setup();
  console.log("Starting tests...");

  try {
    // 1. Desktop & Mobile Image Test
    console.log("TEST A & B: Setting up Desktop and Mobile banner...");
    await setBanner({
      title: "Test Banner",
      imageUrl: "https://via.placeholder.com/1920x800.png/09f/fff?text=Desktop+Banner",
      mobileImageUrl: "https://via.placeholder.com/800x1000.png/f09/fff?text=Mobile+Banner",
      isActive: true,
      linkUrl: "https://example.com"
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: "desktop-banner-test.png" });
    console.log(" - Desktop screenshot saved. Check if it's correct.");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: "mobile-banner-test.png" });
    console.log(" - Mobile screenshot saved. Evaluate aspect-[4/5] height.");

    // Link Test
    const linkHref = await page.evaluate(() => {
      const link = document.querySelector("a[href='https://example.com']");
      return link ? link.href : null;
    });
    console.log(` - Link behavior: ${linkHref === "https://example.com/" ? "PASS" : "FAIL"}`);

    // 2. Mobile Fallback Test
    console.log("TEST C: Mobile Fallback...");
    await setBanner({
      title: "Test Banner",
      imageUrl: "https://via.placeholder.com/1920x800.png/09f/fff?text=Desktop+Banner",
      isActive: true
    });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: "mobile-fallback-test.png" });
    console.log(" - Mobile fallback screenshot saved.");

    // 3. Replacement Test
    console.log("TEST D: Replacement Test...");
    await setBanner({
      title: "New Banner",
      imageUrl: "https://via.placeholder.com/1920x800.png/000/fff?text=New+Desktop+Banner",
      isActive: true
    });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: "replacement-test.png" });
    console.log(" - Replacement test screenshot saved.");

    // 4. Disable Test
    console.log("TEST E: Disable Test...");
    await setBanner({
      title: "Disabled Banner",
      imageUrl: "https://via.placeholder.com/1920x800.png/000/fff?text=Disabled",
      isActive: false
    });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: "disable-test.png" });
    const hasBannerDisabled = await page.evaluate(() => document.body.innerHTML.includes("1920x800"));
    console.log(` - Disable behavior: ${!hasBannerDisabled ? "PASS" : "FAIL"}`);

    // 5. Delete Test
    console.log("TEST F: Delete Test...");
    await cleanupBanners();
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: "delete-test.png" });
    const hasBannerDeleted = await page.evaluate(() => document.body.innerHTML.includes("1920x800"));
    console.log(` - Delete behavior: ${!hasBannerDeleted ? "PASS" : "FAIL"}`);

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await browser.close();
  }
}

runTests();
