import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  decideRouteAccess,
  getAuthorizationMessage,
  getDefaultSignedInPath,
  normalizeRole
} from "@/lib/auth/authorization";
import { getSupabasePublicEnv } from "@/lib/validation/env";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabasePublicEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const role = normalizeRole(
    user?.app_metadata?.role ?? user?.user_metadata?.role ?? null
  );
  const decision = decideRouteAccess({
    pathname: request.nextUrl.pathname,
    role
  });

  if (decision === "allow") {
    return response;
  }

  const redirectPath =
    decision === "redirect_home"
      ? role
        ? getDefaultSignedInPath(role)
        : "/"
      : "/iniciar-sesion";
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = redirectPath;
  redirectUrl.search = "";
  const message = getAuthorizationMessage(decision);

  if (message) {
    redirectUrl.searchParams.set("mensaje", message);
  }

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/iniciar-sesion",
    "/registrarse",
    "/reservar/:path*",
    "/reservas/:path*",
    "/admin/:path*"
  ]
};
