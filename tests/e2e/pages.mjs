// URL paths of every page in site/, e.g. "/", "/aprender/mesa/".
import { readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "site");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

export const pages = walk(site)
  .filter((f) => f.endsWith("index.html"))
  .map((f) => "/" + relative(site, f).replace(/\\/g, "/").replace(/index\.html$/, ""))
  .sort();

export const isTable = (path) => /\/(mesa|table)\/$/.test(path);
