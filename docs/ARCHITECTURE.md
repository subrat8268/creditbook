# KredBook Architecture (Phase 3)

KredBook is a strict single-mode digital khata: **Customers**, **Entries**, **Payments**.

Current product truth:
- Active screens: `Dashboard`, `People`, `Entries`, `Profile`
- Always in scope: offline-first sync, EN/HI localization, CSV export
- Phase 3 focus: dark mode, stronger WhatsApp-first sharing surfaces, overdue badge consistency

## Stack

| Area | Choice |
|---|---|
| App | React Native + Expo + Expo Router |
| Local state | Zustand |
| Server state | TanStack Query |
| Offline writes | MMKV-backed mutation queue |
| Backend | Supabase (Postgres + RLS + Storage + Edge Functions) |
| Styling | NativeWind + `src/utils/theme.ts` tokens |

## Routes (active)

`(auth)` handles login/onboarding; `(main)` contains `dashboard`, `people`, `entries`, `profile`, plus hidden/supporting routes like `export`.

## Data Model (product)

- Customer, Entry, Payment are the canonical nouns.
- Some internals may still use legacy names (for example `order`, `party`, `vendor`). Treat them as transitional.
- Supplier/product tables may still exist in the schema, but they are legacy and not active product pillars.

## Offline-First

- Reads prefer React Query cache (persisted to MMKV).
- Writes are queued when offline and replayed on reconnect.
- Primary surfaces: `src/services/supabase.ts`, `src/lib/syncQueue.ts`.
- Product correctness depends on preserving queued writes; do not bypass the queue for core capture flows.

## Sharing (WhatsApp-first)

- Short-term: share a read-only Customer ledger link (token-based) and formatted WhatsApp text.
- Phase 5: generate a PDF statement / Entry PDF and share via WhatsApp.
- Phase 3: improve share copy, previews, and WhatsApp-first ergonomics without expanding into a general document system.

Planned flow:

1. App requests a share artifact (link/PDF) for a Customer/Entry.
2. Supabase Edge Function builds payload, stores to Storage (if needed), returns URL + message text.
3. App invokes WhatsApp share with the prepared content.

## Planned AI Layer (Phase 4)

- Supabase Edge Functions as the AI boundary.
- Functions call OpenAI (or equivalent) with strict prompts + allowlisted inputs.
- Guardrails: rate limits, audit logs, opt-in UX, and safe fallbacks when offline.
- AI remains assistive only; it must not become the source of accounting truth or perform autonomous sending.
