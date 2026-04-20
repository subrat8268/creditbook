# KredBook — Dashboard Screen UX Specification

> **Last Updated**: April 18, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Dashboard** is the home screen — the first thing users see when they open the app. It's the command center for the entire business.

**Primary Goals**:
1. **Instant context** — See total outstanding at a glance
2. **Quick action** — Add a new entry in 2 taps
3. **Top priorities** — See who owes the most, who's overdue

**User Behavior**:
- Opens app → sees ₹X outstanding → decides to act OR checks details
- Morning routine: open app, check total, see top overdue
- End of day: check if any payments came in

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, 48dp)                       │
│ Business Avatar + Name     [🔔] [⚙️]       │
├─────────────────────────────────────────────┤
│ SCROLLABLE CONTENT                         │
│ ┌─────────────────────────────────────────┐ │
│ │ HERO CARD                               │ │
│ │ Total Outstanding OR "All settled"      │ │
│ │ ₹45,000                                │ │
│ │ ● 12 overdue from 8 customers          │ │
│ └─────────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────────┐ │
│ │ QUICK SUMMARY                          │ │
│ │ Total owed │ Pending │ Overdue            │ │
│ │ ₹45,000   │   12    │    5             │ │
│ └─────────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────────┐ │
│ │ [ADD ENTRY]  (Primary CTA, green)       │ │
│ └─────────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────────┐ │
│ │ COLLECTED THIS WEEK  (positive reinforce)│ │
│ │ 📥 +₹5,000 ↑ Great!                   │ │
│ └─────────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────────┐ │
│ │ TOP OVERDUE                           │ │
│ │ [See all →]                           │ │
│ │ ─────────────────────────────────────  │ │
│ │ 👤 Raj Sharma          ₹25,000 [Pay]  │ │
│ │ 15 days overdue                       │ │
│ │ ─────────────────────────────────────  │ │
│ │ 👤 Priya Patel        ₹12,000 [Pay]   │ │
│ │ 8 days overdue                        │ │
│ │ ──────────���──────────────────────────  │ │
│ │ 👤 Amit Kumar         ₹8,500 [Pay]   │ │
│ │ 3 days overdue                        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header (48dp)

| Element | Spec |
|---------|------|
| Height | 48dp total |
| Avatar | 32×32dp, initials, primary green background |
| Business name | 14px bold, textPrimary |
| Notification bell | 20px icon, hits settings |
| Settings gear | 20px icon, hits profile |
| Padding | px-4 horizontal |

### 2. Hero Card

| Element | Spec |
|--------|------|
| Height | Auto (content-based) |
| Padding | p-4 (16dp) |
| Background | colors.danger when owed, colors.primary when clear |
| Border radius | 16dp (rounded-2xl) |
| Label | 11px bold, white/80%, uppercase, 1.5px tracking |
| Amount | 36px extrabold, white |
| Overdue badge | pill, white/20% background |

**States**:

| State | Label | Badge |
|------|-------|-------|
| Has outstanding | "You will receive" | "X overdue from Y customers" |
| All clear | "All settled" | "All clear! No pending payments. ✓" |

### 3. Quick Summary Card (when has outstanding)

| Element | Spec |
|--------|------|
| Background | colors.surface |
| Border | 1dp colors.border |
| Columns | 4 (Total / divider / Pending / divider / Overdue) |
| Font sizes | 24px bold, 12px medium |
| Colors | Total=danger, Pending=warning, Overdue=primary |

### 4. Primary CTA — Add Entry

| Element | Spec |
|--------|------|
| Background | colors.primary |
| Border radius | 12dp (rounded-xl) |
| Height | Auto (content-based, ~52dp) |
| Icon | Plus, 18px, white, 2.5 stroke |
| Text | "Add Entry", 15px bold, white |
| Touch feedback | 0.85 opacity |

### 5. Collected This Week Card (positive reinforcement)

| Element | Spec |
|--------|------|
| Background | colors.successBg |
| Border radius | 12dp (rounded-xl) |
| Emoji | 📥 in circle |
| Label | "Collected this week", 12px medium, textSecondary |
| Amount | "+₹X,XXX", 16px bold, primary |
| Right side | "↑ Great!" 12px bold, primary |

### 6. Top Overdue Section

| Element | Spec |
|--------|------|
| Title | "Top Overdue", 16px extrabold |
| See all link | "See all →", 13px semibold, primary |
| List items | Max 3 (slice) |
| Item height | Auto (p-3 = 12dp padding) |
| Empty state | "No overdue balances" text |

**List Item Specs**:

| Element | Spec |
|--------|------|
| Avatar | 40×40dp, rounded-full, deterministic color |
| Initials | 12px bold, white |
| Name | 14px bold, textPrimary |
| Balance | 12px semibold, danger |
| Days overdue | 12px semibold, textSecondary |
| Pay button | px-3 py-2, danger bg, surface text, "Pay" |

---

## Visual Design

### Colors (from design-system.md)

| Element | Color |
|--------|-------|
| Hero bg (has outstanding) | colors.danger (#EF4444) |
| Hero bg (clear) | colors.primary (#22C55E) |
| Hero text | white |
| Summary total | colors.danger |
| Summary pending | colors.warning |
| Summary overdue | colors.primary |
| Success bg | colors.successBg |
| Card surface | colors.surface |
| Card border | colors.border |
| Button primary | colors.primary |

### Spacing (from design-system.md)

| Token | Value |
|-------|-------|
| xs | 4dp |
| sm | 8dp |
| md | 16dp |
| lg | 24dp |

### Typography (from design-system.md)

| Element | Weight | Size |
|--------|--------|------|
| Hero label | Bold | 11px |
| Hero amount | ExtraBold | 36px |
| Summary number | Bold | 24px |
| Summary label | Medium | 12px |
| Section title | ExtraBold | 16px |
| List name | Bold | 14px |
| List balance | SemiBold | 12px |

---

## Interactions

### Navigation Flows

| Action | Target | Behavior |
|--------|-------|----------|
| Tap notification bell | /profile | Opens profile screen |
| Tap settings | /profile | Opens profile screen |
| Tap "Add Entry" | /entries/create | Opens create entry screen |
| Tap "See all" | /people | Opens people list |
| Tap customer row | /people/[id] | Opens customer detail |
| Tap "Pay" button | /entries/create | Opens with customer prefilled |

### Quick Pay Flow

1. User taps "Pay" on overdue customer
2. Navigate to `/entries/create?customer={json}`
3. Create screen pre-fills: customer id, name, phone
4. User enters amount, confirms

---

## States

### Loading State

- Shows: Loader component
- Message: "Loading dashboard..."
- Background: colors.background

### Auth State

- Not logged in → Redirects to login screen

### Data States

| State | Hero | Summary | Top Overdue |
|-------|------|---------|------------|
| Has outstanding + overdue | Red, shows amount + count | Shows 3 stats | Shows list |
| Has outstanding, none overdue | Red, shows amount | Shows 2 stats (0 overdue) | Shows empty |
| All settled | Green, "All settled" | Hidden | Shows empty |

### Empty State (no overdue)

- Card: "No overdue balances"
- No positive reinforcement card

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| 0 outstanding | Hero shows green "All settled" |
| 1 overdue person | Summary shows "1 pending", "1 overdue" |
| 100+ overdue people | Only show top 3 in list |
| No phone on customer | "Pay" button still works (creates entry) |
| weekDelta = 0 or negative | Hide "Collected this week" card |
| Very large amount (₹10L+) | Format with L (10L), show full on tap |

---

## Accessibility

- All interactive elements have 44dp minimum touch target
- Text meets contrast ratio (WCAG AA)
- Screen reader labels for all icons (future consideration)
- VoiceOver: labels for sections

---

## Performance

- useDashboard hook uses React Query with 30s staleTime
- Query only runs when vendorId exists
- FlatList virtualization NOT used (max 3 items in Top Overdue)
- Memoized computations for currency format

---

## Implementation Checklist

- [x] Hero card with dynamic colors
- [x] Quick summary showing Total/Pending/Overdue
- [x] Primary "Add Entry" CTA
- [x] "Collected this week" positive reinforcement
- [x] Top 3 overdue list
- [x] Quick Pay buttons
- [x] Empty state handling
- [x] Loading state
- [x] Currency formatting (INR locale)
- [x] Avatar color deterministic generation

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/flows.md` | Navigation reference |
| `docs/STATUS.md` | What is implemented |
| `design-system.md` | Colors, spacing, typography |
| `docs/flows/customer-detail.md` | Customer Detail flow |
| `docs/components.md` | UI components |
| `src/hooks/useDashboard.ts` | Dashboard data hook |
| `src/api/dashboard.ts` | Dashboard API |

---

## Future Considerations

Features that could be added (NOT in v3.0 scope):

1. **App icon badge** — Show pending count on home screen icon
2. **Weekly summary** — "You collected ₹X this week vs ₹Y last week"
3. **Activity graph** — Sparkline showing 7-day trend
4. **Filter by date** — "Due this week", "Due this month"
5. **Sort options** — By amount, by date, by name

---

_Last updated: April 18, 2026_