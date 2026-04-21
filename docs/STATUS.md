# KredBook Current Status

> Phase 1 truth-reset status document.

## Active Product Status

| Area | Status | Notes |
|---|---|---|
| Authentication | Working | Email + Google OAuth |
| Dashboard | Working | Outstanding-focused summary |
| People / Customers | Working | Add, list, search, detail |
| Entries | Working | Create, list, detail |
| Public ledger link sharing | Limited (Transitional) | Read-only, token-based Customer ledger link |
| Payments | Working | Record and view payment context |
| Profile | Working | Settings, language, export, sign out |
| Offline-first sync | Working | Queue + sync model present |
| Localization | Working | EN/HI |
| CSV export | Working | Profile-area export flow |

## Canonical Product Truth

KredBook is a simple digital khata for:
- Customers
- Entries
- Payments
- Dashboard
- Profile

## Out-of-Scope Truth

These are out of scope unless explicitly marked legacy or transitional:
- Suppliers
- Distributor mode
- Party abstraction as primary language
- Product catalog
- Reports
- GST
- Multi-user
- Notifications/reminders as active product features

## Current Drift Notes

The repo still contains legacy or transitional surfaces. These should be treated honestly.

### Transitional / legacy naming still present
- `order` / `orderId`
- `orderStore`
- order-oriented route names and hooks
- supplier/distributor-era language in some code and config
- party abstraction in some hooks/types

### Transitional / legacy product/config surfaces still present
- notifications permission in `app.json`
- notifications route in app code
- supplier/report-era token and type remnants

### Limited / transitional sharing surface

- A read-only, token-based public Customer ledger link exists for sharing.
- It must remain limited (read-only) and should be documented as transitional until explicitly promoted to core scope.

These are not active product truth.

## Phase 1 Completed Here

Phase 1 focuses on:
- truth reset
- naming contract
- operating-system cleanup
- doc alignment

Phase 1 does **not** claim all legacy code is removed.

## Update Rules

Update this file when:
- active scope changes
- a legacy concept is fully removed
- a transitional concept is reclassified
- major implementation status changes

Always keep this file aligned with:
- `docs/naming-contract.md`
- `docs/prd.md`
- `docs/ARCHITECTURE.md`
- `_agents/doc-sync-checklist.md`
