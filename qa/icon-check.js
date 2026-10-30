/* Icon review captures — dev-only. Run: node qa/icon-check.js */
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  const out = [];

  await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map(i => i.complete
      ? Promise.resolve()
      : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
  });
  await page.waitForTimeout(400);

  // 1. trust strip
  await page.locator(".trust").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator(".trust").screenshot({ path: path.join(SHOTS, "icons-trust.png") });
  out.push("icons-trust.png");

  // 2. hero action buttons
  await page.locator(".hero2__actions").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.locator(".hero2__actions").screenshot({ path: path.join(SHOTS, "icons-hero-actions.png") });
  out.push("icons-hero-actions.png");

  // 3. mega menu open
  await page.hover('.site-nav__link.nav-drop[aria-controls="dd-services"]');
  await page.waitForTimeout(450);
  await page.locator(".dd--mega").screenshot({ path: path.join(SHOTS, "icons-mega.png") });
  out.push("icons-mega.png");

  // 4. contact proof list
  await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/contact.html", { waitUntil: "load", timeout: 30000 });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
  });
  await page.locator(".proof-list").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator(".proof-list").screenshot({ path: path.join(SHOTS, "icons-proof.png") });
  out.push("icons-proof.png");

  console.log("console errors:", errors.length, errors.slice(0, 3));
  console.log("captures:\n" + out.map(o => path.join(SHOTS, o)).join("\n"));
  await browser.close();
})();
