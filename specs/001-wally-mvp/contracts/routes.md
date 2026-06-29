# Route Contract: Wally App MVP

This contract defines user-visible routes, access rules, and expected page
states. All visible copy, loading states, empty states, validation messages, and
errors are Spanish-only.

## Public and Auth Routes

### `GET /`

- **Access**: Public.
- **Purpose**: Entry point. Authenticated users may be directed toward
  reservation or admin workflows according to role.
- **States**: loading, authenticated redirect, unauthenticated welcome/sign-in
  prompt.

### `GET /iniciar-sesion`

- **Access**: Public.
- **Purpose**: Spanish sign-in screen.
- **States**: loading, validation error, authentication error.

### `GET /registrarse`

- **Access**: Public.
- **Purpose**: Spanish Player account creation/onboarding.
- **States**: loading, validation error, authentication error.

## Player Routes

### `GET /reservar`

- **Access**: Authenticated Player, Venue Administrator, or Wally Administrator.
- **Purpose**: Browse courts, dates, and available slots; create a reservation.
- **Required data**: active courts, active supported sport, generated time slots,
  unavailable slot reasons when useful.
- **States**: loading availability, no courts, no available slots, conflict
  after submit, reservation created.

### `GET /reservas`

- **Access**: Authenticated user. Players see own reservations; administrators
  may use admin routes for broader views.
- **Purpose**: List upcoming reservations and payment status.
- **States**: loading, no upcoming reservations, list, error.

### `GET /reservas/[reservationId]`

- **Access**: Reservation owner, permitted Venue Administrator, or Wally
  Administrator.
- **Purpose**: Reservation detail with payment information and allowed
  cancellation action.
- **States**: loading, not found, forbidden, cancellation blocked, cancellation
  completed.

## Admin Routes

### `GET /admin/canchas`

- **Access**: Venue Administrator or Wally Administrator.
- **Purpose**: Manage courts and supported sports.
- **States**: loading, empty list, validation errors, saved changes.

### `GET /admin/horarios`

- **Access**: Venue Administrator or Wally Administrator.
- **Purpose**: Manage recurring schedule rules and cancellation cutoff rules.
- **States**: loading, no schedule rules, validation errors, saved changes.

### `GET /admin/disponibilidad`

- **Access**: Venue Administrator or Wally Administrator.
- **Purpose**: Manage closures, blocked slots, and special availability.
- **States**: loading, no overrides, validation errors, saved changes.

### `GET /admin/reservas`

- **Access**: Venue Administrator or Wally Administrator.
- **Purpose**: Search, filter, inspect, cancel, or adjust reservations within
  permitted scope.
- **States**: loading, no reservations, filtered empty state, forbidden,
  cancellation confirmation, audit history display.

### `GET /admin/pagos`

- **Access**: Venue Administrator or Wally Administrator.
- **Purpose**: Review payment current status and history; perform permitted
  manual payment status adjustments.
- **States**: loading, no payment history, filtered empty state, validation
  error, saved status change.

## Future Module Placeholder

### `GET /torneos`

- **Access**: Public or authenticated; no role-specific management UI.
- **Purpose**: Spanish `Próximamente` placeholder.
- **Required content**: mention future support for team registration, fixtures,
  standings, and results.
- **Forbidden content**: tournament creation, editing, registration, fixtures,
  standings, results management, rankings, or admin tournament tools.

## API Route

### `POST /api/pagos/eventos`

- **Access**: Server-to-server or controlled internal source.
- **Purpose**: Receive idempotent payment status events.
- **Request body**:
  - `source`: payment event source name.
  - `sourceEventId`: unique event id from source.
  - `reservationId`: target reservation id.
  - `status`: one of `PENDING`, `PAID`, `FAILED`, `REFUNDED`.
  - `reason`: optional Spanish/admin-readable reason.
  - `occurredAt`: event timestamp.
- **Responses**:
  - `200`: event processed or duplicate safely ignored.
  - `400`: invalid payload.
  - `401`: source not authorized.
  - `404`: reservation not found.
  - `409`: event conflicts with reservation/payment rules.
- **Side effects**: creates `PaymentEvent`, updates `Reservation.paymentStatus`
  when valid, creates `Payment`, and writes `AuditRecord` in one transaction.
