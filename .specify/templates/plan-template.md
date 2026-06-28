# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [TypeScript version or NEEDS CLARIFICATION]

**Primary Dependencies**: [Next.js, Tailwind CSS, Prisma, Supabase client or NEEDS CLARIFICATION]

**Storage**: [PostgreSQL via Supabase, Prisma schema/migrations, or N/A]

**Testing**: [e.g., Vitest, Playwright, Next.js testing approach, or NEEDS CLARIFICATION]

**Target Platform**: [Responsive web from 320px through desktop or NEEDS CLARIFICATION]

**Project Type**: [Next.js web application or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Reservation Integrity**: If this feature creates, changes, cancels, lists,
  or validates reservations, the plan identifies the court, sport, time window
  rules, La Paz timezone handling, reservation states, and concurrency behavior.
- **Payment and Audit Safety**: If this feature touches charges, refunds, payment
  failures, retries, or adjustments, the plan defines idempotency, reconciliation,
  reservation status impact, and audit records for all state changes.
- **Spanish-Only Mobile-First Experience**: The plan defines Spanish
  customer-facing and administrator-facing copy, loading/empty/error states,
  responsive behavior from 320px through desktop widths, touch-friendly controls,
  and no horizontal scrolling. It does not add i18n, language switching, or
  English UI for MVP work.
- **Role-Based Operations**: The plan identifies Player, Venue Administrator,
  and Wally Administrator permissions, protected routes/actions, and limits
  exposed reservation, personal, payment, and audit data.
- **MVP Scope and Future Modules**: The plan stays within court reservations,
  reservation payments, court availability management, reservation management,
  and basic role-based access. If navigation includes Torneos, the plan limits
  it to a Spanish Próximamente placeholder and excludes tournament management.
- **Preferred Stack, Design System, and Performance**: The plan uses Next.js,
  TypeScript, Tailwind CSS, Supabase PostgreSQL, and Prisma by default, applies
  the shared Tailwind CSS design system, and justifies deviations, new
  infrastructure, external services, background jobs, or broad abstractions in
  Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
