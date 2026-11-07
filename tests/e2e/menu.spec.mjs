// Main menu: the hamburger button on phones and the "Aprender" submenu.
import { test, expect } from "@playwright/test";

const learn = {
  es: { home: "/", page: "/aprender/" },
  ast: { home: "/ast/", page: "/ast/deprender/" },
  en: { home: "/en/", page: "/en/learn/" },
};

for (const [lang, l] of Object.entries(learn)) {
  test(`submenú de aprender se abre y se cierra (${lang})`, async ({ page, isMobile }) => {
    await page.goto(l.home);
    if (isMobile) await page.locator("#menu-toggle").click();
    const item = page.locator(".nav .has-sub");
    const toggle = item.locator(".sub-toggle");
    const sub = item.locator(".sub");
    await expect(sub).toBeHidden();

    // The parent entry opens the submenu instead of leaving the page.
    await item.locator(":scope > a").click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(sub).toBeVisible();
    await expect(page).toHaveURL(l.home);

    // Its first entry is the section's own page.
    await sub.locator("li").first().locator("a").click();
    await expect(page).toHaveURL(l.page);
  });
}

test("submenú se cierra con Escape y al pulsar fuera", async ({ page, isMobile }) => {
  test.skip(isMobile, "en móvil el submenú vive dentro del menú desplegable");
  await page.goto("/");
  const item = page.locator(".nav .has-sub");
  const toggle = item.locator(".sub-toggle");
  await toggle.click();
  await expect(item.locator(".sub")).toBeVisible();
  // On desktop the submenu also shows while the mouse is over it, so move away.
  await page.mouse.move(5, 700);
  await expect(item.locator(".sub")).toBeVisible();
  await toggle.focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(item.locator(".sub")).toBeHidden();
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.mouse.click(5, 700);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(item.locator(".sub")).toBeHidden();
});

test("menú de móvil se abre y se cierra", async ({ page, isMobile }) => {
  test.skip(!isMobile, "solo en móvil");
  await page.goto("/");
  const button = page.locator("#menu-toggle");
  const contact = page.locator("#site-menu").getByRole("link", { name: "Contacto" });
  await expect(button).toBeVisible();
  await expect(contact).toBeHidden();

  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(contact).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(contact).toBeHidden();

  await button.click();
  await contact.click();
  await expect(page).toHaveURL("/contacto/");
});

test("en escritorio el menú se ve entero sin botón", async ({ page, isMobile }) => {
  test.skip(isMobile, "solo en escritorio");
  await page.goto("/");
  await expect(page.locator("#menu-toggle")).toBeHidden();
  await expect(page.locator("#site-menu").getByRole("link", { name: "Contacto" })).toBeVisible();
});

test("el tema oscuro se aplica y se recuerda", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const start = await html.getAttribute("data-theme");
  await page.locator("#theme-toggle").click();
  const next = start === "dark" ? "light" : "dark";
  await expect(html).toHaveAttribute("data-theme", next);
  await page.goto("/jugar/");
  await expect(html).toHaveAttribute("data-theme", next);
});
