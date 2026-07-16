import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    passWithNoTests: true,
    reporters: ["default"]
  }
});
