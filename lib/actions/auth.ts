"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/auth/supabase";
import { getDefaultSignedInPath } from "@/lib/auth/authorization";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { getOrCreatePlayerProfileForAuthUser } from "@/lib/data/user-profiles";

const emailSchema = z
  .string()
  .trim()
  .email("Ingresa un correo válido.")
  .toLowerCase();
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.");

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña.")
});

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "Ingresa tu nombre."),
  phone: z.string().trim().optional(),
  email: emailSchema,
  password: passwordSchema
});

function authRedirect(pathname: string, message: string): never {
  redirect(`${pathname}?mensaje=${encodeURIComponent(message)}`);
}

export async function signInAction(formData: FormData): Promise<never> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    authRedirect("/iniciar-sesion", parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    authRedirect(
      "/iniciar-sesion",
      "No pudimos iniciar sesión. Revisa tu correo y contraseña."
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    authRedirect("/iniciar-sesion", "No pudimos confirmar tu sesión.");
  }

  const profile = await getOrCreatePlayerProfileForAuthUser({
    authUserId: user.id,
    displayName:
      user.user_metadata?.displayName ??
      user.email?.split("@")[0] ??
      "Jugador Wally",
    phone: user.user_metadata?.phone ?? null
  });

  redirect(getDefaultSignedInPath(profile.role));
}

export async function signUpAction(formData: FormData): Promise<never> {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    authRedirect("/registrarse", parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        displayName: parsed.data.displayName,
        phone: parsed.data.phone ?? null
      }
    }
  });

  if (error || !data.user) {
    authRedirect(
      "/registrarse",
      "No pudimos crear tu cuenta. Revisa los datos e intenta nuevamente."
    );
  }

  await getOrCreatePlayerProfileForAuthUser({
    authUserId: data.user.id,
    displayName: parsed.data.displayName,
    phone: parsed.data.phone ?? null
  });

  redirect("/reservar");
}

export async function signOutAction(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/iniciar-sesion?mensaje=Sesión cerrada.");
}

export async function getSessionAction() {
  const context = await getCurrentAuthContext();

  if (!context) {
    return { authenticated: false as const };
  }

  return {
    authenticated: true as const,
    user: {
      id: context.user.id,
      email: context.user.email ?? null
    },
    profile: {
      id: context.profile.id,
      role: context.profile.role,
      venueId: context.profile.venueId,
      displayName: context.profile.displayName
    }
  };
}
