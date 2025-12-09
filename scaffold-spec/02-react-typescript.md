### `02-react-typescript.md`

```markdown
# React + TypeScript Coding Conventions

Use the following conventions when writing React components, hooks, and TypeScript code.

## Components

- One React component per file.
- File and component names use **PascalCase** (e.g. `UserCard.tsx`, exporting `UserCard`).
- Default export for the main component per file.
- Components should be small, focused, and follow Single Responsibility Principle.
- Prefer splitting large components into smaller ones rather than making monolithic components.
- Distinguish between:
  - **Presentational / UI components** – stateless, reusable, purely UI.
  - **Feature / page components** – stateful, route-specific or domain-specific logic.

## Props, State & Types

- Always use **TypeScript** — avoid `any` unless absolutely necessary.
- Use explicit `interfaces` or `type` aliases for props and state.
- Define shared or domain-wide types in `/types`.
- For component-specific types, keep them in the same file or adjacent.
- Use immutable types / `readonly` whenever appropriate.
- Favor union types / enums over string literals for constrained types.

## Hooks

- Custom hooks belong in `/hooks`.
- Name them `use…`, e.g. `useAuth`, `useFetchPosts`.
- Hooks should encapsulate side-effects, data fetching, state, or subscriptions — not UI markup.

## Separation of Concerns

- Keep UI layer (components) separate from business logic or data access.
- Business logic / data access / side-effects go into `/lib` or `/services`.
- Components import logic/services rather than embedding data fetching or DB access directly.

## Code Readability & Maintainability

- Use meaningful, descriptive names.
- Keep functions small and focused.
- Add comments sparingly — focus on clarity of code rather than over-documenting.
- Follow consistent formatting (indentation, quotes, semicolons) — consider using a formatter (Prettier) + linter (ESLint) rules aligned with this spec.
```