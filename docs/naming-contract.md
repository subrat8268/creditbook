# KredBook Naming Contract

> Phase 2 reality check for a strict single-mode product.

## Canonical Product Decision

KredBook is a **simple digital khata for small businesses in India**.

It exists to help one business owner:
- add and manage **Customers**
- record **Entries** for money owed
- record **Payments** for money collected
- see total outstanding on the **Dashboard**
- manage settings and export from **Profile**

## In Scope

- Customers
- Entries
- Payments
- Dashboard
- Profile
- Offline-first sync
- EN/HI localization
- CSV export

## Out of Scope

The following are out of scope unless explicitly marked as legacy or transitional:

- Suppliers
- Distributor mode
- Party abstraction as primary product language
- Product catalog
- Reports
- GST
- Multi-user
- Notifications/reminders as active product features

## Canonical Terms

Use these in product docs, tickets, prompts, reviews, and all new user-facing writing.

| Concept | Canonical Term |
|---|---|
| UI/business entity | Customer |
| Transaction owed | Entry |
| Money collected | Payment |
| Main screens | Dashboard, People, Entries, Profile |

## Transitional / Legacy Terms

These terms may still exist in code or old docs. They are not valid product-language defaults.

| Term | Status | Rule |
|---|---|---|
| People | Transitional UI label | Allowed only as screen label; map to Customers |
| Order / Orders | Legacy | Do not use in new docs except when calling out legacy code |
| Bill | Transitional | Allowed only when describing share/send bill behavior; not primary domain noun |
| Party / Parties | Legacy | Do not use as primary product language |
| Supplier / Suppliers | Legacy | Out of scope; use only when marking legacy code or docs |
| Vendor | Legacy | Do not use in product docs except when describing legacy internals |
| Distributor mode | Legacy | Out of scope; do not describe as active product behavior |

## Writing Rules

1. Prefer **Customer**, not person/party/vendor.
2. Prefer **Entry**, not order by default.
3. Prefer **Payment**, not settlement/reminder language.
4. If a legacy term must be mentioned, label it as **legacy** or **transitional**.
5. Do not describe out-of-scope features as active product capabilities.
6. Do not claim legacy code is removed unless it is actually removed from the repo.

## Implementation Rule (Current)

Phases 1-2 are a **truth reset and operating-system cleanup**.

- It aligns docs and agent guidance to the canonical product contract.
- It may reference legacy code honestly.
- It must **not** perform broad code renames just to force the docs to look clean.

## Source-of-Truth Order

1. `SYSTEM_CONTEXT.md` — repo AI single source of truth
2. `docs/naming-contract.md` — canonical language
3. `docs/prd.md` — product scope
4. `docs/ARCHITECTURE.md` — technical architecture
5. `src/utils/theme.ts` — design tokens
6. `.agents/orchestration.md` — workflow pipelines
7. `.agents/doc-sync-checklist.md` — change closeout gate
8. `docs/STATUS.md` — current implementation state

## Decision Rule

If a word, flow, or feature does not support the strict single-mode khata product, either:
- rename it in docs,
- remove it from docs, or
- quarantine it as legacy.
