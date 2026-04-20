# Al-Ramy Blog

A modern, high-performance blog and social blogging platform built with Next.js 16, designed for bilingual content (English/Arabic) with a focus on clean architecture and developer experience.

## Overview

Al-Ramy Blog is a full-featured blogging application that combines the power of modern web technologies with strict coding standards and comprehensive documentation practices. The project emphasizes maintainability, performance, and scalability.

## Monorepo Structure

This project uses a **pnpm workspace monorepo** with:
- **2 Next.js 16 apps**: `webapp` (public blog) and `admin` (dashboard)
- **7 shared packages**: database, server, types, ui, shadcn, hooks, tailwind-config

## Tech Stack

### Core Technologies
- **Next.js 16** - App Router, Server Components, Turbopack
- **React 19+** - Modern React with strict conventions
- **TypeScript** - Strict typing throughout the codebase
- **Tailwind CSS v4** - Utility-first styling framework
- **shadcn/ui** - Accessible, production-ready UI components
- **SASS** - For complex styling and global theming
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **Biome** - Fast linting, formatting, and code analysis
- **Husky** - Git hooks for code quality
- **GitHub Actions** - CI/CD pipeline

## Key Features

- Modern, responsive design with Tailwind v4
- Dark/Light theme support
- RTL (Right-to-Left) support for Arabic content
- Server-side rendering and static generation
- Type-safe development with TypeScript
- Component-driven architecture
- Strict code quality enforcement
- Comprehensive documentation

## Project Structure

```
/Al-Ramy-Blog (monorepo root)
├── /apps/                         # Applications
│   ├── /webapp/                   # Public blog (Next.js 16)
│   │   ├── /app/                  # App Router pages
│   │   ├── /components/           # Webapp-specific components
│   │   ├── /hooks/                # Webapp-specific hooks
│   │   └── /styles/               # Webapp-specific styles
│   └── /admin/                    # Admin dashboard (Next.js 16)
│       ├── /app/                  # App Router pages
│       ├── /components/           # Admin-specific components
│       └── /styles/               # Admin-specific styles
│
├── /packages/                     # Shared packages
│   ├── /database/                 # Prisma client & DB utilities
│   │   └── /prisma/               # Prisma schema & migrations
│   ├── /server/                   # Server-only utilities (auth, S3, validation)
│   ├── /types/                    # Shared TypeScript types
│   ├── /ui/                       # Basic shared UI components
│   ├── /shadcn/                   # shadcn/ui components
│   ├── /hooks/                    # Shared React hooks
│   └── /tailwind-config/          # Shared Tailwind config & design tokens
│
├── /docs/                         # Documentation
├── /scaffold-spec/                # Project specifications
├── package.json                   # Root workspace config
├── pnpm-workspace.yaml            # pnpm workspace definition
├── tsconfig.json                  # Base TypeScript config
└── biome.json                     # Shared Biome config
```

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **PostgreSQL** (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Al-Ramy-Blog.git
   cd Al-Ramy-Blog
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp apps/webapp/.env.local.template apps/webapp/.env.local
   cp apps/admin/.env.local.template apps/admin/.env.local
   ```
   Update the `.env.local` files with your database credentials and other secrets.

4. Generate Prisma client:
   ```bash
   pnpm db:generate
   ```

5. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

6. (Optional) Seed the database:
   ```bash
   pnpm db:seed
   ```

### Development

Run both apps in development mode:
```bash
pnpm dev
```

Or run apps individually:
```bash
pnpm dev:webapp   # Webapp on http://localhost:3000
pnpm dev:admin    # Admin on http://localhost:3001
```

### Available Scripts

```bash
pnpm dev          # Run all apps in parallel
pnpm build        # Build all packages and apps
pnpm lint         # Run Biome linting
pnpm lint:fix     # Fix linting issues
pnpm typecheck    # TypeScript type checking
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
pnpm clean        # Clean all build artifacts
```

## Documentation

This project follows a documentation-first approach. Key documentation files:

### Scaffold Specifications
- **`00-README.md`** - Overview of scaffold specs
- **`01-project-structure.md`** - Project folder layout and organization
- **`02-react-typescript.md`** - React and TypeScript conventions
- **`03-next-16.md`** - Next.js 16 specific conventions
- **`04-documentation-policy.md`** - Documentation requirements
- **`05-styles-and-themings.md`** - Styling with Tailwind, shadcn/ui, SASS
- **`06-biome-police.md`** - Biome enforcement rules
- **`07-monorepo-conventions.md`** - Monorepo-specific best practices

### Project Documentation
- **`/docs/cursor.md`** - Quick context summary for developers
- **`/docs/architecture.md`** - System architecture (to be added)
- **`/docs/api-design.md`** - API contracts and design (to be added)
- **`/docs/style-guide.md`** - Coding style guide (to be added)

## Development Principles

1. **Type Safety** - Strict TypeScript, no `any` types
2. **Code Quality** - Biome enforcement with zero suppressions
3. **Separation of Concerns** - Clear boundaries between UI, logic, and data
4. **Component Architecture** - Small, focused, reusable components
5. **Documentation** - Every major decision and change is documented

## Code Standards

All code in this project must comply with:
- React + TypeScript conventions (see `/scaffold-spec/02-react-typescript.md`)
- Next.js 16 best practices (see `/scaffold-spec/03-next-16.md`)
- Styling guidelines (see `/scaffold-spec/05-styles-and-themings.md`)
- Biome rules with no exceptions (see `/scaffold-spec/06-biome-police.md`)
- Monorepo conventions (see `/scaffold-spec/07-monorepo-conventions.md`)

### Pre-commit Hooks

This project uses Husky to run pre-commit hooks:
- **Biome check** - Linting and formatting
- **Type checking** - Ensures TypeScript compliance

These checks run automatically before each commit.

## Contributing

> Contribution guidelines will be added here.

## License

> License information will be added here.

---

**Project Status**: In Development
**Last Updated**: December 2025