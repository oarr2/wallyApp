# Data Model: Wally App MVP

## Enums

### UserRole

- `PLAYER`
- `VENUE_ADMIN`
- `WALLY_ADMIN`

### ReservationStatus

- `CONFIRMED`: active reservation occupying a court time window.
- `CANCELLED`: reservation cancelled by Player, Venue Administrator, or Wally
  Administrator.
- `EXPIRED`: optional terminal state for reservations that expire before payment
  if the implementation enforces payment deadlines.

### PaymentStatus

- `PENDING`
- `PAID`
- `FAILED`
- `REFUNDED`

### AuditEntityType

- `USER_PROFILE`
- `COURT`
- `SPORT`
- `SCHEDULE_RULE`
- `AVAILABILITY_OVERRIDE`
- `RESERVATION`
- `PAYMENT`

## Entity: UserProfile

**Purpose**: App-owned authorization and display profile for a Supabase Auth user.

**Fields**:

- `id`: UUID primary key.
- `authUserId`: UUID, unique, references Supabase Auth user id.
- `role`: `UserRole`.
- `venueId`: UUID nullable; required for `VENUE_ADMIN`.
- `displayName`: string.
- `phone`: string nullable.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

**Relationships**:

- May belong to one `Venue`.
- Has many created `Reservation` records as Player.
- Appears as actor in `AuditRecord`.

**Validation rules**:

- `VENUE_ADMIN` must have `venueId`.
- `WALLY_ADMIN` has global scope and does not require venue scope.
- A user has exactly one MVP role.

## Entity: Venue

**Purpose**: Administrative container for Wally App courts.

**Fields**:

- `id`: UUID primary key.
- `name`: string.
- `timezone`: string, default `America/La_Paz`.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

**Relationships**:

- Has many `Court`.
- Has many scoped `UserProfile` venue administrators.

## Entity: Court

**Purpose**: Reservable court managed by the venue.

**Fields**:

- `id`: UUID primary key.
- `venueId`: UUID.
- `name`: string.
- `description`: string nullable.
- `isActive`: boolean.
- `displayOrder`: integer.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

**Relationships**:

- Belongs to `Venue`.
- Has many `CourtSport`.
- Has many `ScheduleRule`.
- Has many `AvailabilityOverride`.
- Has many `Reservation`.

**Validation rules**:

- MVP seed data creates exactly two active courts unless a later amendment
  expands scope.
- Inactive courts are hidden from Player availability browsing.

## Entity: Sport

**Purpose**: Sport supported by one or more courts.

**Fields**:

- `id`: UUID primary key.
- `code`: string unique, e.g. `wally`.
- `name`: string for Spanish display.
- `isActive`: boolean.

**Relationships**:

- Has many `CourtSport`.
- Has many `Reservation`.

**Validation rules**:

- MVP reservation flow exposes `wally`.
- Schema remains compatible with constitution-supported court sports.

## Entity: CourtSport

**Purpose**: Join table for sports supported by a court.

**Fields**:

- `courtId`: UUID.
- `sportId`: UUID.
- `isActive`: boolean.

**Relationships**:

- Belongs to `Court`.
- Belongs to `Sport`.

**Validation rules**:

- Unique by `courtId` and `sportId`.
- Reservations can only use active court-sport combinations.

## Entity: ScheduleRule

**Purpose**: Recurring operating windows and cancellation rules.

**Fields**:

- `id`: UUID primary key.
- `courtId`: UUID.
- `dayOfWeek`: integer 0-6.
- `startLocalTime`: time.
- `endLocalTime`: time.
- `slotMinutes`: integer.
- `cancellationCutoffMinutes`: integer.
- `isActive`: boolean.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

**Relationships**:

- Belongs to `Court`.

**Validation rules**:

- `startLocalTime` must be before `endLocalTime`.
- `slotMinutes` must divide the operating window or the final partial slot is
  not generated.
- Active rules cannot produce overlapping generated slots for the same court.

## Entity: AvailabilityOverride

**Purpose**: Date-specific availability adjustments.

**Fields**:

- `id`: UUID primary key.
- `courtId`: UUID.
- `localDate`: date.
- `startLocalTime`: time nullable.
- `endLocalTime`: time nullable.
- `type`: `BLOCKED`, `CLOSED_DAY`, or `OPEN_EXTRA`.
- `reason`: string nullable.
- `createdByUserId`: UUID.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

**Relationships**:

- Belongs to `Court`.
- Created by `UserProfile`.

**Validation rules**:

- `CLOSED_DAY` applies to the whole local date and does not require start/end.
- `BLOCKED` and `OPEN_EXTRA` require start/end.
- Overrides must be represented in Player availability before reservation
  creation.

## Entity: Reservation

**Purpose**: Player booking for a court time window.

**Fields**:

- `id`: UUID primary key.
- `playerId`: UUID.
- `courtId`: UUID.
- `sportId`: UUID.
- `localDate`: date.
- `startAtUtc`: timestamp.
- `endAtUtc`: timestamp.
- `startLocalTime`: time.
- `endLocalTime`: time.
- `status`: `ReservationStatus`.
- `paymentStatus`: `PaymentStatus`.
- `cancelledAt`: timestamp nullable.
- `cancelledByUserId`: UUID nullable.
- `cancellationReason`: string nullable.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

**Relationships**:

- Belongs to Player `UserProfile`.
- Belongs to `Court`.
- Belongs to `Sport`.
- Has many `Payment`.
- Has many `AuditRecord`.

**Validation rules**:

- `startAtUtc` must be before `endAtUtc`.
- Active reservations cannot overlap for the same court.
- Reservation court and sport must be an active `CourtSport` combination.
- Player cancellation must satisfy `ScheduleRule.cancellationCutoffMinutes`.

**State transitions**:

- Create: none -> `CONFIRMED` with `PENDING`.
- Player cancel: `CONFIRMED` -> `CANCELLED` when venue rules allow.
- Admin cancel: `CONFIRMED` -> `CANCELLED` with reason.
- Optional expiry: `CONFIRMED` -> `EXPIRED` only if payment deadline behavior is
  implemented in scope.

## Entity: Payment

**Purpose**: Payment status history and manual or event-driven payment records.

**Fields**:

- `id`: UUID primary key.
- `reservationId`: UUID.
- `status`: `PaymentStatus`.
- `amount`: decimal nullable.
- `currency`: string default `BOB`.
- `source`: `MANUAL`, `EVENT`, or `SYSTEM`.
- `sourceReference`: string nullable.
- `reason`: string nullable.
- `createdByUserId`: UUID nullable.
- `createdAt`: timestamp.

**Relationships**:

- Belongs to `Reservation`.
- May be created by `UserProfile`.

**Validation rules**:

- Status must be one of `PENDING`, `PAID`, `FAILED`, or `REFUNDED`.
- Payment status changes update `Reservation.paymentStatus` in the same
  transaction.
- Manual admin changes require authorized Venue Administrator or Wally
  Administrator.

## Entity: PaymentEvent

**Purpose**: Idempotency ledger for payment status events.

**Fields**:

- `id`: UUID primary key.
- `source`: string.
- `sourceEventId`: string.
- `reservationId`: UUID nullable.
- `receivedAt`: timestamp.
- `processedAt`: timestamp nullable.
- `status`: string, e.g. `RECEIVED`, `PROCESSED`, `IGNORED`, `FAILED`.
- `payloadSummary`: JSON.

**Relationships**:

- Optionally belongs to `Reservation`.

**Validation rules**:

- Unique by `source` and `sourceEventId`.
- Duplicate events must not create duplicate payment history entries.

## Entity: AuditRecord

**Purpose**: Append-only evidence for important state changes.

**Fields**:

- `id`: UUID primary key.
- `entityType`: `AuditEntityType`.
- `entityId`: UUID.
- `action`: string.
- `actorUserId`: UUID nullable.
- `actorRole`: `UserRole` nullable.
- `source`: string, e.g. `USER`, `PAYMENT_EVENT`, `SYSTEM`.
- `beforeState`: JSON nullable.
- `afterState`: JSON nullable.
- `reason`: string nullable.
- `requestId`: string nullable.
- `createdAt`: timestamp.

**Relationships**:

- Actor optionally references `UserProfile`.

**Validation rules**:

- Audit records are append-only.
- Reservation and payment changes must include before and after state.
- Reasons are required for admin cancellation and manual payment adjustment.

## Availability Query Model

Availability is derived from:

1. Active `Court`.
2. Active `CourtSport`.
3. Active `ScheduleRule` for the selected local date.
4. `AvailabilityOverride` records for the selected local date.
5. Active reservations occupying generated slots.

Generated slots are display-only until reservation creation. The transaction that
creates a reservation repeats validation before writing.
