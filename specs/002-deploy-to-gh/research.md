# Phase 0: Research - Deploy to GitHub Pages

**Feature**: 002-deploy-to-gh | **Date**: 2025-10-06

## Research Areas

### 1. GitHub Actions Workflow for Pages Deployment

**Decision**: Use official GitHub Actions for Pages deployment
**Chosen Actions**:

- `actions/configure-pages@v4` - Configure GitHub Pages settings
- `actions/upload-pages-artifact@v3` - Upload built artifacts for Pages
- `actions/deploy-pages@v4` - Deploy artifacts to GitHub Pages
- `softprops/action-gh-release@v1` - Create GitHub releases with artifacts

**Rationale**:

- Official GitHub actions provide stable, well-maintained integration
- Handles Pages-specific configuration automatically
- Built-in permissions handling for GITHUB_TOKEN
- Supports concurrent deployment protection

**Alternatives Considered**:

- Custom deployment scripts using gh CLI - Rejected: More complex, reinvents wheel
- peaceiris/actions-gh-pages - Rejected: Requires pushing to gh-pages branch (older pattern)

### 2. Concurrency Control Strategy

**Decision**: Use GitHub Actions concurrency groups with cancel-in-progress: false
**Pattern**:

```yaml
concurrency:
  group: pages-deployment-${{ github.ref }}
  cancel-in-progress: false
```

**Rationale**:

- Prevents simultaneous deployments for same tag reference
- Queue-based processing ensures orderly deployment
- Aligns with FR-019 (concurrency control requirement)
- cancel-in-progress: false ensures running deployments complete

**Alternatives Considered**:

- cancel-in-progress: true - Rejected: Could leave deployments in inconsistent state
- No concurrency control - Rejected: Violates NFR-003

### 3. Version Management Strategy

**Decision**: Extract version from git tag, use npm version --no-git-tag-version
**Pattern**:

```bash
# Extract version from tag (pages/v1.2.3 → 1.2.3)
TAG_VERSION=${GITHUB_REF#refs/tags/pages/v}
npm version $TAG_VERSION --no-git-tag-version
```

**Rationale**:

- Git tag is source of truth for version
- npm version updates package.json and package-lock.json atomically
- --no-git-tag-version prevents creating duplicate git tags
- Aligns with FR-015 (set version before build)

**Alternatives Considered**:

- Manual package.json editing - Rejected: Error-prone, doesn't update package-lock.json
- Using package.json as source of truth - Rejected: Git tag should drive deployment version

### 4. Post-Release Version Bump Strategy

**Decision**: Bump patch version with -dev suffix after successful release
**Pattern**:

```bash
# From 1.2.3 → 1.2.4-dev
IFS='.' read -ra VERSION_PARTS <<< "$TAG_VERSION"
NEXT_PATCH=$((${VERSION_PARTS[2]} + 1))
NEXT_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.$NEXT_PATCH-dev"
npm version $NEXT_VERSION --no-git-tag-version
```

**Rationale**:

- Clearly marks development versions between releases
- Prevents accidental publishing of in-development code
- Aligns with semantic versioning conventions
- Matches pattern in bodhi-js workflow (see publish-bodhijs.yml:44-48)

**Alternatives Considered**:

- No version bump - Rejected: Package version would lag behind released version
- Bump minor instead of patch - Rejected: Patch bump is conventional for automatic bumps

### 5. GitHub API Integration for Release Fetching

**Decision**: Use GitHub CLI (gh) for API operations in Makefile
**Pattern**:

```bash
GH_PAT=${GH_PAT} gh api repos/bodhiapps/bodhichat/releases \
  --jq '.[] | select(.tag_name | startswith("pages/v"))'
```

**Rationale**:

- gh CLI handles authentication automatically (env var or configured token)
- Built-in retry and error handling
- JSON querying with jq for filtering
- Matches pattern in bodhi-js release Makefile (see bodhi-js/Makefile:94-107)

**Alternatives Considered**:

- curl with manual API calls - Rejected: More complex auth handling, manual retry logic
- Custom Node.js script - Rejected: Additional dependency, more complex

### 6. Network Retry Strategy

**Decision**: Implement retry logic using GitHub Actions retry action for workflow steps
**Pattern**:

```yaml
- uses: nick-fields/retry@v2
  with:
    timeout_minutes: 5
    max_attempts: 3
    retry_wait_seconds: 0.5
    command: [network operation]
```

**Rationale**:

- Aligns with FR-024 and NFR-001 (3 retries @ 500ms)
- Handles transient network failures gracefully
- Consistent retry behavior across workflow steps

**Alternatives Considered**:

- Manual retry loops in bash - Rejected: Less readable, harder to maintain
- No retry logic - Rejected: Violates requirements

### 7. Partial Failure Handling

**Decision**: Use continue-on-error: false (default) but allow workflow to complete both steps
**Pattern**:

```yaml
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
  # Default: continue-on-error: false

- name: Create GitHub Release
  uses: softprops/action-gh-release@v1
  # Runs even if previous step fails (unless job is cancelled)
```

**Rationale**:

- Aligns with FR-021 and NFR-004 (don't revert successful steps)
- Each step fails independently
- Workflow status reflects partial success appropriately

**Alternatives Considered**:

- continue-on-error: true - Rejected: Would hide failures
- Conditional execution - Rejected: Would skip release if Pages fails

### 8. Makefile Git Validation

**Decision**: Use existing git validation scripts from bodhi-js pattern
**Required Checks**:

1. Branch check: Ensure on main/master branch
2. Sync check: Ensure no uncommitted changes, no unpushed commits
3. Tag existence check: Prompt for overwrite if tag exists

**Rationale**:

- Proven pattern from bodhi-js release process
- Prevents common deployment mistakes
- Aligns with FR-001, FR-002, FR-008, FR-009

**Reference**: See bodhi-js/Makefile:94-107 and referenced scripts

### 9. Artifact Archival Strategy

**Decision**: Use softprops/action-gh-release with dist/ directory contents
**Pattern**:

```yaml
- uses: softprops/action-gh-release@v1
  with:
    files: dist/**/*
    name: 'Bodhi Chat v${{ steps.version.outputs.tag_version }}'
    body: |
      Bodhi Chat Release v${{ steps.version.outputs.tag_version }}

      Deployed to GitHub Pages: https://bodhiapps.github.io/bodhichat
```

**Rationale**:

- Preserves build artifacts for debugging and audit
- Provides download option for users
- Aligns with FR-018 (archive as GitHub release)

**Alternatives Considered**:

- Only deploy to Pages without release - Rejected: Violates requirements
- Archive as zip separately - Rejected: softprops/action-gh-release handles this

### 10. Logging Strategy

**Decision**: Minimal logging - only workflow step start/completion and errors
**Pattern**:

- Rely on GitHub Actions default step logging (step name + status)
- No verbose build output unless error occurs
- Use echo for critical checkpoints only

**Rationale**:

- Aligns with FR-023 and NFR-002 (minimal logging)
- GitHub Actions provides sufficient context automatically
- Reduces log noise, improves readability

**Alternatives Considered**:

- Verbose logging - Rejected: Violates requirements
- Silent mode - Rejected: Would hide errors

## Summary

All technical unknowns resolved. Implementation will follow:

1. **Makefile**: Shell script-based tag creation with git validation and GitHub API integration
2. **Workflow**: YAML-based GitHub Actions with official Pages actions and release archival
3. **Versioning**: Git tag as source of truth, npm version for package.json management
4. **Error Handling**: Retry logic for network, partial failure tolerance, clear error messages
5. **Patterns**: Closely aligned with existing bodhi-js release workflow for consistency

No NEEDS CLARIFICATION items remaining from Technical Context.
