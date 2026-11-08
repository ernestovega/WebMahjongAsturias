// Practice table: tiles from a code (?tiles= in the address or the field on the bar).
import { test, expect } from "@playwright/test";

const tables = { es: "/aprender/mesa/", ast: "/ast/deprender/mesa/", en: "/en/learn/table/" };
const TOTAL = 34 * 4 + 8 + 4; // all tiles of the set, as in mesa.spec.mjs
const HIDDEN = "Ficha oculta";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("started")) { localStorage.clear(); sessionStorage.setItem("started", "1"); }
  });
});

// The tiles on the table (not in the piles), as rows of titles, top to bottom and left to right.
async function rowsOnTable(page) {
  const tiles = await page.locator("#table .tile").evaluateAll((els) => els
    .filter((el) => +el.style.zIndex > 1000)
    .map((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return { title: el.title, x: Math.round(m.m41), y: Math.round(m.m42) };
    }));
  const ys = [...new Set(tiles.map((t) => t.y))].sort((a, b) => a - b);
  return ys.map((y) => tiles.filter((t) => t.y === y).sort((a, b) => a.x - b.x).map((t) => t.title));
}

const count = async (page) => (await rowsOnTable(page)).flat().length;
const tilesParam = (page) => new URL(page.url()).searchParams.get("tiles");

test("?tiles= pone las fichas en filas, en orden, y rellena el campo", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(tables.es + "?tiles=123m,456p,789s,ESWNw,RGWd");
  await expect(page.locator("#tiles-code")).toHaveValue("123m,456p,789s,ESWNw,RGWd");
  expect(await rowsOnTable(page)).toEqual([
    ["1 de caracteres", "2 de caracteres", "3 de caracteres"],
    ["4 de círculos", "5 de círculos", "6 de círculos"],
    ["7 de bambús", "8 de bambús", "9 de bambús"],
    ["Viento Este", "Viento Sur", "Viento Oeste", "Viento Norte"],
    ["Dragón rojo", "Dragón verde", "Dragón blanco"],
  ]);
  await expect(page.locator(".tiles-msg")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("el ejemplo de Ernesto: 12345678p234sEEWWwWWGd en una fila", async ({ page }) => {
  await page.goto(tables.es + "?tiles=12345678p234sEEWWwWWGd");
  const tiles = (await rowsOnTable(page)).flat();
  expect(tiles).toEqual([
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `${n} de círculos`),
    ...[2, 3, 4].map((n) => `${n} de bambús`),
    "Viento Este", "Viento Este", "Viento Oeste", "Viento Oeste",
    "Dragón blanco", "Dragón blanco", "Dragón verde",
  ]);
});

test("W es Oeste con w y Blanco con d; s minúscula es bambú y S mayúscula es Sur", async ({ page }) => {
  await page.goto(tables.es + "?tiles=5sSw,Ww,Wd");
  expect(await rowsOnTable(page)).toEqual([
    ["5 de bambús", "Viento Sur"],
    ["Viento Oeste"],
    ["Dragón blanco"],
  ]);
});

test("X es una ficha boca abajo y su pila sigue llena", async ({ page }) => {
  await page.goto(tables.es + "?tiles=X123mX,XXXXXX");
  // Flat: on a narrow phone a row can go on to the next line.
  expect((await rowsOnTable(page)).flat()).toEqual([
    HIDDEN, "1 de caracteres", "2 de caracteres", "3 de caracteres", HIDDEN,
    HIDDEN, HIDDEN, HIDDEN, HIDDEN, HIDDEN, HIDDEN,
  ]);
  // 4 face down tiles still in the pile.
  await expect(page.locator("#table .tile.back")).toHaveCount(4 + 8);
  await page.locator("#clear").click();
  await expect(page.locator("#table .tile.back")).toHaveCount(4);
});

for (const bad of ["123", "0p", "123x", "EXw", "eew", "123m,X5", "11111m", "123m,55555p", "XEEEEEw"]) {
  test(`código no válido no coloca nada: ${bad}`, async ({ page }) => {
    await page.goto(tables.es + "?tiles=" + encodeURIComponent(bad));
    await expect(page.locator(".tiles-msg")).toBeVisible();
    expect(await count(page)).toBe(0);
  });
}

test("el aviso de más de 4 iguales nombra la ficha", async ({ page }) => {
  await page.goto(tables.es + "?tiles=55555p");
  await expect(page.locator(".tiles-msg")).toContainText("5 de círculos");
});

test("el máximo de 4 es por fila: entre filas se crean copias extra", async ({ page }) => {
  await page.goto(tables.es + "?tiles=1111m,1111m,1m");
  expect(await rowsOnTable(page)).toEqual([
    Array(4).fill("1 de caracteres"),
    Array(4).fill("1 de caracteres"),
    ["1 de caracteres"],
  ]);
  await expect(page.locator("#table .tile")).toHaveCount(TOTAL + 5);
  // Extra copies go away when the table is emptied.
  await page.locator("#clear").click();
  await expect(page.locator("#table .tile")).toHaveCount(TOTAL);
  expect(await count(page)).toBe(0);
});

test("una copia extra desaparece al devolverla con doble clic", async ({ page }) => {
  await page.goto(tables.es + "?tiles=1111m,1m");
  await expect(page.locator("#table .tile")).toHaveCount(TOTAL + 1);
  const last = page.locator("#table .tile").last();
  await last.dblclick();
  await expect(page.locator("#table .tile")).toHaveCount(TOTAL);
});

test("el campo coloca el código, actualiza la URL y siempre deja solo eso", async ({ page }) => {
  await page.goto(tables.es + "?tiles=999s");
  const field = page.locator("#tiles-code");
  await field.fill("123m, 456p");
  await field.press("Enter");
  await expect(field).toHaveValue("123m,456p");
  expect(tilesParam(page)).toBe("123m,456p");
  expect(page.url()).toContain("?tiles=123m,456p"); // commas stay readable
  expect(await rowsOnTable(page)).toEqual([
    ["1 de caracteres", "2 de caracteres", "3 de caracteres"],
    ["4 de círculos", "5 de círculos", "6 de círculos"],
  ]);

  // The button does the same as Enter, and replaces what was on the table.
  await field.fill("EEw");
  await page.locator("#tiles-form button").click();
  expect(tilesParam(page)).toBe("EEw");
  expect(await rowsOnTable(page)).toEqual([["Viento Este", "Viento Este"]]);
});

test("un código de la URL vacía antes lo que se puso a mano", async ({ page }) => {
  await page.goto(tables.es);
  const pile = page.locator("#table .tile").nth(3);
  await pile.dblclick(); // a tile from a pile to the table
  expect(await count(page)).toBe(1);
  await page.goto(tables.es + "?tiles=9p");
  expect(await rowsOnTable(page)).toEqual([["9 de círculos"]]);
  // And from the field too.
  await page.locator("#table .tile").nth(3).dblclick();
  expect(await count(page)).toBe(2);
  await page.locator("#tiles-code").fill("1s");
  await page.locator("#tiles-code").press("Enter");
  expect(await rowsOnTable(page)).toEqual([["1 de bambús"]]);
});

test("un código mal escrito en el campo no toca la mesa ni la URL", async ({ page }) => {
  await page.goto(tables.es + "?tiles=123m");
  await page.locator("#tiles-code").fill("123q");
  await page.locator("#tiles-code").press("Enter");
  await expect(page.locator(".tiles-msg")).toBeVisible();
  expect(tilesParam(page)).toBe("123m");
  expect(await count(page)).toBe(3);
});

test("vaciar la mesa borra el campo y el parámetro de la URL", async ({ page }) => {
  await page.goto(tables.es + "?tiles=123m");
  await page.locator("#clear").click();
  await expect(page.locator("#tiles-code")).toHaveValue("");
  expect(tilesParam(page)).toBeNull();
  expect(await count(page)).toBe(0);
});

test("un campo vacío vacía la mesa y quita el parámetro", async ({ page }) => {
  await page.goto(tables.es + "?tiles=123m");
  await page.locator("#tiles-code").fill("");
  await page.locator("#tiles-code").press("Enter");
  expect(tilesParam(page)).toBeNull();
  expect(await count(page)).toBe(0);
});

test("una fila larga se parte, sin salirse de la mesa ni tapar las pilas", async ({ page }) => {
  await page.goto(tables.es + "?tiles=123456789m123456789p123456789s,ESWNw");
  const rows = await rowsOnTable(page);
  expect(rows.flat()).toHaveLength(31);
  expect(rows.length).toBeGreaterThanOrEqual(2);
  const bad = await page.evaluate(() => {
    const t = document.getElementById("table").getBoundingClientRect();
    const all = [...document.querySelectorAll("#table .tile")];
    const placed = all.filter((el) => +el.style.zIndex > 1000).map((el) => el.getBoundingClientRect());
    const piles = all.filter((el) => +el.style.zIndex <= 1000 && el.style.display !== "none")
      .map((el) => el.getBoundingClientRect());
    const pilesLeft = Math.min(...piles.map((r) => r.left));
    return placed.filter((r) => r.left < t.left - 1 || r.right > pilesLeft + 1 ||
      r.top < t.top - 1 || r.bottom > t.bottom + 1).length;
  });
  expect(bad, "fichas fuera de su sitio").toBe(0);
});

test("los avisos salen en el idioma de la página", async ({ page }) => {
  await page.goto(tables.en + "?tiles=11111m");
  await expect(page.locator(".tiles-msg")).toContainText("More than 4 equal tiles");
  await page.goto(tables.ast + "?tiles=1q");
  await expect(page.locator(".tiles-msg")).toContainText("Nun s'entiende");
});

for (const [lang, path] of Object.entries(tables)) {
  test(`?tiles= funciona en la mesa (${lang})`, async ({ page }) => {
    await page.goto(path + "?tiles=X5pEw");
    await expect(page.locator("#tiles-code")).toHaveValue("X5pEw");
    expect(await count(page)).toBe(3);
  });
}

test("las pilas muestran su código solo mientras el campo tiene el foco", async ({ page }) => {
  await page.goto(tables.es);
  const codeOf = (i) => page.locator("#table .tile").nth(i).evaluate((el) => getComputedStyle(el, "::after").content);
  // nth(3) is the top 1m tile; 4 * 27 is the first East tile; .back is a face down tile.
  expect(await codeOf(3)).toBe("none");
  await page.locator("#tiles-code").focus();
  await expect(page.locator("#table")).toHaveClass(/show-codes/);
  expect(await codeOf(3)).toBe('"1m"');
  expect(await codeOf(4 * 27)).toBe('"Ew"');
  expect(await page.locator("#table .tile.back").first().evaluate((el) => getComputedStyle(el, "::after").content)).toBe('"X"');
  await page.locator("#tiles-code").blur();
  await expect(page.locator("#table")).not.toHaveClass(/show-codes/);
  expect(await codeOf(3)).toBe("none");
});

test("el aviso de error sale bajo el campo, en rosa y sin hablar de la ruta", async ({ page }) => {
  await page.goto(tables.es);
  const field = page.locator("#tiles-code");
  await field.fill("123q");
  await field.press("Enter");
  const msg = page.locator(".tiles-msg");
  await expect(msg).toBeVisible();
  await expect(msg).not.toContainText("tiles");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  expect(await msg.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(253, 228, 231)");
  const f = await page.locator("#tiles-form").boundingBox();
  const m = await msg.boundingBox();
  expect(m.y).toBeGreaterThan(f.y + f.height - 1);
  // Typing again hides it.
  await field.press("Backspace");
  await expect(msg).toHaveCount(0);
  await expect(field).not.toHaveAttribute("aria-invalid", "true");
});
