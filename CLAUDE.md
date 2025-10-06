# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bodhi Chat is a modern ChatGPT-like chat interface powered by the Bodhi Platform. Built with React 18, TypeScript, and Vite, it follows test-driven development and spec-driven development methodologies with a focus on code quality and test coverage.

## Tech Stack

- **React 18** with TypeScript 5.6
- **Vite 6** - Build tool and dev server
- **Tailwind CSS v3** - Utility-first styling
- **ShadCN UI** - Component library (auto-generated components in `src/components/ui/`)
- **React Router v7** - Client-side routing
- **Vitest 3** - Unit/component testing
- **Playwright 1.55** - End-to-end testing
- **ESLint 9** - Flat config with TypeScript support
- **Prettier 3** - Code formatting

## Development Commands

### Makefile Commands (Preferred)

```bash
make              # Show help
make setup        # Install dependencies (npm ci) + Playwright browsers
make build        # Build the project
make test         # Run unit tests (Vitest)
make test.e2e     # Run E2E tests (Playwright)
make lint         # Check code with ESLint
make lint-fix     # Fix ESLint and formatting issues
make format       # Check code formatting
make format-fix   # Fix code formatting
make all          # Full pipeline: setup, format, lint, build, test, test.e2e
```

### npm Scripts

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # TypeScript compile + Vite build
npm test              # Run Vitest tests once
npm run test:watch    # Run Vitest in watch mode
npm run test:ui       # Open Vitest UI
npm run test:e2e      # Run Playwright E2E tests
npm run lint          # Run ESLint checks
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without changes
```

### Running Single Tests

```bash
# Vitest - use file path or pattern
npm test -- src/App.test.tsx
npm test -- -t "test name pattern"

# Playwright - use grep pattern
npm run test:e2e -- --grep "homepage loads"
```

## Code Architecture

### Core Application Structure

- **Entry Point**: `src/main.tsx` → Renders `App.tsx` into DOM
- **Routing**: `App.tsx` uses React Router with nested routes under `Layout` component
- **Layout**: `src/components/Layout.tsx` provides header/nav/footer wrapper with `<Outlet />` for page content
- **Pages**: Located in `src/pages/` (e.g., `Home.tsx`, `About.tsx`)
- **UI Components**: ShadCN components in `src/components/ui/` (auto-generated, excluded from Prettier)

### Path Aliasing

The project uses `@` alias for imports (configured in `vite.config.ts`, `vitest.config.ts`, and `components.json`):

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

### Testing Architecture

The project follows the **test pyramid** philosophy:

1. **Component Tests (More)** - Vitest with React Testing Library
   - Located alongside source files as `*.test.tsx` or `*.test.ts`
   - Use custom render from `src/test/test-utils.tsx` for consistent provider setup
   - Test variations and edge cases at this level
   - Global test setup in `src/test/setup.ts`

2. **E2E Tests (Fewer)** - Playwright
   - Located in `e2e/` directory
   - Focus on success paths and critical failure scenarios
   - Required for multi-step, multi-page UI interactions
   - Auto-starts dev server on `http://localhost:5173` via `webServer` config

### Test Best Practices

- **Network Stubbing**: Network interactions should be stubbed (MSW planned for future)
- **Test IDs**: Prefer `data-testid` for E2E tests (e.g., `getByTestId('app-title')`) over fragile selectors
- **No Conditionals in Tests**: Tests should be deterministic - no if-else statements
- **No Try-Catch in Tests**: Let errors throw naturally to fail tests with proper error messages
- **Console Logging**: Use `console.log` for error scenarios in tests only
- **Assert Convention**: `assert_eq!(expected, actual)` - expected value first

## Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required (enforced by Prettier)
- **Line Width**: 160 characters
- **TypeScript**: Strict mode enabled
- **Arrow Functions**: No parentheses for single params (`avoid` setting)

### Special Formatting Rules

- **ShadCN UI Components** (`src/components/ui/**/*.tsx`) are excluded from Prettier to preserve scaffolded structure
- React refresh rules disabled for UI components and test files in ESLint config

## Development Workflow

### Making Changes

1. Make code changes
2. Run `make format-fix` to format code
3. Run `make lint-fix` to fix linting issues
4. Run `make test` for component tests
5. Run `make build` to verify build
6. Run `make test.e2e` for E2E tests
7. Commit changes (pre-commit hooks automatically run format and lint checks)

Or simply: `make all` for the complete pipeline

**Pre-Commit Hooks**: Git hooks are automatically configured by `make setup`. Before each commit, the hooks will:

- Run `make format` to check formatting (blocks commit if formatting is incorrect)
- Run `make lint` to check for linting violations (blocks commit if violations exist)
- If checks fail: Run `make pre-commit` (or `make lint-fix`) to resolve all issues before committing

### Adding New ShadCN Components

ShadCN components are added via CLI and auto-generated in `src/components/ui/`. The `components.json` config defines:

- Style: `new-york`
- Aliases for imports (`@/components`, `@/lib/utils`, etc.)
- Icon library: `lucide-react`
- Tailwind CSS variables enabled

### Test Configuration

- **Vitest**: Uses `jsdom` environment, globals enabled, excludes `e2e/` and build artifacts
- **Playwright**: Runs against Chromium, auto-starts dev server, retries 2x in CI, single worker in CI
- Both configurations share the same `@` alias resolution

## CI/CD Plans

The project is set up for CI/CD with GitHub Actions (planned):

- Every commit and PR should trigger the full test suite
- Use `make ci.test` for CI-specific test runs
- Playwright configured with `forbidOnly` in CI and retry logic

## Spec-Driven Development

Changes to the repository should be documented as markdown plan files in the repository itself. This ensures all modifications are tracked and well-documented before implementation.
