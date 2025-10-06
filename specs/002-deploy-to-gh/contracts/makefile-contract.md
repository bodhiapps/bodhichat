# Makefile Release Target Contract

**Feature**: 002-deploy-to-gh | **Type**: Makefile Target Validation

## Target Specification

**Target Name**: `release.pages`
**Usage**: `make release.pages [GH_PAT=token]`
**Purpose**: Create and push version tag to trigger GitHub Pages deployment

## Pre-conditions

1. **Git Repository State**
   - Current branch MUST be `main`
   - Working directory MUST be clean (no uncommitted changes)
   - Local branch MUST be synced with remote (no unpushed commits)

2. **Environment**
   - `gh` CLI MUST be installed and accessible
   - `git` MUST be installed
   - `jq` MUST be installed for JSON processing
   - Optional: `GH_PAT` environment variable for authenticated API access

3. **Repository**
   - Remote origin MUST be configured
   - Repository MUST be `bodhiapps/bodhichat` (or update API endpoint)

## Execution Contract

### Step 1: Git Validation

**Input**: None
**Output**: Success or error message
**Validation**:

```bash
# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Error: Must be on main branch (currently on $CURRENT_BRANCH)"
  exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Uncommitted changes detected. Commit or stash before release."
  exit 1
fi

# Check for unpushed commits
if [ -n "$(git rev-list @{u}..HEAD)" ]; then
  echo "Error: Unpushed commits detected. Push changes before release."
  exit 1
fi
```

### Step 2: Fetch Latest Release Version

**Input**: Optional `GH_PAT` environment variable
**Output**: Latest version number (e.g., "1.2.3") or empty if no releases
**API Call**:

```bash
# Fetch releases and filter for pages/v* tags
RELEASES=$(GH_PAT=${GH_PAT} gh api repos/bodhiapps/bodhichat/releases \
  --jq '.[] | select(.tag_name | startswith("pages/v")) | {tag_name, created_at}')
```

**Error Handling**:

- If API call fails and GH_PAT not provided:
  ```
  Error: GitHub API request failed (status: 403 rate limit).
  Provide GH_PAT environment variable: GH_PAT=gh_pat_xyz make release.pages
  ```
- If API call fails with GH_PAT:
  ```
  Error: GitHub API request failed: {error message}
  Check token validity and network connection.
  ```

### Step 3: Calculate Next Version

**Input**: Latest version from Step 2 (or default to 0.0.0)
**Output**: Next version number
**Logic**:

```bash
if [ -z "$LATEST_VERSION" ]; then
  NEXT_VERSION="0.1.0"
else
  # Parse version components
  IFS='.' read -ra VERSION_PARTS <<< "$LATEST_VERSION"
  MAJOR=${VERSION_PARTS[0]}
  MINOR=${VERSION_PARTS[1]}
  PATCH=${VERSION_PARTS[2]}

  # Increment patch
  NEXT_PATCH=$((PATCH + 1))
  NEXT_VERSION="$MAJOR.$MINOR.$NEXT_PATCH"
fi
```

**Display**:

```
Latest release: pages/v1.2.3 (or "None" if first release)
Next version: pages/v1.2.4
```

### Step 4: Check Tag Existence

**Input**: Next version tag (e.g., "pages/v1.2.4")
**Output**: Tag existence status (local, remote, or none)
**Validation**:

```bash
TAG_NAME="pages/v$NEXT_VERSION"

# Check local tag
if git tag -l "$TAG_NAME" | grep -q .; then
  LOCAL_EXISTS=true
else
  LOCAL_EXISTS=false
fi

# Check remote tag
if git ls-remote --tags origin "$TAG_NAME" | grep -q .; then
  REMOTE_EXISTS=true
else
  REMOTE_EXISTS=false
fi
```

**If Tag Exists**:

```
Tag pages/v1.2.4 already exists (local: yes, remote: yes).
Delete and recreate? This will trigger a new deployment. (y/N):
```

**User Input Handling**:

- Default: N (abort)
- If Y: Delete local and remote tags
  ```bash
  git tag -d "$TAG_NAME"
  git push origin :refs/tags/"$TAG_NAME"
  ```

### Step 5: Create and Push Tag

**Input**: Tag name (e.g., "pages/v1.2.4")
**Output**: Git tag created and pushed
**Execution**:

```bash
git tag "$TAG_NAME"
git push origin "$TAG_NAME"
```

**Success Message**:

```
✓ Tag pages/v1.2.4 created and pushed
✓ GitHub Actions workflow triggered
✓ Monitor deployment: https://github.com/bodhiapps/bodhichat/actions
```

## Post-conditions

1. **Git State**
   - New tag `pages/vX.Y.Z` exists locally
   - Tag pushed to remote origin
   - GitHub Actions workflow triggered

2. **Output**
   - Clear success message with next steps
   - Link to GitHub Actions monitoring page

3. **Side Effects**
   - GitHub Actions workflow starts executing
   - No local file modifications (only git tag)

## Error Handling

### Error: Git Not Clean

```
Error: Uncommitted changes detected. Commit or stash before release.

Files with changes:
  M src/App.tsx
  ?? new-file.txt
```

**Recovery**: Commit or stash changes, rerun target

### Error: GitHub API Rate Limit

```
Error: GitHub API rate limit exceeded (60 requests/hour without token).

To increase limit to 5000 req/hr, provide a GitHub Personal Access Token:
  GH_PAT=gh_pat_xxxxxxxxxxxx make release.pages

Create token at: https://github.com/settings/tokens?scopes=repo
```

**Recovery**: Provide GH_PAT or wait for rate limit reset

### Error: Tag Already Exists (User Declines Overwrite)

```
Tag pages/v1.2.4 already exists (local: yes, remote: yes).
Delete and recreate? This will trigger a new deployment. (y/N): n

Deployment aborted. Tag not modified.
```

**Recovery**: None (intentional abort)

### Error: Network Failure

```
Error: Failed to push tag to remote: fatal: unable to access 'https://github.com/...':
Could not resolve host: github.com
```

**Recovery**: Check network connection, rerun target (local tag already created, will skip to push)

## Validation Tests

### Test 1: Happy Path (First Release)

**Setup**: No existing releases with `pages/v*` tags
**Execute**: `make release.pages`
**Expected**:

- Fetch releases: Empty list
- Calculate version: 0.1.0
- Create tag: pages/v0.1.0
- Push tag: Success
- Output: "✓ Tag pages/v0.1.0 created and pushed"

### Test 2: Happy Path (Subsequent Release)

**Setup**: Latest release is `pages/v1.2.3`
**Execute**: `make release.pages`
**Expected**:

- Fetch releases: pages/v1.2.3 found
- Calculate version: 1.2.4
- Create tag: pages/v1.2.4
- Push tag: Success

### Test 3: Uncommitted Changes

**Setup**: Modified file not committed
**Execute**: `make release.pages`
**Expected**:

- Git validation fails
- Error: "Uncommitted changes detected"
- Exit code: 1

### Test 4: Tag Already Exists (Overwrite Declined)

**Setup**: Tag `pages/v1.2.4` exists
**Execute**: `make release.pages`, input "n" at prompt
**Expected**:

- Tag check: Exists (local/remote)
- Prompt: "Delete and recreate? (y/N)"
- User input: n
- Output: "Deployment aborted"
- Exit code: 0

### Test 5: Tag Already Exists (Overwrite Accepted)

**Setup**: Tag `pages/v1.2.4` exists
**Execute**: `make release.pages`, input "y" at prompt
**Expected**:

- Tag check: Exists
- Prompt: "Delete and recreate? (y/N)"
- User input: y
- Delete: Local and remote tags deleted
- Create: New tag created
- Push: Success

### Test 6: GitHub API Rate Limit (No Token)

**Setup**: Rate limit exceeded, no GH_PAT
**Execute**: `make release.pages`
**Expected**:

- API call fails: 403 rate limit
- Error message: Includes GH_PAT usage instructions
- Exit code: 1

### Test 7: Authenticated API Call

**Setup**: Valid GH_PAT provided
**Execute**: `GH_PAT=gh_pat_xyz make release.pages`
**Expected**:

- API call: Uses authentication
- No rate limit error
- Success

## Dependencies

- git >= 2.0
- gh CLI >= 2.0
- jq >= 1.6
- bash >= 4.0
- Network access to github.com

## Notes

- This target does NOT modify any source files
- This target does NOT commit any changes
- This target only creates and pushes a git tag
- The actual deployment happens in GitHub Actions workflow
