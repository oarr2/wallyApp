import { expect, test } from "@playwright/test";

test("Wally Administrator ve acceso global de administración", async ({ page }) => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Requiere variables públicas de Supabase para evaluar rutas protegidas."
  );

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/reservas");

  test.skip(
    page.url().includes("/iniciar-sesion"),
    "Pendiente de fixtures de autenticación Wally Administrator para ejecutar acceso global."
  );

  await expect(page.getByRole("link", { name: "Reservas admin" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Canchas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Horarios" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Disponibilidad" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pagos" })).toBeVisible();
});
