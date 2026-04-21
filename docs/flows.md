# KredBook Core Flows

## Purpose

This file is the index for active user flows in the strict single-mode product.

## Active Flow Files

| Flow | File | Purpose |
|---|---|---|
| Dashboard | `docs/flows/dashboard.md` | Outstanding overview and quick actions |
| People | `docs/flows/people.md` | Customer list and add-customer behavior |
| Add Entry | `docs/flows/add-entry.md` | Create entry flow |
| Entries | `docs/flows/entries.md` | Entry list behavior |
| Entry Detail | `docs/flows/entry-detail.md` | Entry detail and payment actions |
| Customer Detail | `docs/flows/customer-detail.md` | Customer ledger and actions |
| Public Ledger Link (Limited) | `docs/flows/public-ledger-link.md` | Read-only, token-based Customer ledger link |
| Record Payment | `docs/flows/record-payment.md` | Record payment flow |
| Profile | `docs/flows/profile.md` | Settings, language, export, sign out |
| Export | `docs/flows/export.md` | CSV export flow |

Supporting auth/onboarding flows also exist in `docs/flows/` and should be treated as supporting flows, not core business nouns.

## Canonical Navigation Map

```text
Dashboard
├── add entry
├── open customer detail
└── review outstanding state

People
├── add customer
├── open customer detail
└── start new entry for a customer

Entries
├── open entry detail
└── record payment from entry flow

Profile
├── update business/profile details
├── switch language
├── export CSV
└── sign out
```

## Common Actions

| Action | Path |
|---|---|
| Add customer | People |
| Add entry | Dashboard, People, or FAB |
| Record payment | Customer detail or entry detail |
| View outstanding | Dashboard or customer detail |
| Export CSV | Profile |

## Flow Writing Rules

1. Use **Customer**, **Entry**, and **Payment** as primary nouns.
2. Do not document a hidden More sheet as an active flow.
3. Do not document suppliers, reports, or reminders as active user flows.
4. If a flow still touches legacy implementation surfaces, call that out explicitly.
