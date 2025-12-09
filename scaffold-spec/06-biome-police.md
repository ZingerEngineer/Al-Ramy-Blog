# `Biome Linting & Formatting Enforcement Policy`

This document defines the mandatory rules for using **Biome** in this project.  
All contributors must follow these rules without exception.

---

## 1. Mandatory Use of Biome

Biome is the **only approved tool** for:

- Formatting  
- Linting  
- Import sorting  
- Static analysis  
- Code consistency checks

Every file in the project must comply with Biome’s rules.

---

## 2. No Disabling or Skipping Biome (Global or Inline)

The following practices are **strictly forbidden** in this codebase:

### 2.1. Forbidden Inline Suppressions

The following suppression patterns are **NOT allowed**, even temporarily:

```typescript
// biome-ignore lint
// biome-ignore-all lint
// biome-ignore lint/suspicious/noDebugger
// biome-ignore format
// biome-ignore-all
````

No file in the project may contain these patterns.

### 2.2. Forbidden Config Disabling

The following are **not allowed** in `biome.json` or `biome.jsonc`:

* Turning off rules globally via `"off"`
* Ignoring entire directories except:

  * `node_modules/`
  * `.next/`
  * `dist/`
  * auto-generated files only
* Overriding or weakening strict lint rules

Biome must always run with full, strict rules.