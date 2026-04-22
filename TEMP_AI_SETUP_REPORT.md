# KredBook AI OS Cleanup — Report (Temporary)

This file captures what was changed to make KredBook a **repo-ready, beginner-friendly OpenCode + OMO execution system**.

## 1) Executive summary

- Consolidated AI guidance into a **single source of truth**: `SYSTEM_CONTEXT.md`.
- Made the repo **command-first** (`/plan`, `/build`, `/fix`, `/refactor`, `/audit`).
- Removed overlapping tool-specific instruction files from the active path by **archiving** them.
- Reduced the skills set to a **minimal, high-signal** subset and archived the rest.
- Removed broken `package.json` scripts that referenced missing files.

## 2) Files kept active

- `AGENTS.md` (entrypoint)
- `SYSTEM_CONTEXT.md` (authoritative AI truth)
- `_agents/orchestration.md` (deterministic pipelines)
- `_agents/commands.md` (command interface)
- `_agents/skill-router.md` (skill loading rules)
- `_agents/doc-sync-checklist.md` (short completion gate)
- `_agents/skills/` (minimal skill set)

## 3) Files archived / removed from active setup

- Cursor rules archived: `archive/tooling/cursor/.cursorrules`
- Gemini CLI guidance archived: `archive/tooling/gemini/GEMINI.md`
- Archived skills moved to `_agents/skills-archive/`

## 4) Files merged and where content went

- Product + execution defaults were consolidated into `SYSTEM_CONTEXT.md`.
- Command usage guidance consolidated into `AGENTS.md` + `_agents/commands.md`.

## 5) New repo-ready structure

```text
AGENTS.md
SYSTEM_CONTEXT.md
_agents/
  commands.md
  orchestration.md
  skill-router.md
  doc-sync-checklist.md
  skills/
    code-reviewer/
    debugger/
    project-planner/
    tech-lead/
    refactor-engineer/
    ui-designer/
    ui-ux-pro-max/
    react-native-skills/
    supabase-expert/
    thinker/
  skills-archive/
archive/
  tooling/
    cursor/
    gemini/
```

## 6) Why this is better

- One clear authority (`SYSTEM_CONTEXT.md`) prevents instruction drift.
- Command-first prompts reduce prompting overhead for beginners.
- Fewer active skills reduces noise and stale guidance.
- Archived tool-specific files no longer compete with OpenCode/OMO execution.

## 7) Beginner usage (copy/paste)

- `/build Add loading + empty states to People list (use theme tokens).`
- `/fix Crash when opening entry detail for a Customer with no Entries. Include stack trace + repro steps.`
- `/build Add a new field to profiles. Use Supabase MCP, add migration, and update types.`
- `/refactor Extract repeated money formatting into a shared utility. No behavior change.`
- `/audit Find remaining legacy “order/party” surfaces that leak into UI copy and list fixes.`

## 8) Follow-up / risks

- Ensure `AGENTS.md`, `_agents/*`, and key docs are committed (they were previously gitignored).
- Consider adding CI hooks later if you want automatic doc-sync enforcement.

## 9) Changed files list

- Updated: `AGENTS.md`, `README.md`, `_agents/orchestration.md`, `_agents/doc-sync-checklist.md`, `_agents/skills/README.md`, `_agents/skills/ui-designer/skill.md`, `_agents/skills/supabase-expert/skill.md`, `.gitignore`, `package.json`
- Added: `SYSTEM_CONTEXT.md`, `_agents/commands.md`, `_agents/skill-router.md`, `archive/README.md`, `archive/tooling/cursor/.cursorrules`, `archive/tooling/gemini/GEMINI.md`, `_agents/skills-archive/README.md`, `TEMP_AI_SETUP_REPORT.md`
- Moved to archive: `_agents/skills/{auditor,backend,composition-patterns,prompt-engineer,react-best-practices,web-design-guidelines}` → `_agents/skills-archive/...`
