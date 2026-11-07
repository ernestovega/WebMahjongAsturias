// Tiny static server for site/ that behaves like Firebase Hosting
// (cleanUrls + trailingSlash, 404.html). Used only by the Playwright tests.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "site");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".xml": "application/xml",
  ".txt": "text/plain", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".ico": "image/x-icon", ".ttf": "font/ttf", ".woff2": "font/woff2",
};

async function isFile(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = join(site, path);
  if (!file.startsWith(site)) { res.writeHead(400).end(); return; }
  let target = null;
  if (path.endsWith("/") && await isFile(join(file, "index.html"))) target = join(file, "index.html");
  else if (!path.endsWith("/") && await isFile(join(file, "index.html"))) {
    res.writeHead(301, { Location: path + "/" }).end();
    return;
  } else if (await isFile(file)) target = file;
  const status = target ? 200 : 404;
  target ||= join(site, "404.html");
  res.writeHead(status, { "Content-Type": types[extname(target)] || "application/octet-stream" });
  res.end(await readFile(target));
}).listen(port, () => console.log(`site/ on http://localhost:${port}`));
