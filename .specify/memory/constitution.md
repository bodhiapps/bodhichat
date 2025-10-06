# <!--

# SYNC IMPACT REPORT

Version Change: 1.0.1 → 1.0.2 (Workflow Enhancement)
Date: 2025-10-06

Modified Sections:

- Development Workflow → Quality Gates Pipeline:
  - Added automated pre-commit hooks enforcement
  - `make setup` now configures git hooks automatically
  - Commits blocked if format or lint checks fail

Added Sections: None
Removed Sections: None

Templates Requiring Updates:
✅ plan-template.md - No changes needed
✅ spec-template.md - No changes needed
✅ tasks-template.md - No changes needed
✅ agent-file-template.md - No changes needed

Documentation Updates:
✅ .githooks/pre-commit - Created pre-commit hook script
✅ Makefile - Updated setup target to configure git hooks
✅ README.md - Updated with git hooks information
✅ CLAUDE.md - Updated workflow with pre-commit hooks

Follow-up TODOs: None

Rationale:
PATCH version bump (1.0.2) for workflow enhancement. Adding automated
pre-commit hooks enforces existing code quality principles (Principle IV)
by blocking commits that fail format or lint checks. Improves development
workflow without changing governance or adding new principles.

Previous Amendment (1.0.1 - 2025-10-06):
Code style refinement. Enabling semicolons and increasing line width to
160 characters improves code consistency and reduces line wrapping.

Previous Amendment (1.0.0 - 2025-10-06):
Initial constitution establishing foundational principles for Bodhi Chat
development. Principles extracted from README.md and CLAUDE.md emphasize
TDD, test pyramid philosophy, code quality, and spec-driven development.
==============================================================================
-->

# Bodhi Chat Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

**Test-Driven Development is mandatory for all code changes.** The Red-Green-Refactor cycle MUST be strictly followed:

1. Write tests that define desired behavior
2. Obtain user/stakeholder approval of test scenarios
3. Verify tests fail (Red)
4. Implement minimum code to pass tests (Green)
5. Refactor while keeping tests green

**Rationale**: TDD ensures code correctness, prevents regression, provides living documentation, and enables confident refactoring. This principle is non-negotiable and supersedes all other development considerations.

### II. Test Pyramid Philosophy

**Testing MUST follow the test pyramid approach with appropriate distribution:**

- **Component Tests (More)**: Use Vitest with React Testing Library
  - Located alongside source files as `*.test.tsx` or `*.test.ts`
  - Test component variations, edge cases, and business logic
  - Use custom render from `src/test/test-utils.tsx` for consistent provider setup
  - Global test setup in `src/test/setup.ts`

- **E2E Tests (Fewer)**: Use Playwright for critical user journeys
  - Located in `e2e/` directory
  - Focus on success paths and critical failure scenarios
  - Required only for multi-step, multi-page UI interactions
  - Auto-starts dev server on `http://localhost:5173`

**Rationale**: The test pyramid optimizes for fast feedback, maintainability, and cost-effectiveness. Component tests provide rapid iteration while E2E tests validate critical user flows.

### III. Deterministic Testing Practices

**All tests MUST be deterministic and reproducible.** The following rules are mandatory:

- **No Conditionals**: Tests MUST NOT contain if-else statements or conditional logic
- **No Try-Catch**: Let errors throw naturally to fail tests with proper error messages
- **Assert Convention**: Use `assert_eq!(expected, actual)` pattern - expected value always first
- **Test IDs**: Prefer `data-testid` attributes for E2E tests over fragile CSS selectors
- **Parameterized Test**: Parameterize test that have same/similar setup and can be configured by passing parameters
- **Console Logging**: Use `console.log` for error scenarios in tests only, not for general output
- **Single Responsibility**: For Unit/Component tests, each test validates exactly one behavior
- **Multi-step/Multi-assertion UI Tests**: Since UI tests are expensive to run (time+resources), have similar tests grouped as multi-step tests and assertion

**Rationale**: Deterministic tests are reliable, debuggable, and serve as trustworthy documentation. Conditional logic in tests indicates unclear requirements or improper test design.

### IV. Code Quality & Type Safety

**Code quality and type safety are enforced through automated tooling:**

- **TypeScript Strict Mode**: Enabled and enforced
- **ESLint 9**: Flat config with TypeScript support, all violations MUST be fixed
- **Prettier 3**: Code formatting enforced (except ShadCN UI components)
- **Style Consistency**:
  - Indentation: 2 spaces
  - Quotes: Single quotes
  - Semicolons: Required (Prettier enforced)
  - Line width: 160 characters
  - Arrow functions: No parentheses for single parameters

**Rationale**: Automated quality enforcement reduces cognitive load, prevents bugs, ensures consistency across the codebase, and enables safe refactoring.

### V. Spec-Driven Development

**All significant changes MUST be documented before implementation:**

- Document changes as markdown specification files in `.specify/specs/`
- Specifications MUST define what users need and why, not how to implement
- Implementation plans derived from specifications
- Tasks generated from implementation plans
- All modifications tracked and reviewable

**Rationale**: Spec-driven development ensures stakeholder alignment, captures requirements clearly, enables review before coding, and provides documentation for future maintenance.

### VI. Modern React Best Practices

**React development MUST follow modern patterns and conventions:**

- **Component Architecture**: Functional components with hooks
- **Path Aliasing**: Use `@/` alias for imports (configured in vite.config.ts, vitest.config.ts, components.json)
- **ShadCN UI**: Component library for consistency (new-york style)
  - Auto-generated components in `src/components/ui/`
  - Excluded from Prettier formatting to preserve scaffolded structure
  - Built on Radix UI primitives
- **Routing**: React Router v7 with nested routes under Layout component
- **State Management**: React hooks and context for state management

**Rationale**: Modern React patterns improve code maintainability, developer experience, type safety, and application performance while ensuring consistency across the codebase.

### VII. Network Isolation in Tests

**Network interactions in tests MUST be stubbed or mocked:**

- Network requests MUST NOT reach external services during tests
- Use Mock Service Worker (MSW) or similar for HTTP mocking (planned)
- Tests MUST be isolated from external dependencies
- Integration tests may use local test servers but MUST NOT depend on internet connectivity

**Rationale**: Network isolation ensures tests are fast, reliable, deterministic, and can run offline. External dependencies introduce flakiness and coupling.

## Technology Stack

**Language & Runtime**:

- TypeScript 5.6 (strict mode)
- Node.js 20.19+ or 22.12+ (LTS versions)

**Framework & Build**:

- React 18 (functional components with hooks)
- Vite 6 (build tool and dev server)
- React Router v7 (client-side routing)

**UI & Styling**:

- Tailwind CSS v3 (utility-first CSS framework)
- ShadCN UI (component library, new-york style)
- Radix UI (accessible component primitives)
- Lucide React (icon library)
- CSS Variables enabled for theming

**Testing Infrastructure**:

- Vitest 3 (unit and component testing)
- Playwright 1.55 (end-to-end testing)
- React Testing Library (component testing utilities)
- @testing-library/user-event (user interaction simulation)
- jsdom (DOM environment for unit tests)

**Code Quality Tools**:

- ESLint 9 (linting with flat config)
- Prettier 3 (code formatting)
- TypeScript ESLint (TypeScript-specific linting rules)

**Development Tools**:

- Git (version control)
- Make (build automation and task orchestration)
- npm (package management)

## Development Workflow

### Quality Gates Pipeline

**All code changes MUST pass through the following pipeline:**

```bash
make all  # Runs: setup → format → lint → build → test → test.e2e
```

**Individual gates:**

1. **Setup**: `make setup` - Install dependencies (npm ci) + Playwright browsers + Configure git hooks
2. **Format**: `make format-fix` - Auto-format code with Prettier
3. **Lint**: `make lint-fix` - Fix ESLint violations automatically
4. **Build**: `make build` - TypeScript compilation + Vite production build
5. **Test**: `make test` - Run Vitest component/unit tests
6. **E2E**: `make test.e2e` - Run Playwright end-to-end tests

**All gates MUST pass before code review.**

**Automated Pre-Commit Enforcement:**

Git pre-commit hooks are automatically configured by `make setup` and enforce quality gates before commits:

- **Format Check**: Runs `make format` - blocks commit if formatting is incorrect
- **Lint Check**: Runs `make lint` - blocks commit if linting violations exist
- **Fix Command**: If checks fail, run `make pre-commit` to resolve all issues

Commits that fail format or lint checks are automatically blocked to maintain code quality.

**Note**: The `make pre-commit` target is an alias for `make lint-fix`, which runs both format and lint fixes in the correct order.

### Test-Driven Workflow

**Development MUST follow this TDD workflow:**

1. **Specify**: Document feature requirements in spec.md
2. **Plan**: Create implementation plan with test scenarios
3. **Write Tests**: Create failing tests that validate requirements
4. **Approval**: Get stakeholder/peer approval of test scenarios
5. **Verify Failure**: Confirm all new tests fail (Red)
6. **Implement**: Write minimum code to pass tests (Green)
7. **Refactor**: Improve code quality while keeping tests green
8. **Quality Gates**: Run full pipeline (make all)

### Test Organization

**Component Tests (Vitest)**:

- Located alongside source files (e.g., `Button.test.tsx` next to `Button.tsx`)
- Use custom render utilities from `src/test/test-utils.tsx`
- Global setup in `src/test/setup.ts`
- Run with: `npm test` or `make test`
- Watch mode: `npm run test:watch`

**E2E Tests (Playwright)**:

- Located in `e2e/` directory
- Focus on critical user journeys only
- Use `data-testid` for element selection
- Run with: `npm run test:e2e` or `make test.e2e`

### Code Style Enforcement

**Makefile commands enforce consistent style:**

- `make format-fix` - Auto-format all code (except src/components/ui/)
- `make lint-fix` - Auto-fix ESLint violations
- Both MUST be run before committing

**Special Rules**:

- ShadCN UI components (`src/components/ui/**/*.tsx`) excluded from Prettier
- React refresh rules disabled for UI components and test files

### Adding ShadCN Components

**ShadCN components MUST be added via CLI:**

```bash
npx shadcn@latest add [component-name]
```

**Configuration** (components.json):

- Style: new-york
- Base color: slate
- CSS variables: enabled
- Aliases: @/components, @/lib/utils, @/hooks
- Icon library: lucide-react

### CI/CD Requirements

**Continuous Integration MUST:**

- Run full test suite on every commit and PR
- Use `make ci.test` for CI-specific test runs
- Playwright configured with `forbidOnly` in CI
- Retry failed tests 2x in CI
- Use single worker in CI for deterministic execution

## Governance

### Constitutional Authority

**This constitution supersedes all other development practices, guidelines, and conventions.** In case of conflict between this constitution and other documentation, the constitution takes precedence.

### Amendment Process

**Amendments to this constitution require:**

1. **Documentation**: Propose changes with rationale in a pull request
2. **Review**: Technical review by project maintainers
3. **Approval**: Consensus approval from maintainers
4. **Version Bump**: Update `CONSTITUTION_VERSION` according to semantic versioning:
   - **MAJOR**: Backward incompatible changes, principle removals, or redefinitions
   - **MINOR**: New principles added or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, or non-semantic refinements
5. **Migration Plan**: Document impact on existing code and provide migration guidance
6. **Date Update**: Update `LAST_AMENDED_DATE` to amendment date

### Compliance Review

**All pull requests MUST verify compliance with constitutional principles:**

- [ ] TDD workflow followed (tests written first, approved, failed, then passed)
- [ ] Test pyramid maintained (appropriate component vs E2E test distribution)
- [ ] Tests are deterministic (no conditionals, no try-catch, reproducible)
- [ ] Code quality gates passed (TypeScript, ESLint, Prettier)
- [ ] Spec-driven if significant change (spec.md created before implementation)
- [ ] React best practices followed (hooks, path aliasing, ShadCN UI)
- [ ] Network isolation maintained (no external dependencies in tests)

### Complexity Justification

**Any deviation from constitutional principles MUST be justified:**

- Document the specific principle being violated
- Explain why the deviation is necessary
- Demonstrate that simpler alternatives were considered and rejected
- Obtain maintainer approval before proceeding

### Runtime Guidance

**For day-to-day development guidance not covered by this constitution:**

- Refer to `CLAUDE.md` for detailed development instructions
- Consult `README.md` for setup and quick start guidance
- Review component-specific documentation in source files

**Version**: 1.0.2 | **Ratified**: 2025-10-06 | **Last Amended**: 2025-10-06
