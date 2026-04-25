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
- Compact mini stat cards for `Needs action now` and `Collected this week`.
- “Recent follow-ups” list (up to 5 overdue Customers).

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

## Visual Correction Pass Mapping

How current dashboard scope maps into the old composition:
- Old hero (`Customers owe you`) -> current `total outstanding` hero (single red gradient card).
- Old compact summary cards -> `Needs action now` and `Collected this week` mini cards.
- Old recent activity/follow-up block -> overdue customer follow-up list with compact rows and quick pay actions.

What changed vs previous dashboard attempt:
- Header now follows the legacy rhythm more closely (identity left, greeting, notification action right).
- Hero actions are translucent pills (not heavy CTA buttons) and overlay treatment is softer.
- Secondary layout now follows hero -> mini stat cards -> follow-up list (instead of a large standalone `Needs action now` section).
- Follow-up rows are denser with smaller status/action chips and tighter right-side amount grouping.

## Key Interactions (Verified)

- View all overdue Customers: navigates to `/(main)/people`.
- Open a Customer: navigates to `/(main)/people/[customerId]`.
- Record a Payment from hero or overdue row: navigates to `/(main)/entries/create` with params:
  - `customer`: JSON string (`{ id, name, phone }`)
  - `amount`: string (overdue balance)

## States

- Loading: shows `Loader` (“Loading dashboard...”).
- No overdue Customers: shows “Nothing needs action now”.

## Notes / Gotchas

- Dashboard header now uses a single notification action (bell) to jump to People.
- Use tokens from `src/utils/theme.ts` (do not hardcode colors).
