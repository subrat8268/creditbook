# KredBook — System Context (Single Source of Truth)

This file is the **single source of truth for AI-assisted work** in this repository.

If any other instruction contradicts this file, **this file wins**.

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
- CSV export

Out of scope unless explicitly marked legacy/transitional:
- Suppliers, Distributor mode, Party-as-primary
- Product catalog, Reports, GST
- Multi-user
- Notifications/reminders as an active product feature

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
- use Supabase MCP
- prefer SQL migrations under `supabase/migrations/`

## Execution defaults (deterministic)

Use the command-first workflow in `_agents/commands.md`.

Minimum quality gates for any non-trivial change:
- naming checked (Customer/Entry/Payment)
- `lsp_diagnostics` clean for changed files
- `npm run lint`
- updated docs if product truth changed

## References (supporting, not authoritative for AI)

- `docs/naming-contract.md` (tracked product language contract)
- `docs/prd.md`, `docs/ARCHITECTURE.md`, `docs/design-system.md` (product/engineering references)
- `_agents/orchestration.md` (pipelines)
- `_agents/doc-sync-checklist.md` (closeout)
