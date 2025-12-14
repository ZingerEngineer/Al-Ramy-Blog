# @al-ramy/shadcn

This package contains shadcn/ui components for the Al-Ramy Blog monorepo.

## Adding Components

To add shadcn/ui components to this package, run the following command from the root of the monorepo:

```bash
cd packages/shadcn
npx shadcn@latest add [component-name]
```

For example:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

## Usage

Import components from this package in your apps:

```tsx
import { Button } from '@al-ramy/shadcn';
import { cn } from '@al-ramy/shadcn';

export function MyComponent() {
  return <Button variant="default">Click me</Button>;
}
```

## Configuration

The shadcn/ui configuration is defined in `components.json`. This package uses:

- **Style**: New York
- **RSC**: Enabled (React Server Components)
- **Tailwind**: Shared config from `@al-ramy/tailwind-config`
- **CSS Variables**: Enabled for theming
