# KredBook Agent Skills

This repo keeps a **high-signal** set of skills under `.agents/skills/`.

If you want routing rules, see:
- `.agents/skill-router.md`

## Active Skills (20 total)

| Skill | Purpose | Typical Triggers |
|---|---|---|
| `project-planner` | Scoped plans, task breakdowns | plan, break down, estimate |
| `ui-ux-pro-max` | UI direction & aesthetic polish | UI, UX, design |
| `react-native-skills` | RN/Expo best practices | React Native, Expo, mobile |
| `code-reviewer` | Quality gates, bug detection | review, quality, audit |
| `refactor-engineer` | Safe refactors & cleanup | refactor, extract, cleanup |
| `supabase-expert` | Schema, RLS, migrations | Supabase, schema, RLS |
| `context7-mcp` | Live framework docs | docs, api, sdk, library |
| `doc-coauthoring` | Writing & co-authoring docs | write, document, draft |
| `internal-comms` | Changelogs, announcements, status updates | changelog, update, announce |
| `writing-plans` | Structured planning docs (PRD, spec) | spec, PRD, requirements |
| `frontend-design` | Frontend architecture & design | frontend, component, layout |
| `brand-guidelines` | Brand identity, colors, typography | brand, color, typography |
| `extract-design-system` | Extract tokens & components into a system | design system, tokens |
| `sleek-design-mobile-apps` | Mobile-specific design polish | mobile design, app polish |
| `supabase-postgres-best-practices` | Advanced Supabase/Postgres patterns | postgres, advanced, performance |
| `typescript-advanced-types` | TypeScript advanced type patterns | typescript, types, generics |
| `skill-creator` | Build & manage agent skills | skill, agent skill |
| `verification-before-completion` | Agent verifies before marking done | verify, confirm, done |
| `systematic-debugging` | Structured debugging methodology | bug, crash, error, fix |
| `finishing-a-development-branch` | Clean branch/PR lifecycle | commit, push, branch, PR |

## Notes

- The authoritative routing rules are in `.agents/skill-router.md`.
- The authoritative product contract is `SYSTEM_CONTEXT.md`.
- Skills are installed via: `npx skills install <owner>/<repo> <skill-name>`
