# KredBook Design System

> **Last Updated**: April 17, 2026
> **App Version**: 3.0
> **Status**: Simplified — Credit tracking only

---

## Product Identity

> **KredBook is a simple digital khata** — replaces the physical notebook.

**Core Principles:**

- Simple — 5 tabs, one primary action per screen
- Fast — Entry in under 30 seconds
- Clear — Color shows financial state

---

## Color System

### Core Colors

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `primary` | `#22C55E` | Primary buttons, FAB, confirmations |
| `success` | `#22C55E` | Money received, paid state |
| `danger` | `#E74C3C` | Money owed, overdue |
| `warning` | `#F59E0B` | Pending, partial |
| `background` | `#F6F7F9` | App background |
| `surface` | `#FFFFFF` | Cards, modals |
| `textPrimary` | `#1C1C1E` | Headings, amounts |
| `textSecondary` | `#6B7280` | Labels, metadata |
| `border` | `#E5E7EB` | Borders, dividers |

### Financial State Colors

| State | Color | Token |
| :--- | :--- | :--- |
| Paid / Received | Green | `success` |
| Owed / Overdue | Red | `danger` |
| Pending / Partial | Amber | `warning` |

### Avatar Palette

```ts
avatarPalette: [
  "#4F9CFF",  // Blue
  "#9B59B6",  // Purple
  "#E91E8C",  // Pink
  "#00BCD4",  // Cyan
  "#FF5722",  // Orange
  "#F59E0B",  // Amber
]
```

---

## Typography

### Font

**Inter** — Primary font for all text

### Type Scale

| Role | Weight | Size | Usage |
| :--- | :--- | :--- | :--- |
| Screen Title | Bold | 24px | Screen headers |
| Hero Amount | Bold | 36px | Total outstanding |
| Card Title | SemiBold | 18px | Card headings |
| Body | Regular | 16px | List items |
| Caption | Medium | 13px | Metadata |

### Rules

- Financial amounts: **bold 700**, larger than surrounding text
- Color-coded: green = paid, red = owed, amber = pending

---

## Layout

### Screen Structure

```
SafeAreaView (full screen)
├── ScrollView / FlatList (content)
│   └── Cards with 16dp padding
├── FloatingActionButton (bottom-right)
└── Bottom Tab Bar (fixed)
```

### Spacing

| Token | Value | Usage |
| :--- | :--- | :--- |
| xs | 4dp | Tight gaps |
| sm | 8dp | Chip padding |
| md | 16dp | Screen padding |
| lg | 24dp | Section spacing |
| xl | 32dp | Major spacing |

### Cards

| Property | Value |
| :--- | :--- |
| Background | White |
| Border Radius | 16dp |
| Shadow | elevation 2 |
| Padding | 16dp |

---

## Components

### Buttons

#### Primary Button

| Property | Value |
| :--- | :--- |
| Background | `#22C55E` |
| Text | White, Bold, 16px |
| Height | 52dp |
| Border Radius | 14dp |

#### Secondary Button

| Property | Value |
| :--- | :--- |
| Background | Transparent |
| Border | 1.5dp `#22C55E` |
| Text | `#22C55E`, SemiBold |

### Floating Action Button (FAB)

| Property | Value |
| :--- | :--- |
| Size | 56dp |
| Background | `#2563EB` (Blue) |
| Icon | White, + |
| Position | Bottom-right, 20dp from edge |
| Border Radius | Full circle |

### Status Chips

| State | Background | Text |
| :--- | :--- | :--- |
| PAID | `#DCFCE7` | `#16A34A` |
| PENDING | `#FEF3C7` | `#D97706` |
| OVERDUE | `#FEE2E2` | `#DC2626` |

### Input Fields

| Property | Value |
| :--- | :--- |
| Background | `#F6F7F9` |
| Border | 1dp `#E5E7EB`, focused: 1.5dp `#22C55E` |
| Height | 48dp |
| Border Radius | 12dp |

### Bottom Sheet

| Property | Value |
| :--- | :--- |
| Background | White |
| Border Radius | 24dp |
| Handle | 40×4dp centered |
| Snap Points | `["65%"]`, `["90%"]` |

---

## Navigation

### Tab Bar

| Property | Value |
| :--- | :--- |
| Background | White |
| Active Color | `#22C55E` |
| Inactive Color | `#9CA3AF` |
| Height | 64dp + inset |

### Tabs

1. **Home** — Dashboard
2. **People** — Customers
3. **Add** — Entry (FAB)
4. **Entries** — All entries
5. **Profile** — Settings

---

## Icons

### Library

**`lucide-react-native`** — Used for all icons

### Guidelines

- Outline style only
- Stroke: 1.5–2dp
- Size: 22–24dp (navigation), 18–20dp (inline)
- Color: Match token or surrounding text

---

## Animations

### Timing

| Use Case | Duration |
| :--- | :--- |
| Modal slide | 250–300ms |
| Toast | 200ms in, 3s auto-dismiss |
| Button feedback | 100ms |

### Rules

- Functional, not decorative
- No bounce on financial confirmations
- Keep under 400ms

---

## UX Patterns

### 3-Tap Entry

1. Tap FAB
2. Enter amount
3. Confirm

### Color Communication

- Green = money received
- Red = money owed
- Amber = action needed

### Optimistic UI

- Transactions appear immediately
- Background sync
- Error shows toast

---

## Updates

When adding new components:

1. Use existing colors from `theme.ts`
2. Use existing spacing values
3. Keep animations under 400ms
4. Test with both green and red states

---

_This document reflects KredBook v3.0. Update when design patterns change._