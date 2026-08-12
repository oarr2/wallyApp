import { expect, test } from "@playwright/test";

test("home muestra la tarjeta Torneos Próximamente en 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  const card = page.getByTestId("home-torneos-card");
  await expect(card).toBeVisible();
  await expect(card.getByText("Próximamente", { exact: true })).toBeVisible();
  await expect(card.getByRole("heading", { name: "Torneos" })).toBeVisible();
  await expect(card.getByText("inscripción de equipos")).toBeVisible();
  await expect(card.getByRole("link", { name: "Ver próximamente" })).toHaveAttribute(
    "href",
    "/torneos"
  );
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    )
    .toBe(true);

  await card.getByRole("link", { name: "Ver próximamente" }).click();
  await expect(page).toHaveURL(/\/torneos$/);
  await expect(page.getByText("Página informativa")).toBeVisible();
});
