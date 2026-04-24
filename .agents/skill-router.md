# KredBook Skill Router (OMO)

This file defines **simple, beginner-friendly skill routing**.

If you manually invoke tasks, load skills using:
`load_skills=["skill-name", ...]`

## Command-based routing (recommended)

### /plan
- `project-planner`
- `tech-lead`

### /build
- `project-planner`
- `tech-lead`
- `code-reviewer`

If the build touches UI:
- add `ui-ux-pro-max`, `ui-designer`, `react-native-skills`

If the build touches database/schema:
- add `supabase-expert`

### /fix
- `debugger`
- `thinker`
- `code-reviewer`

### /refactor
- `refactor-engineer`
- `tech-lead`
- `code-reviewer`

### /audit
- `code-reviewer`

### /git-push
- `code-reviewer`
- `git-push`

## Keyword routing (fallback)

- UI / UX / design / component / screen → `ui-ux-pro-max`, `ui-designer`, `react-native-skills`
- bug / crash / error / fix → `debugger`, `thinker`, `code-reviewer`
- schema / migration / RLS / Supabase / database → `supabase-expert`, `code-reviewer`
- refactor / cleanup / extract → `refactor-engineer`, `tech-lead`, `code-reviewer`
- plan / estimate / break down → `project-planner`, `tech-lead`
- commit / push / publish branch → `code-reviewer`, `git-push`
