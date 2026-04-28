# KredBook — System Context (Single Source of Truth)

This file is the **single source of truth for AI-assisted work** in this repository.

If any other instruction contradicts this file, **this file wins**.

## Current State (update after each task)

- **Phase:** 3 — Polish & Features
- **Last completed:** Task 3.3 — Export screen (PDF/CSV ledger via expo-print + expo-sharing)
- **Next:** Task 3.4 — Overdue push notifications (expo-notifications, AppState, preferencesStore toggle)
- **Roadmap:** `docs/STATUS.md` — read only the Phase 3 section for current context

## Product contract (strict single-mode)

KredBook is a simple digital khata for small businesses in India to track:
- **Customers**
- **Entries** (money owed)
- **Payments** (money collected)
- total outstanding

### Canonical language

Use these nouns in all new user-facing copy, docs, and code comments:
- Business entity: **Customer**
- Money owed: **Entry**
- Money collected: **Payment**
- Screens: **Dashboard**, **People**, **Entries**, **Profile**

Legacy/transitional terms may exist in code. If you must mention them, label them **legacy** or **transitional**.

Do **not** describe out-of-scope concepts as active product features.

## Scope (enforced by docs + review)

In scope:
- Customers, Entries, Payments
- Dashboard, Profile
- Offline-first sync
- EN/HI localization
- CSV + PDF export
- Overdue push notifications (Phase 3)
- Public ledger share link (Phase 3)

Out of scope unless explicitly marked legacy/transitional:
- Suppliers, Distributor mode, Party-as-primary
- Product catalog, Reports, GST
- Multi-user

## Tech stack constraints

- App: React Native + Expo Router
- Global/local state: Zustand
- Server state: TanStack Query
- Backend: Supabase

### UI tokens

**Design token source of truth:** `src/utils/theme.ts`.

Never hardcode colors/sizing when a token exists.

### Database/schema work

Do not guess schema.

When a task touches schema/RLS/migrations/data correctness:
- use Supabase MCP (`list_tables`, `execute_sql`, `apply_migration`)
- prefer SQL migrations under `supabase/migrations/`

### MCP usage (mandatory)

- **Supabase MCP** — all DB introspection and migrations. Never guess schema.
- **Context7 MCP** — all library/SDK/API docs. Always `resolve-library-id` before `query-docs`. Use for: expo-notifications, react-native AppState, NativeWind, TanStack Query, Supabase JS, Expo Router, Zustand.
- **Notion MCP** — not used. Ignore.
- **Stitch MCP** — disabled. Ignore.

## Execution defaults (deterministic)

Use the command-first workflow in `.agents/commands.md`.

Minimum quality gates for any non-trivial change:
- naming checked (Customer/Entry/Payment)
- `lsp_diagnostics` clean for changed files
- `npm run lint`
- updated docs if product truth changed
- `SYSTEM_CONTEXT.md` "Current State" section updated after every completed task

## References (supporting, not authoritative for AI)

- `docs/naming-contract.md` (tracked product language contract)
- `docs/prd.md`, `docs/ARCHITECTURE.md` (product/engineering references)
- `docs/flows/` (per-screen behavior specs — read only the relevant screen file)
- `.agents/orchestration.md` (pipelines)
- `.agents/doc-sync-checklist.md` (closeout)

## Current State

- Last completed: 3.7 (entry note field)
- Next: 3.8 (collect shortcut on dashboard hero)
