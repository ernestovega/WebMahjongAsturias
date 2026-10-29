// Checks the static site in site/ before it is published.
// No dependencies: run with `node scripts/check-site.mjs`.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, extname, posix } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const ownHosts = ["www.mahjongasturias.es", "mahjongasturias.es", "webmahjongasturias.web.app"];
const errors = [];
const fail = (file, msg) => errors.push(`${relative(root, file)}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(site);
const htmlFiles = files.filter((f) => f.endsWith(".html"));

// 1. JSON files must parse.
const firebase = JSON.parse(readFileSync(join(root, "firebase.json"), "utf8"));
for (const f of files.filter((f) => /\.(json|webmanifest)$/.test(f))) {
  try { JSON.parse(readFileSync(f, "utf8")); } catch (e) { fail(f, `invalid JSON: ${e.message}`); }
}

// 2. JavaScript files must have valid syntax.
for (const f of files.filter((f) => f.endsWith(".js"))) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { fail(f, `syntax error:\n${e.stderr}`); }
}

// 3. Internal links must point to a file that Firebase Hosting serves.
const redirectSources = (firebase.hosting.redirects || []).map((r) =>
  new RegExp("^" + r.source.replace(/[.+^$()|[\]\\]/g, "\\$&")
    .replace(/\{,\/\}/g, "/?").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$"));

function resolvePath(urlPath) {
  const clean = decodeURIComponent(urlPath);
  if (redirectSources.some((re) => re.test(clean))) return "redirect";
  const p = join(site, clean);
  if (!p.startsWith(site)) return null;
  for (const c of [p, join(p, "index.html"), p + ".html"]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

const idsCache = new Map();
function idsOf(file) {
  if (!idsCache.has(file)) {
    const html = readFileSync(file, "utf8");
    idsCache.set(file, new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
}

function checkRef(from, ref) {
  if (!ref || /^(mailto:|tel:|javascript:|data:|blob:)/.test(ref)) return;
  let url;
  try { url = new URL(ref, "https://www.mahjongasturias.es" + posix.join("/", relative(site, from))); }
  catch { return fail(from, `bad URL "${ref}"`); }
  if (!ownHosts.includes(url.hostname)) return;
  const target = resolvePath(url.pathname);
  if (!target) return fail(from, `broken link "${ref}"`);
  const hash = decodeURIComponent(url.hash.slice(1));
  if (hash && target !== "redirect" && target.endsWith(".html") && !idsOf(target).has(hash)) {
    fail(from, `missing anchor "${ref}"`);
  }
}

for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  if (!/^<!doctype html>/i.test(html.trimStart())) fail(f, "missing <!DOCTYPE html>");
  if (!/<html[^>]*\slang="[^"]+"/.test(html)) fail(f, "missing lang on <html>");
  if (!/<title>[^<]+<\/title>/.test(html)) fail(f, "missing <title>");

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) fail(f, `duplicate id "${id}"`);

  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]*)"/g)) checkRef(f, m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    for (const part of m[1].split(",")) checkRef(f, part.trim().split(/\s+/)[0]);
  }
}

// 4. url(...) in CSS.
for (const f of files.filter((f) => f.endsWith(".css"))) {
  for (const m of readFileSync(f, "utf8").matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) checkRef(f, m[1]);
}

// 5. Sitemap URLs and the service worker cache list.
const sitemap = join(site, "sitemap.xml");
for (const m of readFileSync(sitemap, "utf8").matchAll(/(?:<loc>|href=")([^<"]+)/g)) checkRef(sitemap, m[1]);
const sw = join(site, "sw.js");
const swList = readFileSync(sw, "utf8").match(/var URLS = \[([\s\S]*?)\]/);
if (swList) for (const m of swList[1].matchAll(/"([^"]+)"/g)) checkRef(sw, m[1]);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) found:\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ site/ OK: ${htmlFiles.length} HTML pages, ${files.length} files checked.`);
