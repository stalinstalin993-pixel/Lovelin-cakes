/*
 * Builds a print-ready catalog from cakes.json: 9 cakes per A4 page.
 * Writes catalog-print.html, then uses a local Chrome/Edge install to save
 * catalog.pdf. If no browser is found, open catalog-print.html and print to PDF.
 *
 * Usage: npm run catalog
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const root = path.join(__dirname, "..");
const cakes = JSON.parse(fs.readFileSync(path.join(root, "cakes.json"), "utf8"));

global.window = {};
require(path.join(root, "site.config.js"));
const SITE = global.window.SITE;

const PER_PAGE = 9;
const pages = [];
for (let i = 0; i < cakes.length; i += PER_PAGE) pages.push(cakes.slice(i, i + PER_PAGE));

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

const money = (value) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(Number(value) || 0))}`;
const weight = (value) => `${Number.isInteger(Number(value)) ? Number(value) : Number(value).toFixed(1)} kg`;
const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const card = (cake) => `
  <article class="card">
    <img src="${esc(cake.image)}" alt="${esc(cake.name)}" />
    <div class="meta">
      <p class="code">${esc(cake.code)} · ${esc(cake.category.replace(/-/g, " "))}</p>
      <h2>${esc(cake.name)}</h2>
      <p class="price">From ${money(cake.price)} <span>/ ${weight(cake.minWeight)}</span></p>
    </div>
  </article>`;

const page = (items, index) => `
  <section class="page">
    <header>
      <div>
        <p class="eyebrow">${esc(SITE.name)} · Cake catalogue</p>
        <p class="sub">${esc(SITE.town)}, ${esc(SITE.state)} · ${esc(SITE.phoneDisplay)}</p>
      </div>
      <div class="right">
        <p class="sub">${esc(today)}</p>
        <p class="sub">Page ${index + 1} of ${pages.length}</p>
      </div>
    </header>
    <div class="grid">
      ${items.map(card).join("")}
    </div>
    <footer>
      <span>Prices are indicative. Final quote confirmed on WhatsApp.</span>
      <span>${esc(SITE.instagram)}</span>
    </footer>
  </section>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(SITE.name)} — printable cake catalogue</title>
<style>
  @page { size: A4 portrait; margin: 11mm 11mm 9mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    color: #1F2A24;
    background: #FFFFFF;
    font-family: "Segoe UI", -apple-system, Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    display: flex;
    flex-direction: column;
    min-height: 277mm;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8mm;
    padding-bottom: 3mm;
    border-bottom: 1px solid rgba(31, 42, 36, 0.22);
  }
  .eyebrow {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 17pt;
    letter-spacing: -0.01em;
  }
  .sub { margin: 1mm 0 0; font-size: 7.5pt; color: #55645b; }
  .right { text-align: right; }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4.2mm;
    padding: 5mm 0 3mm;
    flex: 1;
    align-content: start;
  }
  .card {
    border: 1px solid rgba(31, 42, 36, 0.18);
    border-radius: 3mm;
    overflow: hidden;
    break-inside: avoid;
    background: #FFFFFF;
  }
  .card img {
    display: block;
    width: 100%;
    height: 47mm;
    object-fit: cover;
    background: #E3EDDC;
  }
  .meta { padding: 2mm 2.6mm 2.4mm; }
  .code {
    margin: 0 0 1mm;
    font-size: 6.5pt;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8E3B5A;
  }
  .meta h2 {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 10pt;
    line-height: 1.15;
    font-weight: 500;
  }
  .price {
    margin: 1.4mm 0 0;
    font-size: 8.5pt;
    font-weight: 700;
    color: #8E3B5A;
  }
  .price span { font-weight: 400; color: #55645b; }
  footer {
    display: flex;
    justify-content: space-between;
    gap: 6mm;
    padding-top: 2.5mm;
    border-top: 1px solid rgba(31, 42, 36, 0.18);
    font-size: 6.5pt;
    color: #55645b;
  }
</style>
</head>
<body>
${pages.map(page).join("\n")}
</body>
</html>`;

const htmlPath = path.join(root, "catalog-print.html");
const pdfPath = path.join(root, "catalog.pdf");
fs.writeFileSync(htmlPath, html);
console.log(`Wrote ${path.basename(htmlPath)} (${pages.length} pages, ${cakes.length} cakes).`);

const candidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const browser = candidates.find((candidate) => fs.existsSync(candidate));
if (!browser) {
  console.log("No Chrome/Edge found. Open catalog-print.html and choose Print → Save as PDF.");
  process.exit(0);
}

const result = spawnSync(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--no-pdf-header-footer",
    "--allow-file-access-from-files",
    "--virtual-time-budget=8000",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ],
  { stdio: "inherit" }
);

if (result.status === 0 && fs.existsSync(pdfPath)) {
  console.log(`Wrote ${path.basename(pdfPath)}.`);
} else {
  console.log("Chrome could not create the PDF. Open catalog-print.html and print manually.");
}
