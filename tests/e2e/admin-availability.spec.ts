import { expect, test } from "@playwright/test";

test("Venue Administrator bloquea disponibilidad en 320px", async ({ page }) => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Requiere variables públicas de Supabase para evaluar rutas protegidas."
  );

  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/admin/disponibilidad");

  test.skip(
    page.url().includes("/iniciar-sesion"),
    "Pendiente de fixtures de autenticación admin para ejecutar el flujo completo."
  );

  await expect(page.getByRole("heading", { name: "Disponibilidad" })).toBeVisible();
  await page.getByLabel("Tipo").selectOption("BLOCKED");
  await page.getByLabel("Fecha").fill("2026-07-20");
  await page.getByLabel("Inicio").fill("08:00");
  await page.getByLabel("Fin").fill("09:00");
  await page.getByLabel("Motivo").fill("Mantenimiento programado");
  await expect(page.getByRole("button", { name: "Guardar disponibilidad" })).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    )
    .toBe(true);
});
