/* Gate79 launch QA v2 — dev-only. Run: node qa/check.js */
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"))
  .concat(fs.readdirSync(path.join(ROOT, "services")).filter(f => f.endsWith(".html")).map(f => "services/" + f));
const WIDTHS = [320, 390, 768, 1024, 1366, 1920];

const cssBytes = ["tokens", "base", "layout", "components", "pages"]
  .reduce((a, n) => a + fs.statSync(path.join(ROOT, "assets/css", n + ".css")).size, 0);

const CARD_GRIDS = ".tiers,.versus,.t-grid,.vid-grid,.grid--3,.grid--2,.stats-tiles,.result-grid,.hero-strip,.ba-grid,.includes-grid,.team-grid,.grid.grid--4,.five-grid";
const SQUEEZE_EXEMPT = ".jump__track,.filters,.table-scroll,.tabs-bar";

function lum(r, g, b) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg, bg) {
  const l1 = lum(...fg), l2 = lum(...bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

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
      page.removeAllListeners("console");
      page.on("pageerror", e => errors.push("pageerror: " + e));
      page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });

      await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/" + rel, { waitUntil: "load", timeout: 30000 });
      await page.evaluate(async () => {
        if (document.documentElement.style) document.documentElement.style.scrollBehavior = "auto";
        const h = document.body.scrollHeight;
        for (let y = 0; y <= h; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map(i => i.complete
          ? Promise.resolve()
          : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
      });
      await page.waitForTimeout(2000);

      const a = await page.evaluate(({ cardGrids, squeezeExempt }) => {
        const out = { clip: [], squeeze: [], counters: [], grid: [], height: [], contrast: [], overflow: [] };
        const de = document.documentElement;
        if (de.scrollWidth > window.innerWidth + 1) out.overflow.push("document " + de.scrollWidth);

        // clipping by an overflow hidden/clip ancestor (scroll containers exempt)
        const exempt = el => el.closest(squeezeExempt) !== null;
        document.querySelectorAll("body *").forEach(el => {
          if (el.tagName === "SOURCE" || el.tagName === "TRACK") return;
          const r = el.getBoundingClientRect();
          if (r.width < 2 && r.height < 2) return;
          let anc = el.parentElement;
          while (anc && anc !== document.body) {
            const st = getComputedStyle(anc);
            if ((st.overflow === "hidden" || st.overflow === "clip" || st.overflowX === "hidden" || st.overflowY === "hidden") && !exempt(el)) {
              const ar = anc.getBoundingClientRect();
              if (r.left < ar.left - 2 || r.right > ar.right + 2 || r.top < ar.top - 2 || r.bottom > ar.bottom + 2) {
                out.clip.push(el.tagName + "." + String(el.className).split(" ")[0] + " in " + anc.tagName + "." + String(anc.className).split(" ")[0]);
                return;
              }
            }
            anc = anc.parentElement;
          }
        });
        out.clip = [...new Set(out.clip)].slice(0, 5);

        // squeezed text blocks
        document.querySelectorAll("p,span,h1,h2,h3,h4,li,td,th,label").forEach(el => {
          if (!el.offsetParent) return;
          const st = getComputedStyle(el);
          const lines = Math.round(parseFloat(st.height) / parseFloat(st.lineHeight || st.fontSize));
          if (lines >= 3) {
            const words = (el.textContent || "").trim().split(/\s+/).length;
            const avg = words / lines;
            if (el.getBoundingClientRect().width < 200 && avg < 3) {
              out.squeeze.push(el.tagName + "." + String(el.className).split(" ")[0] + " " + Math.round(el.getBoundingClientRect().width) + "px");
            }
          }
        });
        out.squeeze = [...new Set(out.squeeze)].slice(0, 5);

        // counters at final value
        document.querySelectorAll("[data-count]").forEach(el => {
          const fin = el.getAttribute("data-final") || el.getAttribute("data-count");
          if (el.textContent.trim() !== fin.trim()) out.counters.push(el.getAttribute("data-count") + " shows " + el.textContent.trim());
        });

        // grid placement
        document.querySelectorAll(".split").forEach(sp => {
          [...sp.children].forEach(ch => {
            if (!ch.classList.contains("split__copy") && !ch.classList.contains("split__media")) {
              out.grid.push("split child ." + String(ch.className).split(" ")[0]);
            }
          });
        });
        document.querySelectorAll(cardGrids).forEach(g => {
          const kids = [...g.children].filter(c => c.offsetParent);
          if (kids.length < 2) return;
          const rowsMap = new Map();
          kids.forEach(k => {
            const top = Math.round(k.getBoundingClientRect().top / 20) * 20;
            rowsMap.set(top, (rowsMap.get(top) || 0) + 1);
          });
          const counts = [...rowsMap.values()];
          if (counts.length >= 2) {
            const first = counts[0], last = counts[counts.length - 1];
            const centred = getComputedStyle(g).justifyContent.includes("center");
            if (last < first / 2 && !centred) out.grid.push(g.className.split(" ")[0] + " last row " + last + "/" + first);
          }
        });
        out.grid = [...new Set(out.grid)].slice(0, 5);

        // paired card heights
        document.querySelectorAll(cardGrids).forEach(g => {
          const kids = [...g.children].filter(c => c.offsetParent);
          const rowsMap = new Map();
          kids.forEach(k => {
            const top = Math.round(k.getBoundingClientRect().top / 20) * 20;
            if (!rowsMap.has(top)) rowsMap.set(top, []);
            rowsMap.get(top).push(k);
          });
          rowsMap.forEach(row => {
            const hs = row.map(k => Math.round(k.getBoundingClientRect().height));
            if (hs.length > 1 && Math.max(...hs) - Math.min(...hs) > 2) {
              out.height.push(g.className.split(" ")[0] + " " + Math.min(...hs) + "-" + Math.max(...hs));
            }
          });
        });
        out.height = [...new Set(out.height)].slice(0, 5);

        // contrast
        const lum = (r, g, b) => {
          const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const ratio = (fg, bg) => {
          const l1 = lum(...fg), l2 = lum(...bg);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        };
        const parseC = c => {
          const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
          return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
        };
        const bgOf = el => {
          let n = el;
          while (n && n !== document.documentElement) {
            const c = parseC(getComputedStyle(n).backgroundColor);
            if (c && c[3] > 0.9) return c.slice(0, 3);
            n = n.parentElement;
          }
          return [255, 255, 255];
        };
        const bad = [];
        document.querySelectorAll("p,span,h1,h2,h3,h4,li,a,td,th,label,strong,b,button").forEach(el => {
          if (!el.offsetParent) return;
          const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
          if (!hasText) return;
          const st = getComputedStyle(el);
          const fg = parseC(st.color);
          if (!fg) return;
          let bg = bgOf(el);
          let eff = fg.slice(0, 3);
          if (fg[3] < 1) eff = fg.slice(0, 3).map((c, i) => Math.round(c * fg[3] + bg[i] * (1 - fg[3])));
          const px = parseFloat(st.fontSize);
          const bold = parseInt(st.fontWeight) >= 600;
          const large = px >= 24 || (px >= 18.66 && bold);
          const r = ratio(eff, bg);
          if (r < (large ? 3 : 4.5)) bad.push(el.tagName + "." + String(el.className).split(" ")[0] + " " + r.toFixed(2));
        });
        document.querySelectorAll("svg.icon").forEach(el => {
          if (!el.offsetParent) return;
          const st = getComputedStyle(el.parentElement);
          const r = ratio(parseC(st.color).slice(0, 3), bgOf(el));
          if (r < 3) bad.push("svg in " + el.parentElement.tagName + "." + String(el.parentElement.className).split(" ")[0] + " " + r.toFixed(2));
        });
        out.contrast = [...new Set(bad)].slice(0, 6);
        return out;
      }, { cardGrids: CARD_GRIDS, squeezeExempt: SQUEEZE_EXEMPT });

      const bad = a.overflow.length || a.clip.length || a.squeeze.length || a.counters.length || a.grid.length || a.height.length || a.contrast.length || errors.length;
      if (bad) failures++;
      rows.push({ w, page: rel, ok: !bad, ...a, errors: errors.slice(0, 3) });
      await page.screenshot({ path: path.join(SHOTS, w + "-" + rel.replace(/\//g, "-") + ".png"), fullPage: true });
    }
    await page.close();
  }
  await ctx.close();
  await browser.close();

  fs.writeFileSync(path.join(__dirname, "report.json"), JSON.stringify({ cssBytes, failures, rows }, null, 1));
  console.log("CSS bytes:", cssBytes, cssBytes <= 61440 ? "PASS" : "FAIL (budget 60KB)");
  const fails = rows.filter(r => !r.ok);
  console.log("checks:", rows.length, "failed:", fails.length);
  fails.slice(0, 40).forEach(r => {
    console.log("FAIL", r.w, r.page, JSON.stringify({ c: r.clip, s: r.squeeze, k: r.counters, g: r.grid, h: r.height, x: r.contrast, o: r.overflow, e: r.errors }));
  });
})();
