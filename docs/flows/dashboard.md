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
- Action CTAs: `Collect Now`, `View Customers`.
- Priority customers list (up to 3 overdue Customers).
- Compact mini stat cards for `Needs action now` and `Collected this week`.

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
- Header now follows the legacy rhythm more closely (identity left, greeting, people shortcut right).
- Hero actions are translucent pills (not heavy CTA buttons) and overlay treatment is softer.
- Secondary layout now follows hero -> mini stat cards -> follow-up list (instead of a large standalone `Needs action now` section).
- Follow-up rows are denser with smaller status/action chips and tighter right-side amount grouping.

## Key Interactions (Verified)

- View all Customers: navigates to `/(main)/people`.
- Open a Customer: navigates to `/(main)/people/[customerId]`.
- `Collect Now`: opens Record Payment for the top priority customer (prefilled).
- If there are no overdue customers, `Collect Now` opens a customer picker.
- `Collect` from a priority row opens Record Payment for that customer (prefilled).

## States

- Loading: shows `Loader` (“Loading dashboard...”).
- No overdue Customers: shows “Nothing needs action now”.

## Notes / Gotchas

- Dashboard header currently uses a bell-style icon as a shortcut into People; treat it as navigation, not a notifications product surface.
- Use tokens from `src/utils/theme.ts` (do not hardcode colors).
