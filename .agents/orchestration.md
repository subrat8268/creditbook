# KredBook Orchestration (Deterministic Pipelines)

This file defines **deterministic, command-driven pipelines** for the repo.

Authoritative context:
- `SYSTEM_CONTEXT.md`
- `.agents/skill-router.md`

## /plan pipeline

1) Confirm scope + canonical nouns (Customer/Entry/Payment)
2) Explore codebase for existing patterns
3) Produce a plan: files, risks, verification

## /build pipeline

1) Explore (find existing screens/components/hooks)
2) Plan (scope + out-of-scope + impacted layers)
3) Implement (follow theme tokens + existing patterns)
4) Review (type safety, states, accessibility basics)
5) Verify (lint + diagnostics; tests/build if relevant)
6) Doc sync (run `.agents/doc-sync-checklist.md`)

## /git-push pipeline

1) Review gate (run code-review checks)
2) Validate git scope (`git status` + `git diff`)
3) Draft commit message (why-first)
4) Stage only in-scope files
5) Commit
6) Push current branch safely (no force)

## /fix pipeline

1) Capture evidence (error, stack, repro)
2) Isolate root cause (minimal reproduction)
3) Fix (smallest safe change)
4) Verify (regression + lint/diagnostics)
5) Closeout (what changed, why it was safe)

## /refactor pipeline

1) Identify duplication / risk surface
2) Refactor without behavior change
3) Review + verify

## /audit pipeline

1) Inventory targets (files/flows)
2) Classify findings (critical/high/medium/low)
3) Provide evidence snippets
4) Propose follow-up plan

## Required artifacts (non-trivial work)

For any non-trivial change, include in the final output:
- brief (goal, scope, out-of-scope)
- naming check (Customer/Entry/Payment)
- implementation notes (files + why)
- verification notes (commands + results)
- doc-sync notes (what was updated)
