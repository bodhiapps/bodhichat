# GitHub Actions Workflow Contract

**Feature**: 002-deploy-to-gh | **Type**: Workflow Validation

## Workflow Specification

**File**: `.github/workflows/deploy-pages.yml`
**Trigger**: Push of tags matching pattern `pages/v*`
**Purpose**: Build production artifacts, deploy to GitHub Pages, create GitHub release

## Trigger Contract

**Pattern**: `pages/v*`
**Examples**:

- ✅ `pages/v0.1.0` - Triggers workflow
- ✅ `pages/v1.2.3` - Triggers workflow
- ✅ `pages/v10.20.30` - Triggers workflow
- ❌ `v1.2.3` - Does not trigger (missing pages/ prefix)
- ❌ `pages/1.2.3` - Does not trigger (missing v after pages/)
- ❌ `release/v1.2.3` - Does not trigger (wrong prefix)

**Configuration**:

```yaml
on:
  push:
    tags:
      - 'pages/v*'
```

## Concurrency Contract

**Group**: `pages-deployment-${{ github.ref }}`
**Cancel In Progress**: false (queue deployments instead of cancelling)

**Behavior**:

- Same tag pushed twice: Second workflow queued until first completes
- Different tags pushed: Both workflows run concurrently
- Purpose: Prevents race conditions, ensures atomic deployments per version

**Configuration**:

```yaml
concurrency:
  group: pages-deployment-${{ github.ref }}
  cancel-in-progress: false
```

## Permissions Contract

**Required Permissions**:

```yaml
permissions:
  contents: write # Create releases, commit version bump
  pages: write # Deploy to GitHub Pages
  id-token: write # Pages deployment attestation
```

**Rationale**:

- `contents: write` - Required for `softprops/action-gh-release` and version bump commit
- `pages: write` - Required for `actions/deploy-pages`
- `id-token: write` - Required for OIDC token generation (Pages security)

## Execution Contract

### Step 1: Checkout Repository

**Action**: `actions/checkout@v4`
**Input**: None (defaults to triggered ref)
**Output**: Repository checked out at tag commit
**Validation**: .git directory and source files exist

**Configuration**:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1 # Shallow clone for speed
```

### Step 2: Setup Node.js

**Action**: `actions/setup-node@v4`
**Input**: Node version from `.node-version` or explicit version
**Output**: Node.js and npm available in PATH
**Validation**: `node --version` and `npm --version` succeed

**Configuration**:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version-file: '.node-version'
    cache: 'npm'
```

### Step 3: Extract Version Information

**Type**: Shell script step
**Input**: `GITHUB_REF` (e.g., `refs/tags/pages/v1.2.3`)
**Output**: Environment variables for subsequent steps
**Validation**: Version extracted matches semantic versioning format

**Script**:

```yaml
- name: Extract version information
  id: version
  run: |
    # Extract version from tag (refs/tags/pages/v1.2.3 → 1.2.3)
    TAG_VERSION=${GITHUB_REF#refs/tags/pages/v}
    echo "tag_version=$TAG_VERSION" >> $GITHUB_OUTPUT

    # Calculate next patch version for post-release
    IFS='.' read -ra VERSION_PARTS <<< "$TAG_VERSION"
    MAJOR=${VERSION_PARTS[0]}
    MINOR=${VERSION_PARTS[1]}
    PATCH=${VERSION_PARTS[2]}
    NEXT_PATCH=$((PATCH + 1))
    NEXT_VERSION="$MAJOR.$MINOR.$NEXT_PATCH-dev"
    echo "next_version=$NEXT_VERSION" >> $GITHUB_OUTPUT
```

**Outputs**:

- `tag_version`: e.g., "1.2.3"
- `next_version`: e.g., "1.2.4-dev"

### Step 4: Update Version for Release

**Type**: Shell script step
**Input**: `tag_version` from Step 3
**Output**: package.json and package-lock.json updated
**Validation**: `jq -r .version package.json` equals tag_version

**Script**:

```yaml
- name: Update version for release
  run: |
    npm version ${{ steps.version.outputs.tag_version }} --no-git-tag-version
```

**Side Effects**:

- package.json `version` field updated
- package-lock.json `version` and `packages[""].version` updated

### Step 5: Install Dependencies

**Type**: Shell command
**Input**: package-lock.json
**Output**: node_modules/ populated
**Validation**: `npm run build` can execute

**Script**:

```yaml
- name: Install dependencies
  run: npm ci
```

### Step 6: Build Production Artifacts

**Type**: Shell command (npm script)
**Input**: Source files, node_modules
**Output**: dist/ directory with built files
**Validation**: dist/index.html exists and is non-empty

**Script**:

```yaml
- name: Build production artifacts
  run: npm run build
```

**Error Handling**: If build fails, workflow fails immediately (FR-020)

### Step 7: Configure GitHub Pages

**Action**: `actions/configure-pages@v4`
**Input**: None (auto-detects repository settings)
**Output**: Pages configuration applied
**Validation**: Pages environment configured

**Configuration**:

```yaml
- name: Configure GitHub Pages
  uses: actions/configure-pages@v4
```

### Step 8: Upload Pages Artifact

**Action**: `actions/upload-pages-artifact@v3`
**Input**: dist/ directory path
**Output**: Artifact uploaded to GitHub storage
**Validation**: Artifact ID returned

**Configuration**:

```yaml
- name: Upload Pages artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./dist
```

### Step 9: Deploy to GitHub Pages

**Action**: `actions/deploy-pages@v4`
**Input**: Artifact from Step 8
**Output**: Site deployed to Pages URL
**Validation**: HTTP 200 from https://bodhiapps.github.io/bodhichat

**Configuration**:

```yaml
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

**Error Handling**: If deploy fails, workflow fails but does NOT revert (FR-021)

### Step 10: Create GitHub Release

**Action**: `softprops/action-gh-release@v1`
**Input**: dist/ files, tag name, release metadata
**Output**: GitHub release created with artifacts
**Validation**: Release visible at https://github.com/bodhiapps/bodhichat/releases

**Configuration**:

```yaml
- name: Create GitHub Release
  uses: softprops/action-gh-release@v1
  with:
    files: dist/**/*
    name: 'Bodhi Chat v${{ steps.version.outputs.tag_version }}'
    body: |
      Bodhi Chat Release v${{ steps.version.outputs.tag_version }}

      🌐 Live Application: https://bodhiapps.github.io/bodhichat

      This release has been automatically deployed to GitHub Pages.
    draft: false
    prerelease: false
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Error Handling**: If release fails, workflow fails but does NOT revert Pages deployment (FR-021)

### Step 11: Configure Git for Version Bump

**Type**: Shell script step
**Input**: None
**Output**: Git user.name and user.email configured
**Validation**: Git config values set

**Script**:

```yaml
- name: Configure Git for version bump
  run: |
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    git config --global user.name "github-actions[bot]"
```

### Step 12: Checkout Main Branch

**Type**: Shell script step
**Input**: None
**Output**: Working directory on main branch
**Validation**: `git rev-parse --abbrev-ref HEAD` returns "main"

**Script**:

```yaml
- name: Checkout main branch
  run: |
    git fetch --depth=1 origin main
    git checkout -B main origin/main
```

### Step 13: Bump Version and Commit

**Type**: Shell script step
**Input**: `next_version` from Step 3
**Output**: package.json/package-lock.json updated and committed
**Validation**: New commit on main with version bump

**Script**:

```yaml
- name: Bump version and add -dev suffix
  run: |
    npm version ${{ steps.version.outputs.next_version }} --no-git-tag-version
    npm install  # Update package-lock.json
    git add package.json package-lock.json
    git commit -m "chore: bump version to ${{ steps.version.outputs.next_version }} after release [skip ci]"
    git push origin main
```

**Commit Message**: Includes `[skip ci]` to prevent triggering CI workflows

## Retry Logic

**Implementation**: Use `nick-fields/retry@v2` for network-dependent steps
**Configuration**:

```yaml
- name: Deploy to GitHub Pages
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 5
    max_attempts: 3
    retry_wait_seconds: 0.5
    command: |
      # Use deploy-pages action here
```

**Applied To**:

- GitHub Pages deployment
- GitHub Release creation
- Git push operations

**Rationale**: Handles transient network failures (FR-024, NFR-001)

## Error Scenarios

### Scenario 1: Build Failure

**Trigger**: `npm run build` exits with non-zero code
**Expected Behavior**:

- Workflow fails at Step 6
- No deployment or release created
- Error logs available in GitHub Actions UI

**Recovery**:

- Fix build error locally
- Commit and push fix
- Create new tag to retry: `make release.pages`

### Scenario 2: Pages Deployment Failure

**Trigger**: `actions/deploy-pages` fails
**Expected Behavior**:

- Workflow fails at Step 9
- Release creation (Step 10) MAY still execute
- No rollback of any successful steps

**Recovery**:

- Check Pages configuration in repository settings
- Verify permissions are correct
- Create new tag to retry deployment

### Scenario 3: Release Creation Failure

**Trigger**: `softprops/action-gh-release` fails
**Expected Behavior**:

- Workflow fails at Step 10
- Pages deployment (Step 9) remains successful
- Site is live but release archive not created

**Recovery**:

- Manually create release via GitHub UI
- Or create new tag to retry (will overwrite existing deployment)

### Scenario 4: Network Timeout

**Trigger**: Network operation exceeds timeout
**Expected Behavior**:

- Retry automatically (3 attempts @ 500ms)
- If all retries fail, workflow fails
- Clear error message in logs

**Recovery**:

- Wait for network stabilization
- Create new tag to retry

### Scenario 5: Simultaneous Tag Push

**Trigger**: Two developers push tags for same version
**Expected Behavior**:

- First push: Workflow starts immediately
- Second push: Workflow queued (concurrency control)
- Second workflow runs after first completes

**Recovery**: None needed (automatic queueing)

## Post-conditions

### Successful Deployment

1. **GitHub Pages**: Site live at https://bodhiapps.github.io/bodhichat
2. **GitHub Release**: Release created with tag name and dist/ artifacts
3. **Version Bump**: package.json on main updated to next-dev version
4. **Git History**: New commit on main with version bump

### Failed Deployment (Build)

1. **GitHub Pages**: No change to previous deployment
2. **GitHub Release**: No release created
3. **Version Bump**: No commit to main
4. **Git Tag**: Tag exists but points to failed deployment

### Partial Failure (Pages OK, Release Failed)

1. **GitHub Pages**: New deployment live
2. **GitHub Release**: No release created
3. **Version Bump**: MAY be committed (if failure occurs before Step 13)
4. **Recovery**: Manual release creation or new tag

## Validation Tests

### Test 1: Happy Path

**Setup**: Push tag `pages/v0.1.0`
**Expected**:

1. Workflow triggered
2. Version extracted: 0.1.0
3. Build succeeds
4. Pages deployed
5. Release created
6. Version bumped to 0.1.1-dev on main

### Test 2: Build Failure

**Setup**: Introduce syntax error in source code, push tag `pages/v0.1.1`
**Expected**:

1. Workflow triggered
2. Build fails at Step 6
3. Workflow status: Failed
4. No deployment or release
5. No version bump

### Test 3: Tag Format Validation

**Setup**: Push tag `v1.0.0` (without pages/ prefix)
**Expected**:

- Workflow NOT triggered
- No deployment

### Test 4: Concurrent Tags

**Setup**: Push `pages/v1.0.0` and `pages/v1.0.1` simultaneously
**Expected**:

- Both workflows triggered
- Both run concurrently (different refs)
- Both deployments succeed (v1.0.1 overwrites v1.0.0)

### Test 5: Version Bump Validation

**Setup**: After successful deployment of `pages/v1.2.3`
**Expected**:

- package.json on main: `"version": "1.2.4-dev"`
- Commit message: "chore: bump version to 1.2.4-dev after release [skip ci]"
- No CI workflow triggered by version bump commit

## Dependencies

### GitHub Actions

- actions/checkout@v4
- actions/setup-node@v4
- actions/configure-pages@v4
- actions/upload-pages-artifact@v3
- actions/deploy-pages@v4
- softprops/action-gh-release@v1
- nick-fields/retry@v2

### Runtime

- ubuntu-latest runner
- Node.js (version from .node-version)
- npm (bundled with Node.js)

### Repository Settings

- GitHub Pages enabled
- Pages source: GitHub Actions
- Permissions: Actions have write access to contents and pages

## Notes

- Workflow file is declarative YAML, not executable code
- Testing requires actual GitHub Actions execution (no local simulation)
- Manual validation via test tags recommended before production use
- Logging is minimal per FR-023 and NFR-002
