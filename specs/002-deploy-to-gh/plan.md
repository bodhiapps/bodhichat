# Implementation Plan: Deploy to GitHub Pages

**Feature**: `002-deploy-to-gh` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-deploy-to-gh/spec.md`

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

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Automated GitHub Pages deployment triggered by version tags (pages/vx.y.z). Makefile target initiates tag creation after fetching latest releases from GitHub API, handling version bumping, and git operations. GitHub Actions workflow builds production artifacts, deploys to Pages, and archives as GitHub release with automated post-release version bumping.

## Technical Context

**Implementation Type**: GitHub Actions workflow + Makefile automation (not API/service/UI components)
**Language/Version**: Bash/Make for Makefile target; YAML for GitHub Actions workflow; Node.js 22.12+ for npm operations
**Primary Dependencies**: GitHub Actions (actions/checkout@v4, actions/setup-node@v4, actions/configure-pages@v4, actions/upload-pages-artifact@v3, actions/deploy-pages@v4, softprops/action-gh-release@v1); GitHub CLI (gh) for API operations; git for version control
**Storage**: N/A (workflow operates on git repository and GitHub APIs)
**Testing**: Integration testing via manual workflow trigger; validation of artifact generation and deployment success
**Target Platform**: GitHub Actions (ubuntu-latest runner)
**Project Type**: CI/CD workflow (not traditional single/web/mobile project)
**Performance Goals**: Deployment completion within 10 minutes; network operations with 3 retries @ 500ms intervals
**Constraints**: GitHub API rate limits (60 req/hour unauthenticated, 5000 req/hour authenticated); concurrency control to prevent simultaneous deployments; minimal logging (start/completion/errors only)
**Scale/Scope**: Single repository deployment; version tag pattern pages/v\*; automated version bumping post-release

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Test-Driven Development (NON-NEGOTIABLE)

**Status**: ⚠️ MODIFIED APPROACH - GitHub Actions workflows cannot follow traditional TDD
**Rationale**: Workflow YAML files are declarative configuration, not testable code units. Testing approach:

- Integration tests via manual workflow triggers with test tags
- Validation of workflow outputs (artifacts, deployments, releases)
- Makefile script portions will have validation checks before git operations
  **Mitigation**: Document workflow behavior in quickstart.md with manual validation steps

### II. Test Pyramid Philosophy

**Status**: ⚠️ NOT APPLICABLE - Infrastructure/CI/CD context
**Rationale**: No component tests or E2E tests for workflow configuration. Validation via:

- Manual workflow execution testing
- Verification of deployment artifacts
- GitHub API response validation in Makefile scripts

### III. Deterministic Testing Practices

**Status**: ✅ PASS - Validation will be deterministic
**Application**:

- Makefile validation scripts will have clear success/failure conditions
- No conditional logic in test validation
- Clear error messages for failure scenarios

### IV. Code Quality & Type Safety

**Status**: ⚠️ MODIFIED - Different tooling for infrastructure code
**Application**:

- YAML validated by GitHub Actions schema
- Bash scripts follow shellcheck linting where applicable
- Make syntax validated
- Manual code review for quality

### V. Spec-Driven Development

**Status**: ✅ PASS - This feature follows spec-driven approach
**Evidence**: Feature has complete spec.md with clarifications, now generating implementation plan

### VI. Modern React Best Practices

**Status**: ✅ N/A - Not a React feature
**Rationale**: This is infrastructure/CI/CD work, not React development

### VII. Network Isolation in Tests

**Status**: ⚠️ MODIFIED - Workflow inherently depends on network
**Rationale**: GitHub Actions workflow requires network access to GitHub APIs, npm registry, GitHub Pages deployment
**Mitigation**: Retry logic (3 attempts @ 500ms) handles transient network failures

**Overall Assessment**: 3 constitutional principles require justified deviations due to infrastructure/CI/CD nature of this feature. See Complexity Tracking section for detailed justifications.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
.github/
└── workflows/
    └── deploy-pages.yml        # GitHub Actions workflow for deployment

Makefile                        # Root Makefile with release.pages target

package.json                    # Contains version field for version management
package-lock.json              # Locked dependencies

dist/                          # Production build artifacts (generated)
└── [built files]

vite.config.ts                 # Vite build configuration (existing)
```

**Structure Decision**: CI/CD workflow implementation - no traditional src/ structure. This feature adds:

1. GitHub Actions workflow file in `.github/workflows/`
2. Makefile target `release.pages` in root Makefile
3. Leverages existing build configuration (Vite) and package.json version field

## Phase 0: Outline & Research

**Status**: ✅ COMPLETED

**Researched Areas**:

1. GitHub Actions workflow architecture for Pages deployment
2. Concurrency control strategies
3. Version management patterns (npm version)
4. Post-release version bump strategy
5. GitHub API integration via gh CLI
6. Network retry strategies
7. Partial failure handling
8. Makefile git validation patterns
9. Artifact archival strategies
10. Logging strategies

**Key Decisions**:

- Use official GitHub Actions for Pages deployment
- Concurrency control via workflow groups (cancel-in-progress: false)
- Git tag as source of truth for versioning
- Patch version bump with -dev suffix post-release
- GitHub CLI (gh) for API operations
- 3 retries @ 500ms for network operations
- No rollback of successful steps on partial failure
- Minimal logging (start/completion/errors only)

**Output**: ✅ `research.md` created with all decisions documented

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETED

**Artifacts Created**:

1. **data-model.md** ✅
   - Workflow data structures (not traditional entities)
   - Version Tag, Package Version, GitHub Release, Production Artifact
   - GitHub API payloads, Makefile environment variables, Git repository state
   - Data flow from Makefile → API → Workflow → Deployment
   - Error states and recovery procedures

2. **contracts/** ✅
   - **makefile-contract.md**: Validation contract for `make release.pages` target
     - Pre-conditions: Git validation, environment setup
     - Execution steps: Git checks, API calls, version calculation, tag operations
     - Error handling: Uncommitted changes, rate limits, tag conflicts
     - Validation tests: 7 test scenarios covering happy path and error cases

   - **workflow-contract.md**: Validation contract for GitHub Actions workflow
     - Trigger contract: Tag pattern `pages/v*`
     - Concurrency, permissions, execution steps (13 steps)
     - Error scenarios: Build failure, deployment failure, network timeout
     - Validation tests: 5 test scenarios
     - Post-conditions and rollback procedures

3. **quickstart.md** ✅
   - End-to-end validation guide (5 parts)
   - Part 1: Pre-flight checks (repo state, API access, build)
   - Part 2: Makefile validation (happy path, error handling)
   - Part 3: Workflow validation (monitoring, Pages verification, release verification)
   - Part 4: Error scenario testing (duplicate tags, build failures)
   - Part 5: End-to-end integration
   - Rollback procedures and troubleshooting guide
   - Estimated completion time: ~50 minutes

4. **CLAUDE.md Update** ✅
   - Agent context updated via `update-agent-context.sh claude`
   - Added: GitHub Actions workflow technology stack
   - Added: Make/Bash/YAML as languages
   - Added: CI/CD workflow project type

**Note**: Traditional "contract tests" not applicable for declarative YAML workflows. Validation contracts document expected behavior and manual testing procedures instead.

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

Since this is a CI/CD workflow feature (not traditional application code), task generation will follow a different pattern:

1. **Preparation Tasks**:
   - Review workflow contracts (makefile-contract.md, workflow-contract.md)
   - Review data-model.md for workflow structure understanding
   - Set up local environment (gh CLI, jq, git)

2. **Makefile Implementation Tasks**:
   - Create shell scripts for git validation (reuse patterns from bodhi-js)
   - Do not have heavy use of bash script, offload to nodejs scripts in scripts/ folder
   - Implement GitHub API release fetching logic
   - Implement version calculation logic
   - Implement tag existence checking
   - Implement tag creation and push logic
   - Add `release.pages` target to root Makefile
   - Test Makefile target with dry-run validation

3. **GitHub Actions Workflow Tasks**:
   - Create workflow YAML file (`.github/workflows/deploy-pages.yml`)
   - Configure workflow trigger (on push tags `pages/v*`)
   - Add concurrency control configuration
   - Add permissions configuration
   - Implement version extraction step
   - Implement version update step
   - Implement build step
   - Implement Pages deployment steps (configure, upload, deploy)
   - Implement release creation step
   - Implement post-release version bump steps
   - Add retry logic wrapper where needed

4. **Validation Tasks**:
   - Execute quickstart.md validation (all 5 parts)
   - Test happy path deployment
   - Test error scenarios (uncommitted changes, duplicate tags, build failures)
   - Verify Pages deployment
   - Verify release creation
   - Verify version bump on main
   - Document any deviations in quickstart.md

**Ordering Strategy**:

- Sequential implementation (Makefile → Workflow → Validation)
- Makefile must be complete before workflow (provides trigger mechanism)
- Validation requires both components complete
- No parallel execution markers (infrastructure tasks have dependencies)

**Estimated Output**: 20-25 tasks in tasks.md (fewer than typical due to workflow nature)

**Note**: No unit tests for YAML files. Validation is integration-level via quickstart.md manual testing.

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Constitutional principle deviations justified by infrastructure/CI/CD context_

| Principle Violation                 | Why Needed                                                     | Simpler Alternative Rejected Because                                                                                                |
| ----------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **I. Test-Driven Development**      | Workflow YAML is declarative configuration, not testable code  | Writing tests for YAML syntax serves no purpose; GitHub validates workflow files at runtime                                         |
| **II. Test Pyramid Philosophy**     | No component/E2E tests for infrastructure code                 | Infrastructure testing requires actual cloud execution; mock-based tests would not validate real deployment behavior                |
| **VII. Network Isolation in Tests** | Workflow inherently requires network (GitHub APIs, npm, Pages) | Stubbing network in deployment workflow would eliminate the entire purpose of the feature; retry logic mitigates transient failures |

**Mitigation Strategies**:

1. **Comprehensive contracts**: Detailed validation contracts (makefile-contract.md, workflow-contract.md) document expected behavior and error handling
2. **Manual validation**: quickstart.md provides step-by-step validation procedures covering happy path and error scenarios
3. **Progressive deployment**: Test with non-production tags first; verify each component independently before full integration
4. **Reference implementation**: Pattern follows proven bodhi-js release workflow (publish-bodhijs.yml)

**Complexity Justification**: Infrastructure/CI/CD code has different testing constraints than application code. The constitution's principles remain valid for application development; this feature requires adapted validation approaches appropriate for its domain.

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

- [x] Initial Constitution Check: PASS (with justified deviations)
- [x] Post-Design Constitution Check: PASS (deviations remain justified)
- [x] All NEEDS CLARIFICATION resolved (Technical Context has no unknowns)
- [x] Complexity deviations documented (3 constitutional principles adapted for infrastructure context)

---

_Based on project constitution - See `.specify/memory/constitution.md` for current version_
