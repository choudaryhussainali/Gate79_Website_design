/* Icon contact sheet — dev-only. Run: node qa/icons_sheet.js */
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "..", "qa-tools", "node_modules", "playwright"));

const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const ROOT = path.resolve(__dirname, "..");
const IDS = ["i-alert","i-arrow-right","i-arrow-up","i-arrow-up-right","i-box","i-chart","i-check","i-chevron",
"i-clock","i-doc","i-flag","i-globe","i-image","i-instagram","i-linkedin","i-mail","i-megaphone","i-phone",
"i-pin","i-play","i-plus","i-refresh","i-search","i-shield","i-star","i-store","i-tag","i-x-social"];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  await page.goto("file:///" + ROOT.replace(/\\/g, "/") + "/index.html", { waitUntil: "load", timeout: 30000 });
  await page.evaluate(ids => {
    const wrap = document.createElement("div");
    wrap.id = "icon-sheet-overlay";
    wrap.style.cssText = "position:fixed;inset:0;z-index:99999;background:#fff;padding:24px;overflow:auto;font:12px monospace;";
    let html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:18px">';
    ids.forEach(id => {
      html += '<div style="text-align:center;color:#111">'
        + '<div style="display:flex;gap:14px;justify-content:center;align-items:flex-end;height:40px">'
        + '<svg class="icon" width="24" height="24" aria-hidden="true"><use href="#' + id + '"/></svg>'
        + '<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#' + id + '"/></svg>'
        + "</div>"
        + '<div style="margin-top:6px">' + id + "</div>"
        + "</div>";
    });
    html += "</div>";
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
  }, IDS);
  await page.waitForTimeout(400);
  await page.locator("#icon-sheet-overlay").screenshot({ path: path.join(SHOTS, "icon-sheet.png") });
  console.log("icon-sheet.png written");
  await browser.close();
})();
