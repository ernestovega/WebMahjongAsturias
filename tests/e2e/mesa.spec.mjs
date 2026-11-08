// Practice table (/aprender/mesa/ and its translations).
import { test, expect } from "@playwright/test";

const tables = { es: "/aprender/mesa/", ast: "/ast/deprender/mesa/", en: "/en/learn/table/" };

// 34 kinds x 4 tiles + 8 flowers and seasons + 4 face down tiles.
const TOTAL = 34 * 4 + 8 + 4;
const PILES = 34 * 4 + 4; // visible while flowers are off

// A tile's position, read from its transform.
const posOf = (tile) => tile.evaluate((el) => {
  const m = new DOMMatrix(getComputedStyle(el).transform);
  return { x: m.m41, y: m.m42 };
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // Each test starts with the default settings, without the help bubble in the way.
    if (!sessionStorage.getItem("started")) { localStorage.clear(); sessionStorage.setItem("started", "1"); }
  });
});

for (const [lang, path] of Object.entries(tables)) {
  test(`la mesa carga todas las fichas (${lang})`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator("#table .tile")).toHaveCount(TOTAL);
    await expect(page.locator("#table .tile:visible")).toHaveCount(PILES);
    // Every tile is inside the table.
    const outside = await page.evaluate(() => {
      const t = document.getElementById("table").getBoundingClientRect();
      return [...document.querySelectorAll("#table .tile")].filter((el) => {
        if (el.style.display === "none") return false;
        const r = el.getBoundingClientRect();
        return r.left < t.left - 1 || r.top < t.top - 1 || r.right > t.right + 1 || r.bottom > t.bottom + 1;
      }).length;
    });
    expect(outside, "fichas fuera de la mesa").toBe(0);
    expect(errors).toEqual([]);
  });
}

test("arrastrar una ficha a la mesa, devolverla con doble clic y vaciar", async ({ page }) => {
  await page.goto(tables.es);
  // Drag the top tile of the first pile to the left part of the table.
  const top = page.locator("#table .tile").filter({ has: page.locator("svg") }).nth(3);
  const tb = await top.boundingBox();
  const before = await posOf(top);
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.mouse.down();
  await page.mouse.move(200, 300, { steps: 8 });
  await page.mouse.up();
  const after = await posOf(top);
  expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeGreaterThan(50);

  // Double click sends it back to its pile.
  await top.dblclick();
  await expect.poll(() => posOf(top)).toEqual(before);

  // Drag again and empty the table with the button.
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.mouse.down();
  await page.mouse.move(200, 300, { steps: 8 });
  await page.mouse.up();
  await page.locator("#clear").click();
  await expect.poll(() => posOf(top)).toEqual(before);
});

test("el tamaño de las fichas cambia y se recuerda", async ({ page }) => {
  await page.goto(tables.es);
  const table = page.locator("#table");
  const tw = () => table.evaluate((el) => parseFloat(el.style.getPropertyValue("--tw")));
  const medium = await tw();
  const big = page.locator('#bar [data-size="l"]');
  const small = page.locator('#bar [data-size="s"]');

  await big.click();
  await expect(big).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('#bar [data-size="m"]')).toHaveAttribute("aria-pressed", "false");
  expect(await tw()).toBeGreaterThan(medium);

  await small.click();
  expect(await tw()).toBeLessThan(medium);

  await page.reload();
  await expect(small).toHaveAttribute("aria-pressed", "true");
  expect(await tw()).toBeLessThan(medium);
});

test("cincos rojos y flores se activan y se recuerdan", async ({ page }) => {
  await page.goto(tables.es);
  const red = page.locator("#red-fives");
  const flowers = page.locator("#flowers");
  await expect(red).toHaveAttribute("aria-pressed", "false");
  await expect(flowers).toHaveAttribute("aria-pressed", "false");

  const redTitles = () => page.locator("#table .tile").evaluateAll((els) =>
    els.map((e) => e.title).join("|"));
  const plain = await redTitles();
  await red.click();
  await expect(red).toHaveAttribute("aria-pressed", "true");
  expect(await redTitles()).not.toEqual(plain);

  await flowers.click();
  await expect(flowers).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#table .tile:visible")).toHaveCount(TOTAL);

  await page.reload();
  await expect(red).toHaveAttribute("aria-pressed", "true");
  await expect(flowers).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#table .tile:visible")).toHaveCount(TOTAL);
});
