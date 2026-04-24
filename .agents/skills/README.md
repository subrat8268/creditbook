# KredBook Agent Skills (Minimal)

This repo keeps a **minimal, high-signal** set of OMO skills under `.agents/skills/`.

If you want routing rules, see:
- `.agents/skill-router.md`

## Active skills (kept)

| Skill | Purpose | Typical triggers |
|---|---|---|
| `project-planner` | scoped plans | plan, break down |
| `tech-lead` | architecture decisions | architecture, structure |
| `ui-ux-pro-max` | UI direction | UI, UX, design |
| `ui-designer` | apply repo design tokens | component, screen |
| `react-native-skills` | RN/Expo best practices | React Native, Expo |
| `debugger` | bug fixing | fix, crash, error |
| `thinker` | deep reasoning | analyze, complex |
| `code-reviewer` | quality gates | review, bug |
| `refactor-engineer` | safe refactors | refactor, extract |
| `supabase-expert` | schema/RLS/migrations | supabase, schema, RLS |
| `context7-mcp` | live framework docs | docs, api, sdk |
| `git-push` | review + commit + push | commit, push |

## Archived skills (not active)

To reduce confusion and drift, lower-signal or web-specific skills are archived under:
- `.agents/skills-archive/`

## Notes

- The authoritative routing rules are in `.agents/skill-router.md`.
- The authoritative product contract is `SYSTEM_CONTEXT.md`.
