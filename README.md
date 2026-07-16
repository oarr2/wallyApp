# Wally App

Spanish-only reservation and payment platform for a sports center in La Paz,
Bolivia.

Wally App manages two courts for wally, racket, and fútbol 2. MVP scope is court
reservations, reservation payments, court availability management, reservation
management, and basic role-based access for Player, Venue Administrator, and
Wally Administrator.

The MVP does not include i18n, language switching, English UI, or tournament
management. Navigation may include `Torneos`, but it must show only a Spanish
`Próximamente` placeholder until a future tournament release.

Preferred stack: Next.js, TypeScript, Tailwind CSS, Supabase PostgreSQL, and
Prisma.

## Guardrails del MVP

- Toda la interfaz visible debe permanecer solo en español: sin i18n, rutas por
  idioma, selector de idioma ni textos en inglés para usuarios o administradores.
- La referencia visual seleccionada es la Opción 1 disponible en
  `/design-preview`: app deportiva moderna, mobile-first desde 320px, fondo
  oscuro negro/azul, tarjetas fuertes, acciones verde neón, iconos deportivos y
  espaciado profesional.
- El MVP debe mantenerse enfocado en reservas, pagos, disponibilidad,
  administración básica y roles Player, Venue Administrator y Wally
  Administrator.
- `Torneos` puede aparecer en navegación o inicio solo como `Próximamente`. No
  debe incluir creación, inscripción, fixtures, posiciones, resultados, rankings,
  pagos ni administración de torneos.
- Figma no es fuente de verdad ni dependencia de entrega para este MVP; la
  implementación debe reutilizar Tailwind CSS, shadcn/ui y los componentes
  existentes del repositorio.
