# KredBook Skill Router

This file defines **skill routing rules** for all commands and keyword triggers.

Manually load skills by adding `load_skills=["skill-name", ...]` to your request.

---

## Command-Based Routing

### /plan
Turns a request into a scoped implementation plan.
- `project-planner`
- `writing-plans`

### /build
Implement features after a plan is approved.
- `project-planner`
- `code-reviewer`

If the build touches UI:
- add `ui-ux-pro-max`, `frontend-design`, `react-native-skills`

If the build touches design tokens or brand:
- add `brand-guidelines`, `extract-design-system`

If the build touches mobile-specific UI:
- add `sleek-design-mobile-apps`

If the build touches database/schema:
- add `supabase-expert`, `supabase-postgres-best-practices`

If the build involves TypeScript types:
- add `typescript-advanced-types`

### /fix
Debug and fix bugs with structured root-cause analysis.
- `systematic-debugging`
- `code-reviewer`

### /refactor
Safe code structure improvements without behavior change.
- `refactor-engineer`
- `code-reviewer`

### /audit
Analyze codebase for technical debt or design drift.
- `code-reviewer`
- `verification-before-completion`

### /doc
Write, update, or co-author documentation.
- `doc-coauthoring`
- `internal-comms`
- `writing-plans`

### /finish
Review, commit, and push completed changes safely.
- `finishing-a-development-branch`
- `code-reviewer`
- `verification-before-completion`

---

## Keyword Routing (Fallback)

- UI / UX / design / component / screen → `ui-ux-pro-max`, `frontend-design`, `react-native-skills`
- brand / color / typography / tokens → `brand-guidelines`, `extract-design-system`
- mobile design / app polish → `sleek-design-mobile-apps`
- bug / crash / error / fix → `systematic-debugging`, `code-reviewer`
- schema / migration / RLS / Supabase / database → `supabase-expert`, `supabase-postgres-best-practices`
- postgres / performance / query → `supabase-postgres-best-practices`
- refactor / cleanup / extract → `refactor-engineer`, `code-reviewer`
- plan / estimate / break down / spec / PRD → `project-planner`, `writing-plans`
- typescript / types / generics → `typescript-advanced-types`
- commit / push / branch / PR → `finishing-a-development-branch`, `verification-before-completion`
- write / document / changelog / announce → `doc-coauthoring`, `internal-comms`
- docs / api / sdk / library → `context7-mcp`
- skill / agent skill → `skill-creator`
