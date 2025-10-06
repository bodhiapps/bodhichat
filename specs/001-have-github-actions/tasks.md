# Tasks: GitHub Actions CI/CD Workflow

**Feature**: `001-have-github-actions` | **Date**: 2025-10-06
**Input**: Design documents from `/specs/001-have-github-actions/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/workflow-contract.yml, quickstart.md

## Execution Flow

```
1. Load plan.md from feature directory
   ✓ Tech stack: YAML, GitHub Actions, Node.js v22+
   ✓ Structure: Single project (frontend React app)
2. Load design documents:
   ✓ data-model.md: 6 entities (Workflow Run, Build Job, Unit Test Job, E2E Test Job, Summary Job, Artifacts)
   ✓ contracts/workflow-contract.yml: Workflow structure contract
   ✓ quickstart.md: Validation scenarios
3. Generate tasks by category:
   ✓ Setup: Directory structure, workflow skeleton
   ✓ Tests: Contract validation tests
   ✓ Core: Job implementation (build, test-unit, test-e2e, summary)
   ✓ Integration: Job dependencies, artifact configuration
   ✓ Polish: Documentation updates, validation
4. Apply task rules:
   ✓ Different files = [P] for parallel execution
   ✓ Same file = sequential
   ✓ Tests before implementation (TDD)
5. Number tasks sequentially (T001-T020)
6. Generate dependency graph
7. Create parallel execution examples
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included in descriptions

## Path Conventions

Single project structure:

- Workflow file: `.github/workflows/ci.yml`
- E2E tests: `e2e/`
- Existing Makefile: `Makefile` (no changes needed)
- Existing configs: `vitest.config.ts`, `playwright.config.ts` (no changes needed)

## Phase 3.1: Setup

- [x] T001 [P] Create `.github/workflows/` directory structure
- [x] T002 Create workflow file skeleton `.github/workflows/ci.yml` with name and trigger configuration (push to main branch)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T003 Contract validation test in `e2e/ci-workflow.spec.ts`:
  - Assert workflow triggers only on push to main branch
  - Assert workflow name is "CI/CD Pipeline"
  - Assert all 4 jobs exist (build, test-unit, test-e2e, summary)
  - Assert all jobs use ubuntu-latest runner
  - Assert all jobs use Node.js version 22+
  - Assert build job has no dependencies
  - Assert test-unit and test-e2e jobs depend on build (needs: build)
  - Assert summary job depends on all jobs (needs: [build, test-unit, test-e2e])
  - Assert summary job has if: always() condition
  - Assert all artifact uploads have retention-days: 3
  - Run test: `npm test -- e2e/ci-workflow.spec.ts` (should FAIL initially)

## Phase 3.3: Core Implementation (ONLY after T003 is failing)

### Build Job Implementation

- [x] T004 Implement build job in `.github/workflows/ci.yml`:
  - Add actions/checkout@v4 step
  - Add actions/setup-node@v4 with node-version: '22' and cache: 'npm'
  - Add npm ci installation step
  - Add make build step
  - Add conditional artifact upload (if: failure()) for dist/ with retention-days: 3

### Test Job Implementation (Parallel after build)

- [x] T005 [P] Implement unit test job in `.github/workflows/ci.yml`:
  - Add needs: build dependency
  - Add actions/checkout@v4 step
  - Add actions/setup-node@v4 with node-version: '22' and cache: 'npm'
  - Add npm ci installation step
  - Add make ci.test step

- [x] T006 [P] Implement E2E test job in `.github/workflows/ci.yml`:
  - Add needs: build dependency (runs parallel with test-unit)
  - Add actions/checkout@v4 step
  - Add actions/setup-node@v4 with node-version: '22' and cache: 'npm'
  - Add npm ci installation step
  - Add npx playwright install chromium step
  - Add make test.e2e step
  - Add conditional artifact upload (if: failure()) for playwright-report/ with retention-days: 3

### Summary Job Implementation

- [x] T007 Implement summary job in `.github/workflows/ci.yml`:
  - Add needs: [build, test-unit, test-e2e] dependencies
  - Add if: always() condition
  - Add step to generate markdown summary using $GITHUB_STEP_SUMMARY
  - Display table with job statuses using needs context (needs.build.result, needs.test-unit.result, needs.test-e2e.result)
  - Include workflow overall status

## Phase 3.4: Integration & Validation

- [x] T008 Verify contract test passes: Run `npm test -- e2e/ci-workflow.spec.ts` (should now PASS)

- [x] T009 Local workflow file validation:
  - Verify YAML syntax: Use `yamllint .github/workflows/ci.yml` or online validator
  - Verify job dependency graph matches contract (build → tests → summary)
  - Verify parallel execution capability (test-unit and test-e2e both depend only on build)

- [x] T010 Update `quickstart.md` if needed:
  - Verify quickstart instructions match actual implementation
  - Add any additional troubleshooting discovered during implementation

## Phase 3.5: Polish & Documentation

- [x] T011 Run `make all` to ensure local build and tests pass

- [x] T012 Update CLAUDE.md using agent context script:
  - Run: `.specify/scripts/bash/update-agent-context.sh claude` from repo root
  - Verify CLAUDE.md updated with CI/CD workflow information

- [ ] T013 Manual workflow execution test (per quickstart.md):
  - Commit workflow file to feature branch
  - Push to GitHub
  - Create PR and merge to main
  - Navigate to GitHub Actions tab
  - Verify workflow runs automatically
  - Verify all jobs execute in correct order
  - Verify summary displays correctly
  - **NOTE**: This task requires manual validation after pushing to GitHub

- [ ] T014 Test failure scenarios (per quickstart.md):
  - **Build Failure**: Introduce TypeScript error, push to main, verify build fails and tests are skipped
  - **Unit Test Failure**: Add failing test, push to main, verify test job fails and summary shows failure
  - **E2E Test Failure**: Add failing E2E test, push to main, verify E2E fails, artifact uploaded, summary shows failure
  - Clean up all test failures after validation
  - **NOTE**: This task requires manual validation after pushing to GitHub

- [ ] T015 Performance validation:
  - Verify workflow completes in <5 minutes (with cache)
  - Verify second run shows npm cache hit
  - Verify dependency installation time reduced from ~60s to ~10s with cache
  - **NOTE**: This task requires manual validation after multiple workflow runs on GitHub

## Dependencies

**Sequential Dependencies**:

- T001 → T002 (directory before file)
- T002 → T003 (skeleton before tests)
- T003 → T004-T007 (tests before implementation - TDD gate)
- T004-T007 → T008 (implementation before validation)
- T008 → T009-T010 (validation before polish)
- T009-T010 → T011-T015 (integration before final polish)

**Parallel Opportunities**:

- T001 can run independently (directory creation)
- T005 and T006 can be implemented in parallel (different sections of same file, but independent job configurations)
- T009 and T010 can run in parallel (different files)
- T011 and T012 can run in parallel (different operations)

## Parallel Execution Examples

### Example 1: Setup Phase (T001 standalone)

```bash
# T001 can run independently
Task: "Create .github/workflows/ directory structure"
```

### Example 2: Test Job Implementation (T005, T006)

```bash
# These can be written in parallel as they configure independent jobs
Task: "Implement unit test job in .github/workflows/ci.yml"
Task: "Implement E2E test job in .github/workflows/ci.yml"
```

**Note**: While T005 and T006 modify the same file, they add independent job sections and can be developed in parallel, then merged.

### Example 3: Integration Phase (T009, T010)

```bash
# These operate on different files
Task: "Local workflow file validation"
Task: "Update quickstart.md if needed"
```

### Example 4: Polish Phase (T011, T012)

```bash
# Different operations, can run in parallel
Task: "Run make all to ensure local build and tests pass"
Task: "Update CLAUDE.md using agent context script"
```

## Task Execution Guide

### TDD Workflow

1. **CRITICAL**: Complete T003 and verify it FAILS before implementing any jobs
2. Implement jobs (T004-T007) to make the contract test pass
3. Verify T008 shows all contract validations passing

### File Modification Order

```
.github/workflows/ci.yml creation:
  T002: Skeleton (name, trigger)
  T004: Build job
  T005: Unit test job (can be parallel with T006)
  T006: E2E test job (can be parallel with T005)
  T007: Summary job
```

### Validation Checklist

**Before Starting T004** (TDD Gate):

- [ ] T003 test exists in e2e/ci-workflow.spec.ts
- [ ] Running `npm test -- e2e/ci-workflow.spec.ts` shows FAILURES
- [ ] All assertions in T003 are present and failing

**After Completing T007**:

- [ ] All contract validations in T003 pass
- [ ] Workflow file syntax is valid YAML
- [ ] Job dependency graph matches contract (build → tests → summary)
- [ ] Summary job has if: always() condition

**Before Marking Complete**:

- [ ] Manual workflow execution successful (T013)
- [ ] All failure scenarios tested (T014)
- [ ] Performance targets met (T015)
- [ ] CLAUDE.md updated (T012)

## Notes

- **[P] markers**: Tasks marked [P] can run in parallel if using multiple agents/sessions
- **No Makefile changes**: Existing `make build`, `make ci.test`, `make test.e2e` commands are used as-is
- **No config changes**: Existing vitest.config.ts and playwright.config.ts already configured for CI (forbidOnly, retry logic, single worker)
- **TDD compliance**: T003 MUST fail before implementing jobs (follows project constitution Principle I)
- **Constitutional compliance**: All tasks follow test-driven development, test pyramid philosophy, and spec-driven development principles

## Estimated Completion Time

- Setup (T001-T002): ~5 minutes
- Contract tests (T003): ~30 minutes
- Implementation (T004-T007): ~45 minutes
- Validation (T008-T010): ~15 minutes
- Polish (T011-T015): ~45 minutes (includes manual GitHub workflow testing)
- **Total**: ~2.5 hours

## Success Criteria

✅ All tasks completed
✅ Contract test (T003) passes
✅ Workflow runs successfully on push to main
✅ All jobs execute in correct dependency order
✅ Test jobs run in parallel after build
✅ Summary displays all job statuses
✅ Failure scenarios handled correctly
✅ Performance targets met (<5 minutes with caching)
✅ Documentation updated

---

**Tasks ready for execution. Follow TDD principles: T003 must fail before implementing T004-T007.**
