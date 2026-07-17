import { loadEnvConfig } from "@next/env";
import { formatEnvIssues, validateServerEnv } from "../lib/validation/env";

loadEnvConfig(process.cwd());

const result = validateServerEnv();

if (!result.success) {
  console.error(formatEnvIssues(result.error));
  process.exitCode = 1;
} else {
  console.log("Variables de entorno listas para el MVP de Wally App.");
}
