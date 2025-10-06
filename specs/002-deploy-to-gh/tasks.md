# Tasks: Deploy to GitHub Pages

**Feature**: `002-deploy-to-gh` | **Date**: 2025-10-06
**Input**: Design documents from `/specs/002-deploy-to-gh/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Overview

This feature implements GitHub Pages deployment automation through a Makefile target and GitHub Actions workflow. Tasks are organized sequentially due to infrastructure dependencies (Makefile must exist before workflow can be tested).

**Key Context**:

- This is CI/CD infrastructure code (not traditional application code)
- No unit tests for YAML/Makefile (validation via manual integration testing)
- Tasks sized to balance granularity with context (user guidance: not too granular, not too overloaded)
- Node.js scripts in `scripts/` folder for logic (avoid heavy bash scripting)

## Phase 3.1: Environment Setup

- [x] **T001** Verify local environment prerequisites
  - **File**: N/A (validation only)
  - **Description**: Verify git >= 2.0, gh CLI >= 2.0, jq >= 1.6, Node.js 22.12+ installed and accessible
  - **Validation**: Run `git --version`, `gh --version`, `jq --version`, `node --version`
  - **Estimated**: 5 minutes

- [x] **T002** Review design artifacts for context
  - **Files**: `specs/002-deploy-to-gh/{plan.md,research.md,data-model.md,contracts/,quickstart.md}`
  - **Description**: Read and understand all design documents, contracts, and validation procedures
  - **Key Focus**: Makefile contract (5 steps), Workflow contract (13 steps), data flow, error handling
  - **Estimated**: 20 minutes

## Phase 3.2: Node.js Scripts Development

**Note**: Following project guidance to avoid heavy bash scripting, implement logic in Node.js scripts

- [x] **T003** [P] Create git validation scripts
  - **Files**: `scripts/git-check-branch.js`, `scripts/git-check-sync.js`
  - **Description**: Implement Node.js scripts for git branch validation and repository sync checking
  - **Requirements**:
    - `git-check-branch.js`: Check current branch is main, exit 1 if not
    - `git-check-sync.js`: Check for uncommitted changes and unpushed commits, exit 1 if found
  - **Reference**: Similar to bodhi-js scripts but Node.js instead of bash
  - **Validation**: Test with dirty repo, test on non-main branch
  - **Estimated**: 30 minutes

- [x] **T004** [P] Create version management scripts
  - **Files**: `scripts/get-npm-version.js`, `scripts/increment-version.js`
  - **Description**: Implement Node.js scripts for fetching package versions from npm registry and incrementing semver
  - **Requirements**:
    - `get-npm-version.js`: Fetch latest version of given package from npmjs (used for comparison, not for this app)
    - `increment-version.js`: Parse semver string, increment patch version, output result
  - **Validation**: Test with various version formats (1.2.3, 0.1.0)
  - **Estimated**: 30 minutes

- [x] **T005** [P] Create tag management script
  - **File**: `scripts/delete-tag-if-exists.js`
  - **Description**: Implement Node.js script to check for tag existence and optionally delete local/remote tags with user confirmation
  - **Requirements**:
    - Check if tag exists locally and remotely
    - Prompt user for confirmation (y/N, default N)
    - If confirmed, delete local tag and push deletion to remote
  - **Validation**: Test with existing and non-existing tags
  - **Estimated**: 30 minutes

## Phase 3.3: Makefile Implementation

- [x] **T006** Implement GitHub API release fetching logic in Makefile
  - **File**: `Makefile` (add `release.pages` target - partial)
  - **Description**: Implement Makefile logic to fetch releases from GitHub API and calculate next version
  - **Requirements**:
    - Use `gh api repos/bodhiapps/bodhichat/releases` with optional GH_PAT
    - Filter for tags starting with `pages/v`
    - Sort by created_at, extract latest version
    - If no releases, default to 0.0.0
    - Calculate next version by incrementing patch
  - **Error Handling**: Clear messages for API failures, rate limits, missing GH_PAT
  - **Reference**: `contracts/makefile-contract.md` Steps 2-3
  - **Estimated**: 45 minutes

- [x] **T007** Complete Makefile `release.pages` target with git operations
  - **File**: `Makefile` (complete `release.pages` target)
  - **Description**: Integrate git validation scripts, tag creation, and push logic into complete release target
  - **Requirements**:
    - Call `node scripts/git-check-branch.js`
    - Call `node scripts/git-check-sync.js`
    - Check tag existence (local and remote)
    - If exists, call `node scripts/delete-tag-if-exists.js TAG_NAME`
    - Create new tag: `git tag "pages/v$NEXT_VERSION"`
    - Push tag: `git push origin "pages/v$NEXT_VERSION"`
    - Output success message with Actions URL
  - **Dependencies**: T003, T004, T005, T006
  - **Reference**: `contracts/makefile-contract.md` Steps 1, 4, 5
  - **Validation**: Dry-run test (abort before push)
  - **Estimated**: 45 minutes

## Phase 3.4: GitHub Actions Workflow Implementation

- [x] **T008** Create workflow file with trigger and concurrency configuration
  - **File**: `.github/workflows/deploy-pages.yml` (create new)
  - **Description**: Create GitHub Actions workflow YAML with proper trigger pattern and concurrency control
  - **Requirements**:
    - Trigger on tags: `pages/v*`
    - Concurrency group: `pages-deployment-${{ github.ref }}`
    - Concurrency cancel-in-progress: false
    - Permissions: contents: write, pages: write, id-token: write
  - **Reference**: `contracts/workflow-contract.md` Trigger, Concurrency, Permissions sections
  - **Estimated**: 15 minutes

- [x] **T009** Implement version extraction and calculation steps
  - **File**: `.github/workflows/deploy-pages.yml` (add steps)
  - **Description**: Add workflow steps to extract version from tag and calculate next development version
  - **Requirements**:
    - Step: Extract version information (bash script)
    - Extract version from `GITHUB_REF` (refs/tags/pages/v1.2.3 → 1.2.3)
    - Calculate next_version (1.2.3 → 1.2.4-dev)
    - Set outputs: tag_version, next_version
  - **Reference**: `contracts/workflow-contract.md` Step 3
  - **Estimated**: 20 minutes

- [x] **T010** Implement build and version update steps
  - **File**: `.github/workflows/deploy-pages.yml` (add steps)
  - **Description**: Add workflow steps for repository checkout, Node.js setup, version update, dependency installation, and production build
  - **Requirements**:
    - Step: Checkout repository (actions/checkout@v4, fetch-depth: 1)
    - Step: Setup Node.js (actions/setup-node@v4, node-version-file, cache: npm)
    - Step: Update version for release (`npm version $tag_version --no-git-tag-version`)
    - Step: Install dependencies (`npm ci`)
    - Step: Build production artifacts (`npm run build`)
  - **Dependencies**: T009
  - **Reference**: `contracts/workflow-contract.md` Steps 1, 2, 4, 5, 6
  - **Validation**: Build should fail if any step errors
  - **Estimated**: 30 minutes

- [x] **T011** Implement GitHub Pages deployment steps
  - **File**: `.github/workflows/deploy-pages.yml` (add steps)
  - **Description**: Add workflow steps to configure, upload, and deploy to GitHub Pages
  - **Requirements**:
    - Step: Configure GitHub Pages (actions/configure-pages@v4)
    - Step: Upload Pages artifact (actions/upload-pages-artifact@v3, path: ./dist)
    - Step: Deploy to GitHub Pages (actions/deploy-pages@v4, id: deployment)
  - **Dependencies**: T010
  - **Reference**: `contracts/workflow-contract.md` Steps 7, 8, 9
  - **Error Handling**: If deployment fails, workflow fails but does not revert
  - **Estimated**: 20 minutes

- [x] **T012** Implement GitHub Release creation step
  - **File**: `.github/workflows/deploy-pages.yml` (add step)
  - **Description**: Add workflow step to create GitHub release with production artifacts
  - **Requirements**:
    - Step: Create GitHub Release (softprops/action-gh-release@v1)
    - Include files: `dist/**/*`
    - Release name: "Bodhi Chat v$tag_version"
    - Release body: Include release version and Pages URL
    - draft: false, prerelease: false
    - env: GITHUB_TOKEN
  - **Dependencies**: T010 (needs dist/ artifacts)
  - **Reference**: `contracts/workflow-contract.md` Step 10
  - **Error Handling**: If release fails, Pages deployment remains live
  - **Estimated**: 20 minutes

- [x] **T013** Implement post-release version bump steps
  - **File**: `.github/workflows/deploy-pages.yml` (add steps)
  - **Description**: Add workflow steps to bump version on main branch after successful release
  - **Requirements**:
    - Step: Configure Git (set user.email and user.name to github-actions[bot])
    - Step: Checkout main branch (`git fetch --depth=1 origin main`, `git checkout -B main origin/main`)
    - Step: Bump version and commit
      - `npm version $next_version --no-git-tag-version`
      - `npm install` (update package-lock.json)
      - `git add package.json package-lock.json`
      - `git commit -m "chore: bump version to $next_version after release [skip ci]"`
      - `git push origin main`
  - **Dependencies**: T009 (needs next_version)
  - **Reference**: `contracts/workflow-contract.md` Steps 11, 12, 13
  - **Commit Message**: Must include `[skip ci]` to prevent triggering workflows
  - **Estimated**: 30 minutes

- [ ] **T014** Add retry logic for network-dependent steps (OPTIONAL)
  - **File**: `.github/workflows/deploy-pages.yml` (wrap steps)
  - **Description**: Optionally wrap network-dependent steps with retry logic using nick-fields/retry@v2
  - **Requirements**:
    - Wrap Pages deployment step (if needed)
    - Wrap Release creation step (if needed)
    - Wrap git push step (if needed)
    - Configuration: timeout_minutes: 5, max_attempts: 3, retry_wait_seconds: 0.5
  - **Dependencies**: T011, T012, T013
  - **Reference**: `contracts/workflow-contract.md` Retry Logic section
  - **Note**: This is optional enhancement; basic workflow should work without explicit retry wrapping
  - **Estimated**: 20 minutes (if implemented)

## Phase 3.5: Validation & Testing

- [ ] **T015** Execute Makefile validation tests (Part 2 of quickstart)
  - **Files**: Follow `specs/002-deploy-to-gh/quickstart.md` Part 2
  - **Description**: Manually validate Makefile `release.pages` target functionality
  - **Test Scenarios**:
    - Dry run validation (abort before push)
    - Error handling: uncommitted changes
    - Error handling: wrong branch
    - Error handling: duplicate tag (decline overwrite)
    - Error handling: duplicate tag (accept overwrite)
  - **Dependencies**: T007 (complete Makefile)
  - **Validation**: Each scenario produces expected behavior per quickstart.md
  - **Estimated**: 30 minutes

- [ ] **T016** Execute pre-flight checks (Part 1 of quickstart)
  - **Files**: Follow `specs/002-deploy-to-gh/quickstart.md` Part 1
  - **Description**: Verify repository state, GitHub API access, and local build
  - **Test Scenarios**:
    - Check git repository state (branch, uncommitted changes, unpushed commits)
    - Test GitHub API access (authenticated and unauthenticated)
    - Verify build produces dist/ with artifacts
  - **Dependencies**: T002 (review quickstart)
  - **Validation**: All pre-flight checks pass
  - **Estimated**: 15 minutes

- [ ] **T017** Execute test deployment to GitHub Pages
  - **Files**: Follow `specs/002-deploy-to-gh/quickstart.md` Part 2 Step 2.4 and Part 3
  - **Description**: Perform actual deployment to GitHub Pages and validate workflow execution
  - **Test Scenario**: Complete release cycle
    - Run `make release.pages` with optional GH_PAT
    - Monitor workflow execution (all 13 steps)
    - Verify Pages deployment (HTTP 200, correct content)
    - Verify GitHub Release created with artifacts
    - Verify version bump on main branch
  - **Dependencies**: T007 (Makefile), T008-T013 (complete workflow)
  - **⚠️ WARNING**: This creates real production deployment
  - **Validation**: All success criteria from quickstart.md Part 3 pass
  - **Estimated**: 45 minutes (including ~5-7 min workflow execution)

- [ ] **T018** Execute error scenario testing (Part 4 of quickstart)
  - **Files**: Follow `specs/002-deploy-to-gh/quickstart.md` Part 4
  - **Description**: Test error handling and recovery scenarios
  - **Test Scenarios**:
    - Duplicate tag deployment (decline overwrite)
    - Tag overwrite acceptance
    - Build failure recovery (introduce error, verify workflow fails gracefully, fix and retry)
  - **Dependencies**: T017 (working deployment)
  - **Validation**: All error scenarios handled correctly per quickstart.md
  - **Estimated**: 30 minutes

- [ ] **T019** Execute end-to-end validation (Part 5 of quickstart)
  - **Files**: Follow `specs/002-deploy-to-gh/quickstart.md` Part 5
  - **Description**: Validate complete release cycle with real code change
  - **Test Scenario**: Full release cycle
    - Make real code change (e.g., update README.md)
    - Commit and push to main
    - Execute release
    - Verify change visible on live site
    - Verify release artifacts correct
    - Verify version bumped
  - **Dependencies**: T017, T018
  - **Validation**: Complete end-to-end workflow successful
  - **Estimated**: 20 minutes

## Phase 3.6: Documentation & Cleanup

- [ ] **T020** [P] Document deployment procedure for team
  - **File**: Create `docs/deployment.md` or update existing deployment docs
  - **Description**: Create concise deployment documentation for team use
  - **Contents**:
    - Prerequisites (GH_PAT optional but recommended)
    - Usage: `GH_PAT=token make release.pages`
    - What happens behind the scenes
    - How to monitor deployment
    - Troubleshooting common issues
    - Rollback procedures
  - **Reference**: Summarize quickstart.md into team-facing docs
  - **Estimated**: 30 minutes

- [ ] **T021** [P] Update CLAUDE.md with deployment context (if needed)
  - **File**: `CLAUDE.md`
  - **Description**: Verify CLAUDE.md has correct deployment information from agent context update
  - **Validation**: Check that GitHub Actions, Makefile deployment details are present
  - **Note**: Agent context was already updated in T002 via `update-agent-context.sh`
  - **Estimated**: 10 minutes

## Dependencies

```
Setup Phase:
T001 → T002 → [T003, T004, T005] (parallel scripts)

Makefile Phase:
[T003, T004, T005] → T006 → T007

Workflow Phase (Sequential):
T008 → T009 → T010 → T011 (Pages deployment)
                  ↓
T010 → T012 (Release creation)
T009 → T013 (Version bump)
[T011, T012, T013] → T014 (optional retry logic)

Validation Phase (Sequential):
T002 → T016 (pre-flight checks)
T007 → T015 (Makefile validation)
[T007, T008-T013] → T017 (test deployment)
T017 → T018 (error scenarios)
T018 → T019 (end-to-end)

Documentation Phase (Parallel after validation):
T019 → [T020, T021]
```

## Parallel Execution Opportunities

**Scripts Development (Phase 3.2)**:

```bash
# T003, T004, T005 can run in parallel (different files)
# Launch together:
Task: "Create git validation scripts in scripts/git-check-branch.js and scripts/git-check-sync.js"
Task: "Create version management scripts in scripts/get-npm-version.js and scripts/increment-version.js"
Task: "Create tag management script in scripts/delete-tag-if-exists.js"
```

**Documentation (Phase 3.6)**:

```bash
# T020, T021 can run in parallel (different files)
Task: "Document deployment procedure in docs/deployment.md"
Task: "Update CLAUDE.md with deployment context"
```

**Note**: Most tasks are sequential due to infrastructure dependencies (Makefile → Workflow → Testing).

## Task Sizing Rationale

Per user guidance ("not too granular, not too overloaded"), tasks are sized to:

- **Scripts (T003-T005)**: Grouped by function but kept separate for parallel execution (3 files)
- **Makefile (T006-T007)**: Split into API logic vs. git operations (logical separation, ~45 min each)
- **Workflow (T008-T014)**: Split by logical workflow sections (trigger/concurrency, version, build, deploy, release, bump) to avoid 200+ line single task
- **Validation (T015-T019)**: Grouped by quickstart.md parts (logical test groupings)
- **Documentation (T020-T021)**: Kept as separate parallel tasks

Total: 21 tasks (3 optional/parallel) vs. template example of 23 tasks - appropriate for infrastructure feature.

## Validation Checklist

- [x] All contracts have corresponding validation tests (T015-T019 cover both contracts)
- [x] Tests come before implementation (validation phase after implementation for infrastructure)
- [x] Parallel tasks truly independent (scripts phase, docs phase)
- [x] Each task specifies exact file path or validation reference
- [x] No task modifies same file as another [P] task
- [x] Task sizing balanced per user guidance (not too granular, not too overloaded)

## Notes

- **Infrastructure Context**: This feature has different task structure than typical application code (no traditional unit tests)
- **Validation Approach**: Manual integration testing via quickstart.md procedures instead of automated test suites
- **Node.js Over Bash**: Per project guidance, logic implemented in Node.js scripts rather than heavy bash scripting
- **Sequential Dependencies**: Most tasks sequential due to Makefile → Workflow → Testing dependencies
- **Production Deployment**: T017+ create real deployments to GitHub Pages; use caution
- **Rollback**: See `quickstart.md` Rollback Procedures if deployment needs to be reverted

## Success Criteria

Upon completion of all tasks:

- ✅ `make release.pages` command functional with git validation and API integration
- ✅ GitHub Actions workflow triggers on `pages/v*` tags
- ✅ Workflow builds, deploys to Pages, creates releases, bumps version
- ✅ All error scenarios handled gracefully
- ✅ Complete end-to-end deployment validated
- ✅ Team documentation available
- ✅ Live site accessible at https://bodhiapps.github.io/bodhichat
