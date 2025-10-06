# Bootstrap Plan: bodhichat React Application (As Implemented)

**Project**: Standalone React application with TypeScript, Vite, Tailwind CSS v3, ShadCN, React Router, Vitest, and Playwright

**Target Directory**: Project root (`bodhichat/`)

**Important Notes**:

- This is a **standalone project**, NOT part of a monorepo
- All installations are in the project root directory
- Tailwind CSS v3 used instead of v4 (v4 is beta and had compatibility issues)

---

## Phase 0: Plan Documentation

### Step 1: Create Plan Directory and Export Plan

**Commands**:

```bash
mkdir -p ai-logs/001-bootstrap
# Export plan to ai-logs/001-bootstrap/plan.md
```

**Verification**: Plan file exists

---

## Phase 1: Initialize Vite React TypeScript Project

### Step 2: Manually Create Vite Project Structure

**Note**: Cannot use `npm create vite` in non-empty directory, so create files manually

**Files to create**:

1. **package.json**:

```json
{
  "name": "bodhichat",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.13.0",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "eslint": "^9.13.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "globals": "^15.11.0",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.10.0",
    "vite": "^6.0.1"
  }
}
```

2. **vite.config.ts**:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

3. **tsconfig.json**:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

4. **tsconfig.app.json**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

5. **tsconfig.node.json**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

6. **eslint.config.js**:

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  }
)
```

7. **index.html**:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bodhi Chat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

8. **.gitignore**:

```
logs
*.log
node_modules
dist
dist-ssr
*.local
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
coverage
.nyc_output
playwright-report
test-results
```

9. Create directories and React source files:

```bash
mkdir -p src public
```

10. **src/main.tsx**:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

11. **src/App.tsx** (temporary):

```typescript
function App() {
  return <h1>Bodhi Chat</h1>
}

export default App
```

12. **src/App.css** (temporary):

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
```

13. **src/index.css** (temporary):

```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
}
```

14. **src/vite-env.d.ts**:

```typescript
/// <reference types="vite/client" />
```

**Verification**:

```bash
npm install
npm run build
timeout 5 npm run dev || true
```

**Success Criteria**:

- ✅ Dependencies install
- ✅ Build completes
- ✅ Dev server starts

---

## Phase 2: Install and Configure Tailwind CSS v3

### Step 3: Install Tailwind CSS v3 (not v4)

**Commands**:

```bash
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npm install -D @types/node
```

**Note**: Using v3 because v4 is still in beta and has compatibility issues with ShadCN

### Step 4: Configure Tailwind

1. **Update vite.config.ts** - Add path alias:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

2. **Create tailwind.config.js**:

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
}
```

3. **Create postcss.config.js**:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

4. **Replace src/index.css**:

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
head -20 dist/assets/*.css  # Should see Tailwind CSS variables
```

---

## Phase 3: Initialize ShadCN UI

### Step 5: Configure Path Alias in TypeScript

**Important**: ShadCN init requires path alias in main tsconfig.json

**Update tsconfig.json**:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

**Update tsconfig.app.json** - Add path alias:

```json
{
  "compilerOptions": {
    ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  ...
}
```

### Step 6: Initialize ShadCN

**Command**:

```bash
npx shadcn@latest init -d
```

**Expected Output**:

- Creates `components.json`
- Creates `src/lib/utils.ts`
- Updates `tailwind.config.js` (adds plugins)
- Updates `src/index.css` (refines CSS variables)
- Installs: class-variance-authority, clsx, lucide-react, tailwind-merge, tailwindcss-animate

**Verification**:

```bash
cat components.json
cat src/lib/utils.ts
npm run build
```

### Step 7: Install ShadCN Components

**Command**:

```bash
npx shadcn@latest add button input card scroll-area
```

**Expected Output**: Creates src/components/ui/{button,input,card,scroll-area}.tsx

**Verification**:

```bash
ls src/components/ui/
npm run build
```

---

## Phase 4: Install React Router

### Step 8: Install React Router DOM

**Command**:

```bash
npm install react-router-dom@7.7.1
```

**Verification**:

```bash
npm run build
```

---

## Phase 5: Configure Vitest

### Step 9: Install Vitest Dependencies

**Command**:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Step 10: Configure Vitest

1. **Create vitest.config.ts**:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
})
```

2. **Create src/test/setup.ts**:

```typescript
import '@testing-library/jest-dom'
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

4. **Update package.json** - Add scripts:

```json
{
  "scripts": {
    ...
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:ci": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

5. **Update tsconfig.app.json** - Add vitest types:

```json
{
  "compilerOptions": {
    ...
    "types": ["vitest/globals"],
    ...
  }
}
```

6. **Create sample test src/App.test.tsx** (will be updated later)

**Verification**:

```bash
npm test
npm run build
```

---

## Phase 6: Install Playwright

### Step 11: Install Playwright

**Commands**:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Step 12: Configure Playwright

1. **Create playwright.config.ts**:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Note**: Using `reporter: 'list'` provides clean terminal output without opening a browser window with HTML report.

2. **Create e2e/example.spec.ts**:

```typescript
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Bodhi Chat/)
  await expect(page.getByTestId('app-title')).toBeVisible()
})
```

**Note**: Using `getByTestId` for reliable element selection following best practices for integration tests.

**Verification**: Tests configured (will run after app shell is created)

---

## Phase 7: Configure TypeScript and ESLint

### Step 13: Update TypeScript Configuration

1. **Update tsconfig.node.json** - Include config files:

```json
{
  ...
  "include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

### Step 14: Update ESLint Configuration and Add Prettier

**1. Install Prettier:**

```bash
npm install -D prettier eslint-config-prettier
```

**2. Update eslint.config.js** (migrated from deprecated `tseslint.config()` to flat array):

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist', 'e2e', 'playwright-report', 'test-results', '*.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/test/**/*.ts', '**/test/**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
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
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]
```

**Note**:

- Migrated from deprecated `tseslint.config()` to native flat config array format
- Added `eslint-config-prettier` to disable formatting rules that conflict with Prettier
- Added `*.config.js` to ignores to avoid linting config files
- Added exception for ShadCN UI components (`src/components/ui/**/*.tsx`) to disable the `react-refresh/only-export-components` warning

**3. Create .prettierrc**:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**4. Create .prettierignore**:

```
# Build outputs
dist
dist-ssr
coverage
.nyc_output

# Dependencies
node_modules

# Test outputs
playwright-report
test-results

# Generated files
*.min.js
*.min.css

# Package lock files
package-lock.json
pnpm-lock.yaml
yarn.lock

# Logs
*.log

# ShadCN scaffolded components
src/components/ui/
```

**Note**: ShadCN components are excluded from Prettier formatting to preserve their scaffolded structure.

**5. Add format scripts to package.json**:

```json
{
  "scripts": {
    ...
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    ...
  }
}
```

**Verification**:

```bash
npm run lint
npm run format:check
npx tsc --noEmit
npm run build
```

---

## Phase 8: Create Project Structure

### Step 15: Create Directories

**Commands**:

```bash
mkdir -p src/components src/pages src/hooks
```

**Create src/lib/types.ts**:

```typescript
// Application-wide TypeScript types
export type {}
```

**Verification**:

```bash
npm run build
```

---

## Phase 9: Create App Shell with React Router

### Step 16: Create Layout Component

**Create src/components/Layout.tsx**:

```typescript
import { Link, Outlet } from 'react-router-dom'
import { Button } from './ui/button'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="app-title">Bodhi Chat</h1>
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Bodhi Chat. Powered by Bodhi Platform.
        </div>
      </footer>
    </div>
  )
}
```

**Note**: Added `data-testid="app-title"` to the h1 element for reliable E2E testing.

### Step 17: Create Pages

1. **Create src/pages/Home.tsx**:

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Bodhi Chat</h1>
        <p className="text-lg text-muted-foreground">
          A ChatGPT-like interface powered by the Bodhi Platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>React + TypeScript</CardTitle>
            <CardDescription>Built with modern web technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Leveraging React 18, TypeScript, and Vite for a fast, type-safe development experience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tailwind CSS</CardTitle>
            <CardDescription>Utility-first styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Beautiful, responsive UI built with Tailwind CSS and ShadCN components.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bodhi Platform</CardTitle>
            <CardDescription>Local AI integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Seamlessly connect to local LLM services through the Bodhi Browser ecosystem.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  )
}
```

2. **Create src/pages/About.tsx**:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">About Bodhi Chat</h1>
        <p className="text-lg text-muted-foreground">
          A showcase application for the Bodhi Platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Bodhi Chat is a ChatGPT-like chat interface powered by the Bodhi Platform,
            demonstrating how to build modern web applications that integrate with local AI services.
          </p>

          <div className="space-y-2">
            <h3 className="font-semibold">Built With:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>React 18 with TypeScript</li>
              <li>React Router v7</li>
              <li>Vite for blazing-fast development</li>
              <li>Tailwind CSS for styling</li>
              <li>ShadCN UI components</li>
              <li>Vitest for unit testing</li>
              <li>Playwright for E2E testing</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Modern, responsive UI</li>
              <li>Type-safe development with TypeScript</li>
              <li>Component-based architecture</li>
              <li>Comprehensive testing setup</li>
              <li>Ready for Bodhi Platform integration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 18: Update App Component

**Replace src/App.tsx**:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { About } from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### Step 19: Update Tests

**Replace src/App.test.tsx**:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from './test/test-utils'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getAllByText(/Bodhi Chat/i).length).toBeGreaterThan(0)
  })

  it('renders navigation links', () => {
    render(<App />)
    expect(screen.getByText(/Home/i)).toBeInTheDocument()
    expect(screen.getByText(/About/i)).toBeInTheDocument()
  })
})
```

**Verification**:

```bash
npm test
npm run build
```

---

## Phase 10: Create Makefile

### Step 20: Create Makefile

**Create Makefile**:

```makefile
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
```

**Note**:

- The `.DEFAULT_GOAL := help` makes `help` the default target when running `make` without arguments
- `make setup` now includes Playwright browser installation (chromium) for complete project setup
- `make all` includes formatting check (fails if not formatted) before linting
- Consistent naming pattern: `target` checks (fails if issues), `target-fix` fixes issues
- `make format` - Check formatting and fail if not formatted
- `make format-fix` - Fix formatting issues
- `make lint` - Check linting and fail if issues
- `make lint-fix` - Fix linting and formatting issues

**Verification**:

```bash
make        # Should show help (default target)
make lint
make test
make build
```

---

## Phase 11: Final Verification

### Step 21: Run Complete Verification

**Commands**:

```bash
npm run lint:fix
npx tsc --noEmit
npm test
npm run build
npm run dev  # Verify app in browser, then stop
```

**Success Criteria**:

- ✅ Lint passes (1 warning from ShadCN button component is expected)
- ✅ TypeScript compiles
- ✅ Tests pass
- ✅ Build completes
- ✅ App runs and routes work

---

## Phase 12: Create Documentation

### Step 22: Create README.md

**Create comprehensive README.md** with:

1. Project description and tech stack
2. Prerequisites (Node.js 20.19+ or 22.12+)
3. Quick Start guide:
   - Clone repository
   - Run `make setup` (installs dependencies + Playwright browsers)
   - Start dev server with `npm run dev`
4. Development commands (Makefile targets)
5. npm scripts reference
6. Project structure overview
7. Testing guide (Vitest + Playwright)
8. Code quality tools (ESLint + Prettier)
9. Contributing guidelines

**Purpose**: Provide clear onboarding for new contributors and developers.

**Verification**:

```bash
cat README.md  # Verify content is complete
```

---

## Key Deviations from Original Plan

1. **Tailwind CSS v3 instead of v4**: v4 is still in beta and had configuration issues with the Vite plugin
2. **Manual project scaffolding**: Could not use `npm create vite` due to non-empty directory
3. **Manual Playwright installation**: Interactive `npm init playwright` had issues, so installed manually
4. **Added app shell**: Created Layout, Home, and About pages with React Router as requested
5. **ESLint migration**: Migrated from deprecated `tseslint.config()` to native flat config array format
6. **Added Prettier**: Added code formatter (not in original plan) with integration to ESLint and Makefile
7. **Enhanced setup target**: Added Playwright browser installation to `make setup` for complete project setup
8. **Created README.md**: Comprehensive documentation for getting started and contributing

## Final Directory Structure

```
bodhichat/
├── ai-logs/
│   └── 001-bootstrap/
│       ├── plan.md
│       └── proposed-plan.md
├── dist/
├── e2e/
│   └── example.spec.ts
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── scroll-area.tsx
│   │   └── Layout.tsx
│   ├── hooks/
│   ├── lib/
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── About.tsx
│   │   └── Home.tsx
│   ├── test/
│   │   ├── setup.ts
│   │   └── test-utils.tsx
│   ├── App.css
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── .prettierignore
├── .prettierrc
├── components.json
├── eslint.config.js
├── index.html
├── Makefile
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

## Success Criteria - All Met ✅

- ✅ Vite dev server runs without errors
- ✅ Production build completes successfully
- ✅ Tailwind CSS is working (styles applied correctly)
- ✅ ShadCN components render correctly
- ✅ React Router navigation works (Home and About pages)
- ✅ Vitest unit tests pass
- ✅ Playwright E2E tests pass
- ✅ ESLint runs without errors
- ✅ Prettier formatting configured
- ✅ TypeScript compilation succeeds
- ✅ All Makefile targets work

## Requirements

- Node.js version: 20.19+ or 22.12+
- npm (comes with Node.js)
