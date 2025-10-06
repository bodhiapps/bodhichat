# Bodhi Chat

A modern ChatGPT-like chat interface powered by the Bodhi Platform, built with React, TypeScript, and Vite.

## Tech Stack

- **React 18** - Modern UI library with TypeScript
- **Vite 6** - Fast build tool and dev server
- **TypeScript 5.6** - Type-safe development
- **Tailwind CSS v3** - Utility-first CSS framework
- **ShadCN UI** - High-quality component library built on Radix UI
- **React Router v7** - Client-side routing
- **Vitest 3** - Fast unit testing framework
- **Playwright 1.55** - End-to-end testing
- **ESLint 9** - Code linting with flat config
- **Prettier 3** - Code formatting

## Prerequisites

- **Node.js** 20.19+ or 22.12+
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bodhichat
```

### 2. Setup

Run the setup command to install all dependencies and Playwright browsers:

```bash
make setup
```

This will:

- Install all npm dependencies with exact versions (`npm ci`)
- Download and install Playwright Chromium browser

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Development

### Available Commands

The project uses a Makefile for common tasks. Run `make` or `make help` to see all available targets:

```bash
make              # Show help
make setup        # Install dependencies and Playwright browsers
make build        # Build the project
make test         # Run unit tests
make test.e2e     # Run E2E tests
make lint         # Check code with ESLint
make lint-fix     # Fix ESLint and formatting issues
make format       # Check code formatting
make format-fix   # Fix code formatting
make all          # Run full build pipeline
```

### npm Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Open Vitest UI
npm run test:e2e      # Run Playwright E2E tests
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## Project Structure

```
bodhichat/
├── ai-logs/              # AI-assisted development logs
├── e2e/                  # Playwright E2E tests
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # ShadCN UI components (auto-generated)
│   │   └── Layout.tsx   # Main layout component
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and types
│   ├── pages/           # Page components (Home, About)
│   ├── test/            # Test utilities and setup
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── .prettierrc          # Prettier configuration
├── .prettierignore      # Prettier ignore patterns
├── components.json      # ShadCN configuration
├── eslint.config.js     # ESLint flat config
├── Makefile             # Build automation
├── playwright.config.ts # Playwright E2E test config
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
└── vitest.config.ts     # Vitest test configuration
```

## Testing

### Unit Tests (Vitest)

Run unit tests with:

```bash
npm test                # Run once
npm run test:watch      # Watch mode
npm run test:ui         # Open Vitest UI
```

Tests are located alongside source files with `.test.tsx` or `.test.ts` extensions.

### E2E Tests (Playwright)

Run end-to-end tests with:

```bash
npm run test:e2e        # Run E2E tests
make test.e2e           # Run via Makefile
```

E2E tests are located in the `e2e/` directory.

## Code Quality

### Linting

The project uses ESLint with TypeScript support:

```bash
make lint               # Check for issues
make lint-fix           # Auto-fix issues
```

### Formatting

Code is formatted with Prettier:

```bash
make format             # Check formatting
make format-fix         # Auto-format code
```

**Note**: ShadCN UI components in `src/components/ui/` are excluded from Prettier formatting to preserve their scaffolded structure.

## Building for Production

```bash
npm run build           # Build for production
npm run preview         # Preview production build
```

The production build will be output to the `dist/` directory.

## Contributing

### Development Workflow

1. **Make changes** to the codebase
2. **Format code**: `make format-fix`
3. **Fix linting**: `make lint-fix`
4. **Run tests**: `make test`
5. **Build**: `make build`
6. **Run E2E tests**: `make test.e2e`

Or run the complete pipeline:

```bash
make all
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line width**: 160 characters
- **TypeScript**: Strict mode enabled

## License

[License information to be added]

## Acknowledgments

Powered by the [Bodhi Platform](https://github.com/BodhiSearch/bodhi-browser)
