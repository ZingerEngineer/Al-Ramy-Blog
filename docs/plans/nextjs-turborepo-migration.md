# Next.js 16.1.1 + Turbopack + Turborepo Migration Plan

## Overview
This document describes the migration of the Al-Ramy-Blog monorepo from Next.js 16.0.7 to 16.1.1, standardization of Turbopack configuration, and addition of Turborepo for build/dev caching.

## Migration Date
December 2025

## Changes Made

### 1. Turborepo Installation
Added `turbo` v2.7.2 as a root devDependency for build orchestration and caching.

### 2. turbo.json Configuration
Created `/turbo.json` with the following tasks:

| Task | Caching | Dependencies | Outputs |
|------|---------|--------------|---------|
| `build` | Yes | `^build` | `.next/**`, `dist/**` |
| `dev` | No | None | Persistent |
| `lint` | Yes | `^build` | None |
| `typecheck` | Yes | `^build` | None |
| `clean` | No | None | None |

### 3. Next.js Upgrade
- **webapp**: 16.0.7 → 16.1.1
- **adminapp**: 16.0.7 → 16.1.1

### 4. Turbopack Configuration Standardization
Migrated webapp from deprecated `experimental.turbo` to stable `turbopack` configuration (Next.js 16 standard).

The custom `sass-loader` configuration was **removed** - Next.js 16 with Turbopack has built-in Sass support, making manual configuration unnecessary.

### 5. Root Scripts Updated
| Script | Before | After |
|--------|--------|-------|
| `dev` | `pnpm --parallel -r dev` | `turbo dev` |
| `build` | `pnpm -r build` | `turbo build` |
| `typecheck` | `pnpm -r typecheck` | `turbo typecheck` |
| `clean` | `pnpm -r clean && rimraf node_modules` | `turbo clean && rimraf node_modules .turbo` |

## Benefits

1. **Faster Dev Server**: Turbopack provides faster HMR and startup times
2. **Build Caching**: Turborepo caches build outputs, skipping unchanged packages
3. **Parallel Execution**: Turborepo runs independent tasks in parallel
4. **Consistent Config**: Both Next.js apps use the same turbopack configuration

## Usage

```bash
# Start all dev servers
pnpm dev

# Start specific app
pnpm dev:webapp
pnpm dev:adminapp

# Build all apps (with caching)
pnpm build

# Type checking (with caching)
pnpm typecheck
```

## Cache Location
Local cache is stored in `.turbo/` directory (gitignored).

## Future Enhancements (Optional)

### Remote Caching
For CI/CD caching across machines, configure:
- Set `TURBO_TOKEN` and `TURBO_TEAM` environment variables
- Vercel Remote Cache or self-hosted remote cache
