# KredBook Architecture (Phase 2)

KredBook is a strict single-mode digital khata: **Customers**, **Entries**, **Payments**.

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

`(auth)` for login/onboarding; `(main)` for `dashboard`, `people`, `entries`, `profile`, plus hidden `export`.

## Data Model (product)

- Customer, Entry, Payment are the canonical nouns.
- Some internals may still use legacy names (for example `order`, `party`). Treat as transitional.

## Offline-First

- Reads prefer React Query cache (persisted to MMKV).
- Writes are queued when offline and replayed on reconnect.
- Primary surfaces: `src/services/supabase.ts`, `src/lib/syncQueue.ts`.

## Sharing (WhatsApp-first)

- Short-term: share a read-only Customer ledger link (token-based) and formatted WhatsApp text.
- Phase 5: generate a PDF statement / Entry PDF and share via WhatsApp.

Planned flow:

1. App requests a share artifact (link/PDF) for a Customer/Entry.
2. Supabase Edge Function builds payload, stores to Storage (if needed), returns URL + message text.
3. App invokes WhatsApp share with the prepared content.

## Planned AI Layer (Phase 4)

- Supabase Edge Functions as the AI boundary.
- Functions call OpenAI (or equivalent) with strict prompts + allowlisted inputs.
- Guardrails: rate limits, audit logs, opt-in UX, and safe fallbacks when offline.
