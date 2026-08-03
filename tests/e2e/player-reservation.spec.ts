import { test, expect } from "@playwright/test";

test("entrada de reservas en 320px mantiene CTA y Torneos visible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Reserva canchas/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Reservar cancha" })).toBeVisible();
  await expect(page.getByText("Muy pronto podrás inscribir equipos")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver próximamente" })).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    )
    .toBe(true);
});
