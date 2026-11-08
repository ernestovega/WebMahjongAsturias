// Every page loads without JavaScript errors, without broken own files
// and without sideways scrolling.
import { test, expect } from "@playwright/test";
import { pages } from "./pages.mjs";

for (const path of pages) {
  test(`${path} carga sin errores`, async ({ page, baseURL }) => {
    const problems = [];
    page.on("pageerror", (e) => problems.push(`JS error: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") problems.push(`console.error: ${m.text()}`); });
    page.on("response", (r) => {
      if (r.url().startsWith(baseURL) && r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
    });
    // Only our own files matter; outside requests (YouTube, fonts...) are blocked.
    await page.route((url) => !url.href.startsWith(baseURL), (route) => route.abort());

    const response = await page.goto(path, { waitUntil: "load" });
    expect(response.status()).toBe(200);
    await expect(page.locator("h1, #table").first()).toBeVisible();

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "la página no debe tener scroll horizontal").toBeLessThanOrEqual(1);

    // console.error from aborted outside requests is expected.
    expect(problems.filter((p) => !p.includes("net::ERR_FAILED"))).toEqual([]);
  });
}
