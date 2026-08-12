import { expect, test } from "@playwright/test";

const forbiddenControls = [
  "Crear torneo",
  "Inscribir equipo",
  "Registrar equipo",
  "Crear fixture",
  "Registrar resultado",
  "Administrar torneo"
];

test("Torneos muestra solo placeholder informativo", async ({ page }) => {
  await page.goto("/torneos");

  await expect(page.getByRole("heading", { name: "Torneos" })).toBeVisible();
  await expect(page.getByText("Próximamente", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Inscripción de equipos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fixtures y partidos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Posiciones" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resultados" })).toBeVisible();
  await expect(page.getByText("Página informativa")).toBeVisible();

  for (const label of forbiddenControls) {
    await expect(page.getByRole("button", { name: label })).toHaveCount(0);
    await expect(page.getByRole("link", { name: label })).toHaveCount(0);
  }

  await expect(page.getByRole("link", { name: /admin/i })).toHaveCount(0);
  await expect(page.locator('a[href^="/admin/torneos"]')).toHaveCount(0);
});
