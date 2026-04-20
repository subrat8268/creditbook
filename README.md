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
- Profile
- Offline-first sync
- EN/HI localization
- CSV export

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
1. `docs/naming-contract.md`
2. `docs/prd.md`
3. `docs/ARCHITECTURE.md`
4. `_agents/orchestration.md`
5. `_agents/doc-sync-checklist.md`

Supporting references:
- `docs/components.md`
- `docs/design-system.md`
- `docs/flows.md`
- `docs/STATUS.md`

## Repo Layout

```text
kredBook/
├── app/                  # Expo Router app
├── src/                  # Components, hooks, store, services, utils
├── docs/                 # Product and engineering docs
├── _agents/              # Repo operating system for agents
└── AGENTS.md             # Short canonical operating guide
```

## Important Truth-Reset Notes

- The repo still contains some legacy/transitional names in code such as `order`, `orderId`, and supplier/distributor-era concepts.
- Phase 1 does **not** pretend these are gone.
- Phase 1 does **not** perform broad code renames.
- Phase 1 aligns documentation and operating rules first.

## Development Rules

- `src/utils/theme.ts` is the design-token source of truth.
- Do not guess backend schema; use Supabase MCP.
- Treat docs drift as a product and engineering risk.
- Run `_agents/doc-sync-checklist.md` before closing non-trivial work.
