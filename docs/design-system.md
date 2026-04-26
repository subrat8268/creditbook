# KredBook Design System (Phase 2)

## Rule Zero

`src/utils/theme.ts` is the design-token source of truth. Docs describe intent and usage, not values.

## Visual Principles

- One clear primary action per screen.
- Money state should be obvious (labels + color).
- Use semantic tokens; avoid hardcoded values.

## Token Conventions

- Use `colors.*`, `spacing.*`, `typography.*` from `src/utils/theme.ts`.
- NativeWind utilities come from `tailwind.config.js` (derived from tokens).

## Status / Badge Semantics

- Paid: success
- Pending: warning
- Overdue: danger

Phase 3 target:

- Add an explicit overdue badge token (background + text) so chips/badges are consistent across screens.

## Dashboard + Customer Hero

Use the existing hero gradients and on-hero text tokens (see `theme.ts`):

- `gradients.dashboardHero.*`, `colors.dashboard.hero*`
- `gradients.customerHero.*`, `colors.customerDetail.hero*`

## Dark Mode (Phase 3)

Phase 3 target:

- Add dark-mode semantic tokens (background/surface/text/border + hero variants) in `theme.ts`.
- Ensure all screens render using semantic tokens (no “light-only” hardcodes).
