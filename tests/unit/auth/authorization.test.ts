import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  canAccessAdminRoutes,
  canAccessPlayerRoutes,
  canManageVenue,
  decideRouteAccess,
  getDefaultSignedInPath,
  getRouteKind
} from "@/lib/auth/authorization";

describe("decisiones de autorización por rol", () => {
  it("permite rutas de jugador a los tres roles del MVP", () => {
    expect(canAccessPlayerRoutes(UserRole.PLAYER)).toBe(true);
    expect(canAccessPlayerRoutes(UserRole.VENUE_ADMIN)).toBe(true);
    expect(canAccessPlayerRoutes(UserRole.WALLY_ADMIN)).toBe(true);
  });

  it("limita rutas admin a administradores", () => {
    expect(canAccessAdminRoutes(UserRole.PLAYER)).toBe(false);
    expect(canAccessAdminRoutes(UserRole.VENUE_ADMIN)).toBe(true);
    expect(canAccessAdminRoutes(UserRole.WALLY_ADMIN)).toBe(true);
  });

  it("aplica scope de venue para Venue Administrator y global para Wally Administrator", () => {
    expect(
      canManageVenue({ role: UserRole.VENUE_ADMIN, venueId: "venue-1" }, "venue-1")
    ).toBe(true);
    expect(
      canManageVenue({ role: UserRole.VENUE_ADMIN, venueId: "venue-1" }, "venue-2")
    ).toBe(false);
    expect(
      canManageVenue({ role: UserRole.WALLY_ADMIN, venueId: null }, "venue-2")
    ).toBe(true);
    expect(canManageVenue({ role: UserRole.PLAYER, venueId: null }, "venue-1")).toBe(
      false
    );
  });

  it("clasifica rutas protegidas y públicas", () => {
    expect(getRouteKind("/")).toBe("public");
    expect(getRouteKind("/iniciar-sesion")).toBe("auth");
    expect(getRouteKind("/reservar")).toBe("authenticated");
    expect(getRouteKind("/reservas/abc")).toBe("authenticated");
    expect(getRouteKind("/admin/pagos")).toBe("admin");
  });

  it("redirecciona usuarios con sesión fuera de pantallas de auth", () => {
    expect(
      decideRouteAccess({ pathname: "/iniciar-sesion", role: UserRole.PLAYER })
    ).toBe("redirect_home");
    expect(getDefaultSignedInPath(UserRole.PLAYER)).toBe("/reservar");
    expect(getDefaultSignedInPath(UserRole.WALLY_ADMIN)).toBe("/admin/reservas");
  });
});
