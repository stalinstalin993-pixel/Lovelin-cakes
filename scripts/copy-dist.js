/*
 * Builds a clean Netlify publish directory without node_modules, source files,
 * scripts, or the printable catalog.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const files = [
  "index.html",
  "404.html",
  "admin.html",
  "styles.css",
  "app.min.js",
  "admin.min.js",
  "festive.min.js",
  "404.min.js",
  "festive.css",
  "site.config.js",
  "cakes.json",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "_redirects",
];

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const dir of ["images", "fonts"]) {
  fs.cpSync(path.join(root, dir), path.join(dist, dir), { recursive: true });
}

const count = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => {
    const full = path.join(dir, entry.name);
    return sum + (entry.isDirectory() ? count(full) : 1);
  }, 0);

console.log(`Netlify output ready in dist/ (${count(dist)} files).`);
