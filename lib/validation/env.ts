import { z } from "zod";

const nonEmptyString = z.string().trim().min(1, "Requerido");
const urlString = nonEmptyString.url("Debe ser una URL valida");
const postgresUrl = nonEmptyString.refine(
  (value) =>
    value.startsWith("postgresql://") || value.startsWith("postgres://"),
  "Debe ser una URL de PostgreSQL"
);

export const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: urlString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmptyString
});

export const serverEnvSchema = supabasePublicEnvSchema.extend({
  DATABASE_URL: postgresUrl,
  DIRECT_URL: postgresUrl,
  SUPABASE_SERVICE_ROLE_KEY: nonEmptyString,
  NEXT_PUBLIC_APP_URL: urlString.optional(),
  PLAYWRIGHT_BASE_URL: urlString.optional(),
  PAYMENT_EVENT_SECRET: nonEmptyString.optional()
});

export type SupabasePublicEnv = z.infer<typeof supabasePublicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validateSupabasePublicEnv(
  input: NodeJS.ProcessEnv = process.env
) {
  return supabasePublicEnvSchema.safeParse(input);
}

export function validateServerEnv(input: NodeJS.ProcessEnv = process.env) {
  return serverEnvSchema.safeParse(input);
}

export function getSupabasePublicEnv(
  input: NodeJS.ProcessEnv = process.env
): SupabasePublicEnv {
  const result = validateSupabasePublicEnv(input);

  if (!result.success) {
    throw new Error(formatEnvIssues(result.error));
  }

  return result.data;
}

export function getServerEnv(input: NodeJS.ProcessEnv = process.env): ServerEnv {
  const result = validateServerEnv(input);

  if (!result.success) {
    throw new Error(formatEnvIssues(result.error));
  }

  return result.data;
}

export function formatEnvIssues(error: z.ZodError): string {
  const issues = error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "ENV";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

  return `Variables de entorno invalidas:\n${issues}`;
}
