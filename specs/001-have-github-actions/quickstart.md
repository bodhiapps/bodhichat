# Quickstart: GitHub Actions CI/CD Workflow

**Feature**: `001-have-github-actions` | **Date**: 2025-10-06

## Purpose

This quickstart guide validates that the GitHub Actions CI/CD workflow is properly configured and functioning. It covers initial setup, triggering a workflow run, and interpreting results.

## Prerequisites

- GitHub repository with the workflow file committed to main branch
- Repository access to configure GitHub Actions (if needed)

## Setup Steps

### 1. Verify Workflow File

Confirm `.github/workflows/ci.yml` exists and is committed to the repository.

## Triggering the Workflow

### Method 1: Push to Main Branch

```bash
# Make a trivial change (e.g., update README)
echo "\n# CI/CD Enabled" >> README.md

# Commit and push to main
git add README.md
git commit -m "Test CI/CD workflow"
git push origin main
```

### Method 2: Merge a Pull Request

1. Create a feature branch with changes
2. Open pull request
3. Merge to main → triggers workflow

## Validation Steps

### 1. Check Workflow Run Started

1. Navigate to repository on GitHub
2. Click **Actions** tab
3. Verify new workflow run appears: "CI/CD Pipeline"
4. Click on the run to view details

**Expected**:

- Workflow status: "In progress" (yellow circle) or "Completed" (green check)
- All 4 jobs visible: build, test-unit, test-e2e, summary

### 2. Monitor Job Execution

Watch jobs execute in order:

1. **Build** starts immediately
2. **test-unit** and **test-e2e** start in parallel after build completes
3. **summary** starts after all jobs finish

**Expected Job Statuses** (success path):

- ✅ Build: Success
- ✅ Unit Tests: Success
- ✅ E2E Tests: Success
- ✅ Summary: Success (always)

### 3. Review Workflow Summary

In the GitHub Actions workflow run page:

1. Click on the **summary** job
2. Expand the "Generate Summary" step
3. View the markdown summary table

**Expected Summary Content**:

```markdown
## Workflow Summary

| Job        | Status  |
| ---------- | ------- |
| Build      | success |
| Unit Tests | success |
| E2E Tests  | success |
```

### 4. Verify Artifacts (on failure only)

If any job fails:

1. Scroll to bottom of workflow run page
2. Check "Artifacts" section
3. Verify relevant artifacts are available:
   - `build-dist` (if build failed)
   - `playwright-report` (if E2E tests failed)

**Artifact Retention**: Artifacts expire after 3 days.

## Testing Failure Scenarios

### Test Build Failure

**Introduce TypeScript Error**:

```typescript
// In any .tsx file, add invalid code
const x: number = 'string'; // Type error
```

**Expected**:

- Build job fails with TypeScript compilation error
- Unit and E2E test jobs skipped
- Summary shows build failure

**Cleanup**: Fix the error and push to main again.

### Test Unit Test Failure

**Introduce Failing Test**:

```typescript
// In src/App.test.tsx (or any test file)
test('this test should fail', () => {
  expect(true).toBe(false);
});
```

**Expected**:

- Build succeeds
- Unit test job fails
- E2E test job may succeed (runs in parallel)
- Summary shows unit test failure
- Workflow marked as failed

**Cleanup**: Remove failing test and push to main.

### Test E2E Failure

**Introduce Failing E2E Test**:

```typescript
// In e2e/example.spec.ts
test('should fail', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText('NonexistentText')).toBeVisible();
});
```

**Expected**:

- Build succeeds
- Unit tests succeed
- E2E test job fails
- Playwright report artifact uploaded
- Summary shows E2E failure
- Workflow marked as failed

**Cleanup**: Remove failing test and push to main.

## Performance Validation

### Check Workflow Duration

After successful run, verify total duration:

1. View workflow run page
2. Check total duration in top-right corner

**Expected**:

- Total duration: <5 minutes (with dependency caching)
- Build: <2 minutes
- Unit tests: <2 minutes
- E2E tests: <3 minutes
- Summary: <10 seconds

**Note**: First run may be slower (~5-7 minutes) due to cache population.

### Verify Caching Working

After first successful run:

1. Trigger second workflow run (push another commit)
2. Check "Install dependencies" step in any job
3. Look for cache hit message

**Expected**:

- npm install step shows "Cache restored from key: ..."
- Installation time reduced from ~60s to ~10s

## Troubleshooting

### Workflow Not Triggering

**Symptoms**: No workflow run appears after pushing to main.

**Solutions**:

- Verify `.github/workflows/ci.yml` is committed to main branch
- Check workflow file has correct trigger: `on.push.branches: [main]`
- Ensure branch name is exactly "main" (not "master")

### Tests Passing Locally But Failing in CI

**Symptoms**: Tests succeed with `make test` locally but fail in GitHub Actions.

**Solutions**:

- Check Node.js version matches (22+)
- Verify dependencies are locked in `package-lock.json`
- Review test output in workflow logs for environment-specific issues

### E2E Tests Failing

**Symptoms**: Playwright tests fail with browser errors.

**Solutions**:

- Verify Playwright browsers installed: `npx playwright install chromium`
- Check dev server starts correctly (port 5173)
- Review Playwright report artifact for screenshots/traces

### Artifacts Not Appearing

**Symptoms**: Expected artifacts missing from workflow run.

**Solutions**:

- Build/E2E artifacts only upload on failure (check job status)
- Artifacts expire after 3 days (check run date)

## Success Criteria Checklist

After completing this quickstart, you should have:

- [ ] Workflow runs automatically on push to main
- [ ] All 4 jobs execute in correct order
- [ ] Build compiles successfully
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Workflow summary displays all job statuses
- [ ] Dependency caching reduces subsequent run times
- [ ] Failure scenarios properly reported
- [ ] Artifacts available for debugging failed runs

## Next Steps

Once the workflow is validated:

1. Monitor workflow runs to identify and fix any flaky tests
2. Consider adding branch protection rules requiring CI to pass before merge
3. Optionally extend workflow with additional jobs (linting, security scanning)

---

**Quickstart validation complete. Workflow ready for production use.**
