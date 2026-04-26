# Prompt Library (Sprint Board)

Use these as copy-paste templates for sprint board items. Each template is a single prompt you can give to OpenCode.

Product language: always use the canonical nouns `Customer`, `Entry`, `Payment` and screens `Dashboard`, `People`, `Entries`, `Profile`.

---

## /build

```text
/build

Title:
<short feature name>

Goal:
<what outcome should change for the user>

In scope:
- <what must be included>

Out of scope:
- <explicit non-goals>

Acceptance criteria:
- <bullet list of observable behaviors>

Product nouns check:
- Customers involved? <yes/no>
- Entries involved? <yes/no>
- Payments involved? <yes/no>

Constraints:
- Preserve offline-first behavior (React Query persistence + sync queue).
- Do not change auth/onboarding redirects in `app/_layout.tsx` unless explicitly required.
- Use tokens from `src/utils/theme.ts` (no hardcoded colors/sizing when tokens exist).
- Do not guess database schema; verify via Supabase MCP and put DDL in `supabase/migrations/`.
- Never commit `.env*`.

Implementation notes:
- Target screens/routes:
- Edge cases:
- Analytics/telemetry (if any):

Verification required:
- `npm run lint`
- Manual checks:
- Any doc updates needed under `docs/` or `README.md`:

Deliverables:
- Summary of changes
- Files changed
- Verification evidence
- Doc-sync closeout notes
```

---

## /fix

```text
/fix

Bug title:
<short bug name>

User impact:
<who is affected and how>

Expected behavior:
<what should happen>

Actual behavior:
<what happens today>

Repro steps:
1. <step>
2. <step>
3. <step>

Frequency:
<always/sometimes/rare>

Environment:
- Platform: <ios/android>
- Build: <dev/prod>
- Network: <online/offline/flaky>
- Version/commit (if known):

Suspected area (optional):
- <files, components, services>

Constraints:
- Preserve offline-first behavior (React Query persistence + sync queue).
- Do not guess database schema; verify via Supabase MCP and put DDL in `supabase/migrations/`.
- Never commit `.env*`.

What I need back:
- Root cause (with evidence)
- Fix description
- Verification steps/results
- Regression risks (what else might break)
```

---

## /refactor

```text
/refactor

Refactor target:
<area to improve, with file paths if known>

Motivation:
<why this refactor is needed: duplication, complexity, unsafe patterns>

Guardrails:
- No intended behavior change.
- Preserve naming contract (Customer/Entry/Payment).
- Preserve offline-first behavior (React Query persistence + sync queue).
- Keep changes minimal and local unless reuse is clearly beneficial.

Refactor success criteria:
- <measurable improvements: fewer code paths, smaller surface area, clearer ownership>

Verification required:
- `npm run lint`
- Manual checks:

What I need back:
- Before/after structure
- Why it is safer/cleaner
- Verification results
```

---

## /audit

```text
/audit

Audit theme:
<pick one: security, performance, correctness, UX drift, naming drift, offline/sync reliability>

Scope:
- In scope paths:
- Out of scope paths:

Questions to answer:
- <what you want to know>

Constraints:
- Cite evidence (file path + snippet or line references).
- Prefer actionable findings over broad opinions.
- Use canonical nouns in any new user-facing copy.

What I need back:
- Prioritized findings table (severity, file, evidence, recommendation)
- Follow-up plan (smallest safe fixes first)
```
