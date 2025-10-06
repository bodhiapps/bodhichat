# Quickstart - Deploy to GitHub Pages

**Feature**: 002-deploy-to-gh | **Date**: 2025-10-06

## Overview

This quickstart guide validates the GitHub Pages deployment workflow from end to end. It covers both the Makefile release target and the GitHub Actions workflow execution.

## Prerequisites

### Environment Setup

1. **Install Required Tools**:

   ```bash
   # Verify git installed
   git --version  # Should be >= 2.0

   # Verify GitHub CLI installed
   gh --version   # Should be >= 2.0

   # Verify jq installed (JSON processor)
   jq --version   # Should be >= 1.6
   ```

2. **GitHub Personal Access Token (Optional but Recommended)**:
   - Navigate to: https://github.com/settings/tokens/new
   - Scopes: `repo` (full control)
   - Expiration: Your choice
   - Generate and save token
   - Export as environment variable:
     ```bash
     export GH_PAT=gh_pat_XXXXXXXXXXXXXXXXXXXX
     ```

3. **Repository Setup**:
   - Ensure you have write access to `bodhiapps/bodhichat`
   - Ensure GitHub Pages is enabled in repository settings
   - Pages source: GitHub Actions

### Clone and Setup

```bash
cd /path/to/bodhichat
git checkout main
git pull origin main
make setup  # Install dependencies
```

## Validation Steps

### Part 1: Pre-Flight Checks

#### Step 1.1: Verify Repository State

```bash
# Check current branch
git rev-parse --abbrev-ref HEAD
# Expected: main

# Check for uncommitted changes
git status --porcelain
# Expected: Empty output

# Check for unpushed commits
git rev-list @{u}..HEAD
# Expected: Empty output
```

**✅ Pass Criteria**: All commands return expected values

#### Step 1.2: Verify GitHub API Access

```bash
# Test GitHub API access (unauthenticated)
gh api repos/bodhiapps/bodhichat/releases --jq '.[0].tag_name'
# Expected: Latest release tag or empty

# Test GitHub API access (authenticated, if GH_PAT set)
GH_PAT=$GH_PAT gh api rate_limit --jq '.rate.limit'
# Expected: 5000 (authenticated) or 60 (unauthenticated)
```

**✅ Pass Criteria**: API calls succeed without errors

#### Step 1.3: Verify Build Works Locally

```bash
npm run build
# Expected: Build completes successfully

ls -la dist/
# Expected: dist/index.html and dist/assets/ exist
```

**✅ Pass Criteria**: Build produces dist/ directory with artifacts

### Part 2: Makefile Release Target

#### Step 2.1: Execute Release Target (Dry Run Validation)

**Note**: Skip actual tag push by Ctrl+C after seeing calculated version

```bash
make release.pages
# Expected output:
# - Fetching latest releases...
# - Latest release: pages/vX.Y.Z (or "None")
# - Next version: pages/vX.Y.(Z+1)
# - Tag pages/vX.Y.(Z+1) does not exist
# - Creating tag...
# [PRESS CTRL+C HERE TO ABORT]
```

**✅ Pass Criteria**: Version calculated correctly (patch incremented)

#### Step 2.2: Test Error Handling - Uncommitted Changes

```bash
# Create uncommitted change
echo "test" > test-file.txt

# Try to release
make release.pages
# Expected: Error "Uncommitted changes detected"

# Clean up
rm test-file.txt
```

**✅ Pass Criteria**: Error detected and deployment aborted

#### Step 2.3: Test Error Handling - Wrong Branch

```bash
# Create and checkout test branch
git checkout -b test-branch

# Try to release
make release.pages
# Expected: Error "Must be on main branch"

# Return to main
git checkout main
git branch -D test-branch
```

**✅ Pass Criteria**: Error detected and deployment aborted

#### Step 2.4: Execute Actual Release

**⚠️ WARNING**: This step creates a real deployment to GitHub Pages

```bash
# Execute release (with optional GH_PAT)
GH_PAT=$GH_PAT make release.pages

# Expected output:
# - Fetching latest releases...
# - Latest release: pages/vX.Y.Z
# - Next version: pages/vX.Y.(Z+1)
# - Creating tag pages/vX.Y.(Z+1)...
# - Tag created and pushed
# - GitHub Actions workflow triggered
# - Monitor deployment: https://github.com/bodhiapps/bodhichat/actions
```

**✅ Pass Criteria**:

- Tag created successfully
- Tag pushed to remote
- Workflow link displayed

### Part 3: GitHub Actions Workflow Validation

#### Step 3.1: Monitor Workflow Execution

1. Open workflow monitoring page (link from Step 2.4)
2. Wait for workflow to start (usually < 30 seconds)
3. Monitor workflow steps in real-time

**Expected Steps**:

1. ✅ Checkout repository
2. ✅ Setup Node.js
3. ✅ Extract version information
4. ✅ Update version for release
5. ✅ Install dependencies
6. ✅ Build production artifacts
7. ✅ Configure GitHub Pages
8. ✅ Upload Pages artifact
9. ✅ Deploy to GitHub Pages
10. ✅ Create GitHub Release
11. ✅ Configure Git for version bump
12. ✅ Checkout main branch
13. ✅ Bump version and commit

**⏱️ Expected Duration**: 3-7 minutes

**✅ Pass Criteria**: All steps complete with green checkmarks

#### Step 3.2: Verify GitHub Pages Deployment

```bash
# Wait 1-2 minutes for Pages to propagate
sleep 120

# Test Pages deployment
curl -I https://bodhiapps.github.io/bodhichat/
# Expected: HTTP/2 200

# Verify content
curl -s https://bodhiapps.github.io/bodhichat/ | grep -o "<title>.*</title>"
# Expected: Title tag from your app
```

**✅ Pass Criteria**: Site returns 200 OK and displays expected content

#### Step 3.3: Verify GitHub Release Created

```bash
# Fetch latest release
gh api repos/bodhiapps/bodhichat/releases/latest --jq '.tag_name'
# Expected: pages/vX.Y.(Z+1) (the version you just deployed)

# List release assets
gh api repos/bodhiapps/bodhichat/releases/latest --jq '.assets[].name'
# Expected: List of files from dist/ (index.html, assets/*)

# Check release body
gh api repos/bodhiapps/bodhichat/releases/latest --jq '.body'
# Expected: Contains "Bodhi Chat Release vX.Y.Z" and Pages URL
```

**✅ Pass Criteria**: Release exists with correct tag and assets

#### Step 3.4: Verify Version Bump on Main

```bash
# Pull latest changes from main
git pull origin main

# Check package.json version
jq -r .version package.json
# Expected: X.Y.(Z+2)-dev (next development version)

# Check latest commit message
git log -1 --pretty=%B
# Expected: "chore: bump version to X.Y.(Z+2)-dev after release [skip ci]"

# Verify commit author
git log -1 --pretty="%an <%ae>"
# Expected: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
```

**✅ Pass Criteria**: Version bumped correctly, commit has correct message and author

### Part 4: Error Scenario Testing

#### Step 4.1: Test Duplicate Tag Deployment

**Setup**: Attempt to deploy same version again

```bash
# Try to release again (should detect existing tag)
make release.pages

# Expected prompt:
# "Tag pages/vX.Y.Z already exists (local: yes, remote: yes).
#  Delete and recreate? This will trigger a new deployment. (y/N):"

# Input: n (decline overwrite)
# Expected: "Deployment aborted. Tag not modified."
```

**✅ Pass Criteria**: Deployment aborted when user declines overwrite

#### Step 4.2: Test Tag Overwrite

```bash
# Release again, accepting overwrite
make release.pages
# At prompt, input: y

# Expected:
# - Local and remote tags deleted
# - New tag created and pushed
# - Workflow triggered again
```

**✅ Pass Criteria**: Tag recreated, new workflow triggered

#### Step 4.3: Test Build Failure Recovery

**Setup**: Introduce syntax error to test workflow failure

```bash
# Create broken code
echo "SYNTAX ERROR" >> src/App.tsx
git add src/App.tsx
git commit -m "test: introduce build error"
git push origin main

# Attempt deployment
make release.pages
# Workflow will trigger but fail at build step

# Monitor workflow: Should fail at "Build production artifacts" step
```

**Expected**:

- Workflow fails at build step
- No deployment to Pages
- No release created
- No version bump on main

**Recovery**:

```bash
# Fix the error
git revert HEAD
git push origin main

# Retry deployment (tag overwrite)
make release.pages  # Input 'y' at prompt
```

**✅ Pass Criteria**: Workflow fails gracefully, recovery succeeds

### Part 5: End-to-End Validation

#### Step 5.1: Full Release Cycle

1. Make a real code change (e.g., update README.md)
2. Commit and push to main
3. Execute: `make release.pages`
4. Monitor workflow completion
5. Verify Pages deployment shows new change
6. Verify release created with correct assets
7. Verify version bumped on main

**✅ Pass Criteria**: All steps complete successfully, change visible on live site

#### Step 5.2: Verify Concurrency Control

**Setup**: Two developers deploy simultaneously (simulated)

```bash
# Terminal 1: Start release
make release.pages  # Will create next version

# Terminal 2: Immediately start another release
make release.pages  # Will calculate same version

# Expected:
# - Terminal 2 detects tag already exists (Terminal 1 created it)
# - Terminal 2 prompts for overwrite
# - If declined: No conflict
# - If accepted: Workflow queued (concurrency control)
```

**✅ Pass Criteria**: Git atomicity + workflow concurrency prevents conflicts

## Rollback Procedures

### Rollback Deployment

**Scenario**: Deployed version has critical bug

```bash
# Option 1: Deploy previous version
# Find previous version tag
git tag -l "pages/v*" | sort -V | tail -2 | head -1

# Delete current tag and push previous
CURRENT_TAG=$(git tag -l "pages/v*" | sort -V | tail -1)
PREVIOUS_TAG=$(git tag -l "pages/v*" | sort -V | tail -2 | head -1)

git tag -d $CURRENT_TAG
git push origin :refs/tags/$CURRENT_TAG
git tag -f $PREVIOUS_TAG
git push origin --tags
# Note: This won't trigger workflow (tag already exists remotely)

# Option 2: Manual Pages rollback via GitHub UI
# Go to: Settings → Pages → View deployment history → Redeploy previous version
```

### Rollback Version Bump

**Scenario**: Version bump commit needs to be reverted

```bash
# Revert the version bump commit
git revert HEAD
git push origin main
```

## Troubleshooting

### Issue: "gh: command not found"

**Solution**: Install GitHub CLI

```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list
sudo apt update
sudo apt install gh
```

### Issue: "GitHub API rate limit exceeded"

**Solution**: Provide GH_PAT

```bash
# Generate token at https://github.com/settings/tokens
export GH_PAT=gh_pat_XXXXXXXXXXXXXXXXXXXX
make release.pages
```

### Issue: "Workflow failed at build step"

**Solution**:

1. Check build locally: `npm run build`
2. Fix any build errors
3. Commit and push fix
4. Create new tag: `make release.pages`

### Issue: "Pages deployment failed"

**Solution**:

1. Check repository settings: Pages enabled, source set to "GitHub Actions"
2. Check workflow permissions: Actions have write access to pages
3. Retry deployment: `make release.pages` (accept tag overwrite)

### Issue: "Version bump commit failed"

**Solution**:

1. Check if another commit was pushed to main during workflow
2. Workflow will fail at push step (conflict)
3. Manual fix:
   ```bash
   git pull origin main
   # Manually update package.json version
   npm version X.Y.Z-dev --no-git-tag-version
   git add package.json package-lock.json
   git commit -m "chore: bump version to X.Y.Z-dev after release"
   git push origin main
   ```

## Success Criteria Summary

### Makefile Target (`make release.pages`)

- ✅ Validates git repository state (clean, on main, synced)
- ✅ Fetches latest releases from GitHub API
- ✅ Calculates next version correctly
- ✅ Handles existing tags with user confirmation
- ✅ Creates and pushes tag successfully
- ✅ Provides clear error messages for all failure scenarios

### GitHub Actions Workflow

- ✅ Triggers only on `pages/v*` tags
- ✅ Extracts version from tag correctly
- ✅ Updates package.json version before build
- ✅ Builds production artifacts successfully
- ✅ Deploys to GitHub Pages
- ✅ Creates GitHub release with artifacts
- ✅ Bumps version on main branch after release
- ✅ Handles failures gracefully (no rollback of successful steps)
- ✅ Implements retry logic for network operations
- ✅ Completes within 10 minutes

### End-to-End Integration

- ✅ Single command (`make release.pages`) initiates full deployment
- ✅ Live site accessible at https://bodhiapps.github.io/bodhichat
- ✅ Release artifacts downloadable from GitHub
- ✅ Development version ready for next cycle
- ✅ Minimal logging (start/completion/errors only)
- ✅ Concurrent deployment protection works

## Estimated Completion Time

- **Part 1 (Pre-Flight)**: 5 minutes
- **Part 2 (Makefile)**: 10 minutes
- **Part 3 (Workflow)**: 10 minutes (including 5-7 min workflow execution)
- **Part 4 (Error Scenarios)**: 15 minutes
- **Part 5 (End-to-End)**: 10 minutes

**Total**: ~50 minutes for complete validation

## Notes

- This is a manual validation process (no automated tests for workflow YAML)
- Testing requires actual GitHub Actions execution
- Some steps create real deployments to production
- Consider using a test repository for initial validation
- GH_PAT is optional but recommended to avoid rate limits
