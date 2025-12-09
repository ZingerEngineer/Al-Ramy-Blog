# Al-Ramy Blog

A modern, high-performance blog and social blogging platform built with Next.js 16, designed for bilingual content (English/Arabic) with a focus on clean architecture and developer experience.

## Overview

Al-Ramy Blog is a full-featured blogging application that combines the power of modern web technologies with strict coding standards and comprehensive documentation practices. The project emphasizes maintainability, performance, and scalability.

## Tech Stack

### Core Technologies
- **Next.js 16** - App Router, Server Components, Turbopack
- **React 19+** - Modern React with strict conventions
- **TypeScript** - Strict typing throughout the codebase
- **Tailwind CSS v4** - Utility-first styling framework
- **shadcn/ui** - Accessible, production-ready UI components
- **SASS** - For complex styling and global theming

### Development Tools
- **Biome** - Fast linting, formatting, and code analysis
- **Git** - Version control with conventional commits

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
/my-blog-app
├── /app                      # Next.js App Router (pages, layouts, API routes)
├── /components               # Reusable UI components
├── /hooks                    # Custom React hooks
├── /lib                      # Business logic and utilities
├── /types                    # TypeScript type definitions
├── /styles                   # Global styles and SASS
├── /docs                     # Project documentation
├── /public                   # Static assets
├── /config                   # Configuration files
└── /scaffold-spec            # Project specifications and conventions
```

## Getting Started

> Installation instructions and development setup will be added here.

## Documentation

This project follows a documentation-first approach. Key documentation files:

- **`/scaffold-spec/`** - Project specifications, coding conventions, and architectural guidelines
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

## Contributing

> Contribution guidelines will be added here.

## License

> License information will be added here.

---

**Project Status**: In Development
**Last Updated**: December 2025