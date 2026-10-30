/* Responsive sweep v2 — dev-only. Run: node qa/responsive-check.js
   All pages x 1440/1024/834/768/430/390/360/320: horizontal overflow,
   clipped elements, text floor, tap targets, broken images, console errors,
   header collapse (390 vs 1440), mobile menu open (index @ 390).
   v2: nav assertions tolerate pages without a desktop nav; two-pass scroll
   so lazy images finish; still-loading images are warnings, not failures. */
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots", "responsive");
fs.mkdirSync(SHOTS, { recursive: true });
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"))
  .concat(fs.readdirSync(path.join(ROOT, "services")).filter(f => f.endsWith(".html")).map(f => "services/" + f));
const WIDTHS = [1440, 1024, 834, 768, 430, 390, 360, 320];

const AUDIT = () => {
  const vw = window.innerWidth;
  const out = { overflow: false, clipped: [], tiny: [], taps: [], imgs: [], loading: 0 };
  out.overflow = document.documentElement.scrollWidth > vw + 1;
  const clippedAncestor = el => {
    let n = el.parentElement;
    while (n && n !== document.body) {
      const o = getComputedStyle(n).overflowX;
      if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll") return true;
      n = n.parentElement;
    }
    return false;
  };
  document.querySelectorAll("body *").forEach(el => {
    if (el.matches("svg, svg *")) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || +s.opacity === 0) return;
    if ((r.right > vw + 3 || r.left < -3) && !clippedAncestor(el)) {
      const c = (typeof el.className === "string" ? el.className : "").split(" ")[0];
      out.clipped.push(el.tagName.toLowerCase() + (c ? "." + c : "") + " right=" + Math.round(r.right));
    }
    if (el.children.length === 0 && el.textContent.trim() && parseFloat(s.fontSize) < 10) {
      out.tiny.push(el.tagName.toLowerCase() + " " + s.fontSize + " '" + el.textContent.trim().slice(0, 18) + "'");
    }
    if (el.matches("a, button") && r.height > 0 && r.height < 24 && s.pointerEvents !== "none") {
      out.taps.push("'" + (el.textContent.trim() || el.getAttribute("aria-label") || "control").slice(0, 18) + "' h" + Math.round(r.height));
    }
  });
  document.querySelectorAll("img").forEach(img => {
    if (img.complete && img.naturalWidth === 0) out.imgs.push("BROKEN " + (img.src || "").split("/").pop().slice(0, 34));
    if (!img.complete) out.loading++;
  });
  out.clipped = [...new Set(out.clipped)].slice(0, 6);
  out.tiny = [...new Set(out.tiny)].slice(0, 6);
  out.taps = [...new Set(out.taps)].slice(0, 6);
  out.imgs = [...new Set(out.imgs)].slice(0, 6);
  return out;
};

const NAV = () => {
  const t = document.querySelector(".site-header .nav-toggle");
  const n = document.querySelector(".site-nav");
  const ts = t && getComputedStyle(t);
  const ns = n && getComputedStyle(n);
  return {
    navExists: !!n,
    toggleVisible: !!(ts && ts.display !== "none" && ts.visibility !== "hidden"),
    navHidden: !!(ns && (ns.display === "none" || ns.visibility === "hidden"))
  };
};

const navFail = (w, nav) => {
  if (w === 390) {
    if (!nav.toggleVisible) return "toggle not visible at 390";
    if (nav.navExists && !nav.navHidden) return "desktop nav visible at 390";
    return null;
  }
  if (w === 1440) {
    if (nav.toggleVisible) return "toggle visible at 1440";
    if (nav.navExists && nav.navHidden) return "desktop nav hidden at 1440";
    return null;
  }
  return null;
};

const scrollThrough = () => window.evaluate === undefined ? null : null;
(async () => {
  const browser = await chromium.launch();
  const report = { pages: {}, menuCheck: null };
  let failing = 0;
  for (const pg of pages) {
    for (const w of WIDTHS) {
      const key = pg + " @ " + w;
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text().slice(0, 110)); });
      page.on("pageerror", e => errors.push("pageerror " + String(e).slice(0, 110)));
      try {
        const url = "file:///" + encodeURI(path.resolve(ROOT, pg).replace(/\\/g, "/"));
        await page.goto(url, { waitUntil: "load", timeout: 30000 });
        await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-in")));
        await page.evaluate(async () => {
          const pass = async () => {
            const h = window.innerHeight;
            for (let y = 0; y < document.body.scrollHeight; y += Math.floor(h * 0.75)) {
              window.scrollTo(0, y);
              await new Promise(r => setTimeout(r, 100));
            }
          };
          await pass();
          await new Promise(r => setTimeout(r, 350));
          await pass();
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1300);
        const res = await page.evaluate(AUDIT);
        const nav = await page.evaluate(NAV);
        const navProblem = navFail(w, nav);
        const fail = res.overflow || res.clipped.length > 0 || res.imgs.length > 0 || errors.length > 0 || !!navProblem;
        const entry = {
          pass: !fail,
          warn: { tiny: res.tiny, taps: res.taps, stillLoading: res.loading },
          failDetail: {
            overflow: res.overflow, clipped: res.clipped,
            imgs: res.imgs, console: errors.slice(0, 3), nav: navProblem || undefined
          }
        };
        report.pages[key] = entry;
        if (!entry.pass) failing++;
        const warn = res.tiny.length + res.taps.length;
        console.log(key, entry.pass ? "PASS" : "FAIL", warn ? `(warn ${warn})` : "");
        if (!entry.pass) console.log("   ", JSON.stringify(entry.failDetail).slice(0, 280));
        if (!entry.pass && (w === 1440 || w === 390 || w === 320)) {
          const base = pg.replace(/[\\/]/g, "_").replace(/\.html$/, "");
          await page.screenshot({ path: path.join(SHOTS, base + "-" + w + "-FAIL.png") });
        }
      } catch (e) {
        report.pages[key] = { pass: false, error: String(e).slice(0, 160) };
        failing++;
        console.log(key, "ERROR", String(e).slice(0, 100));
      }
      await ctx.close();
    }
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto("file:///" + encodeURI(path.resolve(ROOT, "index.html").replace(/\\/g, "/")), { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(700);
    await page.click(".site-header .nav-toggle");
    await page.waitForTimeout(600);
    const menu = await page.evaluate(() => {
      const m = document.getElementById("mobile-menu");
      const s = m && getComputedStyle(m);
      return { open: !!(s && s.display !== "none" && s.visibility !== "hidden" && +s.opacity !== 0), hidden: m ? m.hidden : null };
    });
    report.menuCheck = menu;
    console.log("mobile menu open @390:", menu.open ? "PASS" : "FAIL " + JSON.stringify(menu));
    if (!menu.open) failing++;
    await page.screenshot({ path: path.join(SHOTS, "index-390-menu-open.png") });
    await ctx.close();
  }
  for (const spec of [["index.html", 390], ["services/listing-optimisation.html", 390], ["index.html", 320], ["services.html", 768]]) {
    const ctx = await browser.newContext({ viewport: { width: spec[1], height: 844 } });
    const page = await ctx.newPage();
    const url = "file:///" + encodeURI(path.resolve(ROOT, spec[0]).replace(/\\/g, "/"));
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-in")));
    await page.evaluate(async () => {
      const pass = async () => {
        const h = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += Math.floor(h * 0.75)) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 80));
        }
      };
      await pass();
      await new Promise(r => setTimeout(r, 350));
      await pass();
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1300);
    const base = spec[0].replace(/[\\/]/g, "_").replace(/\.html$/, "");
    await page.screenshot({ path: path.join(SHOTS, base + "-" + spec[1] + "-full.png"), fullPage: true });
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, "responsive-report.json"), JSON.stringify(report, null, 1));
  console.log(failing === 0
    ? "ALL GREEN — " + pages.length + " pages x " + WIDTHS.length + " widths"
    : failing + " failing page-widths — see qa/responsive-report.json");
  await browser.close();
})();
