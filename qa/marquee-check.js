/* Logo marquee QA — dev-only. Run: node qa/marquee-check.js */
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
  await page.locator(".logo-marquee").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const rows = await page.evaluate(() => document.querySelectorAll(".logo-marquee__row").length);
  const r1 = page.locator(".logo-marquee__row").first().locator(".logo-marquee__track");
  const r2 = page.locator(".logo-marquee__row").nth(1).locator(".logo-marquee__track");
  const tx1a = await r1.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
  const tx2a = await r2.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
  await page.waitForTimeout(1200);
  const tx1b = await r1.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
  const tx2b = await r2.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);

  const d1 = tx1b - tx1a, d2 = tx2b - tx2a;
  const moving = d1 !== 0 || d2 !== 0;
  const opposite = d1 * d2 < 0;

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const groupOK = await page.evaluate(() => {
    const t = document.querySelector(".logo-marquee__track");
    const groups = t.querySelectorAll(".logo-marquee__group");
    return groups.length === 2 && groups[0].children.length === groups[1].children.length;
  });

  await page.screenshot({ path: path.join(SHOTS, "marquee-1366.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  const overflow390 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  await page.screenshot({ path: path.join(SHOTS, "marquee-390.png") });

  let failures = 0;
  if (rows !== 2) { failures++; console.log("FAIL rows != 2"); }
  if (!moving) { failures++; console.log("FAIL marquee not moving"); }
  if (!opposite) { failures++; console.log("FAIL directions not opposite", d1, d2); }
  if (overflow || overflow390) { failures++; console.log("FAIL horizontal overflow"); }
  if (!groupOK) { failures++; console.log("FAIL group duplication"); }
  if (errors.length) { failures++; console.log("FAIL console", errors.slice(0, 2)); }

  console.log(JSON.stringify({ rows, tx: [tx1a, tx1b, tx2a, tx2b], d1, d2, overflow, overflow390, groupOK, errors: errors.length }));
  console.log(failures === 0 ? "MARQUEE PASS" : "MARQUEE FAIL: " + failures);
  await browser.close();
})();
