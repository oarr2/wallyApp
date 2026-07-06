# Feature Specification: Wally App MVP

**Feature Branch**: `main`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Create the functional specification for the Wally App MVP. Wally is a mobile-first application for reserving wally courts and managing reservation payments. The MVP must focus on reservation and payment workflows while preparing the product for future tournament management."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reserve a Court (Priority: P1)

As a Player, I want to browse available courts and time slots, create a reservation,
and see the reservation with its payment status so I can secure a court time.

**Why this priority**: Court reservation is the primary customer value of the
MVP. Without it, payment and administration workflows have no useful object to
manage.

**Independent Test**: A Player can open the app on a 320px-wide screen, view
available slots, choose one, create a reservation, and see it listed as an
upcoming reservation with payment status `Pending`.

**Acceptance Scenarios**:

1. **Given** at least one court has available time slots, **When** a Player
   selects a valid slot and confirms a reservation, **Then** the reservation is
   created, appears in upcoming reservations, and has payment status `Pending`.
2. **Given** another Player has already reserved a slot, **When** a Player views
   availability, **Then** the reserved slot is not offered as available.
3. **Given** no slots are available for a selected date, **When** a Player opens
   the availability view, **Then** the app displays a Spanish empty state that
   explains no times are available.
4. **Given** a Player browses courts or reservations on a mobile screen,
   **When** they scan the page, **Then** court and reservation information is
   presented in clean card-based views with clear primary actions, Spanish copy,
   consistent spacing, and payment status badges where relevant.

---

### User Story 2 - Review Reservation Payments (Priority: P2)

As a Player, I want to view payment information for each reservation so I know
whether my reservation is pending, paid, failed, or refunded.

**Why this priority**: Reservation trust depends on clear payment status. Players
must understand whether action is required and administrators must have a reliable
payment history to resolve issues.

**Independent Test**: A reservation can be inspected by a Player and shows exactly
one payment status from the supported states with Spanish labels and clear
fallback messaging for failed or refunded payments.

**Acceptance Scenarios**:

1. **Given** a reservation has a `Paid` payment status, **When** the Player views
   reservation details, **Then** the app displays Spanish payment information
   confirming the reservation is paid.
2. **Given** a reservation has a `Failed` payment status, **When** the Player
   views reservation details, **Then** the app displays a Spanish error state or
   message that indicates payment failed.
3. **Given** an administrator reviews payment history, **When** they filter or
   inspect reservations, **Then** they can see payment status history for each
   reservation they are permitted to manage.
4. **Given** a payment status is shown in a list, detail view, or admin review,
   **When** the user reads it, **Then** the app displays a consistent Spanish
   badge treatment for `Pendiente`, `Pagado`, `Fallido`, or `Reembolsado`.

---

### User Story 3 - Manage Reservations and Availability (Priority: P3)

As a Venue Administrator, I want to manage courts, schedules, availability, and
reservations so venue operations stay accurate and customers see correct booking
options.

**Why this priority**: The venue needs operational control to prevent incorrect
availability, handle cancellations, and manage reservation issues.

**Independent Test**: A Venue Administrator can update availability for a court,
review reservations, and cancel or adjust reservations according to venue rules
without exposing unavailable actions to Players.

**Acceptance Scenarios**:

1. **Given** a court has a schedule for a date, **When** a Venue Administrator
   changes availability, **Then** Players see the updated slot availability before
   creating reservations.
2. **Given** an upcoming reservation exists, **When** a Venue Administrator opens
   reservation management, **Then** they can view the reservation, its payment
   status, and permitted management actions.
3. **Given** a Player cancels within allowed venue rules, **When** the
   cancellation is confirmed, **Then** the reservation no longer appears as active
   and the affected slot follows the venue's availability rules.
4. **Given** a Venue Administrator opens an admin list on desktop, **When** they
   review courts, reservations, availability, or payments, **Then** the app uses
   readable tables with filters and clear actions.
5. **Given** a Venue Administrator opens the same admin views on mobile, **When**
   they review the same information, **Then** the app uses stacked cards instead
   of cramped tables or horizontal scrolling.

---

### User Story 4 - Access Future Tournaments Placeholder (Priority: P4)

As any user, I want to open `Torneos` from navigation and see what is coming
later so the app can introduce future tournament management without shipping
unfinished tournament features.

**Why this priority**: The MVP must prepare the product for tournaments while
keeping delivery focused on reservations and payments.

**Independent Test**: Opening `Torneos` displays only a Spanish `Próximamente`
screen that mentions future team registration, fixtures, standings, and results,
with no tournament creation or management actions.

**Acceptance Scenarios**:

1. **Given** a user opens the main navigation, **When** they select `Torneos`,
   **Then** they see a Spanish `Próximamente` screen.
2. **Given** the `Torneos` screen is visible, **When** the user reads the page,
   **Then** it explains that future releases will support team registration,
   fixtures, standings, and results.
3. **Given** a Wally Administrator opens `Torneos`, **When** they view the page,
   **Then** no tournament creation, editing, registration, fixtures, standings,
   results, or rankings management controls are available.
4. **Given** any user opens `Torneos`, **When** the page renders, **Then** it
   appears as a polished Spanish `Próximamente` screen using the shared mobile
   first UI system and no functional tournament forms, tables, or actions.

### Edge Cases

- A Player attempts to reserve a slot that became unavailable after they loaded
  the availability view; the system rejects the reservation and displays a
  Spanish error message asking the Player to choose another slot.
- A Player attempts to cancel a reservation outside the venue's cancellation
  rules; the system blocks cancellation and explains the rule in Spanish.
- A reservation payment changes from `Pending` to `Paid`, `Failed`, or
  `Refunded`; reservation details and administrator history display the current
  payment status consistently.
- A payment status is unavailable due to a temporary issue; the system displays a
  Spanish loading or error state without hiding the reservation itself.
- A Venue Administrator attempts to manage a reservation or court outside their
  permitted venue scope; the system blocks the action and avoids exposing
  protected reservation or payment details.
- A Wally Administrator accesses administrative views; global management actions
  are available for courts, schedules, reservations, and payment review.
- The app is viewed at 320px width; all primary flows remain usable with
  touch-friendly controls and no horizontal scrolling.
- A desktop admin table is viewed on a phone-sized screen; the system switches to
  readable Spanish cards rather than requiring horizontal scroll.
- A court, reservation, or payment list is loading, empty, or unavailable; the
  system displays a professional Spanish state with a clear next action when one
  is available.
- There are no upcoming reservations for a Player; the app displays a Spanish
  empty state.
- `Torneos` is opened during MVP; only the placeholder content is shown, and no
  tournament workflow can be started.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow Players to browse reservable courts.
- **FR-002**: The system MUST allow Players to browse available time slots for a
  selected court and date.
- **FR-003**: The system MUST allow Players to create reservations for available
  time slots.
- **FR-004**: The system MUST prevent two active reservations from using the same
  court and time slot.
- **FR-005**: The system MUST allow Players to view their upcoming reservations.
- **FR-006**: The system MUST allow Players to cancel upcoming reservations when
  cancellation is permitted by venue rules.
- **FR-007**: The system MUST display a Spanish explanation when cancellation is
  blocked by venue rules.
- **FR-008**: Every reservation MUST have exactly one current payment status:
  `Pending`, `Paid`, `Failed`, or `Refunded`.
- **FR-009**: The system MUST allow Players to view payment information for their
  reservations.
- **FR-010**: The system MUST allow administrators to review payment history for
  reservations they are permitted to access.
- **FR-011**: The system MUST allow Venue Administrators to manage courts.
- **FR-012**: The system MUST allow Venue Administrators to manage court
  schedules.
- **FR-013**: The system MUST allow Venue Administrators to manage court
  availability.
- **FR-014**: The system MUST allow Venue Administrators to manage reservations.
- **FR-015**: The system MUST grant Wally Administrators global permissions for
  courts, schedules, reservations, court availability, and payment history.
- **FR-016**: The system MUST define permitted actions and visible data for
  Player, Venue Administrator, and Wally Administrator roles.
- **FR-017**: The system MUST present all customer-facing and
  administrator-facing interface text in Spanish.
- **FR-018**: The system MUST NOT include a language switcher,
  internationalization settings, or English UI during the MVP.
- **FR-019**: The system MUST support mobile-first use from 320px width through
  larger screens with touch-friendly controls and no horizontal scrolling.
- **FR-020**: The system MUST provide Spanish loading, empty, and error states
  for reservation, payment, administration, and Torneos views.
- **FR-021**: The system MUST include a `Torneos` navigation item.
- **FR-022**: The `Torneos` page MUST display a Spanish `Próximamente` screen
  during the MVP.
- **FR-023**: The `Torneos` page MUST explain that future releases will support
  team registration, fixtures, standings, and results.
- **FR-024**: The system MUST NOT provide tournament creation, team registration,
  fixtures, standings, results management, player rankings, push notifications,
  multi-language support, or marketplace features in the MVP.
- **FR-025**: Reservation changes and payment status changes MUST be visible in
  administrative review with actor, timestamp, before/after status, and reason
  when a reason is applicable.
- **FR-026**: The system MUST display only reservations, payments, and protected
  data that the current user's role is permitted to view.
- **FR-027**: The system MUST show clear navigation focused on reservations,
  payments, administration, and the future Torneos module.
- **FR-028**: The MVP UI MUST use Tailwind CSS for styling, shadcn/ui components
  for shared UI primitives, and lucide-react icons for recognizable actions and
  navigation.
- **FR-029**: The UI MUST follow a clean sports booking direction that is
  professional, simple, mobile-first from 320px, and Spanish-only.
- **FR-030**: The UI MUST use consistent spacing, cards, buttons, forms, badges,
  tabs, dialogs, sheets, and tables across Player and administrator views.
- **FR-031**: Player court browsing, slot selection, upcoming reservations, and
  reservation detail views MUST use card-based layouts with clear primary
  actions.
- **FR-032**: Administrator list views MUST use readable tables on desktop and
  card-based layouts on mobile without horizontal scrolling.
- **FR-033**: Payment status MUST be represented with consistent Spanish badges
  in reservation cards, reservation detail, admin reservation views, and payment
  history.
- **FR-034**: The system MUST provide polished Spanish loading, empty, and error
  states for courts, reservations, payments, admin views, and Torneos.
- **FR-035**: The MVP MUST NOT use Figma as a source of truth or delivery
  dependency for UI implementation.

### Key Entities *(include if feature involves data)*

- **Court**: A reservable wally court with schedule, availability, and
  reservation relationships.
- **Time Slot**: A bookable period for a court on a specific local date.
- **Reservation**: A Player booking for a court and time slot with lifecycle
  status, payment status, and cancellation eligibility.
- **Payment**: Payment information tied to a reservation, with current status and
  reviewable history.
- **Schedule**: Venue-defined operating times and availability rules for courts.
- **Role**: Permission boundary for Player, Venue Administrator, and Wally
  Administrator.
- **Audit Record**: Reviewable record of reservation or payment state changes,
  including actor, timestamp, before/after status, and reason when applicable.
- **Tournament Placeholder**: Spanish `Próximamente` page reached from `Torneos`
  navigation during the MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of test Players can find an available slot, create a
  reservation, and view it in upcoming reservations without assistance.
- **SC-002**: A Player can complete the browse-to-reservation flow in under 3
  minutes during usability testing.
- **SC-003**: 100% of active reservations display one of the four supported
  payment statuses: `Pending`, `Paid`, `Failed`, or `Refunded`.
- **SC-004**: 100% of unavailable or already-reserved time slots are blocked from
  new reservation creation during conflict testing.
- **SC-005**: Venue Administrators can update court availability and see the
  changed availability reflected for Players in the same validation session.
- **SC-006**: 100% of customer-facing and administrator-facing MVP screens use
  Spanish copy, including loading, empty, and error states.
- **SC-007**: All primary MVP screens are usable at 320px width with no horizontal
  scrolling in validation.
- **SC-008**: The `Torneos` navigation item opens a Spanish `Próximamente` screen
  and exposes zero tournament management actions.
- **SC-009**: Payment history for a reservation can be reviewed by an authorized
  administrator in under 1 minute during acceptance testing.
- **SC-010**: Primary Player and administrator screens use the shared Tailwind
  and shadcn/ui component direction consistently in UI review.
- **SC-011**: Admin reservation and payment lists are readable as tables on
  desktop and as cards on 320px mobile screens with no horizontal scrolling.
- **SC-012**: All payment statuses render with the approved Spanish badge labels
  and distinguishable visual treatments wherever they appear.

## Assumptions

- Players reserve courts for themselves and can view only their own reservations
  and payment information.
- Venue Administrators manage venue operations for Wally App courts, including
  courts, schedules, availability, reservations, and payment review.
- Wally Administrators have global MVP administration permissions across courts,
  schedules, reservations, availability, and payment history.
- Venue cancellation rules exist or will be defined during planning; the MVP must
  enforce and explain those rules in Spanish.
- Payment collection or reconciliation details may be handled by a later plan,
  but the MVP must consistently store and show reservation payment status and
  history.
- Tournament management remains out of scope for the MVP; `Torneos` is only a
  placeholder entry point for future releases.
- Push notifications, marketplace behavior, player rankings, multi-language
  support, and English UI are excluded from MVP scope.
- UI implementation will be code-driven with Tailwind CSS, shadcn/ui, and
  lucide-react; no Figma handoff or i18n infrastructure is required for MVP.
