# Implementation Plan: GitHub Actions CI/CD Workflow

**Feature**: `001-have-github-actions` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-have-github-actions/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md agent file
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Create a GitHub Actions CI/CD workflow that automates validation of code changes pushed to the main branch. The workflow will execute build verification and run unit tests and end-to-end tests in parallel, displaying a comprehensive summary of all validation results. The system prioritizes developer productivity through parallel execution, dependency caching, and clear failure reporting.

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow syntax), Node.js v22+
**Primary Dependencies**: GitHub Actions standard actions (actions/checkout, actions/setup-node, actions/upload-artifact), existing Makefile commands
**Storage**: GitHub Actions artifact storage (3-day retention for build outputs, test reports)
**Testing**: No additional testing framework required (workflow validates existing tests)
**Target Platform**: GitHub Actions runners (Ubuntu latest recommended)
**Project Type**: Single project (frontend React application with build + test infrastructure)
**Performance Goals**: Workflow completion in <5 minutes through parallel job execution and npm dependency caching
**Constraints**: Triggered only on push to main branch, Playwright browsers must be installed for e2e tests
**Scale/Scope**: Single repository with ~10-20 workflow runs per day, single workflow file managing 4 jobs

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Constitutional Compliance

- [x] **Principle I: Test-Driven Development** - The workflow enforces existing TDD practices by running all tests and failing on test failures. No TDD violation.
- [x] **Principle II: Test Pyramid Philosophy** - The workflow runs both component tests (Vitest) and E2E tests (Playwright) as required. No violation.
- [x] **Principle III: Deterministic Testing** - The workflow runs existing deterministic tests in CI mode. No violation.
- [x] **Principle IV: Code Quality & Type Safety** - The workflow runs build step which includes TypeScript compilation and linting via Makefile. No violation.
- [x] **Principle V: Spec-Driven Development** - This feature follows spec-driven development (spec.md created first). No violation.
- [x] **Principle VI: Modern React Best Practices** - No impact on React patterns. No violation.
- [x] **Principle VII: Network Isolation in Tests** - Existing tests maintain network isolation; workflow doesn't change this. No violation.

### CI/CD Constitutional Requirements

Per constitution section "CI/CD Requirements":

- [x] Run full test suite on every commit (fulfilled by workflow trigger on main branch push)
- [x] Use `make ci.test` for CI-specific test runs (implemented in unit test job)
- [x] Playwright configured with `forbidOnly` in CI (already configured in playwright.config.ts)
- [x] Retry failed tests 2x in CI (already configured in playwright.config.ts)
- [x] Use single worker in CI (already configured in playwright.config.ts)

**Status**: PASS - No constitutional violations. All principles and CI/CD requirements satisfied.

## Project Structure

### Documentation (this feature)

```
specs/001-have-github-actions/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   └── workflow.yml     # GitHub Actions workflow file contract
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
.github/
└── workflows/
    └── ci.yml           # Main CI/CD workflow file (NEW)

src/                      # Existing React application
├── components/
├── pages/
├── test/
└── lib/

e2e/                      # Existing Playwright E2E tests
tests/                    # N/A (using src/ colocated tests)

Makefile                  # Existing build automation
package.json              # Existing dependencies
vitest.config.ts          # Existing Vitest config
playwright.config.ts      # Existing Playwright config
```

**Structure Decision**: Single project structure (React frontend). The feature adds a new `.github/workflows/` directory to the repository root containing the CI/CD workflow YAML file. No changes to existing source structure.

## Phase 0: Outline & Research

### Research Tasks

Since all technical details were clarified in the spec, Phase 0 research focuses on GitHub Actions best practices and workflow optimization patterns:

1. **GitHub Actions Workflow Syntax**:
   - Research: GitHub Actions YAML structure, job dependencies, matrix strategies
   - Rationale: Ensure workflow follows GitHub Actions conventions and best practices

2. **Workflow Performance Optimization**:
   - Research: Dependency caching strategies, parallel job execution patterns
   - Rationale: Minimize workflow execution time as required by NFR-001

3. **Workflow Summary Features**:
   - Research: GitHub Actions job summaries, step outputs, status checks
   - Rationale: Implement clear summary reporting as required by FR-006 and NFR-002

### Research Output

**Output**: `research.md` with sections:

- GitHub Actions workflow structure and job orchestration patterns
- NPM dependency caching with actions/setup-node
- GitHub Actions summary markdown syntax and status reporting
- Artifact upload/retention configuration
- Conditional job execution and failure handling

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

### 1. Data Model

Extract entities from spec → `data-model.md`:

**Workflow Run**:

- Trigger: push event to main branch
- Contains: 4 jobs (build, test-unit, test-e2e, summary)
- Status: success/failure based on critical job outcomes
- Lifecycle: triggered → jobs execute → summary generated

**Build Job**:

- Inputs: source code, dependencies
- Outputs: dist/ artifacts
- Status: success/failure
- Duration target: <2 minutes

**Unit Test Job**:

- Inputs: source code, dependencies
- Outputs: test results
- Status: success/failure
- Depends on: build job success
- Duration target: <2 minutes

**E2E Test Job**:

- Inputs: source code, dependencies, Playwright browsers
- Outputs: test reports, screenshots on failure
- Status: success/failure
- Runs in parallel with: unit test job
- Duration target: <3 minutes

**Workflow Summary**:

- Inputs: all job statuses
- Outputs: markdown summary in GitHub Actions UI
- Always runs: even if previous jobs fail

### 2. API Contracts

For CI/CD workflows, "contracts" are the workflow file structure and job interfaces:

**Workflow Contract** (`contracts/workflow.yml`):

```yaml
# Contract: GitHub Actions Workflow Structure
name: CI/CD Pipeline
on:
  push:
    branches: [main]

jobs:
  build:
    outputs: [build-status]

  test-unit:
    needs: [build]
    outputs: [test-results]

  test-e2e:
    needs: [build]
    outputs: [test-results]

  summary:
    needs: [build, test-unit, test-e2e]
    if: always()
```

**Job Interface Contracts**:

- All jobs must use Node.js v22+
- All jobs must cache npm dependencies
- Build job must produce `dist/` artifacts
- Test jobs must upload failure artifacts
- Summary job must display all job statuses

### 3. Contract Tests

For workflows, "contract tests" verify the workflow file structure and behavior. These will be validation scripts:

**Workflow Structure Test** (`e2e/ci-workflow.spec.ts`):

- Assert workflow triggers on push to main
- Assert jobs have correct dependencies (needs)
- Assert summary job has `if: always()` condition
- Assert all jobs use Node.js 22+
- Assert artifacts have 3-day retention

**Workflow Execution Test** (manual validation via quickstart):

- Trigger workflow by pushing to main
- Verify all jobs execute in correct order
- Verify summary displays correctly

### 4. Test Scenarios

From spec acceptance scenarios → integration test approach:

**Scenario 1: Full Success Path**

- Given: clean build, all tests pass
- When: push to main
- Then: all jobs succeed, summary shows all green

**Scenario 2: Build Failure**

- Given: TypeScript compilation error
- When: push to main
- Then: build fails, tests don't run, summary shows build failure

**Scenario 3: Test Failure**

- Given: build succeeds, unit test fails
- When: push to main
- Then: build succeeds, tests fail, e2e may pass, summary shows test failure

### 5. Quickstart Validation

**Output**: `quickstart.md` containing:

- Setup: Verify workflow file is committed
- Trigger: Push a commit to main branch
- Validation: Check GitHub Actions tab for workflow run
- Expected: All jobs complete, green checkmarks
- Failure scenarios: How to interpret failures in summary

### 6. Agent File Update

Run: `.specify/scripts/bash/update-agent-context.sh claude`

Updates `CLAUDE.md` with:

- GitHub Actions CI/CD workflow added for main branch validation
- Workflow runs build, unit tests, and e2e tests in parallel
- Recent change: Added automated CI/CD pipeline (001-have-github-actions)

**Output**: data-model.md, contracts/workflow.yml, e2e/ci-workflow.spec.ts, quickstart.md, updated CLAUDE.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

### Task Generation Strategy

The /tasks command will generate tasks following TDD principles:

**Contract/Structure Tasks** (parallel):

1. Create `.github/workflows/` directory structure
2. Create workflow YAML file skeleton with metadata (name, trigger)

**Build Job Tasks** (sequential):

3. Write test: validate build job structure in ci-workflow.spec.ts
4. Implement: build job with setup-node, npm ci, make build
5. Implement: artifact upload for dist/

**Test Job Tasks** (parallel after build):

6. Write test: validate unit test job structure
7. Implement: unit test job (make ci.test)
8. Write test: validate e2e test job structure
9. Implement: e2e test job with Playwright browser installation
10. Implement: e2e test results artifact upload

**Summary Job Tasks** (sequential after all jobs):

11. Write test: validate summary job structure
12. Implement: summary job with status collection
13. Implement: markdown summary generation
14. Implement: `if: always()` condition

**Integration Tasks**:

15. Add job dependency configuration (needs:)
16. Configure artifact retention to 3 days
17. Verify parallel execution of test jobs
18. Update quickstart.md with workflow trigger instructions
19. Update CLAUDE.md via update-agent-context.sh script

**Validation Tasks**:

20. Run ci-workflow.spec.ts validation
21. Manual workflow execution test (push to main)
22. Verify summary displays correctly in GitHub Actions UI

### Ordering Strategy

- **TDD order**: Test-first tasks (items 3, 6, 8, 11) before implementation
- **Dependency order**: Build job → Test jobs → Summary job
- **Parallelization**:
  - [P] Tasks 1-2 (setup)
  - [P] Tasks 6-10 (test jobs, depends on build)
  - Sequential: 11-14 (summary depends on tests)
  - [P] Tasks 15-19 (integration tweaks)
  - Sequential: 20-22 (validation)

### Estimated Output

**22 numbered, ordered tasks** in tasks.md following:

- TDD principles (tests before implementation)
- Constitutional requirements (Principle I-VII compliance)
- Job dependency constraints (build → tests → summary)
- Parallel execution markers for independent tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run workflow on main branch, verify quickstart.md steps)

## Complexity Tracking

_No constitutional violations - table not applicable_

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - no deviations)

---

_Based on project constitution - See `.specify/memory/constitution.md` for current version 1.0.2_
