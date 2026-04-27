# KredBook — Roadmap & Status

> **Source of truth for all phase tracking, task sequencing, and OpenCode execution.**
> Stop referring to Notion. This file is the single tracker. Update it after every completed task.

***

## How to use this file

1. **Before starting any task** — read the task row, check `Depends On`, confirm that dependency is `✅ Done`.
2. **Copy the OpenCode Prompt** exactly as written. Load listed skills before running.
3. **After completing a task** — update `Status` to `✅ Done`, fill in the `Commit` link, and run doc-sync checklist (`.agents/doc-sync-checklist.md`).
4. **Never skip a task or reorder**. Tasks within a phase are sequenced for safety.
5. This file is the only tracker. Do not use Notion or Google Sheets.

***

## Phase Overview

| Phase | Name | Status | Theme |
|---|---|---|---|
| 1 | Truth Reset | ✅ Done | Canonical nouns, core flows, offline-first baseline |
| 2 | DB Hardening | ✅ Done | Schema cleanup, due_date, payment_date, parties fields |
| 3 | Experience Upgrades | 🔄 In Progress | Dark mode, WhatsApp-first sharing, overdue polish |
| 4 | AI Assistance | ⏳ Not Started | Opt-in AI layer via Edge Functions |
| 5 | Documents + Collection | ⏳ Not Started | PDF outputs, UPI collection |

***

## Active Product Surface

| Area | Status | Notes |
|---|---|---|
| Authentication | ✅ Working | `app/_layout.tsx` owns auth/onboarding redirects |
| Dashboard | ✅ Working | Outstanding-first overview, overdue collection hero |
| People (Customers) | ✅ Working | Add / list / search / detail |
| Entries | ✅ Working | Create / list / detail |
| Payments | ✅ Working | Record + context |
| Profile | ✅ Working | Settings + CSV export |
| Offline-first sync | ✅ Working | Queue in `src/lib/syncQueue.ts`, replay on reconnect |
| Localization | ✅ Working | EN / HI |
| CSV export | ✅ Working | Profile-area export |

***

## Drift Watchlist

- Legacy internals still use `order` / `party` — label as `legacy/transitional` if referenced.
- `customers` and `suppliers` tables dropped; all data now in `parties`.
- Legacy supplier/product tables have been dropped from `public` (for example `products`, `supplier_*`).
- `order_items.product_id` / `order_items.variant_id` remain as nullable legacy columns; treat them as transitional.
- `parties` is customers-only now (`parties_is_customer_only`). Supplier fields have been removed.
- `profiles.dashboard_mode` has been removed.
- Supplier / product surfaces are out of scope and must not be described as active features.

***

## Phase 1 — Truth Reset ✅ Done

**Goal:** Lock canonical product nouns, get core flows working, establish offline-first baseline.

| # | Task | Status | Commit |
|---|---|---|---|
| 1.1 | Rename canonical nouns to Customer / Entry / Payment | ✅ Done | [6334742](https://github.com/subrat8268/kredBook/commit/6334742aa7059fc77d5942a9bc77b393a8b3640f) |
| 1.2 | Implement Dashboard screen (outstanding + overdue) | ✅ Done | [211cc76](https://github.com/subrat8268/kredBook/commit/211cc76f00dac84d0bb3577585f37ddb85dd6b74) |
| 1.3 | Design system + theme tokens in `src/utils/theme.ts` | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.4 | Migrate customer hooks to `parties` table | ✅ Done | [6d5415b](https://github.com/subrat8268/kredBook/commit/6d5415bb10392ae6709015fe5a472fbeb899be51) |
| 1.5 | Offline-first mutation queue wired (`syncQueue.ts`) | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.6 | EN/HI localization | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.7 | CSV export (Profile area) | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.8 | Align docs to product truth (PRD, ARCHITECTURE, flows) | ✅ Done | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |

***

## Phase 2 — DB Hardening ✅ Done

**Goal:** Clean up schema, drop dead columns, add business-critical fields, lock schema truth.

| # | Task | Status | Command | Skills | Commit |
|---|---|---|---|---|---|
| 2.1 | Audit full schema correctness | ✅ Done | `/audit` | `code-reviewer`, `supabase-expert` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.2 | Remove dead `product_id` + `variant_id` from `order_items` | ✅ Done | `/fix` | `debugger`, `supabase-expert` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.3 | Add `due_date` to orders + overdue partial index | ✅ Done | `/build` | `tech-lead`, `supabase-expert` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.4 | Expand `payment_mode` enum + add `payment_date` | ✅ Done | `/build` | `tech-lead`, `supabase-expert` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.5 | Add `notes`, `avatar_url`, `email` to `parties` | ✅ Done | `/build` | `tech-lead`, `supabase-expert` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.6 | Add CHECK constraint `parties.is_customer = TRUE` | ✅ Done | `/fix` | `debugger`, `supabase-expert` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.7 | Regenerate `database.types.ts` from live Supabase | ✅ Done | `/fix` | `supabase-expert`, `tech-lead` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |
| 2.8 | Refresh `schema.sql` from live Supabase (no-data ref) | ✅ Done | `/audit` | `supabase-expert` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |
| 2.9 | Rename storage bucket `product-images` → `avatars` | ✅ Done | `/refactor` | `refactor-engineer`, `supabase-expert` | — |
| 2.10 | Add RPC `get_dashboard_summary` (single-query dashboard) | ✅ Done | `/build` | `project-planner`, `supabase-expert` | — |

> **Note:** Tasks 2.9 and 2.10 are complete. Next Phase 2 work should start at Phase 3 tasks unless new DB hardening is added.

### Phase 2 OpenCode Prompts

#### 2.9 — Rename storage bucket

```
/refactor load_skills=["refactor-engineer","tech-lead","code-reviewer","supabase-expert"]

Rename Supabase storage bucket from product-images to avatars.
Update all code references in src/ and supabase/ accordingly.
Use Supabase MCP to verify bucket state before and after.
Do not guess — confirm bucket name from live Supabase first.
Verification: bucket renamed, all code references updated, lint clean, diagnostics clean.

Note: Supabase blocks direct SQL deletion from `storage.buckets`. If `product-images` remains, delete it via the Supabase Dashboard/Storage API after confirming it has no objects.
```

#### 2.10 — Add RPC get_dashboard_summary

```
/build load_skills=["project-planner","tech-lead","code-reviewer","supabase-expert"]

Add a Postgres RPC function get_dashboard_summary that returns:
- total outstanding (sum of unpaid entries)
- total overdue (sum of entries past due_date)
- top 5 overdue customers by outstanding amount
- total customers count
- total entries count

Place DDL in supabase/migrations/.
Wire the RPC call into the Dashboard data layer.
Do not guess schema — use Supabase MCP to read current tables.
Verification: RPC runs in Supabase SQL editor, Dashboard uses it, lint clean, types updated.
```

***

## Phase 3 — Experience Upgrades 🔄 In Progress

**Goal:** Dark mode, WhatsApp-first sharing polish, overdue badge consistency, quality-of-life wins.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 3.1 | Dark mode — semantic tokens in `theme.ts` + settings toggle | 🔄 In Progress | P0 | `/build` | `ui-ux-pro-max`, `ui-designer`, `react-native-skills` |
| 3.2 | Overdue badge consistency — token + component across Dashboard / People / Entries | ⏳ Not Started | P0 | `/refactor` | `ui-ux-pro-max`, `refactor-engineer` |
| 3.3 | WhatsApp share polish — consistent message template (amounts, dates, customer name) | ⏳ Not Started | P1 | `/build` | `tech-lead`, `react-native-skills` |
| 3.4 | Indian number format — ₹1,20,000 everywhere | ⏳ Not Started | P1 | `/fix` | `debugger`, `react-native-skills` |
| 3.5 | Entry note field — optional short text per Entry | ⏳ Not Started | P1 | `/build` | `tech-lead`, `supabase-expert` |
| 3.6 | Collect shortcut on Dashboard hero — deep-link to top overdue Customer | ⏳ Not Started | P2 | `/build` | `react-native-skills`, `tech-lead` |
| 3.7 | Offline sync indicator — green (synced) / amber (pending) dot in header | ⏳ Not Started | P2 | `/build` | `react-native-skills`, `ui-designer` |
| 3.8 | Customer search improvements — speed + relevance | ⏳ Not Started | P2 | `/build` | `react-native-skills`, `tech-lead` |
| 3.9 | Entries + People filters | ⏳ Not Started | P2 | `/plan` | `project-planner`, `tech-lead` |
| 3.10 | Export hardening — validate CSV totals, locale-safe formatting | ⏳ Not Started | P2 | `/audit` | `supabase-expert`, `code-reviewer` |

### Phase 3 OpenCode Prompts (next up)

#### 3.1 — Dark mode

```
/build load_skills=["ui-ux-pro-max","ui-designer","react-native-skills","code-reviewer"]

Implement dark mode for KredBook.
- Add semantic dark/light token pairs to src/utils/theme.ts
- Wire a dark mode toggle in Profile settings
- Apply tokens across all active screens: Dashboard, People, Entries, Profile
- No hardcoded colors — all values must come from theme tokens
- Use NativeWind + Tailwind config already wired in tailwind.config.js
Verification: toggle works, all 4 screens render correctly in both modes, lint clean, diagnostics clean.
```

#### 3.2 — Overdue badge

```
/refactor load_skills=["ui-ux-pro-max","refactor-engineer","code-reviewer"]

Standardize the overdue badge across Dashboard, People, and Entries.
- Create a single shared OverdueBadge component
- Use theme tokens for the overdue red color (no hardcoded hex)
- Replace any existing ad-hoc overdue chips with this component
No behavior change. Visual result must be identical to current state.
Verification: component exists, used in all 3 surfaces, lint clean.
```

***

## Phase 4 — AI Assistance ⏳ Not Started

**Goal:** Opt-in AI features only. All AI goes through Supabase Edge Functions with guardrails.

> **Rule:** No AI feature is added without an opt-in UX. All AI calls are rate-limited and audit-logged. No AI feature modifies data directly.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 4.1 | Plan AI architecture — Edge Function boundary, guardrails, rate limits | ⏳ Not Started | P0 | `/plan` | `project-planner`, `tech-lead`, `thinker` |
| 4.2 | Follow-up prioritization — rank Customers by overdue + recency | ⏳ Not Started | P1 | `/build` | `tech-lead`, `supabase-expert` |
| 4.3 | Smart Customer summary — last 30 days entries/payments + suggested action | ⏳ Not Started | P1 | `/build` | `supabase-expert`, `tech-lead` |
| 4.4 | AI WhatsApp draft — generate EN/HI message variants with opt-in UX | ⏳ Not Started | P1 | `/plan` | `tech-lead`, `thinker` |
| 4.5 | Anomaly detection — flag customers with 45+ days no payment | ⏳ Not Started | P2 | `/plan` | `thinker`, `supabase-expert` |
| 4.6 | Monthly insight card — collection trend summary | ⏳ Not Started | P2 | `/build` | `supabase-expert`, `tech-lead` |

***

## Phase 5 — Documents + Collection ⏳ Not Started

**Goal:** PDF outputs and UPI collection links for WhatsApp-first sharing.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 5.1 | PDF Customer statement — Edge Function generates PDF, stores in Supabase Storage, share via WhatsApp | ⏳ Not Started | P1 | `/build` | `supabase-expert`, `tech-lead` |
| 5.2 | Entry PDF — single Entry receipt shareable via WhatsApp | ⏳ Not Started | P2 | `/build` | `supabase-expert`, `tech-lead` |
| 5.3 | UPI collect link + QR on Customer balance screen | ⏳ Not Started | P1 | `/build` | `tech-lead`, `react-native-skills` |
| 5.4 | Receipt-friendly sharing flow — polish and test end-to-end | ⏳ Not Started | P2 | `/plan` | `project-planner`, `tech-lead` |
| 5.5 | Referral prompt after successful payment — lightweight share + deep link | ⏳ Not Started | P3 | `/build` | `ui-ux-pro-max`, `tech-lead` |

***

## OpenCode Quick Reference

| Command | When to use | Default skills |
|---|---|---|
| `/plan` | Before any new feature | `project-planner`, `tech-lead` |
| `/build` | Implement a scoped feature | Add `supabase-expert` for DB, add `ui-ux-pro-max` + `react-native-skills` for UI |
| `/fix` | Bug with evidence | `debugger`, `thinker`, `code-reviewer` |
| `/refactor` | Structure change, no behavior change | `refactor-engineer`, `tech-lead`, `code-reviewer` |
| `/audit` | Health check / drift detection | `code-reviewer`, `supabase-expert` |
| `/git-push` | Commit + push | `code-reviewer`, `git-push` |

### Task Done Checklist

Before marking any task ✅ Done:

- [ ] Command used is logged here
- [ ] `load_skills` used is logged here
- [ ] Files changed are noted
- [ ] GitHub commit or migration URL is in the Commit column
- [ ] `npm run lint` passes
- [ ] `lsp_diagnostics` clean for changed files
- [ ] DB changes have a migration in `supabase/migrations/`
- [ ] Doc-sync checklist (`.agents/doc-sync-checklist.md`) is completed
- [ ] This STATUS.md is updated before closing the session

***

## Canonical Reference

| File | Purpose |
|---|---|
| `SYSTEM_CONTEXT.md` | Product contract, scope, non-goals |
| `AGENTS.md` | AI agent conventions |
| `docs/STATUS.md` | **This file — phase tracking and roadmap** |
| `docs/prd.md` | Full 5-phase PRD |
| `docs/ARCHITECTURE.md` | Stack, routes, offline-first, AI boundary |
| `schema.sql` | Live schema snapshot (no data) |
| `.agents/commands.md` | OpenCode command reference |
| `.agents/orchestration.md` | Deterministic pipelines |
| `.agents/skill-router.md` | Skill routing rules |
| `.agents/doc-sync-checklist.md` | Closeout checklist |
