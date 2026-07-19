import type { UserProfileWithVenue } from "@/lib/data/user-profiles";

export const UserRoleValues = {
  PLAYER: "PLAYER",
  VENUE_ADMIN: "VENUE_ADMIN",
  WALLY_ADMIN: "WALLY_ADMIN"
} as const;

export type AppRole = (typeof UserRoleValues)[keyof typeof UserRoleValues];
export type AuthRouteKind = "public" | "auth" | "authenticated" | "admin";
export type RouteAccessDecision = "allow" | "redirect_sign_in" | "redirect_home";

export const AUTHENTICATED_ROUTE_PREFIXES = ["/reservar", "/reservas"] as const;
export const ADMIN_ROUTE_PREFIX = "/admin";
export const AUTH_ROUTE_PREFIXES = ["/iniciar-sesion", "/registrarse"] as const;

export function normalizeRole(value: unknown): AppRole | null {
  if (
    value === UserRoleValues.PLAYER ||
    value === UserRoleValues.VENUE_ADMIN ||
    value === UserRoleValues.WALLY_ADMIN
  ) {
    return value;
  }

  return null;
}

export function isAdminRole(role: AppRole): boolean {
  return role === UserRoleValues.VENUE_ADMIN || role === UserRoleValues.WALLY_ADMIN;
}

export function canAccessPlayerRoutes(role: AppRole): boolean {
  return (
    role === UserRoleValues.PLAYER ||
    role === UserRoleValues.VENUE_ADMIN ||
    role === UserRoleValues.WALLY_ADMIN
  );
}

export function canAccessAdminRoutes(role: AppRole): boolean {
  return isAdminRole(role);
}

export function canManageVenue(
  profile: Pick<UserProfileWithVenue, "role" | "venueId">,
  venueId: string
): boolean {
  if (profile.role === UserRoleValues.WALLY_ADMIN) {
    return true;
  }

  return profile.role === UserRoleValues.VENUE_ADMIN && profile.venueId === venueId;
}

export function requireAdminProfile(
  profile: Pick<UserProfileWithVenue, "role" | "venueId"> | null
): asserts profile is Pick<UserProfileWithVenue, "role" | "venueId"> {
  if (!profile || !canAccessAdminRoutes(profile.role)) {
    throw new Error("No tienes permiso para acceder a esta sección.");
  }
}

export function requireVenueScope(
  profile: Pick<UserProfileWithVenue, "role" | "venueId"> | null,
  venueId: string
): asserts profile is Pick<UserProfileWithVenue, "role" | "venueId"> {
  if (!profile || !canManageVenue(profile, venueId)) {
    throw new Error("No tienes permiso para administrar este venue.");
  }
}

export function getRouteKind(pathname: string): AuthRouteKind {
  if (pathname === ADMIN_ROUTE_PREFIX || pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`)) {
    return "admin";
  }

  if (
    AUTHENTICATED_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return "authenticated";
  }

  if (AUTH_ROUTE_PREFIXES.includes(pathname as (typeof AUTH_ROUTE_PREFIXES)[number])) {
    return "auth";
  }

  return "public";
}

export function getDefaultSignedInPath(role: AppRole): string {
  return isAdminRole(role) ? "/admin/reservas" : "/reservar";
}

export function decideRouteAccess(input: {
  pathname: string;
  role: AppRole | null;
}): RouteAccessDecision {
  const routeKind = getRouteKind(input.pathname);

  if (routeKind === "public") {
    return "allow";
  }

  if (routeKind === "auth") {
    return input.role ? "redirect_home" : "allow";
  }

  if (!input.role) {
    return "redirect_sign_in";
  }

  if (routeKind === "admin") {
    return canAccessAdminRoutes(input.role) ? "allow" : "redirect_home";
  }

  return canAccessPlayerRoutes(input.role) ? "allow" : "redirect_sign_in";
}

export function getAuthorizationMessage(decision: RouteAccessDecision): string {
  if (decision === "redirect_sign_in") {
    return "Inicia sesión para continuar.";
  }

  if (decision === "redirect_home") {
    return "Tu cuenta no tiene permiso para acceder a esa sección.";
  }

  return "";
}
