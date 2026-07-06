# Implementation Plan: Wally App MVP

**Branch**: `main` | **Date**: 2026-06-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-wally-mvp/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a mobile-first Spanish-only reservation and payment MVP for Wally courts.
Players can browse courts and available time slots, create and cancel
reservations according to venue rules, and view payment status. Venue
Administrators manage courts, schedules, availability, reservations, and payment
history. Wally Administrators have global administrative permissions. The MVP
includes a `Torneos` navigation item that opens only a Spanish `Próximamente`
placeholder for future tournaments.

Technical approach: scaffold a single Next.js TypeScript application deployed to
Vercel, style it with Tailwind CSS and shadcn/ui primitives, use lucide-react
icons for common actions, store domain data in Supabase PostgreSQL managed
through Prisma migrations, use Supabase Auth sessions for user identity, and
enforce role authorization in server actions, route handlers, and protected
layouts. Reservation creation uses a transactional conflict check against court
time windows, payment status changes create auditable history, and all UI states
remain Spanish-only with no i18n or language switching.

## Technical Context

**Language/Version**: TypeScript 5.x with Node.js 20 LTS runtime for local
development, Vercel build, Prisma CLI, and test execution.

**Primary Dependencies**: Next.js App Router, React, Tailwind CSS, shadcn/ui
component primitives, lucide-react icons, Prisma, Supabase JavaScript client and
auth helpers, Zod for input validation, Vitest for unit/integration tests,
Playwright for responsive and user-journey tests.

**Storage**: Supabase PostgreSQL as the system of record. Prisma owns schema
models, migrations, constraints, and transactional data access. Supabase Auth
owns user identities and sessions.

**Testing**: Vitest for domain logic, authorization helpers, and data access
services; Playwright for Player and administrator journeys, Spanish-only UI
checks, 320px responsive layout, no-horizontal-scroll checks, and `Torneos`
placeholder behavior.

**Target Platform**: Responsive web application from 320px mobile width through
tablet and desktop browsers.

**Project Type**: Single Next.js web application with server-rendered routes,
server actions for form mutations, and route handlers for payment status
callbacks or admin endpoints when a server action is not suitable.

**Performance Goals**: Availability browsing and reservation detail pages render
usable content within 2 seconds on a typical mobile connection; reservation
creation returns success or a Spanish conflict/error state within 3 seconds;
admin reservation/payment lists support quick filtering for MVP-scale venue
operations.

**Constraints**: Spanish-only UI; no i18n infrastructure; no language switcher;
no Figma dependency; mobile-first layout from 320px; no horizontal scrolling;
touch-friendly controls; `Torneos` is a Spanish `Próximamente` placeholder only;
no tournament functionality; all protected operations require an authenticated
session and role authorization; reservation and payment changes must be
auditable.

**Scale/Scope**: MVP scope covers two courts, wally reservations, reservation
payments/status tracking, schedule and availability management, reservation
management, role-based access for Player, Venue Administrator, and Wally
Administrator, and a future tournaments placeholder.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Reservation Integrity**: PASS. The plan defines Court, Schedule,
  Availability Override, Reservation, and Payment entities; uses La Paz local
  date/time fields plus UTC instants; enforces conflict prevention with a
  database-backed active reservation time-window exclusion strategy; and
  documents reservation states and cancellation behavior.
- **Payment and Audit Safety**: PASS. Every reservation has a payment status
  (`Pending`, `Paid`, `Failed`, `Refunded`), payment history is modeled
  separately from the current reservation status, idempotent payment events are
  keyed by provider/event references or manual operation references, and audit
  records capture actor, timestamp, before/after values, and reason when
  applicable.
- **Spanish-Only Mobile-First Experience**: PASS. All routes, forms, loading
  states, empty states, validation messages, and errors are Spanish-only. No i18n
  package, locale routing, language switcher, or English UI is included. UI
  validation includes 320px screens, touch targets, and no horizontal scrolling.
- **Role-Based Operations**: PASS. The plan defines Player, Venue Administrator,
  and Wally Administrator permissions and requires checks in protected layouts,
  server actions, route handlers, and data access functions.
- **MVP Scope and Future Modules**: PASS. Scope is limited to reservations,
  payment status/history, availability management, reservation management, basic
  roles, and a `Torneos` placeholder. Tournament creation, team registration,
  fixtures, standings, results management, rankings, push notifications,
  marketplace features, and multi-language support are excluded.
- **Preferred Stack, Design System, and Performance**: PASS. The plan uses
  Next.js, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, Supabase
  PostgreSQL, Prisma, and Vercel. UI work uses a shared Tailwind/shadcn design
  system and no stack deviation is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-wally-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── routes.md
│   └── server-actions.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   ├── iniciar-sesion/page.tsx
│   └── registrarse/page.tsx
├── (player)/
│   ├── reservas/page.tsx
│   ├── reservas/[reservationId]/page.tsx
│   └── reservar/page.tsx
├── admin/
│   ├── canchas/page.tsx
│   ├── horarios/page.tsx
│   ├── disponibilidad/page.tsx
│   ├── reservas/page.tsx
│   └── pagos/page.tsx
├── torneos/page.tsx
├── api/
│   └── pagos/eventos/route.ts
├── layout.tsx
└── page.tsx

components/
├── navigation/
├── reservations/
├── payments/
├── admin/
├── states/
└── ui/

lib/
├── actions/
│   ├── reservations.ts
│   ├── payments.ts
│   ├── availability.ts
│   └── admin.ts
├── auth/
│   ├── session.ts
│   └── authorization.ts
├── data/
│   ├── courts.ts
│   ├── reservations.ts
│   ├── payments.ts
│   ├── schedules.ts
│   └── audit.ts
├── validation/
└── time/

prisma/
├── schema.prisma
├── migrations/
└── seed.ts

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Use a single Next.js App Router project at the repository
root because the MVP is one web product with shared domain logic, shared auth,
and no separate mobile/native or backend service boundary. Server actions handle
form-based mutations. Route handlers are reserved for integrations such as
payment event callbacks where an HTTP endpoint is required.

## Database Schema

Prisma models will represent:

- `UserProfile`: Supabase Auth user metadata mirrored for app permissions,
  display name, phone, and role.
- `Venue`: Initial single venue container for courts and Venue Administrator
  scope.
- `Court`: Two reservable courts with active status and display ordering.
- `Sport`: Seeded sports table with at least `wally`; schema remains compatible
  with constitution-supported court sports.
- `CourtSport`: Join table for sports each court can support.
- `ScheduleRule`: Recurring venue/court operating windows, slot duration,
  timezone, and cancellation cutoff rules.
- `AvailabilityOverride`: Date-specific closures, blocked slots, or admin-added
  availability.
- `Reservation`: Player booking with court, sport, local date, UTC start/end,
  status, payment status, cancellation metadata, and actor references.
- `Payment`: Current and historical payment attempts or manual payment records
  tied to a reservation.
- `PaymentEvent`: Idempotent event ledger for payment status transitions.
- `AuditRecord`: Append-only record for reservation, payment, court, schedule,
  availability, and role-relevant administrative changes.

Key constraints:

- Active reservations cannot overlap the same court time window.
- Reservation payment status is restricted to `Pending`, `Paid`, `Failed`, or
  `Refunded`.
- Payment events are idempotent by source and source event id.
- Audit records are append-only and include actor, action, entity, before/after
  state, timestamp, and optional reason.
- All time-window calculations persist UTC instants and La Paz local date fields
  for display and schedule lookup.

See [data-model.md](./data-model.md) for full entity definitions and state
transitions.

## Authentication and Session Handling

Supabase Auth manages user accounts and sessions. Next.js middleware and server
helpers load the current session from secure cookies for protected routes and
server actions. `UserProfile` maps each authenticated user to one MVP role:
Player, Venue Administrator, or Wally Administrator.

Session requirements:

- Public pages: landing/home, sign-in, sign-up, and the `Torneos` placeholder may
  render without a session when appropriate.
- Player routes: require an authenticated user with Player, Venue Administrator,
  or Wally Administrator role when viewing player-like reservation data; data
  remains scoped to the acting user's permissions.
- Admin routes: require Venue Administrator or Wally Administrator.
- Wally Administrator-only operations: require the Wally Administrator role.
- Server actions and route handlers repeat authorization checks and do not rely
  only on route-level protection.

## Role-Based Authorization

Permissions:

- Player: browse courts and availability, create reservations, view own upcoming
  reservations, view own payment information, cancel own reservations when venue
  rules allow.
- Venue Administrator: manage courts, schedules, availability, reservations, and
  payment history within venue scope.
- Wally Administrator: global permissions across courts, schedules,
  availability, reservations, payment history, user role administration needed
  for MVP operations, and future tournament management once implemented.

Authorization strategy:

- Centralize role checks in `lib/auth/authorization.ts`.
- Enforce data scoping in `lib/data/*` functions, not only UI components.
- Deny by default when a role or venue scope is missing.
- Return Spanish authorization errors for user-visible failures.

## Reservation Workflow

1. Player opens `Reservar`.
2. App lists active courts and available dates.
3. Player selects a court/date and sees generated available time slots.
4. Player confirms a slot.
5. Server action validates session, role, court, sport, schedule, cancellation
   rules, and slot availability.
6. Reservation creation runs in a transaction and fails if another active
   reservation occupies the same court/time window.
7. Reservation is created with status `Confirmed` and payment status `Pending`.
8. Audit record captures creation.
9. Player sees upcoming reservation details and payment information.

Cancellation:

- Player cancellation is allowed only before the configured cancellation cutoff.
- Venue Administrator and Wally Administrator can cancel or adjust reservations
  according to admin policy.
- Cancellation writes reservation before/after state and reason to the audit
  trail.
- Slot release follows venue availability rules after cancellation.

## Payment Workflow

MVP stores and displays payment status and history for each reservation. Payment
collection integration can be completed in implementation or phased behind the
same state model, but all visible states and admin review must work.

States:

- `Pending`: reservation exists and payment is not completed.
- `Paid`: payment is confirmed.
- `Failed`: payment attempt failed or was rejected.
- `Refunded`: payment was returned after payment completion.

Workflow:

1. Reservation starts with `Pending`.
2. Payment status changes through a manual admin action or payment event route.
3. Payment update validates idempotency key/source event id.
4. Reservation current payment status updates in the same transaction as payment
   history.
5. Audit record captures actor/source, previous status, new status, timestamp,
   and reason where applicable.
6. Player reservation detail and admin payment history show Spanish labels for
   all states.

## Admin Operations

Admin surfaces:

- Courts: list, create/update active courts for the venue, assign supported
  sports, and hide inactive courts from Player browsing.
- Schedules: define operating windows, slot duration, and cancellation cutoff
  rules.
- Availability: add closures, blocked slots, or special availability for a court
  and date.
- Reservations: search and filter reservations, inspect details, cancel or
  adjust permitted reservations, and view audit history.
- Payments: review payment current status and history, update manual payment
  status when allowed, and inspect reconciliation/audit details.

All admin forms use Spanish copy and validate server-side. Destructive or
state-changing admin actions require explicit confirmation and an audit reason
when the reason materially affects customer support or accounting.

## Audit Trail

Every reservation and payment state change writes an audit record. Court,
schedule, availability, and role-affecting admin changes also write audit
records.

Audit record fields:

- Entity type and entity id.
- Action name.
- Actor user id or system source.
- Actor role at time of action.
- Timestamp.
- Before state.
- After state.
- Reason when provided or required.
- Request/event id for idempotent operations when available.

Audit records are visible to administrators according to role and venue scope.
Players do not see internal audit details.

## Supabase/Prisma Data Access Strategy

- Supabase Auth handles identity and session cookies.
- Prisma is the only application data access layer for domain tables.
- Prisma migrations define schema, enums, indexes, and constraints.
- Domain services in `lib/data/*` expose scoped functions such as
  `listAvailableSlots`, `createReservation`, `cancelReservation`,
  `updatePaymentStatus`, and `listAdminPaymentHistory`.
- Server actions call domain services after loading session and authorization
  context.
- Route handlers are limited to integration-style HTTP interfaces such as payment
  events.
- Database transactions wrap reservation creation, cancellation, payment status
  changes, and audit writes.

## Next.js Routes, Pages, Server Actions, and API Routes

Routes/pages:

- `/`: authenticated-aware home routing to reservations or admin dashboard.
- `/iniciar-sesion`: Spanish sign-in.
- `/registrarse`: Spanish account creation for Player onboarding.
- `/reservar`: browse courts, dates, and time slots; create reservation.
- `/reservas`: Player upcoming reservations.
- `/reservas/[reservationId]`: Player reservation and payment detail.
- `/admin/canchas`: court management.
- `/admin/horarios`: schedule management.
- `/admin/disponibilidad`: availability management.
- `/admin/reservas`: reservation management and audit review.
- `/admin/pagos`: payment history and status review.
- `/torneos`: Spanish `Próximamente` placeholder only.

Server actions:

- `createReservationAction`
- `cancelReservationAction`
- `updateCourtAction`
- `updateScheduleRuleAction`
- `updateAvailabilityOverrideAction`
- `adminCancelReservationAction`
- `adminUpdatePaymentStatusAction`

Route handlers:

- `POST /api/pagos/eventos`: idempotent payment status event receiver for future
  payment integration or controlled MVP payment event simulation.

See [contracts/routes.md](./contracts/routes.md) and
[contracts/server-actions.md](./contracts/server-actions.md).

## UI/UX Requirements

- All customer-facing and administrator-facing UI text is Spanish.
- No i18n setup, locale route segments, translation files, language selector, or
  English fallback UI.
- No Figma handoff, design-file dependency, or design-token import is required;
  the MVP UI source of truth is the codebase.
- Tailwind CSS provides layout, spacing, color, typography, and responsive
  utility styling.
- shadcn/ui provides the baseline primitives for buttons, cards, forms, inputs,
  selects, badges, tabs, dialogs, sheets, tables, skeletons, and alerts.
- lucide-react provides icons for navigation and recognizable actions such as
  booking, calendar, payment, filters, edit, cancel, and admin tools.
- Mobile-first layout starts at 320px width.
- No horizontal scrolling on primary screens or admin tables; tables collapse to
  stacked/list layouts on small screens.
- Touch targets are at least 44px tall where practical.
- Loading, empty, validation, conflict, authorization, and error states are
  Spanish.
- Navigation emphasizes `Reservar`, `Mis reservas`, `Pagos` through reservation
  detail, `Administración` for admins, and `Torneos`.
- Tailwind CSS design system defines shared tokens/components for buttons,
  inputs, status badges, cards, list rows, alerts, modals, and admin filters.
- The selected visual direction is the modern sports app option: dark
  navy/black backgrounds, neon green primary actions, strong card-based layouts,
  sports-oriented lucide-react icons, professional spacing, and high contrast
  for quick mobile decisions.
- Primary actions use one clear button per decision area, with secondary or
  destructive actions visually subordinate and confirmed through dialogs or
  sheets when needed.
- Court browsing, slot selection, upcoming reservations, and reservation details
  use card-based layouts with concise Spanish labels, date/time prominence, court
  identity, and payment state visibility.
- The Player home or main availability dashboard includes a prominent
  `Torneos` / `Próximamente` card visible without first opening navigation. Copy
  should clearly state: `Muy pronto podrás inscribir equipos, ver fixtures,
  posiciones y resultados.` The CTA is placeholder-only, such as
  `Ver próximamente` or `Quiero participar`.
- Admin courts, schedules, availability, reservations, and payment history use
  readable tables on desktop and stacked cards on mobile, preserving filters and
  row actions without horizontal scroll.
- Shared state components cover Spanish loading, empty, error, authorization,
  conflict, and success states, with a clear next action when applicable.
- Payment states use consistent Spanish labels and visual treatments:
  `Pendiente`, `Pagado`, `Fallido`, `Reembolsado`.
- `Torneos` is a polished `Próximamente` screen using the same navigation,
  spacing, icon, card, and state patterns, but it must not include tournament
  forms, tables, admin controls, payments, or functional calls to action. The
  home/dashboard card is also placeholder-only and must not start tournament
  registration, fixture, standings, results, or payment workflows.

## Responsive Behavior From 320px

- 320px to 479px: single-column layout, bottom or compact navigation, stacked
  reservation cards, full-width forms, no data tables.
- 480px to 767px: single-column with larger spacing, filters collapsible into
  drawers or stacked controls.
- 768px and above: two-column layouts where useful, admin lists may use wider
  table-like layouts while preserving no horizontal scrolling.
- Playwright checks cover 320px, 375px, 768px, and desktop widths for primary
  Player and admin flows.

## Testing

Unit/integration:

- Availability generation for schedule rules and overrides.
- Reservation conflict prevention and cancellation cutoff rules.
- Payment state transitions and idempotency.
- Role authorization helpers for Player, Venue Administrator, and Wally
  Administrator.
- Audit record creation for reservation and payment changes.

End-to-end:

- Player creates reservation from available slot.
- Player views upcoming reservation and payment status.
- Player cancellation allowed and blocked paths.
- Venue Administrator updates availability and manages reservations.
- Administrator reviews payment history.
- Wally Administrator accesses global admin operations.
- `Torneos` renders only Spanish `Próximamente` placeholder.
- Spanish-only text and no language switcher.
- 320px responsive layout and no horizontal scrolling.

## Deployment

- Deploy to Vercel.
- Configure Supabase project URL, anon key, service role key for server-only
  operations, database URL, direct database URL for migrations, and auth callback
  URLs as environment variables.
- Run Prisma migrations before production release.
- Seed initial venue, two courts, wally sport, court-sport assignments, default
  schedule rules, and an initial Wally Administrator account/profile.
- Use Vercel preview deployments for branch validation and production deployment
  after quickstart checks pass.

## Post-Design Constitution Check

- **Reservation Integrity**: PASS. Data model, contracts, and quickstart include
  conflict prevention, La Paz timezone expectations, and cancellation rules.
- **Payment and Audit Safety**: PASS. Payment state model, idempotent event
  handling, admin history, and audit records are documented.
- **Spanish-Only Mobile-First Experience**: PASS. Routes, UI requirements, and
  validation scenarios require Spanish-only copy, no i18n/language switcher,
  320px layout, and no horizontal scrolling.
- **Role-Based Operations**: PASS. Permission matrix is represented in plan,
  data model, contracts, and quickstart scenarios.
- **MVP Scope and Future Modules**: PASS. `Torneos` is placeholder-only and no
  tournament behavior is included.
- **Preferred Stack, Design System, and Performance**: PASS. The approved stack
  is used without deviation and Tailwind CSS design system usage is required.

## Complexity Tracking

No constitution deviations. The approved default stack is used: Next.js,
TypeScript, Tailwind CSS, Supabase PostgreSQL, Prisma, and Vercel.
