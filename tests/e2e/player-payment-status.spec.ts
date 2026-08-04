import { expect, test } from "@playwright/test";

test("los estados de pago visibles usan etiquetas españolas", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/design-preview");

  await expect(page.getByText("Estado de pago").first()).toBeVisible();
  await expect(page.getByText("Pendiente").first()).toBeVisible();
  await expect(page.getByText("Pagado").first()).toBeVisible();
  await expect(page.getByText("Fallido").first()).toBeVisible();
  await expect(page.getByText("Reembolsado").first()).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    )
    .toBe(true);
});
