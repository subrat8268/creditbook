# KredBook Design System

> Phase 1 truth-reset version.

## Rule Zero

`src/utils/theme.ts` is the design-token source of truth.

`tailwind.config.js` extends those tokens for NativeWind usage.

If any document conflicts with actual token values in code, the code-backed token source wins and the docs must be updated.

## Product Context

KredBook is a simple digital khata.

The UI should feel:
- focused
- fast
- legible
- trustworthy

## Core Visual Principles

1. One clear primary action per screen.
2. Financial state should be obvious at a glance.
3. Use consistent spacing and tokenized colors.
4. Avoid decorative complexity.

## Canonical Tokens

### Colors

These are the active semantic tokens to document and use:

| Token | Value | Use |
|---|---|---|
| `primary` | `#2563EB` | Brand, active states, primary CTAs |
| `danger` | `#EF4444` | Money owed / overdue |
| `warning` | `#F59E0B` | Pending / action needed |
| `background` | `#F6F7F9` | App canvas |
| `surface` | `#FFFFFF` | Cards, sheets, modals |
| `textPrimary` | `#1C1C1E` | Main text |
| `textSecondary` | `#6B7280` | Secondary text |
| `border` | `#E2E8F0` | Borders, dividers |
| `fabBg` | `#2563EB` | Floating Action Button background |

### Important implementation note

The FAB background should come from `colors.fabBg`. Avoid hardcoding color values.

## Status Colors

| State | Background | Text |
|---|---|---|
| Paid | `#DCFCE7` | `#15803D` |
| Pending | `#FEF3C7` | `#D97706` |
| Overdue | `#FEE2E2` | `#DC2626` |

## Dashboard Hero Tokens

For the Dashboard visual anchor card, use the dashboard-specific gradient and on-gradient text tokens:

- `gradients.dashboardHero.start`
- `gradients.dashboardHero.end`
- `colors.dashboard.heroText`
- `colors.dashboard.heroTextMuted`
- `colors.dashboard.heroChipBg`
- `colors.dashboard.heroChipBorder`
- `colors.dashboard.heroOrb`

NativeWind utility aliases (from `tailwind.config.js`):

- `text-dashboard-hero-text`
- `text-dashboard-hero-text-muted`
- `bg-dashboard-hero-chip-bg`
- `border-dashboard-hero-chip-border`
- `bg-dashboard-hero-orb`

## Spacing and Layout

Use the token system from `src/utils/theme.ts`.

Key active dimensions:
- screen padding: `16`
- input height: `48`
- button height in theme: `50`
- card radius: `16`
- FAB size: `56`

### Current implementation note

Button height should follow the token: `spacing.buttonHeight`.

## Typography

Typography source of truth is `src/utils/theme.ts`.

Important active roles:
- screen title
- hero amount
- card title
- body
- caption
- label

Use financial emphasis intentionally:
- balances should be visually prominent
- color should reinforce financial state, not replace readable labels

## Component Guidance

- Use `Button`, `Input`, `Card`, `SearchBar`, and `Avatar` before creating variations.
- Keep animations functional, not decorative.
- Keep interaction feedback fast and clear.

## Anti-Drift Rules

This document must not:
- override `theme.ts`
- claim token values that differ from the source
- treat supplier/distributor visual semantics as active product design
- introduce new product concepts through visual terminology

## Legacy / Transitional Note

Supplier-era or report-era colors may still exist in `theme.ts` for legacy reasons. They are not part of the active product design language unless explicitly called out as legacy.
