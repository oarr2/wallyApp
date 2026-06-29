# Server Action Contract: Wally App MVP

All server actions validate the current session, enforce role authorization,
validate input, return Spanish user-visible messages, and create audit records
for reservation, payment, court, schedule, and availability changes.

## `createReservationAction`

- **Actor**: Player, Venue Administrator, or Wally Administrator acting within
  permitted scope.
- **Input**:
  - `courtId`
  - `sportId`
  - `localDate`
  - `startLocalTime`
  - `endLocalTime`
- **Success**: Creates `Reservation` with status `CONFIRMED` and payment status
  `PENDING`; returns reservation id and Spanish success message.
- **Failures**:
  - Slot no longer available.
  - Court or sport inactive.
  - Invalid time window.
  - User not authenticated or not authorized.

## `cancelReservationAction`

- **Actor**: Player cancelling own reservation.
- **Input**:
  - `reservationId`
  - optional `reason`
- **Success**: Changes reservation status to `CANCELLED`, releases the slot
  according to venue rules, writes audit record.
- **Failures**:
  - Reservation not found.
  - Reservation does not belong to Player.
  - Cancellation cutoff has passed.
  - Reservation already cancelled.

## `adminCancelReservationAction`

- **Actor**: Venue Administrator within venue scope or Wally Administrator.
- **Input**:
  - `reservationId`
  - required `reason`
- **Success**: Cancels reservation and writes before/after audit record.
- **Failures**:
  - Missing reason.
  - Reservation outside admin scope.
  - Reservation already terminal.

## `adminUpdatePaymentStatusAction`

- **Actor**: Venue Administrator within venue scope or Wally Administrator.
- **Input**:
  - `reservationId`
  - `status`: `PENDING`, `PAID`, `FAILED`, or `REFUNDED`
  - required `reason`
  - optional `amount`
  - optional `currency`
- **Success**: Creates payment history record, updates reservation current
  payment status, writes audit record.
- **Failures**:
  - Invalid status.
  - Missing reason.
  - Reservation outside admin scope.

## `updateCourtAction`

- **Actor**: Venue Administrator within venue scope or Wally Administrator.
- **Input**:
  - `courtId` optional for create.
  - `name`
  - `description` optional.
  - `isActive`
  - active sport ids.
- **Success**: Creates or updates court and supported sports, writes audit
  record.
- **Failures**:
  - Duplicate name within venue.
  - Missing active sport assignment.
  - Actor outside scope.

## `updateScheduleRuleAction`

- **Actor**: Venue Administrator within venue scope or Wally Administrator.
- **Input**:
  - `scheduleRuleId` optional for create.
  - `courtId`
  - `dayOfWeek`
  - `startLocalTime`
  - `endLocalTime`
  - `slotMinutes`
  - `cancellationCutoffMinutes`
  - `isActive`
- **Success**: Creates or updates schedule rule and writes audit record.
- **Failures**:
  - Invalid time window.
  - Slot minutes invalid.
  - Overlapping active schedule rule.
  - Actor outside scope.

## `updateAvailabilityOverrideAction`

- **Actor**: Venue Administrator within venue scope or Wally Administrator.
- **Input**:
  - `availabilityOverrideId` optional for create.
  - `courtId`
  - `localDate`
  - `type`: `BLOCKED`, `CLOSED_DAY`, or `OPEN_EXTRA`
  - `startLocalTime` optional for `CLOSED_DAY`, required otherwise.
  - `endLocalTime` optional for `CLOSED_DAY`, required otherwise.
  - `reason` optional.
- **Success**: Creates or updates date-specific availability and writes audit
  record.
- **Failures**:
  - Invalid date/time combination.
  - Missing time window for partial-day override.
  - Actor outside scope.
