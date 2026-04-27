# KredBook Skill Router

Routing rules for all commands and keyword triggers.
Load manually: `load_skills=["skill-name", ...]`

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

If touches UI/screens:
- add `ui-ux-pro-max`, `frontend-design`, `building-native-ui`, `sleek-design-mobile-apps`

If touches design tokens or brand:
- add `brand-guidelines`, `extract-design-system`

If touches NativeWind/Tailwind styles:
- add `expo-tailwind-setup`

If touches data fetching / React Query / API calls:
- add `native-data-fetching`

If touches database / schema / RLS:
- add `supabase`, `supabase-postgres-best-practices`

If touches TypeScript types:
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
Write, update, or co-author any documentation.
- `doc-coauthoring`
- `internal-comms`
- `writing-plans`

### /finish
Review, commit, and push completed changes safely.
- `finishing-a-development-branch`
- `code-reviewer`
- `verification-before-completion`

### /upgrade
Upgrade Expo SDK or major dependencies.
- `upgrading-expo`
- `react-native-skills`
- `expo-tailwind-setup`
- `verification-before-completion`

---

## Keyword Routing (Fallback)

- UI / screen / component / design → `ui-ux-pro-max`, `frontend-design`, `building-native-ui`
- brand / color / typography / tokens → `brand-guidelines`, `extract-design-system`
- mobile design / app polish → `sleek-design-mobile-apps`
- NativeWind / tailwind / styles → `expo-tailwind-setup`
- fetch / query / API / React Query / offline → `native-data-fetching`
- bug / crash / error / fix → `systematic-debugging`, `code-reviewer`
- schema / migration / RLS / auth / storage / Supabase → `supabase`, `supabase-postgres-best-practices`
- postgres / performance / query optimization → `supabase-postgres-best-practices`
- refactor / cleanup / extract → `refactor-engineer`, `code-reviewer`
- plan / estimate / break down / spec / PRD → `project-planner`, `writing-plans`
- typescript / types / generics / inference → `typescript-advanced-types`
- commit / push / branch / PR → `finishing-a-development-branch`, `verification-before-completion`
- write / document / changelog / announce → `doc-coauthoring`, `internal-comms`
- docs / api / sdk / library / framework → `context7-mcp`
- expo upgrade / SDK version → `upgrading-expo`, `react-native-skills`
- react native / RN / expo → `react-native-skills`, `vercel-react-native-skills`
- new skill / create skill / agent skill → `skill-creator`
