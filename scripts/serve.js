/*
 * Tiny zero-dependency static server for local previews.
 * Mirrors Netlify's compression + cache behaviour closely enough for testing.
 * Usage: node scripts/serve.js [port]
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.join(__dirname, "..");
const port = Number(process.argv[2] || process.env.PORT || 3000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".pdf": "application/pdf",
};

const COMPRESSIBLE = new Set([".html", ".css", ".js", ".json", ".svg", ".xml", ".txt", ".webmanifest"]);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = path.join(root, path.normalize(pathname).replace(/^([/\\])+/, ""));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      const notFound = path.join(root, "404.html");
      fs.readFile(notFound, (notFoundError, page) => {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(notFoundError ? "Not found" : page);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = TYPES[ext] || "application/octet-stream";
    const cacheControl =
      [".html", ".css", ".js"].includes(ext)
        ? "no-cache"
        : [".webp", ".png", ".jpg", ".jpeg", ".svg", ".woff2"].includes(ext)
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600";

    const headers = {
      "Content-Type": type,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
      Vary: "Accept-Encoding",
    };

    const acceptsGzip = /\bgzip\b/.test(req.headers["accept-encoding"] || "");
    if (acceptsGzip && COMPRESSIBLE.has(ext) && data.length > 512) {
      const compressed = zlib.gzipSync(data);
      headers["Content-Encoding"] = "gzip";
      res.writeHead(200, headers);
      res.end(compressed);
      return;
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Pistachio & Petal running at http://localhost:${port}`);
});
