/* Mega menu QA — dev-only. Run: node qa/mega-check.js */
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots");
const SIZES = [[1920, 1080], [1366, 768], [1024, 768]];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  let failures = 0;
  const paths = [];

  for (const [w, h] of SIZES) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: h });
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
    await page.hover('.site-nav__link.nav-drop[aria-controls="dd-services"]');
    await page.waitForTimeout(400);

    const r = await page.evaluate(() => {
      const panel = document.querySelector(".dd--mega");
      const pr = panel.getBoundingClientRect();
      return {
        visible: !panel.hidden && pr.width > 0,
        within: pr.left >= 0 && pr.right <= window.innerWidth + 1,
        items: panel.querySelectorAll(".mega__item").length,
        w: Math.round(pr.width),
        h: Math.round(pr.height),
        scroll: document.documentElement.scrollWidth > window.innerWidth + 1
      };
    });
    const bad = !r.visible || !r.within || r.items !== 6 || r.scroll || errors.length;
    if (bad) failures++;
    console.log(w + "x" + h, bad ? "FAIL " + JSON.stringify({ r, errors: errors.slice(0, 2) }) : "PASS panel " + r.w + "x" + r.h + " items " + r.items);

    const shot = path.join(SHOTS, "mega-" + w + ".png");
    await page.locator(".dd--mega").screenshot({ path: shot });
    paths.push(shot);
    await page.close();
  }
  await ctx.close();
  await browser.close();
  console.log("failures:", failures);
  console.log("screenshots:\n" + paths.join("\n"));
})();
