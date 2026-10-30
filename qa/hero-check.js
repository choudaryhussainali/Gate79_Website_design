/* Home hero QA — dev-only. Run: node qa/hero-check.js */
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const SIZES = [[1920, 1080], [1440, 900], [1366, 768], [1024, 768], [768, 1024], [390, 844], [360, 740], [320, 640], [844, 390]];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const rows = [];
  let failures = 0;

  for (const [w, h] of SIZES) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: h });
    const errors = [];
    page.on("pageerror", e => errors.push("pageerror: " + e));
    page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
    await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map(i => i.complete
        ? Promise.resolve()
        : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
      await new Promise(r => setTimeout(r, 700));
    });

    const a = await page.evaluate(() => {
      const out = { overflow: false, frameEdge: [], tiny: [], small: [], broken: [], fx: [], colour: [] };
      const de = document.documentElement;
      if (de.scrollWidth > window.innerWidth + 1) out.overflow = true;
      const frame = document.querySelector(".hero-frame");
      if (frame) {
        const fr = frame.getBoundingClientRect();
        if (fr.left < -1 || fr.right > window.innerWidth + 1) out.frameEdge.push("frame beyond viewport");
        frame.querySelectorAll("*").forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width < 2 && r.height < 2) return;
          if (r.left < fr.left - 2 || r.right > fr.right + 2) out.frameEdge.push(el.tagName + "." + String(el.className).split(" ")[0]);
        });
        out.frameEdge = [...new Set(out.frameEdge)].slice(0, 4);
      }
      document.querySelectorAll("p,span,h1,h2,h3,li,a,label").forEach(el => {
        if (!el.offsetParent) return;
        const st = getComputedStyle(el);
        if (parseFloat(st.fontSize) < 12) out.tiny.push(el.tagName + " " + st.fontSize);
      });
      if (window.innerWidth < 1024) {
        document.querySelectorAll("a,button,input,select,textarea").forEach(el => {
          if (!el.offsetParent) return;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          if (el.type === "range") return;
          if (r.width < 44 || r.height < 44) out.small.push(el.tagName + "." + String(el.className).split(" ")[0] + " " + Math.round(r.width) + "x" + Math.round(r.height));
        });
        out.small = out.small.slice(0, 4);
      }
      document.querySelectorAll("img").forEach(i => {
        if (i.complete && i.naturalWidth === 0) out.broken.push(i.getAttribute("src"));
      });
      const hero = document.querySelector(".hero-frame-wrap");
      if (hero) {
        hero.querySelectorAll("*").forEach(el => {
          const st = getComputedStyle(el);
          if ((st.backgroundImage && st.backgroundImage.includes("gradient")) ||
              (st.filter && st.filter !== "none") ||
              (st.backdropFilter && st.backdropFilter !== "none")) {
            out.fx.push(el.tagName + "." + String(el.className).split(" ")[0]);
          }
        });
        const hueBad = c => {
          const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)/);
          if (!m) return false;
          const r = +m[1] / 255, g = +m[2] / 255, b = +m[3] / 255;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          if (mx - mn < 0.25 || mx < 0.35) return false;
          let hue = 0;
          if (mx === r) hue = 60 * (((g - b) / (mx - mn)) % 6);
          else if (mx === g) hue = 60 * ((b - r) / (mx - mn) + 2);
          else hue = 60 * ((r - g) / (mx - mn) + 4);
          if (hue < 0) hue += 360;
          return hue <= 55 || hue >= 330;
        };
        hero.querySelectorAll("*").forEach(el => {
          const st = getComputedStyle(el);
          if (hueBad(st.color) || hueBad(st.backgroundColor)) {
            out.colour.push(el.tagName + "." + String(el.className).split(" ")[0]);
          }
        });
        out.colour = [...new Set(out.colour)].slice(0, 4);
      }
      return out;
    });

    const bad = a.overflow || a.frameEdge.length || a.tiny.length || a.small.length || a.broken.length || a.fx.length || a.colour.length || errors.length;
    if (bad) failures++;
    rows.push({ size: w + "x" + h, ok: !bad, ...a, errors: errors.slice(0, 2) });
    await page.screenshot({ path: path.join(SHOTS, "hero-" + w + "x" + h + ".png") });

    // scroll 400: header must NOT stick; to-top must appear and work
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(350);
    const scrollCheck = await page.evaluate(() => {
      const hd = document.querySelector(".site-header--inset");
      const st = hd ? getComputedStyle(hd).position : "missing";
      const btn = document.querySelector("[data-to-top]");
      const bt = btn ? getComputedStyle(btn) : null;
      return {
        headerPos: st,
        notSticky: st === "static",
        toTopVisible: !!btn && bt.opacity !== "0" && bt.display !== "none",
        toTopSize: btn ? Math.round(btn.getBoundingClientRect().width) : 0
      };
    });
    await page.click("[data-to-top]", { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(900);
    const backAtTop = await page.evaluate(() => window.scrollY < 40);
    const okScroll = scrollCheck.notSticky && scrollCheck.toTopVisible && backAtTop;
    await page.screenshot({ path: path.join(SHOTS, "hero-scrolled-400-" + w + "x" + h + ".png") });
    rows.push({ size: w + "x" + h + " scroll", ok: okScroll, ...scrollCheck, backAtTop });
    if (!okScroll) failures++;
    await page.close();
  }
  await ctx.close();
  await browser.close();
  fs.writeFileSync(path.join(__dirname, "hero-report.json"), JSON.stringify({ failures, rows }, null, 1));
  console.log("failed checks:", failures);
  rows.filter(r => !r.ok).forEach(r => console.log("FAIL", r.size, JSON.stringify({ o: r.overflow, f: r.frameEdge, t: r.tiny.slice(0, 3), s: r.small, i: r.broken.slice(0, 2), fx: r.fx, c: r.colour, e: r.errors })));
})();
