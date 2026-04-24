# KredBook AI Commands

These commands are the **intended prompt interface** for OpenCode + OMO in this repo.

## /plan

**Purpose:** Turn a request into a safe, scoped plan.

**Default flow:**
1) confirm product scope + canonical nouns (Customer/Entry/Payment)
2) locate existing patterns (search + read)
3) list files to change + risks
4) define verification steps

**Expected output:** plan table (tasks, dependencies, risks, verification).

## /build

**Purpose:** Implement a scoped feature end-to-end.

**Default flow:** explore → plan → implement → review → verify → doc sync.

**Expected output:**
- summary of changes
- files changed
- verification evidence (lint/typecheck/tests)
- doc-sync closeout notes

## /fix

**Purpose:** Debug and fix a bug with evidence.

**Default flow:** reproduce → isolate → fix root cause → verify → regression check.

**Expected output:**
- root cause
- fix description
- verification steps/results

## /refactor

**Purpose:** Improve structure without behavior change.

**Default flow:** analyze duplication → refactor → review → verify.

**Expected output:**
- before/after structure
- why it’s safer/cleaner
- verification results

## /audit

**Purpose:** Health and drift analysis with evidence.

**Default flow:** inventory → classify → cite evidence → recommend fixes.

**Expected output:**
- prioritized findings table (severity, file, snippet)
- follow-up plan

## /git-push

**Purpose:** Finalize completed changes with review-first commit and push workflow.

**Use when:** User explicitly asks to commit/push changes.

**Default flow:** code review gate -> inspect git status/diff/log -> draft commit message -> stage scoped files -> commit -> push current branch.

**Expected output:**
- review pass/fail notes
- final commit message (with rationale)
- push result (remote + branch)
