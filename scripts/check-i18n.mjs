// Checks that the three languages of site/ (es, ast, en) stay in step.
// No dependencies: run with `node scripts/check-i18n.mjs`.
//
// For every page (except 404.html):
//  - it lists its es, ast and en versions plus x-default with <link rel="alternate" hreflang>,
//    each of them exists, and they all list the same group back (reciprocal);
//  - <html lang> and <link rel="canonical"> match its own entry in the group;
//  - the flag links point to the other two versions;
//  - the main menu has the same entries, in the same order, as its translations.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const origin = "https://www.mahjongasturias.es";
const langs = ["es", "ast", "en"];
const errors = [];
const fail = (file, msg) => errors.push(`${relative(root, file)}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// "/en/learn/" -> site/en/learn/index.html
function fileOf(path) {
  const f = join(site, decodeURIComponent(path), path.endsWith("/") ? "index.html" : "");
  return existsSync(f) && statSync(f).isFile() ? f : null;
}
// site/en/learn/index.html -> "/en/learn/"
const pathOf = (file) => "/" + relative(site, file).replace(/\\/g, "/").replace(/index\.html$/, "");
const toPath = (href) => new URL(href, origin).pathname;

const pages = new Map();
for (const file of walk(site).filter((f) => f.endsWith(".html") && !f.endsWith("404.html"))) {
  const html = readFileSync(file, "utf8");
  const alt = {};
  for (const m of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) alt[m[1]] = m[2];
  const nav = html.match(/<ul id="site-menu">([\s\S]*?)<\/nav>/);
  pages.set(file, {
    html,
    alt,
    lang: (html.match(/<html[^>]*\slang="([^"]+)"/) || [])[1],
    canonical: (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1],
    menu: nav ? [...nav[1].matchAll(/<a href="([^"]+)"/g)].map((m) => toPath(m[1])) : null,
    flags: [...html.matchAll(/<a (?:class="lang" )?href="([^"]+)" hreflang="([^"]+)"/g)]
      .map((m) => ({ href: toPath(m[1]), lang: m[2] })),
  });
}

for (const [file, page] of pages) {
  const self = pathOf(file);
  const missing = [...langs, "x-default"].filter((l) => !page.alt[l]);
  if (missing.length) { fail(file, `missing hreflang alternate(s): ${missing.join(", ")}`); continue; }
  if (page.alt["x-default"] !== page.alt.es) fail(file, `x-default should be the es page ${page.alt.es}`);
  if (!langs.includes(page.lang)) { fail(file, `unexpected <html lang="${page.lang}">`); continue; }
  if (toPath(page.alt[page.lang]) !== self) {
    fail(file, `hreflang="${page.lang}" points to ${page.alt[page.lang]}, not to this page`);
  }
  if (page.canonical !== page.alt[page.lang]) fail(file, `canonical ${page.canonical} differs from hreflang="${page.lang}"`);

  for (const l of langs) {
    const other = fileOf(toPath(page.alt[l]));
    if (!other) { fail(file, `hreflang="${l}" page ${page.alt[l]} does not exist`); continue; }
    const o = pages.get(other);
    if (o.lang !== l) fail(file, `hreflang="${l}" page ${page.alt[l]} has <html lang="${o.lang}">`);
    for (const k of langs) {
      if (o.alt[k] !== page.alt[k]) {
        fail(file, `hreflang="${k}" is ${page.alt[k]} here but ${o.alt[k]} in ${pathOf(other)}`);
      }
    }
  }

  // Flags: one link to each of the other two languages.
  const flagLangs = page.flags.map((f) => f.lang).sort().join(",");
  const want = langs.filter((l) => l !== page.lang).sort().join(",");
  if (flagLangs !== want) fail(file, `language flags are [${flagLangs}], expected [${want}]`);
  for (const f of page.flags) {
    if (page.alt[f.lang] && f.href !== toPath(page.alt[f.lang])) {
      fail(file, `flag "${f.lang}" links to ${f.href}, but hreflang="${f.lang}" is ${toPath(page.alt[f.lang])}`);
    }
  }
}

// Menu: translate each entry of the es menu with its page's alternates
// and compare with the ast and en menus, entry by entry.
for (const [file, page] of pages) {
  if (page.lang !== "es" || !page.menu || !page.alt.en) continue;
  for (const l of ["ast", "en"]) {
    const other = fileOf(toPath(page.alt[l] || ""));
    const o = other && pages.get(other);
    if (!o || !o.menu) continue;
    const expected = page.menu.map((p) => {
      const target = pages.get(fileOf(p));
      return target && target.alt[l] ? toPath(target.alt[l]) : `(no ${l} version of ${p})`;
    });
    if (expected.length !== o.menu.length) {
      fail(other, `menu has ${o.menu.length} entries, the es menu of ${pathOf(file)} has ${expected.length}`);
      continue;
    }
    expected.forEach((p, i) => {
      if (p !== o.menu[i]) fail(other, `menu entry ${i + 1} is ${o.menu[i]}, expected ${p} (translation of ${page.menu[i]})`);
    });
  }
}

const count = (l) => [...pages.values()].filter((p) => p.lang === l).length;
if (new Set(langs.map(count)).size !== 1) {
  errors.push(`page count per language differs: ${langs.map((l) => `${l}=${count(l)}`).join(", ")}`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} language problem(s) found:\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ Languages OK: ${pages.size} pages, ${count("es")} in each of ${langs.join(", ")}.`);
