/* Canonical brush-accent QA — dev-only. Run: node qa/accent-final.js
   Brief step 5: all 19 pages x 1366/768/390/320 — transparent bg, nine-brush
   allowlist, ground pairings, 100% size once revealed, 320 overflow, console
   errors; element shots of every highlighted title at 1366 and 390. */
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots", "final");
fs.mkdirSync(SHOTS, { recursive: true });
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"))
  .concat(fs.readdirSync(path.join(ROOT, "services")).filter(f => f.endsWith(".html")).map(f => "services/" + f));
const WIDTHS = [1366, 768, 390, 320];
const SHOT_W = [1366, 390];

const AUDIT = () => {
  const groundOf = el => {
    let n = el;
    while (n && n !== document.body) {
      const c = n.classList;
      if (c.contains("cta-card") || c.contains("card--dark") || c.contains("versus__new") || c.contains("t-featured")) return "dark";
      if (c.contains("band--ice")) return "ice";
      if (c.contains("band--black") || c.contains("band--carbon")) return "black";
      if (c.contains("band--white")) return "white";
      if (c.contains("band--stone")) return "stone";
      n = n.parentElement;
    }
    return "white";
  };
  const WANT = {
    ice: ["brush-white", "rgb(2, 1, 1)"],
    white: ["brush-ice", "rgb(2, 1, 1)"],
    stone: ["brush-ice", "rgb(2, 1, 1)"],
    black: ["brush-icedeep", "rgb(255, 255, 255)"],
    dark: ["brush-icedeep", "rgb(255, 255, 255)"]
  };
  const rows = [];
  document.querySelectorAll("h1 .accent, h2 .accent, h3 .accent").forEach(el => {
    const s = getComputedStyle(el);
    const g = groundOf(el);
    const want = WANT[g];
    const m = s.backgroundImage.match(/brush-(ice|white|icedeep)-[123]\.svg/);
    const fails = [];
    if (s.backgroundColor !== "rgba(0, 0, 0, 0)") fails.push("bgcolor " + s.backgroundColor);
    if (!m) fails.push("noBrush " + s.backgroundImage.slice(0, 40));
    else if (!m[0].startsWith(want[0])) fails.push("wrongBrush want " + want[0] + " got " + m[0]);
    if (s.color !== want[1]) fails.push("wrongColor " + s.color + " want " + want[1]);
    if (!s.backgroundSize.startsWith("100%")) fails.push("size " + s.backgroundSize);
    rows.push({ text: el.textContent.trim().slice(0, 30), ground: g, brush: m ? m[0] : null, fails });
  });
  const secs = [...document.querySelectorAll("section")];
  const dup = [];
  let prev = null;
  for (const sec of secs) {
    const a = sec.querySelector(".section-head__title .accent");
    if (!a) continue;
    const m = getComputedStyle(a).backgroundImage.match(/brush-[a-z]+-\d/);
    const bi = m ? m[0] : null;
    if (prev && bi && bi === prev) dup.push(a.textContent.trim().slice(0, 24));
    prev = bi;
  }
  return { rows, dup, overflow: document.documentElement.scrollWidth > window.innerWidth };
};

(async () => {
  const browser = await chromium.launch();
  const report = { pages: {}, reducedMotion: {} };
  let failing = 0;
  for (const pg of pages) {
    for (const w of WIDTHS) {
      const key = pg + " @ " + w;
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text().slice(0, 120)); });
      page.on("pageerror", e => errors.push("pageerror " + String(e).slice(0, 120)));
      page.on("requestfailed", r => errors.push("reqfail " + (r.url().split("/").pop() || r.url()).slice(0, 90)));
      try {
        const url = "file:///" + encodeURI(path.resolve(ROOT, pg).replace(/\\/g, "/"));
        await page.goto(url, { waitUntil: "load", timeout: 30000 });
        await page.evaluate(async () => {
          const h = window.innerHeight;
          for (let y = 0; y < document.body.scrollHeight; y += Math.floor(h * 0.8)) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 90));
          }
        });
        await page.waitForTimeout(2600);
        const res = await page.evaluate(AUDIT);
        const bad = res.rows.filter(r => r.fails.length);
        const fail = bad.length > 0 || res.dup.length > 0 || res.overflow || errors.length > 0;
        report.pages[key] = {
          pass: !fail,
          titles: res.rows.length,
          bad: bad.slice(0, 6),
          dup: res.dup.slice(0, 4),
          overflow: res.overflow,
          console: errors.slice(0, 4)
        };
        if (!fail && SHOT_W.includes(w)) {
          const titles = page.locator("h1:has(.accent), h2:has(.accent), h3:has(.accent)");
          const n = await titles.count();
          const base = pg.replace(/[\\/]/g, "_").replace(/\.html$/, "");
          for (let i = 0; i < n; i++) {
            const t = titles.nth(i);
            try {
              await t.scrollIntoViewIfNeeded();
              await page.waitForTimeout(90);
              const box = await t.boundingBox();
              if (!box || box.height < 4 || box.width < 4) continue;
              await t.screenshot({ path: path.join(SHOTS, base + "-" + w + "-" + i + ".png") });
            } catch (e) { /* non-fatal capture */ }
          }
        }
        if (fail) failing++;
        console.log(key, fail
          ? "FAIL bad=" + bad.length + " dup=" + res.dup.length + " overflow=" + res.overflow + " console=" + errors.length
          : "PASS (" + res.rows.length + " titles)");
      } catch (e) {
        report.pages[key] = { pass: false, error: String(e).slice(0, 200) };
        failing++;
        console.log(key, "ERROR", String(e).slice(0, 120));
      }
      await ctx.close();
    }
  }
  for (const pg of ["index.html", "about.html", "services/listing-optimisation.html"]) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const url = "file:///" + encodeURI(path.resolve(ROOT, pg).replace(/\\/g, "/"));
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(500);
    const rm = await page.evaluate(() =>
      [...document.querySelectorAll("h1 .accent, h2 .accent, h3 .accent")].map(el => {
        const s = getComputedStyle(el);
        return { t: el.textContent.trim().slice(0, 20), brush: /brush-(ice|white|icedeep)-[123]\.svg/.test(s.backgroundImage), size: s.backgroundSize };
      })
    );
    const ok = rm.length > 0 && rm.every(r => r.brush && r.size.startsWith("100%"));
    report.reducedMotion[pg] = { pass: ok, checked: rm.length };
    console.log("reduced-motion", pg, ok ? "PASS" : "FAIL " + JSON.stringify(rm.filter(r => !r.brush || !r.size.startsWith("100%")).slice(0, 3)));
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, "final-accent-report.json"), JSON.stringify(report, null, 1));
  console.log(failing === 0
    ? "ALL GREEN — " + pages.length + " pages x " + WIDTHS.length + " widths + reduced-motion"
    : failing + " failing page-widths — see qa/final-accent-report.json");
  await browser.close();
})();
