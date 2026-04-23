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
