# Al-Ramy Blog - Context Summary

This document provides a quick reference for the project's architecture, conventions, and policies. For detailed specs, see `/scaffold-spec/` directory.

## Project Overview

**Al-Ramy Blog** is a Next.js 16 blog/social-blog application using React, TypeScript, Tailwind v4, shadcn/ui, and SASS.

## Quick Reference

### Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack, Server Components)
- **Language**: TypeScript (strict, no `any` unless necessary)
- **UI**: React 19+ with strict conventions
- **Styling**: Tailwind v4 (primary) + shadcn/ui + SASS (minimal)
- **Linting/Formatting**: Biome (mandatory, no suppressions allowed)

---

## Project Structure

```
/my-blog-app
├── /app                      # App Router: pages, layouts, route handlers
├── /components               # Shared UI components (reusable)
├── /hooks                    # Custom React hooks
├── /lib                      # Business logic, utilities, DB/ORM wrappers
├── /types                    # Global TypeScript type definitions
├── /styles                   # Global styles, SASS partials, theming
├── /docs                     # Documentation (THIS FILE, architecture, API design, etc.)
├── /public                   # Static assets
├── /config                   # Configuration files, env wrappers, feature flags
├── /services                 # External service clients (optional)
└── /tests                    # Tests (or colocate with modules)
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
- Custom hooks in `/hooks`
- Name with `use…` prefix (e.g., `useAuth`, `useFetchPosts`)
- Encapsulate side-effects, data fetching, state

### Separation of Concerns
- Keep UI (components) separate from business logic
- Business logic/data access in `/lib` or `/services`
- Components import logic/services, never embed DB access directly

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
- shadcn components in `/components/ui/`, don't modify generated files directly
- SASS in `/styles`, shallow nesting (max 2 levels)
- Support light/dark themes via CSS variables
- Support RTL for Arabic (`[dir="rtl"]`)

### File Locations
- `tailwind.config.js` at root
- `/components/ui/` for shadcn components
- `/styles` for global SASS

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

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run Biome linting
npm run format           # Run Biome formatting
npm run check            # Run Biome check (lint + format)
```

---

## Important Notes

- **No over-engineering**: Keep solutions simple, focused on requirements
- **Shallow nesting**: Aim for readability and easy navigation
- **Colocate when possible**: Tests, component-specific types
- **Document decisions**: Architecture, API design, major refactors
- **Consistent naming**: Components, files, folders, routes, utilities

---

**Last Updated**: 2025-12-09
**Spec Source**: `/scaffold-spec/` directory
