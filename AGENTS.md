# KredBook AI Operating System (Repo-Ready)

This repository is configured for **OpenCode + OMO** with a **command-first** workflow.

If anything contradicts the active AI rules, **`SYSTEM_CONTEXT.md` wins**.

## 5-minute beginner guide

Use one of these commands as your prompt, plus 1–3 sentences of context:

- `/plan` — break down a feature or change safely
- `/build` — implement a scoped feature end-to-end
- `/fix` — debug and fix a bug with verification
- `/refactor` — restructure without behavior changes
- `/audit` — repo/feature health check with evidence

Command reference: `_agents/commands.md`

## What this repo enforces (non-negotiable)

### Canonical product language

- Business entity: **Customer**
- Money owed: **Entry**
- Money collected: **Payment**
- Screens: **Dashboard**, **People**, **Entries**, **Profile**

Legacy terms may exist in code. If mentioned, label them **legacy**/**transitional**.

### UI tokens

`src/utils/theme.ts` is the design-token source of truth.

### Database/schema

Do not guess schema.
Use Supabase MCP for schema/RLS/migrations.

## Default execution model

Deterministic pipelines live in:
- `_agents/orchestration.md`

Skill routing rules live in:
- `_agents/skill-router.md`

Completion checklist:
- `_agents/doc-sync-checklist.md`

## Examples (copy/paste)

### UI work
`/build Add loading + empty states to People list (follow theme tokens).`

### Bug fix
`/fix Crash when opening entry detail for a Customer with no Entries. Include stack trace + repro steps.`

### Database change
`/build Add a new field to profiles. Use Supabase MCP, add migration, and update types.`

### Refactor
`/refactor Extract repeated money formatting into a shared utility. No behavior change.`

### Audit
`/audit Find remaining legacy “order/party” surfaces that leak into UI copy and list fixes.`
