# Quickstart: Wally App MVP Validation

This guide validates the implementation plan end-to-end after tasks are
implemented. It is intentionally focused on observable behavior, not source code.

## Prerequisites

- Node.js 20 LTS.
- Supabase project with PostgreSQL and Auth enabled.
- Vercel project for preview/production deployment.
- Environment variables configured for Supabase, Prisma, and auth callbacks.
- Seed data available for one venue, two courts, wally sport, default schedules,
  one Player, one Venue Administrator, and one Wally Administrator.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Validate environment:

   ```bash
   npm run env:check
   ```

3. Apply database migrations:

   ```bash
   npx prisma migrate deploy
   ```

4. Seed MVP data:

   ```bash
   npm run db:seed
   ```

5. Start the local app:

   ```bash
   npm run dev
   ```

## Automated Validation

Run the full validation suite:

```bash
npm run test
npm run test:e2e
```

Expected result:

- Unit and integration tests pass.
- E2E tests pass at 320px, 375px, 768px, and desktop widths.
- No primary page has horizontal scrolling.
- No English UI, language switcher, locale route, or i18n behavior appears.

## Manual Validation Scenarios

### Player reservation flow

1. Sign in as a Player.
2. Open `/reservar`.
3. Select an active court, date, and available time slot.
4. Confirm the reservation.
5. Open `/reservas`.

Expected result:

- All UI copy is Spanish.
- The reservation appears as upcoming.
- Payment status is shown as `Pendiente`.
- The same slot is no longer offered as available.

### Reservation conflict

1. In one session, reserve a slot as a Player.
2. In another session, attempt to reserve the same court and time slot.

Expected result:

- The second attempt is blocked.
- A Spanish conflict/error message asks the user to choose another slot.
- No duplicate active reservation exists for the same court and time window.

### Player cancellation

1. Sign in as a Player with an upcoming reservation inside the allowed
   cancellation window.
2. Open reservation details.
3. Cancel the reservation.

Expected result:

- The reservation changes to cancelled.
- The UI explains the result in Spanish.
- An audit record exists for the cancellation.

### Cancellation blocked by venue rules

1. Sign in as a Player with an upcoming reservation outside the allowed
   cancellation window.
2. Attempt cancellation.

Expected result:

- Cancellation is blocked.
- The user sees a Spanish explanation of the venue rule.
- Reservation status remains active.

### Venue Administrator operations

1. Sign in as a Venue Administrator.
2. Open `/admin/disponibilidad`.
3. Block a future time window for one court.
4. Open `/reservar` as a Player.

Expected result:

- The blocked time window is unavailable to Players.
- The availability change is recorded in audit history.
- Admin pages remain usable at 320px with no horizontal scrolling.

### Payment history review

1. Sign in as a Venue Administrator.
2. Open `/admin/pagos`.
3. Select a reservation.
4. Change payment status with a reason, or process a valid payment event.

Expected result:

- Payment status changes to one of `Pendiente`, `Pagado`, `Fallido`, or
  `Reembolsado`.
- Payment history shows the change.
- Reservation detail shows the current payment status.
- Audit history includes before/after status and actor/source.

### Wally Administrator global access

1. Sign in as a Wally Administrator.
2. Open admin pages for courts, schedules, availability, reservations, and
   payments.

Expected result:

- Global admin operations are available.
- Protected reservation and payment data is visible only through authorized admin
  views.

### Torneos placeholder

1. Open `/torneos` from navigation.

Expected result:

- The page displays Spanish `Próximamente` content.
- It mentions future team registration, fixtures, standings, and results.
- No tournament creation, team registration, fixtures, standings, results,
  rankings, or admin tournament controls are present.

## Deployment Validation

1. Push to a branch and open the Vercel preview deployment.
2. Confirm environment variables are present in the preview environment.
3. Run migrations against the intended Supabase database.
4. Run smoke tests against the preview URL.
5. Promote to production only after reservation, payment, admin, audit,
   responsive, and Torneos placeholder checks pass.

Expected result:

- Vercel preview and production builds complete successfully.
- Auth callbacks work in the deployed environment.
- Prisma migrations match Supabase PostgreSQL schema.
- The deployed app preserves Spanish-only, mobile-first MVP behavior.
