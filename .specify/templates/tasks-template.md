---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL unless the
feature touches reservation state changes, payment behavior, access control,
audit records, responsive layout, Spanish-first UX, or regression-prone domain
rules; those areas require automated or documented validation by the constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Next.js web app**: `app/`, `components/`, `lib/`, `prisma/`, `tests/`
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize TypeScript/Next.js project with Tailwind CSS dependencies
- [ ] T003 [P] Configure linting, formatting, and type-checking tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management
- [ ] T010 Define Prisma models/migrations for courts, sports, schedules, prices, reservations, payments, and audits
- [ ] T011 Define audit-safe logging for reservation and payment operations
- [ ] T012 Define shared access-control checks for customer and admin roles
- [ ] T013 Define Spanish-first UI copy conventions and responsive 320px layout baseline

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (REQUIRED if constitutional domains are touched) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].[ts]
- [ ] T015 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].[ts]
- [ ] T016 [P] [US1] Reservation conflict/payment/access-control test in tests/integration/test_[name].[ts]
- [ ] T017 [P] [US1] Responsive 320px and Spanish copy validation for [screen/flow]

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create/update Prisma model for [Entity1] in prisma/schema.prisma
- [ ] T019 [P] [US1] Create [UI component/page] in app/[route]/page.tsx or components/[name].tsx
- [ ] T020 [US1] Implement [service/action] in lib/[domain]/[service].ts
- [ ] T021 [US1] Implement [endpoint/server action/feature] in app/[route]/[file].ts
- [ ] T022 [US1] Add validation and error handling with Spanish user-facing messages
- [ ] T023 [US1] Add audit records for reservation/payment changes

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (REQUIRED if constitutional domains are touched) ⚠️

- [ ] T024 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].[ts]
- [ ] T025 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].[ts]
- [ ] T026 [P] [US2] Reservation conflict/payment/access-control test in tests/integration/test_[name].[ts]
- [ ] T027 [P] [US2] Responsive 320px and Spanish copy validation for [screen/flow]

### Implementation for User Story 2

- [ ] T028 [P] [US2] Create/update Prisma model for [Entity] in prisma/schema.prisma
- [ ] T029 [US2] Implement [service/action] in lib/[domain]/[service].ts
- [ ] T030 [US2] Implement [endpoint/server action/feature] in app/[route]/[file].ts
- [ ] T031 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (REQUIRED if constitutional domains are touched) ⚠️

- [ ] T032 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].[ts]
- [ ] T033 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].[ts]
- [ ] T034 [P] [US3] Reservation conflict/payment/access-control test in tests/integration/test_[name].[ts]
- [ ] T035 [P] [US3] Responsive 320px and Spanish copy validation for [screen/flow]

### Implementation for User Story 3

- [ ] T036 [P] [US3] Create/update Prisma model for [Entity] in prisma/schema.prisma
- [ ] T037 [US3] Implement [service/action] in lib/[domain]/[service].ts
- [ ] T038 [US3] Implement [endpoint/server action/feature] in app/[route]/[file].ts

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Verify reservation/payment audit evidence avoids sensitive data exposure
- [ ] TXXX Verify Spanish-first UX and 320px responsive layout for affected screens
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Required tests MUST be written and FAIL before implementation
- Reservation, payment, audit, access-control, and regression-prone domain tests are required
- Spanish-first UX and 320px responsive behavior require automated or documented validation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
