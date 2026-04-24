# KredBook Dashboard (Current Implementation)

> Last updated: 2026-04-24

## Purpose

- Show total outstanding at a glance.
- Surface the most overdue Customers to act on next.
- Provide a fast path to record a Payment.

## Routes / Entry Points

- Screen: `app/(main)/dashboard/index.tsx`
- Header: `src/components/dashboard/DashboardHeader.tsx`

## What It Shows

- Total outstanding (amount to receive).
- “Needs action now” list (up to 3 overdue Customers).
- “Collected this week” card (only when `weekDelta > 0`).

## Visual Source Notes (Dashboard Fidelity Pass)

Primary reference:
- `designs/Seller Dashboard.png`

Secondary references:
- `designs/KredBook Dashboard - Both View.png`
- `designs/Net Position Screen - When Clicked on Both View Dashboard.png`

Reused from references:
- One strong, rounded gradient hero card as the visual anchor.
- Large amount-first hierarchy in the hero card (label -> amount -> trend/meta line).
- Pill/chip styling on hero actions and status indicators.
- Flat white secondary surfaces for lists/summary cards.
- List-first overdue rows with separators instead of stacked card-heavy blocks.

Ignored on purpose (out of current scope):
- Supplier/distributor widgets and supplier payable sections.
- Product/reporting modules not part of current Dashboard flow.
- Extra dashboard stats beyond current truth (`total outstanding`, `needs action now`, `collected this week`).

## Key Interactions (Verified)

- View all overdue Customers: navigates to `/(main)/people`.
- Open a Customer: navigates to `/(main)/people/[customerId]`.
- Record a Payment from an overdue row: navigates to `/(main)/entries/create` with params:
  - `customer`: JSON string (`{ id, name, phone }`)
  - `amount`: string (overdue balance)

## States

- Loading: shows `Loader` (“Loading dashboard...”).
- No overdue Customers: shows “Nothing needs action now”.

## Notes / Gotchas

- `DashboardHeader` supports bell/settings actions, but `DashboardScreen` currently renders it with `showActions={false}`.
- Use tokens from `src/utils/theme.ts` (do not hardcode colors).
