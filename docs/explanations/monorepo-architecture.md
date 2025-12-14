# Monorepo Architecture Explanation

## Why a Monorepo?

The Al-Ramy Blog project uses a monorepo architecture to efficiently manage multiple related applications and shared code. Here's why this approach was chosen:

### Benefits

1. **Code Sharing Made Easy**
   - Both webapp and admin share the same database models, types, UI components, and utilities
   - No need to publish packages to npm or manage versions
   - Changes to shared code instantly available to all apps

2. **Single Source of Truth**
   - One repository contains all code
   - Unified versioning and release process
   - Consistent tooling across all packages

3. **Atomic Changes**
   - Can update an API and all consumers in a single commit
   - Breaking changes are caught immediately
   - No "version hell" with dependencies

4. **Developer Experience**
   - One `pnpm install` sets up everything
   - Shared configuration (TypeScript, Biome, Tailwind)
   - Fast iteration with hot reload across packages

5. **Simplified CI/CD**
   - Single CI pipeline for all code
   - Test entire system together
   - Deploy apps independently if needed

## Architecture Overview

### Three-Layer Structure

```
┌─────────────────────────────────────────────────┐
│              Applications Layer                 │
│  - webapp (public-facing blog)                  │
│  - admin (dashboard for content management)     │
└─────────────────────────────────────────────────┘
                    ▼ depends on
┌─────────────────────────────────────────────────┐
│              Shared Packages Layer              │
│  - database (Prisma client)                     │
│  - types (TypeScript definitions)               │
│  - server (auth, validation, storage)           │
│  - ui, shadcn (UI components)                   │
│  - hooks (React hooks)                          │
│  - tailwind-config (design tokens)              │
└─────────────────────────────────────────────────┘
                    ▼ depends on
┌─────────────────────────────────────────────────┐
│          Infrastructure Layer                   │
│  - pnpm workspace (package management)          │
│  - TypeScript (type system)                     │
│  - Biome (linting/formatting)                   │
│  - Husky (git hooks)                            │
│  - GitHub Actions (CI/CD)                       │
└─────────────────────────────────────────────────┘
```

## Package Organization Strategy

### By Concern (Domain-Driven)

Each package has a clear purpose and domain:

1. **@al-ramy/database**
   - **Purpose**: Single source of truth for database access
   - **Contains**: Prisma schema, client singleton, migrations
   - **Why separate**: Both apps need same database, prevents duplication

2. **@al-ramy/types**
   - **Purpose**: Shared TypeScript type definitions
   - **Contains**: Domain models, API types, utility types
   - **Why separate**: Type safety across apps and packages

3. **@al-ramy/server**
   - **Purpose**: Server-only utilities
   - **Contains**: Authentication, validation, storage helpers
   - **Why separate**: Server logic shouldn't leak to client bundles

4. **@al-ramy/ui + @al-ramy/shadcn**
   - **Purpose**: Reusable UI components
   - **Contains**: Basic components (Button, Card) + shadcn/ui components
   - **Why separate**: Consistent design system across apps

5. **@al-ramy/hooks**
   - **Purpose**: Shared React hooks
   - **Contains**: useDebounce, useLocalStorage, useMediaQuery
   - **Why separate**: Common client-side logic

6. **@al-ramy/tailwind-config**
   - **Purpose**: Shared design tokens and Tailwind configuration
   - **Contains**: Colors, typography, spacing tokens
   - **Why separate**: Consistent styling across apps

## Dependency Flow

### How Packages Depend on Each Other

```
webapp ──┐
         ├──> database ──> Prisma Client ──> PostgreSQL
admin ───┘

webapp ──┐
         ├──> types (no dependencies)
admin ───┘

webapp ──┐
         ├──> server ──> types
admin ───┘                   └──> Zod

webapp ──┐
         ├──> ui ──> React, Tailwind
admin ───┘

webapp ──┐
         ├──> shadcn ──> React, Tailwind, class-variance-authority
admin ───┘

webapp ──┐
         ├──> hooks ──> React
admin ───┘

webapp ──┐
         ├──> tailwind-config (base Tailwind config)
admin ───┘
```

**Key Principles**:
- No circular dependencies
- Packages can depend on other packages
- Apps depend on packages, packages don't depend on apps
- Database package is independent (only depends on Prisma)

## Why pnpm Workspaces?

### Comparison with Alternatives

| Feature | pnpm Workspaces | npm Workspaces | Yarn Workspaces | Lerna | Turborepo |
|---------|----------------|----------------|-----------------|-------|-----------|
| Setup Complexity | Low | Low | Low | Medium | Medium |
| Disk Efficiency | Excellent | Good | Good | Good | Good |
| Speed | Very Fast | Fast | Fast | Fast | Very Fast |
| Built-in Features | Workspace protocol, filters | Basic | Basic | Versioning, publishing | Caching, task orchestration |
| Learning Curve | Low | Low | Low | Medium | Medium |

**Why pnpm?**
1. **Disk efficiency**: Stores one copy of each package version globally
2. **Fast installs**: Content-addressable store
3. **Strict**: Prevents phantom dependencies
4. **Workspace protocol**: `workspace:*` ensures local packages are used
5. **Filtering**: `pnpm --filter` for targeted operations

### pnpm Workspace Features Used

1. **Workspace Protocol**
   ```json
   {
     "dependencies": {
       "@al-ramy/database": "workspace:*"
     }
   }
   ```
   - Ensures local package is used, not from npm
   - Prevents version conflicts

2. **Filtering**
   ```bash
   pnpm --filter webapp dev          # Run only webapp
   pnpm --filter "@al-ramy/*" build  # Build all packages
   ```

3. **Recursive Operations**
   ```bash
   pnpm -r install    # Install in all packages
   pnpm -r build      # Build all packages
   ```

## TypeScript Configuration Strategy

### Inheritance Model

```
Root tsconfig.json (base configuration)
    ├── packages/database/tsconfig.json (extends root)
    ├── packages/types/tsconfig.json (extends root)
    ├── packages/server/tsconfig.json (extends root)
    ├── packages/ui/tsconfig.json (extends root)
    ├── packages/shadcn/tsconfig.json (extends root)
    ├── packages/hooks/tsconfig.json (extends root)
    ├── apps/webapp/tsconfig.json (extends root + Next.js)
    └── apps/admin/tsconfig.json (extends root + Next.js)
```

**Benefits**:
- Single source of truth for compiler options
- Consistent settings across entire monorepo
- Easy to update (change root, affects all)
- Package-specific overrides when needed

### Path Aliases

Defined in root `tsconfig.json`:
```json
{
  "paths": {
    "@al-ramy/database": ["./packages/database/src"],
    "@al-ramy/server": ["./packages/server/src"],
    "@al-ramy/types": ["./packages/types/src"]
  }
}
```

**Why?**
- Import from package name, not relative paths
- Auto-complete works in IDEs
- Easier refactoring
- Clearer code

## Build Strategy

### Development: No Build Required

In development, packages are consumed **directly as TypeScript source**:

```typescript
// In apps/webapp/app/page.tsx
import { prisma } from '@al-ramy/database';  // ← Direct import
import { User } from '@al-ramy/types';       // ← No build needed
```

**How?**
- Next.js transpiles TypeScript on-the-fly
- `transpilePackages` in next.config.ts tells Next.js to transpile workspace packages
- Fast iteration, no build step between changes

### Production: Full Build

In production:
1. Build packages (if needed)
2. Build apps (which bundle everything)
3. Apps include bundled package code

**Why different strategies?**
- Development: Speed and DX (no build step)
- Production: Optimization (bundled, minified)

## Code Quality Enforcement

### Layered Approach

```
┌──────────────────────────────────────┐
│  Pre-commit Hook (Husky)             │
│  ├─ lint-staged                      │
│  └─ Biome check on staged files      │
└──────────────────────────────────────┘
              ▼
┌──────────────────────────────────────┐
│  Local Development                   │
│  ├─ pnpm lint (manual)               │
│  ├─ pnpm typecheck (manual)          │
│  └─ IDE integration                  │
└──────────────────────────────────────┘
              ▼
┌──────────────────────────────────────┐
│  CI/CD (GitHub Actions)              │
│  ├─ Biome check (all files)          │
│  ├─ TypeScript check (all packages)  │
│  └─ Build verification               │
└──────────────────────────────────────┘
```

**Three levels of enforcement**:
1. Pre-commit: Catch issues before they're committed
2. Local: Manual checks during development
3. CI: Final verification before merge

## Deployment Strategy

### Independent Deployment

Apps can be deployed independently:

```
┌─────────────┐     ┌─────────────┐
│   webapp    │     │    admin    │
│  (Vercel)   │     │  (Vercel)   │
└─────────────┘     └─────────────┘
       │                   │
       └────────┬──────────┘
                │
         ┌──────▼──────┐
         │  Database   │
         │ (PostgreSQL)│
         └─────────────┘
```

**Benefits**:
- Deploy webapp without touching admin
- Separate scaling
- Different deployment schedules
- Isolated failures

### Shared Database

Both apps use the same database (via `@al-ramy/database`):
- Consistent data models
- Single migration strategy
- Shared Prisma client

## Scalability Considerations

### Current State (Day 1)

- 2 apps, 7 packages
- ~50 dependencies total
- Simple build: ~3-5 seconds

### Future Growth

As the project grows:

1. **Add More Packages**
   - Easy: Just create new package in `/packages`
   - Example: `@al-ramy/analytics`, `@al-ramy/emails`

2. **Add More Apps**
   - Easy: Just create new app in `/apps`
   - Example: `mobile-api`, `public-api`

3. **Optimize Builds** (if needed)
   - Add Turborepo for caching
   - Use remote caching for CI
   - Implement incremental builds

4. **Split Database** (if needed)
   - Create `@al-ramy/database-read` (read replicas)
   - Create `@al-ramy/database-write` (primary)

## Trade-offs Made

### Pros ✅
- Fast development iteration
- Easy code sharing
- Consistent tooling
- Single repository
- Atomic changes

### Cons ❌
- More complex initial setup
- Larger repository over time
- All developers need full context
- Potential for circular dependencies (if not careful)
- CI runs for entire monorepo (can optimize later)

### Mitigations
- Clear documentation (this file!)
- Strong conventions (`07-monorepo-conventions.md`)
- Biome enforcement (prevents bad practices)
- Path aliases (prevents circular deps)
- Filtered CI (future: only run affected tests)

## Comparison with Alternatives

### What We Chose: Monorepo with Shared Packages

```
✅ Single repository
✅ Code sharing via packages
✅ Atomic commits
✅ Consistent tooling
```

### Alternative 1: Separate Repositories

```
❌ Code duplication
❌ Version management complexity
❌ Separate CI/CD pipelines
❌ Harder to keep in sync
```

### Alternative 2: Monolith (Single App)

```
❌ Can't deploy apps independently
❌ Tight coupling
❌ Harder to scale team
❌ All-or-nothing deploys
```

## Key Takeaways

1. **Monorepo ≠ Monolith**: Apps are separate, just share code efficiently
2. **Packages are boundaries**: Clear separation of concerns
3. **pnpm is fast**: Workspace protocol ensures local packages are used
4. **TypeScript across all**: Type safety from database to UI
5. **Independent deployment**: Apps can deploy separately
6. **Shared database**: Consistent data models via Prisma
7. **Simple initially**: No need for complex tools (Turbo, Nx) until needed

---

**Document Purpose**: Explain architectural decisions and reasoning
**Target Audience**: Developers joining the project, future you
**Related Docs**:
- [Monorepo Conventions](/scaffold-spec/07-monorepo-conventions.md)
- [Implementation Log](/docs/logs/2025-12-10-monorepo-bootstrap.md)
