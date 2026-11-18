# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Guidance

- Always check for available MCP tools, particularly the Context 7 lookup tool
- To save main context space, for code searches, inspections, troubleshooting or analysis, use code-searcher subagent where appropriate - giving the subagent full context background for the task(s) you assign it.
- After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, and then take the best next action.
- For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
- Before you finish, please verify your solution
- Do what has been asked; nothing more, nothing less.
- NEVER create files unless they're absolutely necessary for achieving your goal.
- ALWAYS prefer editing an existing file to creating a new one.
- NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
- When you update or modify core context files, also update markdown documentation and memory bank
- When asked to commit changes, exclude CLAUDE-\*.md referenced memory bank system files from any commits. Never delete these files.
- When you need to make a commit ever use the commiter agent, and make commit with user credentials and without sign on commit or topics.

## Memory Bank System

This project uses a structured memory bank system with specialized context files. Always check these files for relevant information before starting work:

### Core Context Files

- **CLAUDE-activeContext.md** - Current session state, goals, and progress (if exists)
- **CLAUDE-patterns.md** - Established code patterns and conventions (if exists)
- **CLAUDE-decisions.md** - Architecture decisions and rationale (if exists)
- **CLAUDE-troubleshooting.md** - Common issues and proven solutions (if exists)
- **CLAUDE-config-variables.md** - Configuration variables reference (if exists)
- **CLAUDE-temp.md** - Temporary scratch pad (only read when referenced)

**Important:** Always reference the active context file first to understand what's currently being worked on and maintain session continuity.

### Memory Bank System Backups

When asked to backup Memory Bank System files, you will copy the core context files above and @.claude settings directory to directory @/path/to/backup-directory. If files already exist in the backup directory, you will overwrite them.

## Project Overview

## ALWAYS START WITH THESE COMMANDS FOR COMMON TASKS

**Task: "List/summarize all files and directories"**

```bash
fd . -t f           # Lists ALL files recursively (FASTEST)
# OR
rg --files          # Lists files (respects .gitignore)
```

**Task: "Search for content in files"**

```bash
rg "search_term"    # Search everywhere (FASTEST)
```

**Task: "Find files by name"**

```bash
fd "filename"       # Find by name pattern (FASTEST)
```

### Directory/File Exploration

```bash
# FIRST CHOICE - List all files/dirs recursively:
fd . -t f           # All files (fastest)
fd . -t d           # All directories
rg --files          # All files (respects .gitignore)

# For current directory only:
ls -la              # OK for single directory view
```

### BANNED - Never Use These Slow Tools

- ❌ `tree` - NOT INSTALLED, use `fd` instead
- ❌ `find` - use `fd` or `rg --files`
- ❌ `grep` or `grep -r` - use `rg` instead
- ❌ `ls -R` - use `rg --files` or `fd`
- ❌ `cat file | grep` - use `rg pattern file`

### Use These Faster Tools Instead

```bash
# ripgrep (rg) - content search
rg "search_term"                # Search in all files
rg -i "case_insensitive"        # Case-insensitive
rg "pattern" -t py              # Only Python files
rg "pattern" -g "*.md"          # Only Markdown
rg -1 "pattern"                 # Filenames with matches
rg -c "pattern"                 # Count matches per file
rg -n "pattern"                 # Show line numbers
rg -A 3 -B 3 "error"            # Context lines
rg " (TODO| FIXME | HACK)"      # Multiple patterns

# ripgrep (rg) - file listing
rg --files                      # List files (respects •gitignore)
rg --files | rg "pattern"       # Find files by name
rg --files -t md                # Only Markdown files

# fd - file finding
fd -e js                        # All •js files (fast find)
fd -x command {}                # Exec per-file
fd -e md -x ls -la {}           # Example with ls

# jq - JSON processing
jq. data.json                   # Pretty-print
jq -r .name file.json           # Extract field
jq '.id = 0' x.json             # Modify field
```

### Search Strategy

1. Start broad, then narrow: `rg "partial" | rg "specific"`
2. Filter by type early: `rg -t python "def function_name"`
3. Batch patterns: `rg "(pattern1|pattern2|pattern3)"`
4. Limit scope: `rg "pattern" src/`

### INSTANT DECISION TREE

```
User asks to "list/show/summarize/explore files"?
  → USE: fd . -t f  (fastest, shows all files)
  → OR: rg --files  (respects .gitignore)

User asks to "search/grep/find text content"?
  → USE: rg "pattern"  (NOT grep!)

User asks to "find file/directory by name"?
  → USE: fd "name"  (NOT find!)

User asks for "directory structure/tree"?
  → USE: fd . -t d  (directories) + fd . -t f  (files)
  → NEVER: tree (not installed!)

Need just current directory?
  → USE: ls -la  (OK for single dir)
```

## Project Overview

Service Span is a **Turborepo monorepo** for a service booking and management platform. It consists of a Next.js 15 frontend (React 19), a NestJS backend, and shared packages for UI components and configurations.

**Stack:** TypeScript, Next.js 15, NestJS, PostgreSQL, Zustand, React Query, TailwindCSS, Radix UI

## Commands

### Development

```bash
# Start all apps (API + Web) - API starts first automatically
pnpm run dev

# Build all packages and apps (respects dependency order)
pnpm run build

# Run tests across all packages
pnpm run test

# Type checking
pnpm run check-types
```

### Per-App Commands

```bash
# Frontend (apps/web)
cd apps/web
pnpm dev              # Next.js with Turbopack
pnpm build            # Production build
pnpm test             # Vitest unit tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report

# Backend (apps/api)
cd apps/api
pnpm dev              # NestJS watch mode
pnpm build            # Compile to dist/
pnpm start            # Run compiled app
pnpm start:debug      # Debug mode
pnpm test             # Vitest unit tests
pnpm test:e2e         # E2E tests
```

### Linting & Formatting

```bash
pnpm run lint         # ESLint all packages
pnpm run format       # Prettier formatting
```

## Architecture

### Monorepo Structure

```
service-span/
├── apps/
│   ├── web/          # Next.js 15 App Router frontend
│   └── api/          # NestJS backend (Vercel serverless)
└── packages/
    ├── @repo/ui/                 # Shared React components (Radix UI)
    ├── @repo/api/                # Shared NestJS utilities
    ├── @repo/eslint-config/
    ├── @repo/typescript-config/
    └── @repo/vitest-config/
```

**Package Manager:** pnpm with workspaces
**Build Orchestration:** Turborepo (handles task caching & dependency order)
**Node Version:** >= 18

### Frontend Architecture (`apps/web`)

**Framework:** Next.js 15 with App Router
**Routing:** File-based routing in `src/app/`

Key route structure:

- `/` - Landing page
- `/booking/` - Customer booking flow
- `/checkout/` - Payment
- `/partner/` - Admin dashboard (services, stores, agenda, plans)

**State Management:** Zustand stores organized by domain:

```
apps/web/src/store/
├── auth/           # Authentication state
├── admin/          # Admin-related stores
│   ├── plans/
│   ├── stores/
│   ├── services/
│   ├── dashboard/
│   ├── agenda/     # Calendar & appointments
│   └── notifications/
```

**Store Pattern:**

- `*.store.ts` - Zustand store definition
- `*.types.ts` - TypeScript interfaces
- `*.hook.ts` - Custom hook (e.g., `useAuthStore`)
- `*.actions.ts` - Action creators (if needed)

**Data Fetching:** TanStack React Query for server state
**Forms:** React Hook Form + Zod validation
**Styling:** Tailwind CSS 4 + Radix UI components from `@repo/ui`

**API Communication:**

- Axios for HTTP requests
- Next.js rewrites: `/api/*` → `${NEXT_PUBLIC_API_URL}/*`
- JWT authentication via interceptors

### Backend Architecture (`apps/api`)

**Framework:** NestJS (TypeScript-first, modular)
**Database:** PostgreSQL via TypeORM
**Authentication:** JWT (Passport.js) + Google OAuth

**Module Structure:**

```
apps/api/src/modules/
├── database/        # TypeORM configuration
├── auth/           # JWT strategy, Google SSO
├── users/          # User management
├── subscription/   # Subscription logic
├── plans/          # Plan CRUD
├── partner/        # Partner modules
│   ├── services/   # Service management
│   ├── stores/     # Store management
│   ├── schedules/  # Appointment scheduling
│   └── categories/ # Service categories
├── stripe/         # Payment integration
├── notification/   # Email/SMS
└── storage/        # S3 uploads
```

**Design Patterns:**

- **Dependency Injection:** Constructor-based DI (NestJS IoC)
- **Guards:** JWT authentication via `@UseGuards(JwtAuthGuard)`
- **DTOs:** Request/response validation
- **Entities:** TypeORM decorators with relations

**Deployment:** Vercel Serverless Functions

- `main.ts` has dual-mode support (dev server + serverless handler)
- Singleton app caching in production
- Connection pooling: max 1 per instance

### Shared Packages

**@repo/ui:** React component library

- 60+ components built on Radix UI + shadcn/ui
- Exported from `./src/index.ts`
- Styles via `./styles`

**@repo/api:** Shared NestJS utilities and types

**@repo/typescript-config:**

- `base.json` - ES2022, strict mode
- `nextjs.json` - ESNext, bundler resolution
- `nestjs.json` - CommonJS, decorators enabled
- `react-library.json` - For UI package

**@repo/vitest-config:**

- `base.ts` - Node environment
- `next.ts` - jsdom + React
- `nest.ts` - Node + NestJS

## Development Workflow

### Component Development Pattern (Frontend)

Recent refactoring shows the preferred pattern for complex UI components:

**Hook-Driven Architecture:**

1. Create a `*.hook.ts` file with all business logic
2. Component file (`*.tsx`) contains only UI rendering
3. Hook accesses Zustand store, derives computed values, and provides handlers

Example from agenda module:

```typescript
// agenda-toolbar.hook.ts
export function useAgendaToolbar() {
  const monthYear = useAgendaStore((state) => state.monthYear);
  const setCurrentWeek = useAgendaStore((state) => state.setCurrentWeek);

  const handleNextWeek = useCallback(() => {
    setCurrentWeek(currentWeek + 1);
  }, [currentWeek]);

  return { monthYear, handleNextWeek, ... };
}

// agenda-toolbar.tsx
export function AgendaToolbar() {
  const { monthYear, handleNextWeek } = useAgendaToolbar();
  return <div>...</div>;
}
```

**Benefits:**

- Testable logic separate from UI
- Reusable hooks across components
- Minimal prop drilling

### Component Composition

**Prefer:** Self-contained components that read from store directly
**Avoid:** Passing many props down the tree

Example: `BlockModeAlert` reads `isBlockMode` from store internally instead of receiving it as a prop.

### API Module Development (Backend)

1. **Create Module:** `nest g module feature-name`
2. **Add Controller:** `nest g controller feature-name`
3. **Add Service:** `nest g service feature-name`
4. **Define Entity:** Create TypeORM entity with decorators
5. **Add DTOs:** Create request/response DTOs
6. **Wire Guards:** Apply `@UseGuards(JwtAuthGuard)` on protected routes

### Testing

**Test Framework:** Vitest (Jest replacement)

**Frontend Tests:**

- Unit tests: Component logic in `*.test.tsx`
- Use jsdom environment (`@repo/vitest-config/next`)
- Mock Zustand stores when needed

**Backend Tests:**

- Unit tests: Service logic in `*.spec.ts`
- E2E tests: Full API request/response in `*.e2e-spec.ts`
- Use Node environment (`@repo/vitest-config/nest`)

**Run Tests:**

```bash
pnpm test              # All tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

## Environment Variables

**Required for Local Dev:**

```env
# Frontend (.env.local in apps/web)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
FRONTEND_URL=http://localhost:3000

# Backend (.env.local in apps/api)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_NAME=service_span
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_API_KEY=...
SUPABASE_URL=...
SUPABASE_API_KEY=...
```

**Global Env Variables:** Managed in `turbo.json` under `globalEnv`

## Build & Deployment

### Build Order

Turborepo ensures correct build order automatically:

1. Shared configs (`typescript-config`, `eslint-config`, `vitest-config`)
2. Shared packages (`@repo/api`, `@repo/ui`)
3. Apps (`apps/api`, `apps/web`)

### Deployment Architecture

**Frontend:** Vercel (Next.js)

- Edge Network for static assets
- Vercel Functions for API routes
- Image optimization enabled

**Backend:** Vercel Serverless Functions

- Single function per request
- Connection pooling optimized (max 1 connection per instance)
- CORS enabled for frontend URL

**Database:** PostgreSQL (Supabase/Neon/Railway)

- TypeORM with `synchronize: true` in production (`DB_SYNCHRONIZE`): the schema follows the entities, with no migration scripts
- Synchronize does not create Postgres extensions: a new database needs `CREATE EXTENSION IF NOT EXISTS btree_gist` (schedule overlap constraint)

## Key Conventions

### TypeScript

- **Strict mode** in frontend (`apps/web/tsconfig.json`)
- **Relaxed mode** in backend (NestJS convention, `noImplicitAny: false`)
- Use path aliases: `@/*` for app imports, `@repo/*` for packages

### Styling

- **Tailwind CSS 4** for utilities
- **Radix UI** for headless components
- **@repo/ui** for shared components
- Avoid inline styles; use Tailwind classes

### State Management

- **Zustand** for client state (not Context API)
- **React Query** for server state
- Organize stores by domain in `src/store/`

### API Design

- **RESTful** endpoints in NestJS controllers
- **DTOs** for validation (class-validator decorators)
- **Guards** for authentication
- **Entities** for database models (TypeORM)

### Naming Conventions

- Components: PascalCase (e.g., `AgendaToolbar`)
- Hooks: camelCase with `use` prefix (e.g., `useAgendaToolbar`)
- Types: PascalCase with `T` prefix (e.g., `TAppointment`)
- Interfaces: PascalCase with `I` prefix (e.g., `IAgendaStore`)

## Troubleshooting

### Build Issues

```bash
# Clear Turborepo cache
pnpm turbo clean

# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Type Errors

```bash
# Check types without building
pnpm run check-types

# Rebuild TypeScript configs
cd packages/typescript-config
pnpm build
```

### Database Connection Issues

- Ensure PostgreSQL is running locally
- Check `DB_*` environment variables in `apps/api/.env.local`
- Verify connection pooling settings in `main.ts`

### Hot Reload Not Working

- Check if Turbopack is enabled (`pnpm dev` uses Turbopack by default)
- Restart dev server with `pnpm dev`
