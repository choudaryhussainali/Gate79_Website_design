/* Services section QA — dev-only. Run: node qa/svc-check.js */
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const WIDTHS = [1366, 1024, 768, 390];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  let failures = 0;
  const paths = [];

  for (const w of WIDTHS) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: 900 });
    const errors = [];
    page.on("pageerror", e => errors.push("pageerror: " + e));
    page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
    await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      const grid = document.querySelector(".svc2-grid");
      grid.scrollIntoView({ block: "center" });
      await Promise.all([...document.images].map(i => i.complete
        ? Promise.resolve()
        : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
      await new Promise(r => setTimeout(r, 600));
    });

    const checks = await page.evaluate(() => {
      const out = { overflow: false, broken: [], clipped: [] };
      const de = document.documentElement;
      out.overflow = de.scrollWidth > window.innerWidth + 1;
      document.querySelectorAll(".svc2-grid img").forEach(i => {
        if (i.complete && i.naturalWidth === 0) out.broken.push(i.getAttribute("src"));
      });
      const grid = document.querySelector(".svc2-grid");
      const gr = grid.getBoundingClientRect();
      document.querySelectorAll(".svc2-grid .svc-card2__num, .svc2-grid .svc-card2__btn, .svc2-grid .svc-card2__circle").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > gr.right + 2 || r.left < gr.left - 2) out.clipped.push(el.className.split(" ")[0]);
      });
      return out;
    });

    const bad = checks.overflow || checks.broken.length || checks.clipped.length || errors.length;
    if (bad) failures++;
    console.log(w, "rest:", bad ? "FAIL " + JSON.stringify({ checks, errors: errors.slice(0, 2) }) : "PASS");

    const restPath = path.join(SHOTS, "svc2-" + w + "-rest.png");
    await page.locator(".svc2-grid").screenshot({ path: restPath });
    paths.push(restPath);

    await page.locator(".svc2-grid .svc-card2").first().hover();
    await page.waitForTimeout(350);
    const hoverPath = path.join(SHOTS, "svc2-" + w + "-hover.png");
    await page.locator(".svc2-grid").screenshot({ path: hoverPath });
    paths.push(hoverPath);
    await page.close();
  }
  await ctx.close();
  await browser.close();
  console.log("failures:", failures);
  console.log("screenshots:\n" + paths.join("\n"));
})();
