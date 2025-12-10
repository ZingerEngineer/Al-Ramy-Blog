# Monorepo Conventions & Best Practices

Rules and conventions specific to the monorepo structure of Al-Ramy Blog.

## Monorepo Structure

This project uses **pnpm workspaces** to manage multiple apps and shared packages.

```
/Al-Ramy-Blog (root)
├── /apps/                  # Applications
│   ├── /webapp/            # Public blog application
│   └── /admin/             # Admin dashboard
├── /packages/              # Shared packages
│   ├── /database/          # Prisma client & DB utilities
│   ├── /server/            # Server-only utilities
│   ├── /types/             # Shared TypeScript types
│   ├── /ui/                # Basic UI components
│   ├── /shadcn/            # shadcn/ui components
│   ├── /hooks/             # Shared React hooks
│   └── /tailwind-config/   # Shared Tailwind configuration
├── /docs/                  # Documentation
├── /scaffold-spec/         # Project specifications
└── package.json            # Root workspace configuration
```

## Package Naming

All packages use the `@al-ramy` scope:

- `@al-ramy/database` - Database package
- `@al-ramy/server` - Server utilities
- `@al-ramy/types` - TypeScript types
- `@al-ramy/ui` - UI components
- `@al-ramy/shadcn` - shadcn/ui components
- `@al-ramy/hooks` - React hooks
- `@al-ramy/tailwind-config` - Tailwind configuration

Apps use simple names without scope:
- `webapp` - Public blog
- `admin` - Admin dashboard

## Cross-Package Imports

### In package.json

Use workspace protocol for internal dependencies:

```json
{
  "dependencies": {
    "@al-ramy/database": "workspace:*",
    "@al-ramy/types": "workspace:*"
  }
}
```

### In Code

Import from package names (not relative paths across packages):

```typescript
// ✅ Good
import { prisma } from '@al-ramy/database';
import { User } from '@al-ramy/types';
import { useDebounce } from '@al-ramy/hooks';

// ❌ Bad
import { prisma } from '../../packages/database/src';
```

## TypeScript Configuration

- **Root `tsconfig.json`**: Base configuration extended by all packages
- **Package `tsconfig.json`**: Extends root, adds package-specific paths
- **Path Aliases**: Defined in root for cross-package imports

## Dependency Management

### Rules

1. **No Duplicate Dependencies**: Install shared dependencies at the root when possible
2. **Peer Dependencies**: Use peer dependencies for React, React DOM in shared packages
3. **Version Consistency**: Keep package versions consistent across the monorepo
4. **Workspace Protocol**: Always use `workspace:*` for internal dependencies

### Installing Dependencies

```bash
# Root-level dependency (shared across all packages)
pnpm add -w <package-name>

# Package-specific dependency
pnpm --filter <package-name> add <dependency>

# Add to multiple packages
pnpm --filter "@al-ramy/ui" --filter "@al-ramy/shadcn" add <dependency>
```

## Package Structure Standards

### Standard Package Structure

Every package should follow this structure:

```
/packages/<package-name>/
├── package.json        # Package manifest
├── tsconfig.json       # TypeScript config (extends root)
├── /src/               # Source code
│   └── index.ts        # Main entry point
└── README.md           # Package documentation (optional)
```

### Package.json Required Fields

```json
{
  "name": "@al-ramy/<package-name>",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

## Build Order & Dependencies

### Dependency Graph

```
database ──┐
types ─────┤
hooks ─────┼──> webapp
ui ────────┤      &
shadcn ────┤    admin
server ────┘
tailwind-config
```

### Build Strategy

- **No build step in development**: TypeScript packages are consumed directly via source
- **Production builds**: Apps bundle all dependencies
- **Prisma generation**: Must run before building apps

## When to Create a New Package

Create a new package when:

1. **Code is shared** between multiple apps
2. **Clear boundaries** exist (types, UI, utilities, etc.)
3. **Independent versioning** would be beneficial (future consideration)
4. **Separation of concerns** improves architecture

Do NOT create a package if:

1. Code is only used in one app (keep it in the app)
2. The abstraction is premature
3. It creates unnecessary complexity

## Scripts & Commands

### Root-Level Scripts

```bash
# Development
pnpm dev                # Run all apps in parallel
pnpm dev:webapp         # Run only webapp
pnpm dev:admin          # Run only admin

# Build
pnpm build              # Build all packages and apps

# Quality Checks
pnpm lint               # Run Biome on all packages
pnpm lint:fix           # Fix linting issues
pnpm typecheck          # TypeScript check on all packages

# Database
pnpm db:generate        # Generate Prisma client
pnpm db:migrate         # Run Prisma migrations
pnpm db:studio          # Open Prisma Studio
pnpm db:seed            # Seed database

# Cleanup
pnpm clean              # Clean all build artifacts
```

### Package-Specific Scripts

```bash
# Run script in specific package
pnpm --filter webapp dev
pnpm --filter @al-ramy/database prisma:generate

# Run script in multiple packages
pnpm --filter "@al-ramy/*" typecheck
```

## Environment Variables

### Organization

- **Root `.env`**: Shared environment variables (optional)
- **App `.env.local`**: App-specific environment variables
- **Package `.env.example`**: Example environment variables (committed)

### Precedence

App-level `.env.local` > Root `.env` > Default values

## Testing Strategy

### Test Organization

- **Unit tests**: Colocated with code (`*.test.ts` files)
- **Integration tests**: In package or app `/tests` folder
- **E2E tests**: In app `/tests/e2e` folder

### Running Tests

```bash
pnpm test               # Run all tests
pnpm --filter webapp test
pnpm --filter @al-ramy/types test
```

## Documentation Requirements

Each package should have:

1. **README.md** (optional but recommended): Package purpose, usage, examples
2. **Inline comments**: For complex logic
3. **Type definitions**: Properly typed exports

## Versioning (Future Consideration)

Currently all packages are `private: true` and version `0.1.0`.

In the future, consider:
- **Changesets**: For managing package versions and changelogs
- **Semantic Versioning**: For package releases
- **Independent Versioning**: Different version for each package

## Common Pitfalls

### Circular Dependencies

❌ **Avoid**:
```
packages/types imports from packages/database
packages/database imports from packages/types
```

✅ **Solution**: Extract shared types to `@al-ramy/types`, database package should not import from types

### Relative Imports Across Packages

❌ **Avoid**:
```typescript
import { User } from '../../../packages/types/src/models';
```

✅ **Use**:
```typescript
import { User } from '@al-ramy/types';
```

### Duplicate Dependencies

❌ **Avoid**: Installing the same dependency in multiple packages

✅ **Use**:
- Install at root for shared dependencies
- Use peer dependencies for libraries like React
- Use `pnpm list <package-name>` to check for duplicates

## Migration Path (Adding New Packages)

1. Create package directory: `mkdir -p packages/<name>/src`
2. Create `package.json` with required fields
3. Create `tsconfig.json` extending root
4. Create `src/index.ts` with exports
5. Add to `pnpm-workspace.yaml` (already includes `packages/*`)
6. Install dependencies: `pnpm --filter @al-ramy/<name> add <dep>`
7. Import in apps: `import { ... } from '@al-ramy/<name>';`
8. Document the package purpose and usage

## Performance Considerations

- **Fast Refresh**: Works seamlessly with workspace packages
- **TypeScript Performance**: Use project references for large monorepos (future)
- **Build Caching**: Consider Turbo for caching (optional)
- **Selective Installation**: Use `pnpm --filter` for CI optimizations

## Best Practices Summary

1. Use `workspace:*` for internal dependencies
2. Keep package boundaries clear and well-defined
3. Avoid circular dependencies
4. Keep versions consistent
5. Use path aliases from root tsconfig
6. Document shared packages
7. Run quality checks before commits (Husky)
8. Test packages independently when possible
9. Keep apps lean, move shared code to packages
10. Follow naming conventions strictly
