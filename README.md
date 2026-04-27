# KredBook

**KredBook** is a simple digital khata for small businesses in India.

It helps one business owner:
- manage **Customers**
- record **Entries** for money owed
- record **Payments** for money collected
- see total outstanding on the **Dashboard**
- manage settings and export from **Profile**

## Canonical Product Scope

### In scope
- Customers
- Entries
- Payments
- Dashboard
- People
- Profile
- Offline-first sync
- EN/HI localization
- CSV export
- WhatsApp-first sharing

### Out of scope unless marked legacy
- Suppliers
- Distributor mode
- Party abstraction as primary language
- Product catalog
- Reports
- GST
- Multi-user
- Notifications/reminders as active product features

## Canonical Product Language

- Business entity: **Customer**
- Money owed: **Entry**
- Money collected: **Payment**
- Screens: **Dashboard**, **People**, **Entries**, **Profile**

Do not use `Order`, `Party`, `Supplier`, `Vendor`, or `Distributor` as active product language unless explicitly marked as legacy or transitional.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Routing | Expo Router |
| Styling | NativeWind + Tailwind config backed by `src/utils/theme.ts` |
| Local state | Zustand |
| Server state | TanStack Query |
| Backend | Supabase |
| Offline sync | MMKV-backed sync queue |
| AI workflow | OpenCode + OMO + local repo guides |

## Source of Truth

Read in this order before non-trivial work:
1. `SYSTEM_CONTEXT.md`
2. `docs/naming-contract.md`
3. `.agents/commands.md`
4. `.agents/orchestration.md`
5. `.agents/doc-sync-checklist.md`

Supporting references:
- `docs/design-system.md`
- `docs/flows/`
- `docs/STATUS.md`

## Local Development

1. Install dependencies: `npm ci`
2. Set env vars:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Optional: `EXPO_PUBLIC_SENTRY_DSN`
3. Start: `npm run start`

Other commands:
- Lint: `npm run lint`
- iOS/Android (generates gitignored `/ios` + `/android`): `npm run ios` / `npm run android`

## AI workflow (beginner-friendly)

Use short commands as prompts:
- `/plan` — break down work safely
- `/build` — implement a feature end-to-end
- `/fix` — debug + fix with verification
- `/refactor` — safe structure improvements
- `/audit` — evidence-based repo/feature audit

See `AGENTS.md` and `.agents/commands.md`.

## Repo Layout

```text
kredBook/
├── app/                  # Expo Router app
├── src/                  # Components, hooks, store, services, utils
├── docs/                 # Product and engineering docs
├── .agents/              # Repo operating system for agents
└── AGENTS.md             # Short canonical operating guide
```

## Current Product Truth

- The repo still contains some legacy/transitional names in code such as `order`, `orderId`, and supplier/distributor-era concepts.
- Current product mode is still strict and single-purpose: `Customer`, `Entry`, `Payment`.
- Phase 3 is in progress: dark mode is now live (Profile toggle), with WhatsApp-first sharing and overdue badge consistency still underway.
- Legacy internals may remain, but docs and user-facing language should stay aligned to the active product truth.

## Development Rules

- `src/utils/theme.ts` is the design-token source of truth.
- Do not guess backend schema; use Supabase MCP.
- Any behavior, flow, setup, or workflow change must include related updates in `docs/` and/or `README.md` in the same task.
- Treat docs drift as a product and engineering risk.
- Run `.agents/doc-sync-checklist.md` before closing non-trivial work.

## Dev seeding

No dev seeding guide is checked in yet.
