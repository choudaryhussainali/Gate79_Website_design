/* Draw-in recording on the home page at 1366 — six stepped frames. Dev-only. */
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots", "drawin");
fs = require("fs");
fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
  await page.evaluate(() => { document.querySelectorAll("[data-reveal]").forEach(el => el.classList.remove("is-in")); });
  const head = "[aria-labelledby=\"services-title\"] .section-head";
  await page.locator(head).scrollIntoViewIfNeeded();
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(160);
    await page.locator(head).screenshot({ path: path.join(SHOTS, "drawin-" + i + ".png") });
  }
  console.log("six draw-in frames saved");
  await browser.close();
})();
