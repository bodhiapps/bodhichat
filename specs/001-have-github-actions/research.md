# Research: GitHub Actions CI/CD Workflow

**Feature**: `001-have-github-actions` | **Date**: 2025-10-06

## Overview

This document consolidates research findings for implementing a GitHub Actions CI/CD workflow that automates build verification, testing (unit + e2e), and workflow summaries for the Bodhi Chat project.

## 1. GitHub Actions Workflow Structure

### Decision

Use GitHub Actions YAML workflow with job orchestration based on `needs` dependencies and parallel execution where possible.

### Rationale

- **Native Integration**: GitHub Actions is the native CI/CD platform for GitHub repositories, requiring no additional service configuration
- **Job Dependencies**: The `needs` keyword allows explicit job ordering (build → tests → summary)
- **Parallel Execution**: Jobs without dependencies can run concurrently, reducing total workflow time
- **Mature Ecosystem**: Extensive marketplace of actions for common tasks (checkout, setup-node, upload-artifact)

### Key Patterns

**Workflow Trigger**:

```yaml
on:
  push:
    branches: [main]
```

**Job Dependencies**:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

  test-unit:
    needs: build # Sequential dependency

  test-e2e:
    needs: build # Runs in parallel with test-unit
```

**Conditional Execution**:

```yaml
summary:
  needs: [build, test-unit, test-e2e]
  if: always() # Runs even if previous jobs fail
```

### Alternatives Considered

- **GitHub Actions Matrix Strategy**: Over-engineered for single Node.js version (v22+)
- **Separate Workflows**: Would complicate summary generation and increase duplication
- **Reusable Workflows**: Unnecessary complexity for a single workflow file

## 2. NPM Dependency Caching

### Decision

Use `actions/setup-node@v4` with built-in npm caching via `cache: 'npm'` parameter.

### Rationale

- **Integrated Caching**: `setup-node` action has native npm cache support
- **Automatic Key Management**: Cache key automatically derived from `package-lock.json`
- **Cross-Job Sharing**: Cache restored for all jobs that use setup-node
- **Performance**: Reduces npm ci time from ~60s to ~10s on cache hit

### Configuration

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'

- name: Install dependencies
  run: npm ci
```

### Cache Behavior

- **Cache Hit**: Dependencies restored from cache, npm ci validates integrity
- **Cache Miss**: Full dependency installation, cache saved for next run
- **Cache Invalidation**: Automatic when package-lock.json changes
- **Storage Limit**: 10GB per repository (old caches evicted automatically)

### Alternatives Considered

- **Manual actions/cache**: Requires explicit cache key management, more verbose
- **Third-party Caching Actions**: Unnecessary when setup-node provides built-in support
- **Yarn/pnpm**: Project uses npm, no benefit to switching package managers

## 3. GitHub Actions Workflow Summary

### Decision

Use `$GITHUB_STEP_SUMMARY` environment file with markdown formatting for job status reporting.

### Rationale

- **Native Feature**: GitHub Actions supports markdown summaries visible in workflow UI
- **Job Context Access**: Can access status of all jobs via `needs` context
- **Persistent Display**: Summary visible after workflow completes, unlike step logs
- **Rich Formatting**: Supports markdown tables, emojis, links for clear status presentation

### Implementation Pattern

```yaml
summary:
  needs: [build, test-unit, test-e2e]
  if: always()
  runs-on: ubuntu-latest
  steps:
    - name: Generate Summary
      run: |
        echo "## Workflow Summary" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "| Job | Status |" >> $GITHUB_STEP_SUMMARY
        echo "|-----|--------|" >> $GITHUB_STEP_SUMMARY
        echo "| Build | ${{ needs.build.result }} |" >> $GITHUB_STEP_SUMMARY
        echo "| Unit Tests | ${{ needs.test-unit.result }} |" >> $GITHUB_STEP_SUMMARY
        echo "| E2E Tests | ${{ needs.test-e2e.result }} |" >> $GITHUB_STEP_SUMMARY
```

### Job Result Values

- `success`: Job completed successfully
- `failure`: Job failed
- `cancelled`: Job was cancelled
- `skipped`: Job was skipped due to dependency failure

### Alternatives Considered

- **GitHub Checks API**: Requires additional API calls and token management
- **External Reporting Services**: Adds dependency on third-party service
- **Slack/Email Notifications**: Out of scope per feature spec

## 4. Artifact Upload and Retention

### Decision

Use `actions/upload-artifact@v4` with 3-day retention for build outputs and test reports.

### Rationale

- **Debugging Support**: Artifacts available for investigation when builds/tests fail
- **Official Action**: Maintained by GitHub, integrates with workflow UI
- **Retention Balance**: 3 days sufficient for debugging while minimizing storage costs
- **Selective Upload**: Only upload artifacts from failed jobs or valuable outputs

### Configuration

**Build Artifacts**:

```yaml
- name: Upload build artifacts
  if: failure() # Only on build failure for debugging
  uses: actions/upload-artifact@v4
  with:
    name: build-dist
    path: dist/
    retention-days: 3
```

**Test Reports**:

```yaml
- name: Upload E2E test results
  if: failure() # Only on test failure
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 3
```

### Storage Considerations

- **Repository Limit**: 10GB total artifact storage (shared with caches)
- **Automatic Cleanup**: Artifacts older than retention period deleted automatically
- **Size Optimization**: Use `if: failure()` for large artifacts to save space

### Alternatives Considered

- **Longer Retention**: 7-30 days unnecessary for fast-moving project
- **Shorter Retention**: 1 day too short for debugging across weekends
- **External Storage**: S3/GCS adds complexity for minimal benefit

## 5. Conditional Job Execution and Failure Handling

### Decision

Use `needs` with job result checks and `if: always()` for summary job to ensure comprehensive reporting.

### Rationale

- **Fail-Fast Behavior**: Tests depend on build succeeding (don't run tests on build failure)
- **Always-Run Summary**: Summary job shows all results regardless of failures

### Implementation Patterns

**Critical Dependencies**:

```yaml
test-unit:
  needs: build
  # Implicitly fails if build fails (default behavior)
```

**Always-Run Jobs**:

```yaml
summary:
  needs: [build, test-unit, test-e2e]
  if: always() # Runs even if dependencies fail
```

### Failure Propagation

- Build fails → Tests skipped → Summary runs
- Tests fail → Summary runs (reports test failure)

### Alternatives Considered

- **Continue-On-Error for All**: Hides critical failures, rejected
- **Matrix with Failfast**: Over-engineered for non-matrix workflow
- **Separate Success/Failure Workflows**: Duplicates logic unnecessarily

## Implementation Notes

### Makefile Integration

The workflow uses existing Makefile commands:

- `make build` - Runs TypeScript compilation and Vite build
- `make ci.test` - Runs Vitest tests
- `make test.e2e` - Runs Playwright tests

No Makefile changes needed.

### Estimated Workflow Duration

- **Build**: ~1.5 minutes (with cache)
- **Unit Tests**: ~1 minute (parallel with e2e)
- **E2E Tests**: ~2 minutes (parallel with unit)
- **Summary**: ~5 seconds
- **Total**: ~3 minutes (with parallelization)

## References

- GitHub Actions Documentation: https://docs.github.com/en/actions
- Vitest Testing: https://vitest.dev/
- Actions Setup Node: https://github.com/actions/setup-node
- Workflow Syntax: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions

---

**All research complete. Ready for Phase 1: Design & Contracts.**
