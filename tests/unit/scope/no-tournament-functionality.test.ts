import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const forbiddenPatterns = [
  /\bmodel\s+(Tournament|Torneo|Team|Equipo|Fixture|Standing|Ranking|Result|Resultado)\b/i,
  /\benum\s+(Tournament|Torneo|Team|Equipo|Fixture|Standing|Ranking|Result|Resultado)\b/i,
  /Crear torneo/i,
  /Inscribir equipo/i,
  /Registrar equipo/i,
  /Crear fixture/i,
  /Registrar resultado/i,
  /Administrar torneo/i,
  /admin\/torneos/i,
  /admin\/equipos/i,
  /admin\/fixtures/i,
  /admin\/resultados/i
];

const allowedPlaceholderFiles = new Set([
  path.join(root, "app/torneos/page.tsx"),
  path.join(root, "components/navigation/torneos-copy.ts"),
  path.join(root, "components/reservations/HomeTorneosCard.tsx"),
  path.join(root, "tests/e2e/torneos-placeholder.spec.ts"),
  path.join(root, "tests/e2e/home-torneos-card.spec.ts"),
  path.join(root, "tests/unit/scope/no-tournament-functionality.test.ts")
]);

describe("scope placeholder de torneos", () => {
  it("no agrega modelos Prisma de torneos, equipos, fixtures, posiciones ni resultados", () => {
    const schema = readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");

    for (const pattern of forbiddenPatterns.slice(0, 2)) {
      expect(schema).not.toMatch(pattern);
    }
  });

  it("no agrega acciones, APIs ni rutas admin de torneos", () => {
    const files = [
      ...listFiles(path.join(root, "lib/actions")),
      ...listFiles(path.join(root, "app/admin")),
      ...listFiles(path.join(root, "app/api"))
    ].filter((file) => !allowedPlaceholderFiles.has(file));

    for (const file of files) {
      const relativePath = path.relative(root, file);
      const content = readFileSync(file, "utf8");

      expect(relativePath).not.toMatch(/admin\/(torneos|equipos|fixtures|resultados)/i);
      for (const pattern of forbiddenPatterns) {
        expect(content, relativePath).not.toMatch(pattern);
      }
    }
  });
});

function listFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    return stats.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}
