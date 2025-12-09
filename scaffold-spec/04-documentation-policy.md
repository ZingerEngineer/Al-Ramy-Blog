
### `04-documentation-policy.md`

```markdown
# Documentation & Project Logging Policy

Guidelines for maintaining docs and logs in this project.

## Mandatory Docs Files

Within `/docs`, always maintain:

- `architecture.md` — High-level system architecture: folder layout rationale, data flow, service boundaries, routing strategy, caching strategy, deployment plan.
- `api-design.md` — API contracts (route handlers or API endpoints), request/response shapes, authentication & authorization rules, data models, error handling patterns.
- `style-guide.md` — Coding conventions for React, TypeScript, styling, naming, folder structure, naming rules, component architecture patterns.
- `CHANGELOG.md` — Chronological list of major changes, breaking changes, migrations, version bumps, refactors.
- Optionally: `logs/` directory or `logs.md` — project logs, architectural decisions, experiments, performance metrics, foldbacks.

## Doc Writing Guidelines

- Use **Markdown** format (`.md`) — easy to version, diff, and read.
- For each major feature or architectural change, write a short doc entry describing:
  - What changed  
  - Why it changed  
  - What trade-offs were considered  
  - Any follow-up tasks (migration notes, cleanup, backwards compatibility)  

## Purpose & Benefits

- Transparent reasoning: other developers (or future you) can understand *why* things are done a certain way.  
- History tracking: tracks evolution of project, decisions, refactors — very useful for maintenance or handing over.  
- Consistency: ensures code + docs evolve together.  
- Better onboarding for collaborators or even for yourself after a break.
```

