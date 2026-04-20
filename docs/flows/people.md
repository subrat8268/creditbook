# KredBook — People Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **People** screen is the customer list view — where shopkeepers manage their ledger partners (customers).

**Primary Goals**:
1. **Quick add** — Add a new person in under 30 seconds
2. **Find fast** — Search and locate any person instantly
3. **Quick actions** — Call or remind overdue customers with one tap

**User Behavior**:
- Tap "Add Person" → Enter name/phone → Done
- Search by name → Find person
- Tap person → Quick entry creation
- Long press → Open customer ledger (detail view)
- See overdue → One-tap call or WhatsApp reminder

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, 56dp)                       │
│ People                      [Add Person →] │
├─────────────────────────────────────────────┤
│ SEARCH BAR (44dp)                           │
│ [🔍 Search people...]                      │
├─────────────────────────────────────────────┤
│ INLINE ADD (collapsible form)                │
│ ┌─────────────────────────────────────────┐ │
│ │ ADD PERSON                              │ │
│ │ [Name input]    [Phone input]          │ │
│ │ [Add Person button]                   │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ SCROLLABLE LIST                            │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 John Sharma              ₹5,000    │ │
│ │ PENDING                        2h ago  │ │
│ │ ─────────────────────────────────────  │ │
│ │ 👤 Priya Patel           ₹25,000     │ │
│ │ [Call] [Remind]  OVERDUE      15d ago │ │
│ │ ─────────────────────────────────────  │ │
│ │ 👤 Amit Kumar             ₹0 PAID    │ │
│ │ Paid                            1d ago │ │
│ │ ─────────────────────────────────────  │ │
│ │ 👤 Raj Mehta              ₹-2,000 ADV │ │
│ │ Advance                        3d ago  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Loading spinner when fetching more]       │
│                                             │
│ [Empty state when no people]               │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header (56dp height)

| Element | Spec |
|---------|------|
| Title | "People", 24px bold, textPrimary |
| Add button | Pill style with + icon, primary color |
| Touch target | 44dp minimum |
| Padding | px-4 horizontal |

**Add Person Button**:
- Container: `flex-row items-center gap-1`
- Background: `primaryLight` (#DCFCE7)
- Border: 1dp `primary`
- Border radius: 20dp (full pill)
- Padding: 8dp vertical, 12dp horizontal
- Icon: UserPlus, 16dp, primary
- Text: 13px bold, primary

### 2. Search Bar (44dp height)

| Element | Spec |
|---------|------|
| Height | 44dp |
| Background | colors.surface |
| Border | 1dp colors.border |
| Border radius | 12dp |
| Icon | Search (magnifying glass), 18dp, textSecondary |
| Placeholder | "Search people...", textSecondary |
| Placeholder color | #9CA3AF |
| Text | 15px regular, textPrimary |

### 3. Inline Add Form

| Element | Spec |
|---------|------|
| Container | bg-surface, border border-border, rounded-2xl, p-4 |
| Section label | "ADD PERSON", 12px bold, textSecondary, tracking-widest |
| Spacing | gap-3 between fields |
| Fields | Name (required), Phone (optional) |
| Submit button | Full-width primary button |

**Form Fields**:

| Field | Label | Placeholder | Required | Keyboard |
|-------|-------|------------|----------|----------|
| Name | Name | Mohit Sharma | Yes | default |
| Phone | Phone | 9876543210 | No | numeric |

**Submit Button**:
- Title: "Add Person"
- Full width
- Disabled when name is empty
- Loading state shows spinner

### 4. People List (FlatList)

| Element | Spec |
|---------|------|
| Container | flex-1 |
| Content padding | px-4 horizontal, pt-2, pb-120 |
| Pull-to-refresh | Enabled |
| Infinite scroll | Enabled (onEndReached) |
| Initial render | 8 items |
| Max per batch | 10 items |
| Window size | 5 |

**Optimization Props**:
```typescript
{
  initialNumToRender: 8,
  maxToRenderPerBatch: 10,
  windowSize: 5,
  removeClippedSubviews: true,
  onEndReachedThreshold: 0.5,
}
```

### 5. Customer Card

| Element | Spec |
|---------|------|
| Container | flex-row items-center, bg-surface, p-4, rounded-2xl, mb-3, border border-border |
| Shadow | elevation 2, shadowOpacity 0.04 |
| Left section | Avatar + Info + Quick actions |
| Right section | Amount + Status pill |

**Avatar**:
- Size: 52×52dp
- Shape: rounded-full
- Background: deterministic color from name hash (avatarPalette)
- Initials: 17px bold, white
- Margin right: 14dp (mr-3.5)

**Info Section** (left, flex-1):
- Name: 16px semibold, textPrimary, 1 line, ellipsis
- Row 2: Days overdue badge (conditional) + Last active
- Row 3: Call + Remind buttons (conditional on overdue + phone)

**Amount + Badge Section** (right, items-end):
- Amount: 16px bold, color varies by status
- Status pill: uppercase, 11px bold, colored background

**Days Overdue Badge** (when applicable):
- Background: colors.overdue.bg
- Text: 10px bold, colors.overdue.text
- Format: "Xd overdue"
- Shows only when status = Overdue

**Quick Action Buttons** (on overdue + phone):
- Call button: flex-row, bg-primaryLight, rounded-full, px-2 py-1
  - Icon: Phone, 12dp, primary
  - Text: "Call", 10dp semibold, primary
- Remind button: flex-row, bg-#25D366/10, rounded-full, px-2 py-1
  - Icon: MessageCircle, 12dp, #25D366
  - Text: "Remind", 10dp semibold, #25D366

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title text | #1C1C1E | textPrimary |
| Secondary text | #6B7280 | textSecondary |
| Surface | #FFFFFF | surface |
| Border | #E2E8F0 | border |
| Primary | #22C55E | primary |
| Primary Light | #DCFCE7 | primaryLight |
| Danger | #EF4444 | danger |
| Warning | #F59E0B | warning |

**Status Chip Colors**:

| Status | Badge BG | Badge Text | Amount Color |
|--------|---------|-----------|-------------|
| PAID | #DCFCE7 | #16A34A | primary |
| PENDING | #FEF3C7 | #D97706 | warning |
| OVERDUE | #FEE2E2 | #DC2626 | danger |
| ADVANCE | #EFF6FF | #3B82F6 | primary |

### Typography (from theme.ts)

| Element | Weight | Size | Usage |
|---------|--------|------|-------|
| Screen title | Bold | 24px | Header |
| Card name | SemiBold | 16px | Customer name |
| Card amount | Bold | 16px | Balance |
| Status pill | Bold | 11px | Status label |
| Caption | Medium | 12px | Metadata |
| Label | Bold | 12px | Form labels |

### Spacing (from design-system.md)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4dp | Tight gaps |
| sm | 8dp | Chip padding, inline gaps |
| md | 16dp | Screen padding, card padding |
| lg | 24dp | Section spacing |

---

## Interactions

### Tap Behaviors

| Element | Action |
|---------|--------|
| Add Person button (header) | Opens NewCustomerModal |
| Inline add button | Creates person + optional entry |
| Search input | Filters people list in real-time |
| Customer card (tap) | Navigate to entry create with customer |
| Customer card (long press) | Navigate to customer detail (ledger) |
| Days overdue badge | No action (indicator only) |
| Call button | Opens phone dialer with customer phone |
| Remind button | Opens WhatsApp with pre-filled message |

### Navigation

| From | To | With |
|------|----|------|
| Tap person | /entries/create | customer JSON |
| Long press person | /people/[customerId] | customerId param |
| Add Person header | NewCustomerModal (bottom sheet) | - |
| FAB (global) | /entries/create | - |

### Animations

| Action | Animation |
|--------|-----------|
| Screen transition | Slide from right (300ms) |
| Modal open | Slide up from bottom (250ms) |
| Button press | Scale to 0.96 (spring 100ms) |
| List scroll | Virtualized, 60fps target |
| Empty state | Fade in (400ms) |
| Pull to refresh | Native RefreshControl |
| Load more | Spinner appears at bottom |

---

## States

### Loading States

| State | Display |
|-------|----------|
| Initial load | Loader: "Loading people" |
| Refresh | Native RefreshControl spinning |
| Load more | Loader: "Loading more customers..." |
| Search | Instant filter (no loading) |

### Data States

| State | Hero | List | Actions |
|-------|------|------|---------|
| Has people | - | Shows all | All enabled |
| Has overdue | - | Shows overdue badge | Call/Remind visible |
| Empty | - | Empty state | Add button enabled |
| Offline | Shows cached | Shows cached | Disabled |

### Status States

**Customer Card Status Calculation**:

```
if (balance > 0 && isOverdue) → OVERDUE → Red amount
if (balance > 0 && !isOverdue) → PENDING → Amber amount
if (balance < 0) → ADVANCE → Green amount + "ADVANCE" badge
if (balance === 0) → PAID → Green amount + "PAID" badge
```

### Empty State

| State | Title | Description | CTA |
|-------|-------|-------------|-----|
| Connected | "Your people list is empty" | "Add your first person to start tracking entries" | Add Person |
| Offline | "You're offline" | "Connect to the internet to load your people" | None |

---

## Edge Cases

### Long Customer Name
- Truncate with ellipsis after 1 line
- Full name shown in Customer Detail

### No Phone Number
- Hide Call button
- Hide WhatsApp Remind button
- Card shows no quick actions

### Very Large Amount
- Format with Lakhs: ₹5.25L
- Or Crores: ₹2.50Cr

### First-time User
- Show empty state immediately
- Inline add form prominent

### Search with No Results
- Show empty filter results (same empty state)
- Clear search button available

### Network Offline
- Show last cached data
- Queue all mutations
- Show sync status banner

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| Customer name | Screen reader announces name |
| Balance amount | Announces "Balance: ₹X,XXX" |
| Status | Announces "OVERDUE", "PENDING", "PAID", or "ADVANCE" |
| Quick actions | "Call" and "Remind" buttons labeled |
| List | VoiceOver support for navigation |
| Touch targets | Minimum 44dp |

---

## Performance

| Metric | Target |
|--------|--------|
| Initial render | < 300ms |
| List scroll | 60fps |
| Search filter | < 50ms |
| Add person mutation | < 500ms perceived |

### Optimizations Applied

- React.memo on CustomerCard, CustomerList, CustomersHeader
- FlatList virtualization (initialNumToRender, maxToRenderPerBatch, windowSize)
- removeClippedSubviews for Android
- Infinite scroll with onEndReached
- Pull-to-refresh with RefreshControl

---

## Implementation Checklist

- [x] Screen title "People"
- [x] Add Person header button (opens modal)
- [x] SearchBar component
- [x] Inline add form (Name + Phone + Button)
- [x] CustomerList with FlatList
- [x] CustomerCard with avatar, name, amount, status
- [x] Days overdue badge
- [x] Quick Call button (on overdue + phone)
- [x] Quick Remind button (on overdue + phone)
- [x] Status pills (PAID/PENDING/OVERDUE/ADVANCE)
- [x] Empty state
- [x] Loading states
- [x] Pull-to-refresh
- [x] Infinite scroll
- [x] Long press to open ledger
- [x] Tap to create entry
- [x] NewCustomerModal bottom sheet

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens, typography |
| `docs/flows.md` | Navigation reference |
| `docs/STATUS.md` | What is implemented |
| `docs/flows/customer-detail.md` | Customer detail flow |
| `docs/components.md` | UI components |
| `app/(main)/people/index.tsx` | Screen implementation |
| `src/components/people/CustomerCard.tsx` | Card component |
| `src/components/people/CustomerList.tsx` | List component |
| `src/components/people/NewCustomerModal.tsx` | Add modal |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Sort options** — By name, amount, recent activity
2. **Filter by status** — Show only overdue, pending, etc.
3. **Bulk actions** — Select multiple, send reminders
4. **Import contacts** — From phone contacts
5. **Customer groups** — Tags/categories

---

_Last updated: April 20, 2026_