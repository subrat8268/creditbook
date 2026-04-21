# KredBook — Entries Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Entries** screen is the central ledger — showing all entries across all customers.

**Primary Goals**:
1. **Overview** — See all entries at a glance
2. **Filter** — Filter by status (All/Paid/Pending/Overdue)
3. **Find** — Search entries by customer or bill number
4. **Quick action** — Tap entry to view details or record payment

**User Behavior**:
- Scroll through entries to see recent activity
- Filter to find specific status entries
- Search by customer name or bill number
- Tap entry → View details → Record payment or share

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed)                             │
│ Entries                                    │
├─────────────────────────────────────────────┤
│ FILTER CHIPS (horizontal scroll)            │
│ [All] [Paid] [Pending] [Overdue]           │
├─────────────────────────────────────────────┤
│ SEARCH BAR (pill style)                    │
│ [🔍 Search entry or person…]              │
├─────────────────────────────────────────────┤
│ SCROLLABLE LIST                            │
│ ┌─────────────────────────────────────────┐ │
│ │ Mohit Sharma              ₹5,000       │ │
│ │ INV-001 • 15 Jan 2026    PENDING       │ │
│ │ ─────────────────────────────────────  │ │
│ │ Priya Patel            ₹25,000        │ │
│ │ INV-002 • 10 Jan 2026    PAID         │ │
│ │ ─────────────────────────────────────  │ │
│ │ Raj Kumar              ₹12,000        │ │
│ │ INV-003 • 5 Jan 2026     OVERDUE      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Loading spinner when fetching more]       │
│                                             │
│ [Empty state when no entries]             │
└─────────────────────────────────────────────┘
│                                             │
│ [FAB: +]                                  │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header

| Element | Spec |
|---------|------|
| Title | "Entries", 24px bold, textPrimary |
| Padding | px-4 horizontal |

### 2. Filter Chips (Horizontal ScrollView)

| Element | Spec |
|---------|------|
| Container | ScrollView, horizontal, showsHorizontalScrollIndicator=false |
| Chip spacing | mr-2 |
| Chip padding | px-3 py-1.5 |
| Chip radius | full (pill) |

**Filter Options**:

| Label | Active Color | Active BG | Inactive BG | Inactive Border |
|-------|-------------|-----------|-------------|-----------------|
| All | textPrimary | surface | surface | border |
| Paid | primary | successBg | successBg | none |
| Pending | warning | warningBg | warningBg | none |
| Overdue | danger | dangerBg | dangerBg | none |

**Active State**:
- No border
- Background = label color (solid)
- Text = white

**Inactive State**:
- Border: 1dp border color
- Background: status-specific light background
- Text: status color

### 3. Search Bar (Pill Style)

| Element | Spec |
|---------|------|
| Container | flex-row, items-center, bg-background, rounded-full |
| Height | 44dp (searchBarHeight) |
| Icon | Search, 16dp, textSecondary, mr-2 |
| Input | flex-1, 14px, textPrimary |
| Placeholder | Current UI: "Search entry or person…" (transitional copy; product noun is customer) |
| Placeholder color | textSecondary |
| Clear button | while-editing mode |

### 4. Entry List (FlatList)

| Element | Spec |
|---------|------|
| Container | flex-1 |
| Content padding | pt-4, pb-120 (for FAB) |
| Pull-to-refresh | Enabled |
| Infinite scroll | Enabled |
| Initial render | 12 items |
| Max per batch | 10 items |
| Window size | 10 |

**Optimization Props**:
```typescript
{
  initialNumToRender: 12,
  maxToRenderPerBatch: 10,
  windowSize: 10,
  removeClippedSubviews: true,
  onEndReachedThreshold: 0.4,
}
```

### 5. Entry Card (Inline Component)

| Element | Spec |
|---------|------|
| Container | flex-row, items-center, bg-surface, p-4, rounded-2xl, mb-3, border border-border |
| Shadow | elevation 2, shadowOpacity 0.04 |

**Left Section** (flex-1):
- Customer name: 16px semibold, textPrimary, 1 line, ellipsis
- Metadata: 12px medium, textSecondary
- Format: "{bill_number} • {date}" or "— • {date}"

**Right Section** (items-end):
- Amount: 16px bold, textPrimary
- Status pill: uppercase, 11px bold

**Status Colors**:

| Status | Pill BG | Pill Text |
|--------|---------|-----------|
| Paid | paid.bg (#DCFCE7) | paid.text (#16A34A) |
| Pending | pending.bg (#FEF3C7) | pending.text (#D97706) |
| Partial | pending.bg | pending.text |
| Overdue | overdue.bg (#FEE2E2) | overdue.text (#DC2626) |

### 6. Floating Action Button (FAB)

| Element | Spec |
|---------|------|
| Position | bottom-right |
| Bottom | 24dp above tab bar |
| Right | 20dp from edge |
| Size | 56dp |
| Background | fab (#2563EB) |
| Icon | Plus, white |
| Action | Navigate to /entries/create |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Surface | #FFFFFF | surface |
| Background | #F6F7F9 | background |
| Border | #E2E8F0 | border |
| Primary | #22C55E | primary |
| FAB | #2563EB | fab |
| Success BG | #F0FDF4 | successBg |
| Warning BG | #FFFBEB | warningBg |
| Danger BG | #FEF2F2 | dangerBg |

### Typography (from theme.ts)

| Element | Weight | Size |
|---------|--------|------|
| Screen title | Bold | 24px |
| Card name | SemiBold | 16px |
| Card amount | Bold | 16px |
| Card metadata | Medium | 12px |
| Status pill | Bold | 11px |
| Search input | Regular | 14px |
| Filter chip | Bold | 13px |

### Spacing (from design-system.md)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4dp | Tight gaps |
| sm | 8dp | Chip padding |
| md | 16dp | Screen padding, card padding |
| lg | 24dp | Section spacing |

---

## Interactions

### Tap Behaviors

| Element | Action |
|---------|--------|
| Filter chip | Filter list by status |
| Search input | Filter list by query |
| Entry card | Navigate to entry detail |
| FAB | Navigate to create entry |
| Pull down | Refresh list |

### Navigation

| From | To | With |
|------|-----|------|
| Tap entry card | /entries/[orderId] | orderId param |
| Tap FAB | /entries/create | - |
| Back from detail | /entries | - |

### Entry Detail Flow

From Entry Detail screen:
- View full entry with items, summary, payments
- Tap "Send Entry" → Generate PDF + share
- Tap "Record Payment" → Open payment modal
- Tap phone/whatsapp icons → Quick customer contact shortcut

---

## States

### Loading States

| State | Display |
|-------|----------|
| Initial load | "Loading entries…" centered text |
| Refresh | Native RefreshControl spinning |
| Load more | "Loading more…" text at bottom |
| Error | Error message with retry hint |

### Filter Logic

| Filter | Shows |
|--------|-------|
| All | All entries |
| Paid | status === "Paid" |
| Pending | status === "Pending" OR "Partially Paid" |
| Overdue | status === "Pending" AND days > 30 |

### Empty States

| Scenario | Title | Description | CTA |
|----------|-------|-------------|-----|
| Connected, no entries | "No entries yet" | "Add your first entry to start tracking." | Add Entry button |
| Offline | "You're offline" | "Connect to the internet to load entries." | None |

---

## Edge Cases

### Long Customer Name
- Truncate with ellipsis after 1 line

### No Bill Number
- Show "—" in metadata

### Very Large Amount
- Format with Lakhs: ₹5.25L
- Or Crores: ₹2.50Cr

### Search with No Results
- Show empty state (same as no entries)
- Clear search to reset

### Network Offline
- Show last cached data
- Queue all mutations
- Show sync status banner

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| Entry card | Screen reader announces "{Name}, {Amount}, {Status}" |
| Filter chips | VoiceOver labels |
| FAB | Minimum 44dp touch target |

---

## Performance

| Metric | Target |
|--------|--------|
| Initial render | < 300ms |
| List scroll | 60fps |
| Filter/search | < 50ms |

### Optimizations Applied

- React.memo on EntryCard
- FlatList virtualization (initialNumToRender, maxToRenderPerBatch, windowSize)
- removeClippedSubviews for Android
- Infinite scroll with onEndReached
- Pull-to-refresh with RefreshControl

---

## Implementation Checklist

- [x] Screen title "Entries"
- [x] Filter chips (All/Paid/Pending/Overdue)
- [x] Pill-style search bar
- [x] EntryCard inline component
- [x] Customer name + bill number + date
- [x] Status pills (Paid/Pending/Partial/Overdue)
- [x] FlatList with virtualization
- [x] Pull-to-refresh
- [x] Infinite scroll
- [x] Empty states (connected + offline)
- [x] FAB for new entry

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens, typography |
| `docs/flows.md` | Navigation reference |
| `docs/STATUS.md` | What is implemented |
| `docs/flows/add-entry.md` | Add entry flow |
| `docs/flows/customer-detail.md` | Customer detail flow |
| `app/(main)/entries/index.tsx` | Screen implementation |
| `app/(main)/entries/[orderId].tsx` | Entry detail |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Sort options** — By date, amount, customer name
2. **Date filter** — This week, this month, custom range
3. **Export entries** — CSV download
4. **Bulk actions** — Not in scope for the current product

---

_Last updated: April 20, 2026_
