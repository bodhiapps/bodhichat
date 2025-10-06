.PHONY: all setup install clean build test ci.test test.e2e lint lint-fix format format-fix validate help

.DEFAULT_GOAL := help

all: setup format lint build ci.test test.e2e ## Build and test everything including E2E tests

setup: ## Install dependencies with exact versions (using npm ci)
	@echo "Installing dependencies..."
	npm ci
	@echo "Dependencies installed successfully"
	@echo "Installing Playwright browsers..."
	npx playwright install chromium
	@echo "Playwright browsers installed successfully"

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

validate: ## Run validation (lint)
	@echo "Validating..."
	npm run lint
	@echo "Validation completed successfully"

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9._-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
