# Research: Wally App MVP

## Decision: Use Next.js App Router with server actions for form mutations

**Rationale**: Reservation, cancellation, availability, and admin updates are
form-driven workflows that benefit from colocated server-side validation,
session checks, authorization, and redirects. Server actions keep the MVP small
while preserving progressive enhancement for mobile-first forms.

**Alternatives considered**:

- Dedicated REST-only backend: rejected because it adds a service boundary before
  the MVP needs one.
- Client-only mutations: rejected because reservation, payment, and admin actions
  require trusted authorization, transactions, and audit writes.

## Decision: Keep route handlers only for integration-style HTTP endpoints

**Rationale**: Payment status events may need a stable HTTP endpoint. Route
handlers are appropriate for `POST /api/pagos/eventos`, while normal app form
mutations remain server actions.

**Alternatives considered**:

- Use route handlers for every mutation: rejected because it duplicates form
  handling and validation paths.
- Avoid route handlers entirely: rejected because payment events need an
  integration-friendly contract.

## Decision: Supabase Auth sessions with app-owned role profiles

**Rationale**: Supabase Auth provides identity and secure session handling. The
application still needs a domain-specific `UserProfile` table so roles and venue
scope can be enforced consistently across Prisma queries and server actions.

**Alternatives considered**:

- Store roles only in auth metadata: rejected because authorization and audit
  queries need stable relational data.
- Build custom authentication: rejected because it increases security risk and
  implementation scope.

## Decision: Prisma owns domain schema and transactional data access

**Rationale**: Prisma provides typed access, migrations, constraints, and
transaction APIs for reservation conflict prevention, payment updates, and audit
writes. Using Prisma as the only domain data access layer avoids mixing query
semantics.

**Alternatives considered**:

- Supabase client for all domain queries: rejected because the plan needs
  explicit migrations and transaction-heavy workflows.
- Mixed Supabase and Prisma domain writes: rejected because dual data access
  paths increase consistency risk.

## Decision: Model availability as schedule rules plus date-specific overrides

**Rationale**: Recurring schedules cover normal operating hours, while overrides
  cover closures, blocked slots, and special availability. This keeps MVP admin
  operations clear without requiring a generated slot table for every future day.

**Alternatives considered**:

- Pre-generate all time slots: rejected because it creates extra lifecycle work
  for schedule changes.
- Store only manual slots: rejected because recurring schedules would become
  tedious for administrators.

## Decision: Enforce reservation conflicts with database constraints and transactions

**Rationale**: Reservation integrity is constitutional. The application must use
  a transaction for slot validation and creation, backed by a database-level
  active reservation overlap guard for the same court and time window.

**Alternatives considered**:

- UI-only slot hiding: rejected because concurrent users can submit stale slots.
- Application-only conflict checks without database guard: rejected because race
  conditions can still create double bookings.

## Decision: Store UTC instants and La Paz local date/time metadata

**Rationale**: Schedules are understood by venue operators in La Paz local time,
  while UTC instants are safer for ordering and audit timestamps. Persisting both
  avoids ambiguous display and comparison behavior.

**Alternatives considered**:

- Store only local strings: rejected because ordering and comparisons become
  fragile.
- Store only UTC: rejected because schedule lookup and admin review need local
  business dates.

## Decision: Payment status is first-class on Reservation with history in Payment

**Rationale**: Players and admins need the current status immediately on
  reservation views, while Payment and PaymentEvent records preserve history,
  idempotency, and reconciliation details.

**Alternatives considered**:

- Derive current status only from payment history: rejected because every
  reservation list would require extra aggregation.
- Store only current status without history: rejected because admin review and
  audit requirements need history.

## Decision: Audit records are append-only JSON snapshots

**Rationale**: Reservation, payment, schedule, and availability changes need
  actor, timestamp, before/after state, and reason. JSON snapshots keep the MVP
  flexible while preserving enough evidence for support and accounting.

**Alternatives considered**:

- Separate audit table per entity: rejected because it adds duplicated schema and
  task volume.
- Log-only audit trail: rejected because logs are not a reliable user-facing
  review source.

## Decision: Spanish-only UI without i18n infrastructure

**Rationale**: The Constitution explicitly excludes English UI, i18n, and
  language switching for MVP. Hard-coded Spanish copy and shared Spanish message
  constants are sufficient and keep scope small.

**Alternatives considered**:

- Add i18n now for future expansion: rejected because it violates MVP scope.
- Store UI copy in a translation framework: rejected for the same reason.

## Decision: Mobile-first Tailwind CSS design system

**Rationale**: Shared Tailwind components and tokens provide consistency for
  forms, status badges, lists, alerts, and admin filters while supporting 320px
  screens and avoiding horizontal scrolling.

**Alternatives considered**:

- One-off page styling: rejected because it creates inconsistent admin/player
  experiences.
- Component library adoption: deferred unless implementation proves the custom
  Tailwind components are insufficient.

## Decision: Deploy through Vercel with Supabase-managed PostgreSQL

**Rationale**: Vercel is the approved deployment target, aligns with Next.js
  hosting, supports preview deployments, and can securely provide environment
  variables for Supabase and Prisma.

**Alternatives considered**:

- Self-hosted Node deployment: rejected because it is outside the approved
  default stack and adds operations work.
- Supabase Edge Functions for app logic: rejected because the MVP app logic fits
  within Next.js server execution.
