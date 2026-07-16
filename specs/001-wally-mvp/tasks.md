# Tasks: Wally App MVP

**Input**: Design documents from `/specs/001-wally-mvp/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Required for this feature because it touches reservation state changes, payment behavior, access control, audit records, responsive layout, Spanish-only UX, and Torneos placeholder behavior.

**Organization**: Tasks are grouped by setup/foundational work and then by user story so each story can be implemented and tested as an independent increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in the same phase because it touches different files and has no dependency on incomplete tasks
- **[Story]**: User story label from `spec.md`; only user story phases include this label
- Every task includes an exact file path

## Path Conventions

- Next.js App Router source: `app/`
- Shared UI: `components/`
- shadcn/ui primitives: `components/ui/`
- Domain actions/data/auth/time/validation: `lib/`
- Database schema and seed: `prisma/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Deployment/configuration: repository root config files and `vercel.json`

## Phase 1: Project Setup

**Purpose**: Scaffold the Next.js TypeScript application and shared project tooling.

- [X] T001 Initialize the Next.js TypeScript project metadata and scripts in `package.json`
- [X] T002 Add TypeScript compiler settings for the App Router project in `tsconfig.json`
- [X] T003 Add Next.js runtime configuration in `next.config.ts`
- [X] T004 Add Tailwind CSS and PostCSS configuration in `tailwind.config.ts` and `postcss.config.mjs`
- [X] T005 Create global Spanish-first Tailwind app styles, design tokens, and responsive base rules in `app/globals.css`
- [X] T006 Create the root App Router layout shell in `app/layout.tsx`
- [X] T007 Create the authenticated-aware home route placeholder in `app/page.tsx`
- [X] T008 Create the planned source directory structure with placeholder index files in `components/ui/index.ts`, `components/navigation/index.ts`, `components/reservations/index.ts`, `components/payments/index.ts`, `components/admin/index.ts`, `components/states/index.ts`, `lib/actions/index.ts`, `lib/auth/index.ts`, `lib/data/index.ts`, `lib/validation/index.ts`, and `lib/time/index.ts`
- [X] T009 Configure ESLint for TypeScript and Next.js rules in `eslint.config.mjs`
- [X] T010 Configure Vitest for unit and integration tests in `vitest.config.ts`
- [X] T011 Configure Playwright projects for 320px, 375px, 768px, and desktop viewports in `playwright.config.ts`
- [X] T012 Add local environment variable documentation without secrets in `.env.example`
- [X] T013 Add a Spanish-only UI guard note and MVP constraints to `README.md`
- [ ] T128 Add shadcn/ui configuration for Tailwind aliases and component generation in `components.json`
- [ ] T129 Add lucide-react and required shadcn/ui package dependencies to `package.json`
- [ ] T130 Create initial shadcn/ui primitives for `button`, `card`, `input`, `label`, `select`, `badge`, `tabs`, `dialog`, `sheet`, `table`, `skeleton`, and `alert` in `components/ui/`
- [ ] T131 Create shared utility helpers for class merging and UI variants in `lib/utils.ts`
- [ ] T132 Document the professional mobile-first UI direction, no-Figma constraint, and no-i18n constraint in `README.md`

## Phase 2: Supabase and Prisma Setup

**Purpose**: Establish Supabase PostgreSQL, Prisma schema, migrations, seed data, and data access foundations.

- [ ] T014 Add Prisma datasource and generator configuration in `prisma/schema.prisma`
- [ ] T015 Define `UserRole`, `ReservationStatus`, `PaymentStatus`, and `AuditEntityType` enums in `prisma/schema.prisma`
- [ ] T016 Define `Venue` and `UserProfile` models with role and venue-scope constraints in `prisma/schema.prisma`
- [ ] T017 Define `Court`, `Sport`, and `CourtSport` models with active flags and uniqueness constraints in `prisma/schema.prisma`
- [ ] T018 Define `ScheduleRule` and `AvailabilityOverride` models with local date/time fields in `prisma/schema.prisma`
- [ ] T019 Define `Reservation` with UTC instants, La Paz local fields, status, payment status, cancellation fields, and indexes in `prisma/schema.prisma`
- [ ] T020 Define `Payment`, `PaymentEvent`, and `AuditRecord` models with idempotency and audit fields in `prisma/schema.prisma`
- [ ] T021 Add PostgreSQL overlap protection for active reservation court time windows in `prisma/migrations/001_reservation_overlap_guard/migration.sql`
- [ ] T022 Add the Prisma client singleton in `lib/data/prisma.ts`
- [ ] T023 Add Supabase browser and server client helpers in `lib/auth/supabase.ts`
- [ ] T024 Add environment validation for Supabase, Prisma, and Vercel variables in `lib/validation/env.ts`
- [ ] T025 Add an environment check script in `scripts/env-check.ts`
- [ ] T026 Add MVP seed data for one venue, two courts, wally sport, court-sport assignments, schedules, and admin profiles in `prisma/seed.ts`
- [ ] T027 Add database setup scripts for generate, migrate, and seed commands in `package.json`

## Phase 3: Auth and Roles

**Purpose**: Implement session loading and role-based authorization before feature work begins.

- [ ] T028 Create session loading helpers for server components and server actions in `lib/auth/session.ts`
- [ ] T029 Create role and venue-scope authorization helpers in `lib/auth/authorization.ts`
- [ ] T030 Create protected-route middleware for authenticated and admin routes in `middleware.ts`
- [ ] T031 Create Spanish sign-in page UI in `app/(auth)/iniciar-sesion/page.tsx`
- [ ] T032 Create Spanish registration page UI for Player onboarding in `app/(auth)/registrarse/page.tsx`
- [ ] T033 Create auth server actions for sign-in, sign-up, and sign-out in `lib/actions/auth.ts`
- [ ] T034 Create user profile data access helpers in `lib/data/user-profiles.ts`
- [ ] T035 Add unit tests for role authorization decisions in `tests/unit/auth/authorization.test.ts`
- [ ] T036 Add integration tests for protected route access by role in `tests/integration/auth/protected-routes.test.ts`

## Phase 4: Court and Availability Data Model

**Purpose**: Implement court, schedule, availability, time, and audit foundations shared by reservation and admin stories.

- [ ] T037 Create La Paz date/time conversion helpers in `lib/time/la-paz.ts`
- [ ] T038 Create schedule slot generation logic from `ScheduleRule` records in `lib/data/schedules.ts`
- [ ] T039 Create availability override application logic in `lib/data/availability.ts`
- [ ] T040 Create court and sport data access helpers in `lib/data/courts.ts`
- [ ] T041 Create audit record append helper in `lib/data/audit.ts`
- [ ] T042 Create validation schemas for courts, schedules, availability, and time slots in `lib/validation/admin.ts`
- [ ] T043 Add unit tests for La Paz time conversion in `tests/unit/time/la-paz.test.ts`
- [ ] T044 Add unit tests for schedule slot generation in `tests/unit/availability/schedules.test.ts`
- [ ] T045 Add unit tests for availability overrides in `tests/unit/availability/overrides.test.ts`
- [ ] T046 Add integration tests for court/sport active filtering in `tests/integration/availability/courts.test.ts`

## Phase 5: User Story 1 - Reserve a Court (Priority: P1) 🎯 MVP

**Goal**: Players can browse courts and slots, create a reservation, and see it as upcoming with payment status `Pending`.

**Independent Test**: A Player signs in, opens `/reservar` at 320px, selects an available slot, creates a reservation, sees it in `/reservas`, and the same slot is unavailable afterward.

### Tests for User Story 1

- [ ] T047 [P] [US1] Add integration tests for available slot listing in `tests/integration/reservations/list-available-slots.test.ts`
- [ ] T048 [P] [US1] Add integration tests for reservation creation and conflict rejection in `tests/integration/reservations/create-reservation.test.ts`
- [ ] T049 [P] [US1] Add integration tests for Player upcoming reservation scoping in `tests/integration/reservations/player-reservations.test.ts`
- [ ] T050 [P] [US1] Add Playwright test for the Player browse-to-reservation journey at 320px in `tests/e2e/player-reservation.spec.ts`

### Implementation for User Story 1

- [ ] T051 [US1] Create reservation validation schemas for create and cancel inputs in `lib/validation/reservations.ts`
- [ ] T052 [US1] Implement available slot query service with schedule, override, and active reservation filtering in `lib/data/reservations.ts`
- [ ] T053 [US1] Implement transactional reservation creation with conflict protection and audit write in `lib/data/reservations.ts`
- [ ] T054 [US1] Implement Player upcoming reservation query with payment status in `lib/data/reservations.ts`
- [ ] T055 [US1] Implement `createReservationAction` and `cancelReservationAction` server action shells in `lib/actions/reservations.ts`
- [ ] T056 [P] [US1] Create reusable court selector and date selector components in `components/reservations/CourtDateSelector.tsx`
- [ ] T057 [P] [US1] Create reusable available slot picker component in `components/reservations/SlotPicker.tsx`
- [ ] T058 [P] [US1] Create card-based reservation component using shadcn/ui Card, Button, and Spanish payment status badge in `components/reservations/ReservationCard.tsx`
- [ ] T133 [P] [US1] Create mobile-first court card component with clear Spanish primary action in `components/reservations/CourtCard.tsx`
- [ ] T139 [P] [US1] Create prominent modern sports-style Torneos `Próximamente` home card with neon green placeholder CTA and no tournament logic in `components/reservations/HomeTorneosCard.tsx`
- [ ] T059 [US1] Create `/reservar` Player page with Spanish loading, empty, conflict, and success states in `app/(player)/reservar/page.tsx`
- [ ] T060 [US1] Create `/reservas` Player upcoming reservations page with Spanish empty state in `app/(player)/reservas/page.tsx`
- [ ] T061 [US1] Create `/reservas/[reservationId]` Player reservation detail page with cancellation affordance in `app/(player)/reservas/[reservationId]/page.tsx`
- [ ] T062 [US1] Wire reservation navigation entries into the shared navigation in `components/navigation/AppNavigation.tsx`

## Phase 6: User Story 2 - Review Reservation Payments (Priority: P2)

**Goal**: Players and administrators can view reservation payment status and payment history using the four supported states.

**Independent Test**: A reservation detail page shows one Spanish payment status label, and an authorized administrator can review status history for the same reservation.

### Tests for User Story 2

- [ ] T063 [P] [US2] Add unit tests for payment status transitions and Spanish labels in `tests/unit/payments/payment-status.test.ts`
- [ ] T064 [P] [US2] Add integration tests for idempotent payment event handling in `tests/integration/payments/payment-events.test.ts`
- [ ] T065 [P] [US2] Add integration tests for admin payment history scoping in `tests/integration/payments/admin-payment-history.test.ts`
- [ ] T066 [P] [US2] Add Playwright test for Player payment status visibility in `tests/e2e/player-payment-status.spec.ts`

### Implementation for User Story 2

- [ ] T067 [US2] Create payment validation schemas for status updates and events in `lib/validation/payments.ts`
- [ ] T068 [US2] Implement payment status label and style mapping in `components/payments/payment-status.ts`
- [ ] T069 [US2] Implement payment history and current status data access in `lib/data/payments.ts`
- [ ] T070 [US2] Implement transactional payment status update with reservation sync and audit write in `lib/data/payments.ts`
- [ ] T071 [US2] Implement idempotent payment event processing in `lib/data/payments.ts`
- [ ] T072 [US2] Implement `adminUpdatePaymentStatusAction` in `lib/actions/payments.ts`
- [ ] T073 [US2] Implement `POST /api/pagos/eventos` route handler in `app/api/pagos/eventos/route.ts`
- [ ] T074 [P] [US2] Create payment status badge component with consistent shadcn/ui Badge variants for `Pendiente`, `Pagado`, `Fallido`, and `Reembolsado` in `components/payments/PaymentStatusBadge.tsx`
- [ ] T075 [P] [US2] Create payment history list component in `components/payments/PaymentHistoryList.tsx`
- [ ] T076 [US2] Add payment status and history display to reservation detail page in `app/(player)/reservas/[reservationId]/page.tsx`

## Phase 7: User Story 3 - Manage Reservations and Availability (Priority: P3)

**Goal**: Venue Administrators and Wally Administrators can manage courts, schedules, availability, reservations, and payment history within their permitted scope.

**Independent Test**: A Venue Administrator blocks a slot, verifies Players cannot reserve it, reviews reservations and payment history, and can only access permitted venue data.

### Tests for User Story 3

- [ ] T077 [P] [US3] Add integration tests for admin court management authorization in `tests/integration/admin/courts.test.ts`
- [ ] T078 [P] [US3] Add integration tests for admin schedule and availability changes in `tests/integration/admin/availability.test.ts`
- [ ] T079 [P] [US3] Add integration tests for admin reservation cancellation with required audit reason in `tests/integration/admin/reservations.test.ts`
- [ ] T080 [P] [US3] Add Playwright test for Venue Administrator availability blocking at 320px in `tests/e2e/admin-availability.spec.ts`
- [ ] T081 [P] [US3] Add Playwright test for Wally Administrator global admin access in `tests/e2e/wally-admin.spec.ts`

### Implementation for User Story 3

- [ ] T082 [US3] Implement court create/update admin data access with audit writes in `lib/data/courts.ts`
- [ ] T083 [US3] Implement schedule rule create/update admin data access with audit writes in `lib/data/schedules.ts`
- [ ] T084 [US3] Implement availability override create/update admin data access with audit writes in `lib/data/availability.ts`
- [ ] T085 [US3] Implement admin reservation search, filter, detail, and cancellation data access in `lib/data/admin-reservations.ts`
- [ ] T086 [US3] Implement admin server actions for courts, schedules, availability, and reservation cancellation in `lib/actions/admin.ts`
- [ ] T087 [P] [US3] Create admin page shell and filter components using shadcn/ui Tabs, Sheet, Button, and form controls in `components/admin/AdminShell.tsx` and `components/admin/AdminFilters.tsx`
- [ ] T088 [P] [US3] Create court management form component using consistent shadcn/ui inputs, selects, dialogs, and buttons in `components/admin/CourtForm.tsx`
- [ ] T089 [P] [US3] Create schedule rule form component using consistent shadcn/ui inputs, selects, dialogs, and buttons in `components/admin/ScheduleRuleForm.tsx`
- [ ] T090 [P] [US3] Create availability override form component using consistent shadcn/ui inputs, selects, dialogs, and buttons in `components/admin/AvailabilityOverrideForm.tsx`
- [ ] T091 [P] [US3] Create admin reservation list and detail components with desktop tables and mobile cards in `components/admin/AdminReservationList.tsx` and `components/admin/AdminReservationDetail.tsx`
- [ ] T092 [P] [US3] Create admin payment history review component with desktop table, mobile cards, filters, and Spanish payment badges in `components/admin/AdminPaymentHistory.tsx`
- [ ] T134 [P] [US3] Create reusable responsive admin table/card pattern for desktop tables and mobile cards in `components/admin/ResponsiveAdminList.tsx`
- [ ] T093 [US3] Create court management page in `app/admin/canchas/page.tsx`
- [ ] T094 [US3] Create schedule management page in `app/admin/horarios/page.tsx`
- [ ] T095 [US3] Create availability management page in `app/admin/disponibilidad/page.tsx`
- [ ] T096 [US3] Create reservation management page in `app/admin/reservas/page.tsx`
- [ ] T097 [US3] Create payment history admin page in `app/admin/pagos/page.tsx`
- [ ] T098 [US3] Add admin navigation entries gated by role in `components/navigation/AppNavigation.tsx`

## Phase 8: User Story 4 - Access Future Tournaments Placeholder (Priority: P4)

**Goal**: Users can open `Torneos` and see only a Spanish `Próximamente` placeholder for future tournament capabilities.

**Independent Test**: Opening `/torneos` from navigation displays Spanish placeholder copy for future team registration, fixtures, standings, and results with no tournament actions or data model.

### Tests for User Story 4

- [ ] T099 [P] [US4] Add Playwright test for the Torneos placeholder content and absence of tournament controls in `tests/e2e/torneos-placeholder.spec.ts`
- [ ] T140 [P] [US4] Add Playwright test that the home or main availability dashboard shows the Torneos `Próximamente` card at 320px before navigation in `tests/e2e/home-torneos-card.spec.ts`
- [ ] T100 [P] [US4] Add static guard test that no tournament models, actions, or admin routes exist in `tests/unit/scope/no-tournament-functionality.test.ts`

### Implementation for User Story 4

- [ ] T101 [US4] Create the polished Spanish Torneos `Próximamente` page using shared shadcn/ui layout patterns and no tournament actions in `app/torneos/page.tsx`
- [ ] T102 [US4] Add the Torneos navigation item without admin tournament controls in `components/navigation/AppNavigation.tsx`
- [ ] T103 [US4] Add shared placeholder copy constants for Torneos in `components/navigation/torneos-copy.ts`
- [ ] T141 [US4] Reuse Torneos placeholder copy in the home card and ensure CTA text remains non-functional placeholder copy in `components/reservations/HomeTorneosCard.tsx`

## Phase 9: Responsive Spanish-Only Validation

**Purpose**: Enforce global UI/UX constraints across implemented stories.

- [ ] T104 Add Playwright Spanish-only text guard for primary routes in `tests/e2e/spanish-only.spec.ts`
- [ ] T105 Add Playwright no-language-switcher guard for primary routes in `tests/e2e/no-language-switcher.spec.ts`
- [ ] T106 Add Playwright no-horizontal-scroll checks for Player routes at 320px in `tests/e2e/player-responsive.spec.ts`
- [ ] T107 Add Playwright no-horizontal-scroll checks for admin routes at 320px in `tests/e2e/admin-responsive.spec.ts`
- [ ] T108 Add touch-target and form usability checks for key actions in `tests/e2e/touch-friendly.spec.ts`
- [ ] T109 Review loading, empty, validation, authorization, and error states for Spanish copy in `components/states/StateMessage.tsx`
- [ ] T135 Add Playwright checks that admin lists render as tables on desktop and cards on 320px mobile in `tests/e2e/admin-responsive-lists.spec.ts`
- [ ] T136 Add Playwright checks for consistent Spanish payment badge labels and visibility in Player and admin routes in `tests/e2e/payment-badges.spec.ts`
- [ ] T137 Create shared Spanish state components for loading, empty, error, conflict, authorization, and success states in `components/states/StateMessage.tsx`

## Phase 10: Tests

**Purpose**: Consolidate automated test coverage and make the suite runnable in CI.

- [ ] T110 Add test data factories for users, courts, schedules, reservations, payments, and audits in `tests/factories/domain.ts`
- [ ] T111 Add database test setup and teardown helpers in `tests/integration/setup-db.ts`
- [ ] T112 Add Playwright authentication fixtures for Player, Venue Administrator, and Wally Administrator in `tests/e2e/fixtures/auth.ts`
- [ ] T113 Add CI test scripts for typecheck, lint, unit, integration, and e2e suites in `package.json`
- [ ] T114 Add GitHub Actions workflow for checks in `.github/workflows/ci.yml`
- [ ] T115 Add quickstart validation smoke test entry point in `tests/e2e/quickstart-smoke.spec.ts`

## Phase 11: Deployment

**Purpose**: Prepare Vercel deployment and production validation.

- [ ] T116 Add Vercel build and region configuration in `vercel.json`
- [ ] T117 Add production environment variable checklist in `docs/deployment.md`
- [ ] T118 Add Prisma migration deployment command documentation in `docs/deployment.md`
- [ ] T119 Add Supabase Auth callback URL deployment notes in `docs/deployment.md`
- [ ] T120 Add production seed and initial Wally Administrator setup notes in `docs/deployment.md`
- [ ] T121 Add preview deployment smoke checklist linked to quickstart scenarios in `docs/deployment.md`

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and full-scope validation after all user stories are implemented.

- [ ] T122 Verify all quickstart scenarios are reflected in automated or documented validation in `specs/001-wally-mvp/quickstart.md`
- [ ] T123 Verify reservation and payment audit records avoid sensitive data exposure in `lib/data/audit.ts`
- [ ] T124 Verify all user-visible copy remains Spanish-only and no i18n files exist in `app/`, `components/`, and `lib/`
- [ ] T125 Verify Torneos remains placeholder-only with no tournament model, migration, action, or admin route in `prisma/schema.prisma`, `lib/actions/`, and `app/admin/`
- [ ] T126 Run lint, typecheck, unit, integration, and e2e commands and record results in `specs/001-wally-mvp/validation-results.md`
- [ ] T127 Update implementation notes and known MVP limitations in `README.md`
- [ ] T138 Verify no Figma files, design imports, i18n setup, locale routing, or language switcher were added in `app/`, `components/`, `lib/`, and repository root configuration files

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Project Setup**: Starts immediately.
- **Phase 2: Supabase and Prisma Setup**: Depends on Phase 1.
- **Phase 3: Auth and Roles**: Depends on Phase 1 and the `UserProfile` model from Phase 2.
- **Phase 4: Court and Availability Data Model**: Depends on Phase 2.
- **Phase 5: User Story 1**: Depends on Phases 2, 3, and 4.
- **Phase 6: User Story 2**: Depends on Phases 2, 3, and User Story 1 reservation detail surfaces.
- **Phase 7: User Story 3**: Depends on Phases 2, 3, 4, and shared payment/audit helpers.
- **Phase 8: User Story 4**: Can start after Phase 1 and navigation shell from User Story 1; must not add tournament data or admin functionality.
- **Phase 9: Responsive Spanish-Only Validation**: Depends on implemented Player, admin, and Torneos routes.
- **Phase 10: Tests**: Builds on test tasks from all story phases and can mature as stories land.
- **Phase 11: Deployment**: Depends on app setup, migrations, env validation, and smoke tests.
- **Phase 12: Polish**: Depends on all desired stories and validation phases.

### User Story Dependencies

- **US1 Reserve a Court (P1)**: First independently useful MVP slice after foundations.
- **US2 Review Reservation Payments (P2)**: Builds on reservations but can be validated independently through reservation detail and admin payment history.
- **US3 Manage Reservations and Availability (P3)**: Builds on court, availability, reservation, role, payment, and audit foundations.
- **US4 Access Future Tournaments Placeholder (P4)**: Independent UI placeholder after project/navigation setup; explicitly excludes real tournament functionality.

### Within Each User Story

- Write story tests before implementation tasks where listed.
- Implement validation schemas before server actions.
- Implement data access before pages that consume it.
- Implement server actions before forms that submit to them.
- Keep each story independently runnable and demonstrable before moving to the next priority.

## Parallel Opportunities

- Phase 1 config tasks T002-T005 and UI setup tasks T128-T132 can run in
  parallel after T001.
- Phase 2 model tasks T015-T020 can be drafted in parallel before migration generation.
- Phase 3 auth pages T031-T032 can run in parallel with auth helper tests T035-T036 after T028-T030.
- Phase 4 time, schedule, availability, court, and audit helpers T037-T041 can run in parallel.
- US1 component tasks T056-T058 and T133 can run in parallel with service work
  T052-T054 after schemas T051.
- US2 component tasks T074-T075 can run in parallel with payment data work T069-T071.
- US3 admin component tasks T087-T092 and T134 can run in parallel after admin
  contracts and validations are established.
- US4 tasks T101-T103 can run in parallel after shared navigation conventions exist.
- Phase 9 Playwright validation tasks T104-T108 and T135-T137 can run in
  parallel once routes exist.
- Phase 11 deployment documentation tasks T117-T121 can run in parallel after environment names are settled.

## Parallel Example: User Story 1

```bash
Task: "T047 [P] [US1] Add integration tests for available slot listing in tests/integration/reservations/list-available-slots.test.ts"
Task: "T048 [P] [US1] Add integration tests for reservation creation and conflict rejection in tests/integration/reservations/create-reservation.test.ts"
Task: "T056 [P] [US1] Create reusable court selector and date selector components in components/reservations/CourtDateSelector.tsx"
Task: "T057 [P] [US1] Create reusable available slot picker component in components/reservations/SlotPicker.tsx"
Task: "T133 [P] [US1] Create mobile-first court card component with clear Spanish primary action in components/reservations/CourtCard.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T063 [P] [US2] Add unit tests for payment status transitions and Spanish labels in tests/unit/payments/payment-status.test.ts"
Task: "T064 [P] [US2] Add integration tests for idempotent payment event handling in tests/integration/payments/payment-events.test.ts"
Task: "T074 [P] [US2] Create payment status badge component in components/payments/PaymentStatusBadge.tsx"
Task: "T075 [P] [US2] Create payment history list component in components/payments/PaymentHistoryList.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T077 [P] [US3] Add integration tests for admin court management authorization in tests/integration/admin/courts.test.ts"
Task: "T078 [P] [US3] Add integration tests for admin schedule and availability changes in tests/integration/admin/availability.test.ts"
Task: "T088 [P] [US3] Create court management form component in components/admin/CourtForm.tsx"
Task: "T090 [P] [US3] Create availability override form component in components/admin/AvailabilityOverrideForm.tsx"
Task: "T134 [P] [US3] Create reusable responsive admin table/card pattern for desktop tables and mobile cards in components/admin/ResponsiveAdminList.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "T099 [P] [US4] Add Playwright test for the Torneos placeholder content and absence of tournament controls in tests/e2e/torneos-placeholder.spec.ts"
Task: "T100 [P] [US4] Add static guard test that no tournament models, actions, or admin routes exist in tests/unit/scope/no-tournament-functionality.test.ts"
Task: "T101 [US4] Create the polished Spanish Torneos Próximamente page using shared shadcn/ui layout patterns and no tournament actions in app/torneos/page.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 through Phase 4.
2. Complete Phase 5 / US1 Reserve a Court.
3. Validate Player browse-to-reservation flow at 320px with Spanish-only UI.
4. Stop and review before adding payment/admin depth.

### Incremental Delivery

1. US1: Player can reserve a court and see the reservation with `Pending` payment status.
2. US2: Payment status and history are visible and auditable.
3. US3: Venue and Wally administrators can manage courts, availability, reservations, and payments.
4. US4: Torneos placeholder appears with no real tournament functionality.
5. Responsive, Spanish-only, test, and deployment phases harden the MVP for release.

### Team Strategy

After Phase 4, split by story and layer:

- Developer A: US1 reservation workflow and Player UI.
- Developer B: US2 payment status/history and audit workflow.
- Developer C: US3 admin operations.
- Developer D: US4 placeholder plus responsive Spanish-only validation.

## Notes

- Do not implement tournament creation, team registration, fixtures, standings, results, rankings, or tournament admin tools.
- Do not add i18n, translation frameworks, locale route segments, language switching, or English UI.
- Do not use Figma or make design files a dependency for MVP delivery.
- Use Tailwind CSS, shadcn/ui components, and lucide-react icons for the selected modern sports-app UI: dark navy/black surfaces, neon green primary actions, strong cards, sports-oriented icons, and professional spacing.
- Preserve mobile-first layouts from 320px with no horizontal scrolling.
- Show Torneos as a visible `Próximamente` card on the home/main availability screen, not only in navigation.
- Use desktop tables and mobile cards for admin list views.
- Every reservation and payment state change must write an audit record.
- Every protected operation must validate session and role on the server.
