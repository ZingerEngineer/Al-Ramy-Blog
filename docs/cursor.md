# Al-Ramy Blog - Context Summary

This document provides a quick reference for the project's architecture, conventions, and policies. For detailed specs, see `/scaffold-spec/` directory.

## Project Overview

**Al-Ramy Blog** is a **pnpm workspace monorepo** with two Next.js 16 apps (webapp + admin) and seven shared packages.

## Quick Reference

### Technology Stack

- **Monorepo**: pnpm workspaces
- **Apps**: 2 × Next.js 16 (App Router, Turbopack, Server Components)
- **Language**: TypeScript (strict, no `any` unless necessary)
- **Database**: PostgreSQL + Prisma ORM
- **UI**: React 19+ with strict conventions
- **Styling**: Tailwind v4 (primary) + shadcn/ui + SASS (minimal)
- **Linting/Formatting**: Biome (mandatory, no suppressions allowed)
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions

---

## Monorepo Structure

```markdown
/Al-Ramy-Blog (monorepo root)
├── /apps/
│   ├── /webapp/              # Public blog (port 3000)
│   │   ├── /app/             # App Router pages
│   │   ├── /components/      # Webapp-specific components
│   │   ├── /hooks/           # Webapp-specific hooks
│   │   ├── /lib/             # Webapp-specific utilities
│   │   └── /styles/          # Webapp-specific styles
│   └── /admin/               # Admin dashboard (port 3001)
│       ├── /app/             # App Router pages
│       ├── /components/      # Admin-specific components
│       └── /styles/          # Admin-specific styles
│
├── /packages/                # Shared packages (@al-ramy/*)
│   ├── /database/            # Prisma client & DB utilities
│   ├── /server/              # Server utilities (auth, S3, validation)
│   ├── /types/               # Shared TypeScript types
│   ├── /ui/                  # Basic UI components
│   ├── /shadcn/              # shadcn/ui components
│   ├── /hooks/               # Shared React hooks
│   └── /tailwind-config/     # Shared Tailwind config
│
├── /docs/                    # Documentation
├── /scaffold-spec/           # Project specifications
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # Workspace definition
├── tsconfig.json             # Base TypeScript config
└── biome.json                # Shared Biome config
```

---

## Key Coding Conventions

### React Components

- **One component per file**, PascalCase naming (e.g., `UserCard.tsx`)
- **Default export** for main component
- Small, focused, Single Responsibility
- Separate presentational (UI) from feature (stateful) components

### TypeScript

- Always use TypeScript, avoid `any`
- Explicit interfaces/types for props and state
- Shared types in `/types`, component-specific types in same file
- Use `readonly`, union types, enums where appropriate

### Hooks

- App-specific hooks in app's `/hooks` directory
- Shared hooks in `@al-ramy/hooks` package
- Name with `use…` prefix (e.g., `useAuth`, `useFetchPosts`)
- Encapsulate side-effects, data fetching, state

### Separation of Concerns

- Keep UI (components) separate from business logic
- App-specific logic in app's `/lib` directory
- Shared server utilities in `@al-ramy/server` package
- Database access via `@al-ramy/database` package
- Components import from packages using `@al-ramy/*` imports

---

## Next.js 16 Conventions

### Routing

- Use **App Router** (`/app/` directory)
- File-system routing: folders = route segments
- Route groups: `(groupName)` for organizing without affecting URLs
- Private folders: prefix with `_` or place outside `/app/`

### Backend/API

- **Route Handlers** (`route.ts`) for API endpoints
- Don't mix UI and API logic
- Use Server Components for data fetching

### Caching & Rendering

- Use Next.js 16 caching APIs (`revalidateTag()`, `cache` directive)
- Server Components for heavy logic to minimize client bundle
- Dynamic data: avoid caching or use invalidation

---

## Styling Policy

### Approach

- **Utility-first + component-driven**
- **Tailwind v4**: 90% of styling (layout, spacing, typography, colors, responsive)
- **shadcn/ui**: Accessible, production-ready UI primitives with Tailwind
- **SASS**: Only for global resets, complex UI, theme overrides, mixins

### Conventions

- Prefer Tailwind classes in JSX
- Use CSS variables for design tokens (no hardcoded colors)
- shadcn components in `@al-ramy/shadcn` package
- Basic UI components in `@al-ramy/ui` package
- App-specific styles in app's `/styles` directory
- Shared Tailwind config in `@al-ramy/tailwind-config` package
- Support light/dark themes via CSS variables
- Support RTL for Arabic (`[dir="rtl"]`)

### File Locations

- `packages/tailwind-config/base.js` - Shared Tailwind config
- `apps/*/tailwind.config.js` - App-specific Tailwind config (extends base)
- `packages/shadcn/src/ui/` - shadcn/ui components
- `packages/ui/src/components/` - Basic UI components
- `apps/*/styles/` - App-specific styles

---

## Biome Enforcement

### Strict Rules

- **Mandatory** for all formatting, linting, import sorting
- **NO suppressions allowed**: no `// biome-ignore` comments
- **NO disabling rules** in `biome.json` (except auto-generated dirs)
- All code must comply with Biome's rules without exception

---

## Documentation Policy

### Required Files in `/docs`

- `architecture.md` - System architecture, data flow, routing, caching
- `api-design.md` - API contracts, auth rules, error handling
- `style-guide.md` - Coding conventions reference
- `CHANGELOG.md` - Chronological changes, breaking changes
- `cursor.md` - **THIS FILE** (context summary for quick reference)

### Guidelines

- Use Markdown format
- Document what changed, why, trade-offs, follow-up tasks
- Keep docs in sync with code evolution

---

## Development Workflow

1. **Before starting a feature**: Read relevant spec files in `/scaffold-spec/`
2. **During development**: Follow conventions (React, TS, Next.js, styling, Biome)
3. **After major changes**: Update documentation in `/docs`
4. **Code review**: Use specs as architecture + style check guidelines

---

## Monorepo Package System

### Package Naming

- All shared packages use `@al-ramy/*` scope
- Apps use simple names: `webapp`, `admin`

### Cross-Package Imports

```typescript
// Import from shared packages
import { prisma } from '@al-ramy/database';
import { User, Post } from '@al-ramy/types';
import { Button } from '@al-ramy/ui';
import { useDebounce } from '@al-ramy/hooks';
import { createUserSchema } from '@al-ramy/server';
```

### Workspace Dependencies

In `package.json`, use `workspace:*` for internal deps:

```json
{
  "dependencies": {
    "@al-ramy/database": "workspace:*",
    "@al-ramy/types": "workspace:*"
  }
}
```

---

## Quick Commands Reference

```bash
# Development
pnpm dev                 # Run all apps in parallel
pnpm dev:webapp          # Run webapp only (port 3000)
pnpm dev:admin           # Run admin only (port 3001)

# Build
pnpm build               # Build all packages and apps

# Code Quality
pnpm lint                # Run Biome on all packages
pnpm lint:fix            # Fix linting issues
pnpm typecheck           # TypeScript check all packages

# Database (Prisma)
pnpm db:generate         # Generate Prisma client
pnpm db:migrate          # Run migrations
pnpm db:studio           # Open Prisma Studio
pnpm db:seed             # Seed database

# Cleanup
pnpm clean               # Clean all build artifacts

# Package-specific
pnpm --filter webapp dev          # Run specific app
pnpm --filter @al-ramy/types typecheck  # Run script in package
```

---

## Important Notes

- **No over-engineering**: Keep solutions simple, focused on requirements
- **Shallow nesting**: Aim for readability and easy navigation
- **Colocate when possible**: Tests, component-specific types
- **Document decisions**: Architecture, API design, major refactors
- **Consistent naming**: Components, files, folders, routes, utilities
- **Use packages for shared code**: Don't duplicate code across apps
- **Use workspace protocol**: Always use `workspace:*` for internal dependencies
- **Import from packages**: Use `@al-ramy/*` imports, not relative paths across packages

---

## Monorepo Best Practices

1. **Shared code** → Create/use packages (`@al-ramy/*`)
2. **App-specific code** → Keep in app directory
3. **Cross-package imports** → Use `@al-ramy/*`, not relative paths
4. **Dependencies** → Install shared deps at root, app-specific in apps
5. **Database** → Use `@al-ramy/database` package (Prisma client)
6. **Types** → Use `@al-ramy/types` for shared types
7. **Server utilities** → Use `@al-ramy/server` (auth, validation, storage)
8. **UI components** → Use `@al-ramy/ui` or `@al-ramy/shadcn`

---

**Last Updated**: 2025-12-10
**Spec Source**: `/scaffold-spec/` directory (including `07-monorepo-conventions.md`)
**Architecture**: pnpm workspace monorepo with 2 apps and 7 packages
