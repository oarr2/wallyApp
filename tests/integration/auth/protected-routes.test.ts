import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { decideRouteAccess } from "@/lib/auth/authorization";

describe("acceso a rutas protegidas por middleware", () => {
  it("envía a iniciar sesión cuando no hay sesión en rutas de jugador", () => {
    expect(decideRouteAccess({ pathname: "/reservar", role: null })).toBe(
      "redirect_sign_in"
    );
    expect(decideRouteAccess({ pathname: "/reservas/reserva-1", role: null })).toBe(
      "redirect_sign_in"
    );
  });

  it("permite rutas de jugador a Player, Venue Administrator y Wally Administrator", () => {
    expect(
      decideRouteAccess({ pathname: "/reservar", role: UserRole.PLAYER })
    ).toBe("allow");
    expect(
      decideRouteAccess({ pathname: "/reservas", role: UserRole.VENUE_ADMIN })
    ).toBe("allow");
    expect(
      decideRouteAccess({ pathname: "/reservas", role: UserRole.WALLY_ADMIN })
    ).toBe("allow");
  });

  it("bloquea rutas admin para Player", () => {
    expect(
      decideRouteAccess({ pathname: "/admin/reservas", role: UserRole.PLAYER })
    ).toBe("redirect_home");
  });

  it("permite rutas admin a Venue Administrator y Wally Administrator", () => {
    expect(
      decideRouteAccess({ pathname: "/admin/disponibilidad", role: UserRole.VENUE_ADMIN })
    ).toBe("allow");
    expect(
      decideRouteAccess({ pathname: "/admin/pagos", role: UserRole.WALLY_ADMIN })
    ).toBe("allow");
  });

  it("mantiene públicas las rutas fuera de auth y administración", () => {
    expect(decideRouteAccess({ pathname: "/", role: null })).toBe("allow");
    expect(decideRouteAccess({ pathname: "/torneos", role: null })).toBe("allow");
  });
});
