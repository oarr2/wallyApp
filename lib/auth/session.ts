import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/auth/supabase";
import {
  getUserProfileByAuthUserId,
  type UserProfileWithVenue
} from "@/lib/data/user-profiles";

export type AuthContext = {
  user: User;
  profile: UserProfileWithVenue;
};

export class AuthRequiredError extends Error {
  constructor(message = "Inicia sesión para continuar.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class ProfileRequiredError extends Error {
  constructor(message = "Tu perfil no está configurado.") {
    super(message);
    this.name = "ProfileRequiredError";
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentAuthContext(): Promise<AuthContext | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const profile = await getUserProfileByAuthUserId(user.id);

  if (!profile) {
    return null;
  }

  return { user, profile };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  const profile = await getUserProfileByAuthUserId(user.id);

  if (!profile) {
    throw new ProfileRequiredError();
  }

  return { user, profile };
}
