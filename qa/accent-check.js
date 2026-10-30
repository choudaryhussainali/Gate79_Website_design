/* Brush-accent QA — dev-only. Run: node qa/accent-check.js */
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots", "accent");
fs.mkdirSync(SHOTS, { recursive: true });
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"))
  .concat(fs.readdirSync(path.join(ROOT, "services")).filter(f => f.endsWith(".html")).map(f => "services/" + f));
const WIDTHS = [1366, 768, 390, 320];

const AUDIT = () => {
  const out = { accents: 0, noStroke: [], wrongGround: [], wordy: [], edge: [], contrast: [], dup: [] };
  const ground = el => {
    let n = el;
    while (n && n !== document.body) {
      const cls = n.classList;
      if (cls.contains("band--ice")) return "ice";
      if (cls.contains("band--black") || cls.contains("band--carbon")) return "black";
      if (cls.contains("card--dark") || cls.contains("versus__new") || cls.contains("svc-cta-card") || cls.contains("cta-card")) return "blackcard";
      if (cls.contains("band--white")) return "white";
      if (cls.contains("band--stone")) return "stone";
      n = n.parentElement;
    }
    return "white";
  };
  document.querySelectorAll(".section-head__title .accent, .cta-card__title .accent, .svc-cta-card__title .accent, .versus__title .accent").forEach(el => {
    out.accents++;
    const s = getComputedStyle(el);
    const bg = s.backgroundImage;
    if (!bg || !bg.includes("brush-")) out.noStroke.push(el.textContent.slice(0, 24));
    const g = ground(el);
    const want = (g === "ice") ? "brush-white" : (g === "black" || g === "blackcard") ? "brush-icedeep" : "brush-ice";
    if (!bg.includes(want)) out.wrongGround.push(el.textContent.slice(0, 24) + " want " + want);
    if (s.color !== "rgb(2, 1, 1)" && !(g === "black" || g === "blackcard") && s.color !== "rgb(255, 255, 255)") out.contrast.push(el.textContent.slice(0, 24) + " " + s.color);
    const words = el.textContent.trim().split(/\s+/).length;
    if (words > 3) out.wordy.push(el.textContent.slice(0, 30));
    const r = el.getBoundingClientRect();
    if (r.left < 8) out.edge.push("left " + Math.round(r.left));
    if (r.right > window.innerWidth - 8) out.edge.push("right " + Math.round(r.right));
    if (s.backgroundImage.includes("gradient") || s.filter !== "none" || s.textShadow !== "none") out.contrast.push("fx " + el.textContent.slice(0, 20));
  });
  // neighbouring sections must not share a variant
  const secs = [...document.querySelectorAll("section")];
  for (let i = 1; i < secs.length; i++) {
    const a = secs[i - 1].querySelector(".section-head__title .accent");
    const b = secs[i].querySelector(".section-head__title .accent");
    if (!a || !b) continue;
    const va = getComputedStyle(a).getPropertyValue("--brush");
    const vb = getComputedStyle(b).getPropertyValue("--brush");
    if (va && vb && va === vb) out.dup.push("sections " + i);
  }
  out.dup = [...new Set(out.dup)].slice(0, 4);
  return out;
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const rows = [];
  let failures = 0;

  for (const w of WIDTHS) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: 900 });
    for (const rel of pages) {
      const errors = [];
      page.removeAllListeners("pageerror");
      page.on("pageerror", e => errors.push(String(e)));
      await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/" + rel, { waitUntil: "load", timeout: 30000 });
      const head = await page.evaluate(() => {
        document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-in"));
        return document.querySelectorAll(".section-head__title .accent").length;
      });
      await page.waitForTimeout(1100);
      const audit = await page.evaluate(AUDIT);
      const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      const bad = audit.noStroke.length || audit.wrongGround.length || audit.contrast.length || audit.wordy.length || audit.edge.length || audit.dup.length || over || errors.length;
      if (bad) failures++;
      rows.push({ w, page: rel, accents: head, ok: !bad, ...audit, over, errors: errors.slice(0, 2) });
      await page.screenshot({ path: path.join(SHOTS, "accent-" + w + "-" + rel.replace(/\//g, "-") + ".png"), fullPage: true });
    }
    await page.close();
  }

  // reduced motion: strokes present immediately
  const page = await ctx.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
  const rm = await page.evaluate(() => {
    const el = document.querySelector(".section-head__title .accent");
    return el ? getComputedStyle(el).backgroundSize : "none";
  });
  console.log("reduced-motion background-size:", rm, rm === "100% 1em" || rm.includes("100%") ? "PASS" : "CHECK");

  // brush SVG loads once (9 distinct, then cached)
  const perf = await page.evaluate(() => performance.getEntriesByType("resource").filter(r2 => r2.name.includes("brush-")).map(r2 => r2.name.split("/").pop()));
  console.log("brush loads:", JSON.stringify(perf));

  // CLS
  const cls = await page.evaluate(() => new Promise(res => {
    let total = 0;
    new PerformanceObserver(list => { total += list.getEntries().reduce((a, e) => a + e.value, 0); }).observe({ type: "layout-shift", buffered: true });
    setTimeout(() => res(Math.round(total * 1000) / 1000), 800);
  }));
  console.log("CLS:", cls, cls === 0 ? "PASS" : "CHECK");

  await page.close();
  await ctx.close();
  await browser.close();

  fs.writeFileSync(path.join(__dirname, "accent-report.json"), JSON.stringify({ failures, rows }, null, 1));
  console.log("titles audited:", rows.reduce((a, r2) => a + (r2.accents || 0), 0), "| failed page-widths:", failures);
  console.log(failures === 0 ? "ACCENT QA PASS" : "ACCENT QA FAIL");
})();
