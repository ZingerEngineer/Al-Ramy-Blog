# **`05-styles-and-themings.md` (UPDATED FOR: Tailwind v4, SASS, shadcn/ui)**

```markdown
# Styling & Theming Policy (TailwindCSS v4 / SASS / shadcn/ui)

This document defines how styling, theming, and UI consistency are handled across the monorepo (webapp + admin).

Our styling stack consists of:
- **TailwindCSS v4** (primary styling system)
- **shadcn/ui** (prebuilt, extensible component system)
- **SASS (SCSS)** for global styles, overrides, mixins, typography, and special layout cases.
- **CSS variables** for design tokens & theming.

---

## 1. Styling Philosophy

We follow a **utility-first + component-driven** approach:

- **TailwindCSS** handles 90% of layout, spacing, typography, color, and responsive design.
- **shadcn/ui** provides accessible, production-ready UI primitives with Tailwind-based styling.
- **SASS** is used *only when needed*:
  - Global resets
  - Typography rules
  - Complex UI not expressible via utility classes
  - Theme overrides and custom animations
  - Shared mixins or helper classes

Avoid custom CSS unless Tailwind or shadcn doesn't cover the use case cleanly.

---

## 2. TailwindCSS v4 Usage

Tailwind is the *primary* styling tool.

### Conventions:

* Use utilities for spacing, layout, flex/grid, colors, typography.
* Prefer **Tailwind classes in JSX** instead of SASS for most components.
* Use Tailwind's **design tokens** system to reference CSS variables instead of hardcoded values.
* Use Tailwind's **dark mode** strategy and `[dir="rtl"]` support for Arabic.

### File placement:

Tailwind config lives at root:

tailwind.config.js

Do not customize too aggressively — extend via tokens instead.

---

## 3. shadcn/ui Component Standards

shadcn/ui is used for consistent component styling across apps.

### Rules:

* Never modify generated component files directly—extend via:

  * ClassName overrides
  * Wrapper components
  * Slots/variants pattern
* Keep component folders inside:

/components/ui/

### Theming via shadcn:

* Use the provided theme file (`components/ui/theme.css`) for updating Light/Dark theme colors.
* Inject custom CSS variables via your global token system.

---

## 4. SASS (SCSS) Usage

SASS is used for *specialized* styling only.

### When to use SASS:

* Complex layout cases not easily expressed via utility classes.
* Global base styles (typography, animations).
* RTL adjustments if utility classes become cluttered.
* Shared mixins or reusable patterns.

### File conventions:

* Global SASS lives in `/styles`.
* Component-specific SASS modules **ONLY if absolutely required**:

  MyComponent.module.scss
  
* Keep SASS selectors shallow—avoid deeply nested rules.

### Avoid:

* Large SASS frameworks.
* Overusing SASS for simple styles covered by Tailwind.
* Global overrides—prefer component-level styling.

---

## 5. Theming (Light/Dark + Future Themes)

Themes rely primarily on **CSS variables**.

### Rules:

* Theme variables defined in `:root` and `[data-theme="dark"]`.
* Tailwind utilities bind to these variables.
* Do not hardcode hex colors in components — use semantic tokens:

  * `--color-primary`
  * `--color-muted`
  * etc.

### RTL

* Add `[dir="rtl"]` support globally.
* Only apply RTL corrections via SASS when utilities become verbose.

---

## 6. Maintainability & Best Practices

* Keep class names meaningful when writing custom CSS.
* Prefer Tailwind utilities over writing new CSS.
* Extremely shallow nesting in SASS (max 2 levels).
* All custom colors, fonts, spacing → **go through design tokens**.
* Keep styling colocated with component or in global SASS only if reusable.
* Document any unusual styling pattern in `/docs/ui-guidelines.md`.

---

## 7. Performance Considerations

* Tailwind v4 uses on-demand CSS extraction — keep classes explicit.
* Avoid massive SASS files; break globals into partials.
* Avoid chaining arbitrary selectors in SASS—use component boundaries instead.