# KredBook AI Commands

These commands are the **intended prompt interface** for OpenCode in this repo.

## /plan

**Purpose:** Turn a request into a safe, scoped plan.

**Default skills:** `project-planner`, `writing-plans`

**Default flow:**
1. Confirm product scope + canonical nouns (Customer/Entry/Payment)
2. Locate existing patterns (search + read)
3. List files to change + risks
4. Define verification steps

**Expected output:** plan table (tasks, dependencies, risks, verification).

---

## /build

**Purpose:** Implement a scoped feature end-to-end.

**Default skills:** `project-planner`, `code-reviewer`

Add conditionally:
- UI/screens → `ui-ux-pro-max`, `frontend-design`, `building-native-ui`, `sleek-design-mobile-apps`
- Design tokens/brand → `brand-guidelines`, `extract-design-system`
- NativeWind/Tailwind → `expo-tailwind-setup`
- Data fetching/React Query/API → `native-data-fetching`
- DB/schema/RLS/auth/storage → `supabase`, `supabase-postgres-best-practices`
- TypeScript types → `typescript-advanced-types`

**Default flow:** explore → plan → implement → review → verify → doc sync.

**Expected output:**
- Summary of changes
- Files changed
- Verification evidence (lint/typecheck/tests)
- Doc-sync closeout notes

---

## /fix

**Purpose:** Debug and fix a bug with evidence.

**Default skills:** `systematic-debugging`, `code-reviewer`

**Default flow:** reproduce → isolate → fix root cause → verify → regression check.

**Expected output:**
- Root cause
- Fix description
- Verification steps/results

---

## /refactor

**Purpose:** Improve structure without behavior change.

**Default skills:** `refactor-engineer`, `code-reviewer`

**Default flow:** analyze duplication → refactor → review → verify.

**Expected output:**
- Before/after structure
- Why it's safer/cleaner
- Verification results

---

## /audit

**Purpose:** Health and drift analysis with evidence.

**Default skills:** `code-reviewer`, `verification-before-completion`

**Default flow:** inventory → classify → cite evidence → recommend fixes.

**Expected output:**
- Prioritized findings table (severity, file, snippet)
- Follow-up plan

---

## /doc

**Purpose:** Write, update, or co-author any documentation.

**Default skills:** `doc-coauthoring`, `internal-comms`, `writing-plans`

**Default flow:** read existing docs → identify gaps → draft → review → sync checklist.

**Expected output:**
- Updated doc file(s)
- Summary of what changed and why

---

## /finish

**Purpose:** Finalize completed changes with review-first commit and push workflow.

**Default skills:** `finishing-a-development-branch`, `code-reviewer`, `verification-before-completion`

**Use when:** Session work is done and ready to commit/push.

**Default flow:** code review gate → inspect git status/diff/log → draft commit message → stage scoped files → commit → push current branch.

**Expected output:**
- Review pass/fail notes
- Final commit message (with rationale)
- Push result (remote + branch)

---

## /upgrade

**Purpose:** Upgrade Expo SDK or major dependencies safely.

**Default skills:** `upgrading-expo`, `react-native-skills`, `expo-tailwind-setup`, `verification-before-completion`

**Default flow:** read changelog → identify breaking changes → upgrade → verify → doc sync.

**Expected output:**
- What changed
- Breaking changes handled
- Verification results
