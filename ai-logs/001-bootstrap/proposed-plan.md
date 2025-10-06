# Bootstrap Plan: bodhichat React Application

**Project**: Standalone React application with TypeScript, Vite, Tailwind CSS, ShadCN, React Router, Vitest, and Playwright

**Target Directory**: `/Users/amir36/Documents/workspace/src/github.com/BodhiSearch/bodhi-browser/bodhichat` (project root)

**Important Note**: This is a **standalone project**, NOT part of a monorepo. All installations are in the project root directory.

---

## Phase 0: Plan Documentation

### Step 1: Create Plan Directory and Export Plan

**Actions**:

- Create `ai-logs/001-bootstrap/` directory
- Export this plan to `ai-logs/001-bootstrap/plan.md`

**Verification**: Plan file exists and is readable

---

## Phase 1: Initialize Vite React TypeScript Project

### Step 2: Scaffold Vite Project in Current Directory

**Command**:

```bash
npm create vite@latest . -- --template react-ts
```

**Expected Output**:

- Creates package.json, vite.config.ts, tsconfig.json, tsconfig.node.json
- Creates src/ directory with App.tsx, main.tsx, index.css
- Creates public/ directory
- Creates index.html

**Verification**:

```bash
npm install
npm run build
npm run dev
# Ctrl+C to stop dev server
```

**Success Criteria**:

- ✅ Dependencies install without errors
- ✅ Build completes successfully
- ✅ Dev server starts and app loads in browser

---

## Phase 2: Install and Configure Tailwind CSS v4

### Step 3: Install Tailwind CSS v4

**Command**:

```bash
npm install tailwindcss@next @tailwindcss/vite@next
```

**Verification**:

- Check package.json for `tailwindcss` and `@tailwindcss/vite` in dependencies
- Verify node_modules are installed

### Step 4: Configure Tailwind

**Actions**:

1. **Update vite.config.ts** - Add Tailwind plugin and @ path alias:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

2. **Create tailwind.config.js** - ShadCN-compatible theme with CSS variables:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

3. **Create postcss.config.js**:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

4. **Update src/index.css** - Add Tailwind directives and ShadCN theme CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 100% 50%;
    --destructive-foreground: 210 40% 98%;
    --ring: 215 20.2% 65.1%;
    --radius: 0.5rem;
  }

  :root[class~='dark'] {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    --muted: 223 47% 11%;
    --muted-foreground: 215.4 16.3% 56.9%;
    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;
    --popover: 224 71% 4%;
    --popover-foreground: 215 20.2% 65.1%;
    --border: 216 34% 17%;
    --input: 216 34% 17%;
    --card: 224 71% 4%;
    --card-foreground: 213 31% 91%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 1.2%;
    --secondary: 222.2 47.4% 11.2%;
    --secondary-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --ring: 216 34% 17%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Verification**:

```bash
npm run build
ls dist/assets/*.css  # Check that CSS files are generated
```

**Success Criteria**:

- ✅ Build completes without errors
- ✅ CSS files in dist/assets/ contain Tailwind classes

---

## Phase 3: Initialize ShadCN UI

### Step 5: Initialize ShadCN

**Command**:

```bash
npx shadcn@latest init
```

**Interactive Prompts**:

- Select Vite preset
- Choose TypeScript
- Accept default paths (or customize as needed)

**Expected Output**:

- Creates `components.json`
- Creates `src/lib/utils.ts` with cn() helper function
- May update tailwind.config.js and other configs

**Verification**:

```bash
cat components.json
cat src/lib/utils.ts
npm run build
```

**Success Criteria**:

- ✅ components.json exists
- ✅ src/lib/utils.ts exists with cn() function
- ✅ Build completes successfully

### Step 6: Install Initial ShadCN Components

**Command**:

```bash
npx shadcn@latest add button input card scroll-area
```

**Expected Output**:

- Creates src/components/ui/button.tsx
- Creates src/components/ui/input.tsx
- Creates src/components/ui/card.tsx
- Creates src/components/ui/scroll-area.tsx

**Verification**:

```bash
ls src/components/ui/
npm run build
```

**Success Criteria**:

- ✅ All component files exist in src/components/ui/
- ✅ Build completes successfully

---

## Phase 4: Install React Router

### Step 7: Install React Router DOM

**Command**:

```bash
npm install react-router-dom@7.7.1
```

**Verification**:

```bash
cat package.json | grep react-router-dom
npm run build
```

**Success Criteria**:

- ✅ react-router-dom@7.7.1 appears in package.json dependencies
- ✅ Build completes successfully

---

## Phase 5: Configure Vitest for Unit Testing

### Step 8: Install Vitest and Testing Libraries

**Command**:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Verification**:

```bash
cat package.json | grep -E '(vitest|jsdom|@testing-library)'
```

**Success Criteria**:

- ✅ All testing dependencies appear in devDependencies

### Step 9: Configure Vitest

**Actions**:

1. **Create vitest.config.ts**:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

2. **Create src/test/setup.ts**:

```typescript
import '@testing-library/jest-dom';
```

3. **Create src/test/test-utils.tsx**:

```typescript
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

4. **Update package.json** - Add test scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:ci": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui"
  }
}
```

5. **Create src/App.test.tsx** - Sample test:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/vite/i)).toBeInTheDocument()
  })
})
```

**Verification**:

```bash
npm test
npm run build
```

**Success Criteria**:

- ✅ Tests run and pass
- ✅ Build completes successfully

---

## Phase 6: Install and Configure Playwright

### Step 10: Initialize Playwright

**Command**:

```bash
npm init playwright@latest
```

**Interactive Prompts**: Accept defaults or customize test directory

**Expected Output**:

- Creates playwright.config.ts
- Creates tests/ or e2e/ directory
- Updates package.json with @playwright/test

**Post-Installation**:

```bash
npx playwright install
```

**Create Sample E2E Test** (e.g., tests/example.spec.ts or e2e/example.spec.ts):

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Vite/);
});
```

**Verification**:

```bash
npm run build
npx playwright test --reporter=list
```

**Success Criteria**:

- ✅ playwright.config.ts exists
- ✅ Browsers are installed
- ✅ Playwright tests run (may need to start dev server or preview server)

---

## Phase 7: Configuration

### Step 11: TypeScript and ESLint

**Actions**:

1. **Update tsconfig.json** - Ensure strict mode and @ alias:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["vitest/globals"],

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

2. **Verify/Create tsconfig.node.json** exists (usually created by Vite):

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

3. **Create eslint.config.js** - Flat config with TypeScript and React:

```javascript
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    ignores: ['dist', 'node_modules', 'e2e', 'tests', 'playwright-report'],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/test/**/*.ts', 'vitest.config.ts', 'vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
        vi: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
];
```

4. **Install ESLint dependencies**:

```bash
npm install -D @eslint/js @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

5. **Update package.json** - Add lint scripts:

```json
{
  "scripts": {
    "lint": "eslint . --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --fix"
  }
}
```

**Verification**:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

**Success Criteria**:

- ✅ ESLint runs without errors
- ✅ TypeScript compilation succeeds
- ✅ Build completes successfully

---

## Phase 8: Project Structure

### Step 12: Create Project Directories

**Commands**:

```bash
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/hooks
```

**Create src/lib/types.ts** (empty or with initial types):

```typescript
// Application-wide TypeScript types
export type {};
```

**Verification**:

```bash
ls -la src/
npm run build
```

**Success Criteria**:

- ✅ All directories exist
- ✅ Build completes successfully

---

## Phase 9: Create Makefile

### Step 13: Create Makefile

**Create Makefile** in project root:

```makefile
.PHONY: all setup install clean build test ci.test lint lint-fix validate help

all: setup lint build ci.test ## Default target, builds and tests everything

setup: ## Install dependencies with exact versions (using npm ci)
	@echo "Installing dependencies..."
	npm ci
	@echo "Dependencies installed successfully"

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

lint: ## Run ESLint checks
	@echo "Running ESLint checks..."
	npm run lint
	@echo "ESLint checks completed"

lint-fix: ## Fix ESLint and formatting issues automatically
	@echo "Fixing ESLint and formatting issues..."
	npm run lint:fix
	@echo "ESLint and formatting fixes completed"

validate: ## Run validation (lint)
	@echo "Validating..."
	npm run lint
	@echo "Validation completed successfully"

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9._-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
```

**Verification**:

```bash
make build
make test
make lint
```

**Success Criteria**:

- ✅ All Makefile targets execute successfully

---

## Phase 10: Final Verification

### Step 14: Complete Test Suite

**Commands**:

```bash
npm run lint
npm run lint:fix
npm test
npm run build
npx playwright test
npm run dev  # Verify app works in browser, then stop
```

**Success Criteria**:

- ✅ Lint passes
- ✅ Tests pass
- ✅ Build completes
- ✅ Playwright tests pass
- ✅ Dev server runs and app loads

---

## Phase 11: Implementation Review & Plan Correction

### Step 15: Review and Create Reproducible Plan

**Actions**:

1. Review entire implementation against this plan in `ai-logs/001-bootstrap/plan.md`
2. Identify any deviations, corrections, or assumptions made during implementation
3. Document any issues encountered and how they were resolved
4. If deviations found:
   - Rename `ai-logs/001-bootstrap/plan.md` to `ai-logs/001-bootstrap/proposed-plan.md`
   - Create corrected `ai-logs/001-bootstrap/plan.md` reflecting actual implementation steps with all corrections incorporated
5. This ensures future AI can reproduce exactly without making same corrections

**Verification**:

- Compare actual implementation with plan
- Document all deviations
- Create final reproducible plan if needed

---

## Final Success Criteria

- ✅ Vite dev server runs without errors (`npm run dev`)
- ✅ Production build completes successfully (`npm run build`)
- ✅ Tailwind CSS is working (styles applied correctly)
- ✅ ShadCN components render correctly
- ✅ React Router library is installed
- ✅ Vitest unit tests pass (`npm test`)
- ✅ Playwright E2E tests pass (`npx playwright test`)
- ✅ ESLint runs without errors (`npm run lint`)
- ✅ TypeScript compilation succeeds (`npx tsc --noEmit`)
- ✅ All Makefile targets work (`make build`, `make test`, etc.)
- ✅ Implementation review completed and reproducible plan created

---

## Requirements

- Node.js version: 20.19+ or 22.12+
- npm (comes with Node.js)

## Notes

- This is a standalone project, NOT part of a monorepo
- All installations are in the project root (bodhichat directory)
- Each step includes verification to catch issues early
- The final plan review ensures reproducibility for future implementations
