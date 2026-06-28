<!--
Sync Impact Report
Version change: 1.1.0 -> 1.2.0
Modified principles:
- I. Spanish-First Responsive Experience -> I. Spanish-Only Mobile-First Experience
- II. Reservation Integrity -> II. Reservation Integrity
- III. Payment and Audit Safety -> III. Payment and Audit Safety
- IV. Role-Based Operations -> IV. Role-Based Operations
- V. Preferred Stack and Performance -> V. Preferred Stack, Design System, and Performance
Added sections:
- MVP Scope and Future Modules
Removed sections:
- None
Templates requiring updates:
- Updated: .specify/templates/plan-template.md
- Updated: .specify/templates/spec-template.md
- Updated: .specify/templates/tasks-template.md
- Updated: .specify/templates/checklist-template.md
- Reviewed: .specify/templates/commands/*.md (not present)
Runtime guidance requiring updates:
- Updated: README.md
- Reviewed: AGENTS.md (already points agents to the current plan)
Follow-up TODOs:
- None
-->

# Wally App Constitution

## Core Principles

### I. Spanish-Only Mobile-First Experience
All customer-facing and administrator-facing interfaces MUST be written in
Spanish for the MVP. Loading states, empty states, validation messages,
confirmations, and error states MUST be Spanish. English UI, internationalization
(i18n), locale infrastructure, and language switching MUST NOT be implemented
during the MVP.

Every user-facing flow MUST be mobile-first, responsive from 320px width through
tablet and desktop layouts, touch-friendly, readable, and free of horizontal
scrolling. Navigation MUST be clear and focused on reservations, payments,
availability management, reservation management, and the future Torneos module.

Rationale: Wally serves a local sports center audience and must be usable on the
phones customers carry when checking availability or managing reservations.

### II. Reservation Integrity
The system MUST prevent double-booking across the two Wally App courts for every
supported sport: wally, ráquetbol, and fútbol 2. Reservation features MUST preserve
a single source of truth for court availability, define reservation states, and
handle concurrent attempts, cancellations, expirations, and failed confirmations.
Availability, schedule rules, and price rules MUST be tied to the correct court,
sport, local date, and La Paz time.

Rationale: A reservation platform fails its core promise if two customers can
book the same court for the same time window.

### III. Payment and Audit Safety
Reservation and payment features MUST keep payment status consistent with
reservation status. Charges, refunds, failed payments, manual adjustments, and
reservation changes MUST be auditable with actor, timestamp, before/after state,
and reason where applicable. Payment operations MUST be idempotent for retryable
requests and MUST define reconciliation behavior before implementation.

Rationale: Payments and reservation changes affect customer trust, operator
accounting, and dispute resolution.

### IV. Role-Based Operations
The MVP MUST implement only basic role-based access for Player, Venue
Administrator, and Wally Administrator roles. Players MUST be able to browse
availability, reserve a court, pay, and view their reservations. Venue
Administrators MUST be able to manage court availability and reservations for
their venue operations. Wally Administrators MUST be able to perform platform
administration and, in future tournament releases, create and manage tournaments.

Features MUST define the permitted actions and visible data for each role before
implementation, and MUST avoid exposing personal, reservation, payment, or audit
data beyond the role's need. Any new role or materially expanded permission set
requires an explicit feature specification and constitution compliance review.

Rationale: Admin workflows need broad operational control while customer
workflows need focused self-service with clear privacy boundaries.

### V. Preferred Stack, Design System, and Performance
New application work MUST default to Next.js, TypeScript, Tailwind CSS,
PostgreSQL through Supabase, and Prisma unless a feature plan documents a
specific exception. UI work MUST use a consistent Tailwind CSS design system
instead of one-off styling. Pages that support availability browsing,
reservation, payment, and administrator operations MUST be optimized for fast
initial loads and responsive interaction. Authentication MUST be secure,
session-aware, and integrated with role checks for protected routes and server
actions.

Rationale: A consistent stack lowers implementation risk, and the product's
critical flows need predictable performance and security.

## MVP Scope and Future Modules

The MVP scope is intentionally small and limited to production-ready workflows
for court reservations, reservation payments, court availability management,
reservation management, and basic role-based access for Player, Venue
Administrator, and Wally Administrator. Feature work MUST prioritize complete,
validated reservation and payment workflows over partially implemented adjacent
features.

The main navigation MAY include a `Torneos` section during the MVP. If present,
it MUST display a Spanish `Próximamente` placeholder page only. Tournament
creation, tournament management, brackets, standings, registrations, payments,
and administrative tournament tooling are explicitly out of scope for the MVP.
When tournaments are implemented in a future release, only Wally Administrators
MUST be able to create and manage tournaments initially.

## Product Scope and Venue Rules

Wally App is a reservation and payment platform for a sports center in La Paz,
Bolivia. The product manages exactly two courts unless a future amendment or
feature specification expands that scope. The supported sports are wally,
racket, and fútbol 2.

Every feature that touches reservations, schedules, or pricing MUST specify:
- Which court or courts are affected.
- Which sport or sports are supported.
- The booking duration, time granularity, local timezone, and availability
  boundaries.
- The price source and any sport-specific, court-specific, or schedule-specific
  pricing behavior.
- The Player, Venue Administrator, and Wally Administrator behavior for
  cancellations, changes, no-shows, and payment failures when applicable.

## Technology and Quality Constraints

The preferred implementation stack is Next.js, TypeScript, Tailwind CSS,
Supabase PostgreSQL, and Prisma. Feature plans MUST use this stack by default
and record a Complexity Tracking entry for any deviation.

Feature plans MUST define:
- Responsive behavior from 320px through desktop widths.
- Spanish-only UX requirements for customer and administrator screens, including
  loading, empty, and error states.
- Authentication and authorization requirements for all protected operations.
- Audit records for every reservation change and payment state change.
- Tailwind CSS design system usage for new or changed UI.
- Performance expectations for availability browsing, reservation creation,
  payment confirmation, availability management, and reservation management
  workflows.

## Delivery Workflow

Work MUST proceed through specification, planning, task generation, and
implementation artifacts in `specs/[###-feature-name]/`. Specs MUST prioritize
independently testable Player, Venue Administrator, and Wally Administrator
journeys with acceptance scenarios. Plans MUST pass the Constitution Check
before research and again after design. Tasks MUST be grouped by independently
deliverable user story and MUST include explicit validation tasks for every
principle touched by the story.

Before a feature is considered complete, its quickstart or equivalent validation
path MUST demonstrate the highest-priority user journey. Reservation,
payment, authentication, authorization, audit, responsive layout, and
Spanish-only UX changes MUST have automated or documented evidence. MVP work
MUST avoid partial implementations of out-of-scope features.

## Governance

This constitution supersedes conflicting project guidance for feature
specification, planning, implementation, and review. Amendments MUST update this
file, include a Sync Impact Report, and propagate changes to dependent Spec Kit
templates and runtime guidance in the same change.

Versioning follows semantic versioning:
- MAJOR for removed principles or incompatible redefinition of existing
  governance.
- MINOR for new principles, new mandatory sections, or materially expanded
  compliance requirements.
- PATCH for clarifications, wording fixes, and non-semantic refinements.

Every plan and review MUST verify compliance with the Core Principles. Any
approved exception MUST be recorded in the plan's Complexity Tracking section
with the principle affected, reason, and rejected simpler alternative.

**Version**: 1.2.0 | **Ratified**: 2026-06-27 | **Last Amended**: 2026-06-28
