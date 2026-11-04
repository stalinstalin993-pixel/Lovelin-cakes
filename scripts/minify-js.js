/*
 * Minifies the storefront scripts for production. Source files stay readable:
 * edit app.js / admin.js / festive.js and run `npm run build`.
 */
const esbuild = require("esbuild");
const path = require("node:path");

const root = path.join(__dirname, "..");
const files = [
  ["app.js", "app.min.js"],
  ["admin.js", "admin.min.js"],
  ["festive.js", "festive.min.js"],
  ["404.js", "404.min.js"],
];

for (const [source, output] of files) {
  esbuild.buildSync({
    entryPoints: [path.join(root, source)],
    outfile: path.join(root, output),
    minify: true,
    target: ["es2020"],
    format: "iife",
    charset: "utf8",
    legalComments: "none",
    logLevel: "silent",
  });
  console.log(`Minified ${source} → ${output}`);
}
