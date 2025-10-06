.PHONY: all setup install clean build test ci.test test.e2e ci.test.e2e lint lint-fix format format-fix pre-commit validate release.pages help

.DEFAULT_GOAL := help

all: setup format lint build ci.test ci.test.e2e ## Build and test everything including E2E tests

setup: ## Install dependencies with exact versions (using npm ci)
	@echo "Installing dependencies..."
	npm ci
	@echo "Dependencies installed successfully"
	@echo "Installing Playwright browsers..."
	npx playwright install chromium
	@echo "Playwright browsers installed successfully"
	@echo "Configuring git hooks..."
	git config core.hooksPath .githooks
	@echo "Git hooks configured successfully"

install: ## Install dependencies (using npm install)
	@echo "Installing dependencies..."
	npm install
	@echo "Dependencies installed successfully"

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf dist coverage .nyc_output playwright-report test-results
	@echo "Build artifacts cleaned"

build: ## Build the project
	npm run build
	@echo "Build completed successfully"

test: ## Run tests
	npm test
	@echo "Tests completed successfully"

ci.test: ## Run tests in CI mode
	npm run test:ci
	@echo "CI tests completed successfully"

test.e2e: ## Run Playwright E2E tests
	npm run test:e2e
	@echo "E2E tests completed successfully"

ci.test.e2e: ## Run Playwright E2E tests in CI mode (headless)
	npm run test:e2e:ci
	@echo "E2E tests completed successfully"

lint: ## Run ESLint checks
	@echo "Running ESLint checks..."
	npm run lint
	@echo "ESLint checks completed"

lint-fix: ## Fix ESLint and formatting issues automatically
	@echo "Fixing ESLint and formatting issues..."
	npm run format
	npm run lint:fix
	@echo "ESLint and formatting fixes completed"

format: ## Check code formatting without making changes
	@echo "Checking code formatting..."
	npm run format:check
	@echo "Format check completed"

format-fix: ## Format code with Prettier
	@echo "Formatting code..."
	npm run format
	@echo "Code formatting completed"

pre-commit: ## Fix all pre-commit issues (format + lint)
	@$(MAKE) lint-fix

validate: ## Run validation (lint)
	@echo "Validating..."
	npm run lint
	@echo "Validation completed successfully"

release.pages: ## Create and push version tag to trigger GitHub Pages deployment
	@echo "Starting GitHub Pages release process..."
	@echo ""
	@echo "Step 1: Validating git repository state..."
	@node scripts/git-check-branch.js
	@node scripts/git-check-sync.js
	@echo "✓ Repository state validated"
	@echo ""
	@echo "Step 2: Fetching latest releases from GitHub..."
	@RELEASES=$$(GH_PAT=$(GH_PAT) gh api repos/bodhiapps/bodhichat/releases --jq '.[] | select(.tag_name | startswith("pages/v")) | .tag_name' 2>&1); \
	if [ $$? -ne 0 ]; then \
		if echo "$$RELEASES" | grep -q "rate limit"; then \
			echo "Error: GitHub API rate limit exceeded (60 requests/hour without token)."; \
			echo ""; \
			echo "To increase limit to 5000 req/hr, provide a GitHub Personal Access Token:"; \
			echo "  GH_PAT=gh_pat_xxxxxxxxxxxx make release.pages"; \
			echo ""; \
			echo "Create token at: https://github.com/settings/tokens?scopes=repo"; \
			exit 1; \
		else \
			echo "Error: GitHub API request failed: $$RELEASES"; \
			echo "Check token validity and network connection."; \
			exit 1; \
		fi; \
	fi; \
	LATEST_TAG=$$(echo "$$RELEASES" | head -1); \
	if [ -z "$$LATEST_TAG" ]; then \
		echo "Latest release: None (this will be the first release)"; \
		LATEST_VERSION=""; \
		NEXT_VERSION="0.0.1"; \
	else \
		echo "Latest release: $$LATEST_TAG"; \
		LATEST_VERSION=$${LATEST_TAG#pages/v}; \
		NEXT_VERSION=$$(node scripts/increment-version.js $$LATEST_VERSION); \
	fi; \
	TAG_NAME="pages/v$$NEXT_VERSION"; \
	echo "Next version: $$TAG_NAME"; \
	echo ""; \
	echo "Step 3: Checking if tag already exists..."; \
	node scripts/delete-tag-if-exists.js $$TAG_NAME || exit 0; \
	echo ""; \
	echo "Step 4: Creating and pushing tag..."; \
	git tag "$$TAG_NAME"; \
	git push origin "$$TAG_NAME"; \
	echo ""; \
	echo "✓ Tag $$TAG_NAME created and pushed"; \
	echo "✓ GitHub Actions workflow triggered"; \
	echo "✓ Monitor deployment: https://github.com/bodhiapps/bodhichat/actions"; \
	echo ""

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9._-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
