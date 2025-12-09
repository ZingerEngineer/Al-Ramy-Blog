### `01-project-structure.md`

```markdown
# Project Structure & Folder Layout

Define the root-level folder layout and naming conventions. What belongs where:

```

/my-blog-app
├── /app                      # App Router – all pages, layouts, route-handlers, etc.
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── ...                   # Feature folders (e.g. blog, auth, admin, profile)
│   └── (groups) / _private   # Optionally group non-route-specific code
├── /components               # Shared UI components (reusable across routes)
├── /hooks                    # Custom React hooks (data fetching, auth state, etc.)
├── /lib                      # Utility, business logic, DB/ORM wrappers, helpers
├── /types                    # Global/shared TS type definitions, interfaces, enums
├── /styles                   # Global styles, SASS partials / variables / theming
├── /docs                     # Documentation: architecture, API design, decisions, changelog
│   ├── architecture.md
│   ├── api-design.md
│   ├── style-guide.md
│   └── CHANGELOG.md
├── /public                   # Static assets (images, fonts, icons)
├── /config                   # Configuration files/constants, env wrappers, feature flags
├── /services                 # External service clients (optional)
├── /tests                    # (Optional) tests – or colocate tests next to modules
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env*.local               # Environment variables
└── README.md

```

## Folder Usage Guidelines

- Use the Next.js 16 App Router by placing routes, layouts, and pages under `/app/`.
- Feature-based folders under `/app/` should represent URL route segments (e.g. `app/blog`, `app/auth`, etc.).
- For code that should not map to a URL (utilities, helpers, shared modules), use private folders — either inside `app/` (prefixed `_`) or outside (e.g. `/lib`, `/hooks`, etc.).
- Shared UI components belong in `/components`, not inside route folders (unless very specific).
- Business logic, database access, service wrappers, utilities go in `/lib` or `/services`.
- Shared TypeScript interfaces, types, enums go in `/types`.
- Global configuration or constants go in `/config`.
- Static assets go into `/public`.
- Styling and theming via SASS or other CSS methods go into `/styles`.
- Documentation (architecture, API docs, style guide, changelog) goes in `/docs`, as Markdown.
- Tests can be colocated with modules or placed under `/tests`.
- Avoid deep folder nesting unless necessary — aim for readability and ease of navigation.
```