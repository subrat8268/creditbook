# KredBook Status

## Phase Status (5 phases)

| Phase | Status | Summary |
|---|---|---|
| 1 | Done | Truth reset (Customer/Entry/Payment), core flows, offline-first baseline |
| 2 | In Progress | Reliability + polish: overdue prioritization, sync UX, export correctness |
| 3 | Not Started | Dark mode + stronger WhatsApp-first sharing surfaces |
| 4 | Not Started | AI assistance layer (opt-in) |
| 5 | Not Started | PDF outputs + UPI collection |

## Active Product Surface

| Area | Status | Notes |
|---|---|---|
| Authentication | Working | routing + onboarding in `app/_layout.tsx` |
| Dashboard | Working | outstanding-first overview |
| People (Customers) | Working | add/list/search/detail |
| Entries | Working | create/list/detail |
| Payments | Working | record + context |
| Profile | Working | settings + export |
| Offline-first sync | Working | queue + replay |
| Localization | Working | EN/HI |
| CSV export | Working | Profile-area export |

## Phase 3 Scope (Not Started)

- Dark mode (token-driven)
- WhatsApp-first sharing polish (copy, formatting, previews)
- Overdue badge consistency (token + component)

## Drift Watchlist (keep honest)

- Legacy internals may still use `order`/`party` naming.
- Supplier/product surfaces are legacy and should not be described as active scope.
