# KredBook — Add Entry Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Add Entry** screen is the quick amount-first entry creation flow. It's designed for speed — add an entry in under 30 seconds.

**Primary Goals**:
1. **Fast entry** — Amount-first input for speed
2. **Quick payment** — Record payments against outstanding balance
3. **Shareable** — Generate and share PDF instantly

**User Behavior**:
- Tap FAB → Enter amount → Select person → Save & Share
- Tap customer in People → Quick entry with person pre-selected
- Tap "Record Payment" → Enter amount → Done

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, 56dp)                       │
│ [←] Add Entry          [SyncStatus] [INV#] │
├─────────────────────────────────────────────┤
│ SCROLLABLE CONTENT                         │
│ ┌─────────────────────────────────────────┐ │
│ │ CUSTOMER SELECTOR                        │ │
│ │ [? Avatar] Select Person           [✏️]  │ │
│ │                                         │ │
│ │ (When selected + has balance)          │ │
│ │ ⚠️ Previous Balance: ₹X,XXX          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ SEARCH + PEOPLE LIST                    │ │
│ │ [🔍 Search people...]                  │ │
│ │ ─────────────────────────────────────  │ │
│ │ Mohit Sharma                           │ │
│ │ 9876543210                             │ │
│ │ ─────────────────────────────────────  │ │
│ │ Priya Patel                            │ │
│ │ 9876543211                             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ AMOUNT INPUT                           │ │
│ │ AMOUNT                                 │ │
│ │ [₹]  [0________________]              │ │
│ │                                         │ │
│ │ (Large numeric input, auto-focus)        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ NOTE (OPTIONAL)                        │ │
│ │ NOTE (OPTIONAL)                        │ │
│ │ [e.g., Rice purchase, Monthly bill...]   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ SUMMARY (when amount entered)            │ │
│ │ Entry Amount           ₹5,000.00       │ │
│ │ Previous Balance     ₹20,000.00       │ │
│ │ ─────────────────────────────────────  │ │
│ │ Grand Total        ₹25,000.00          │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER ACTIONS                            │
│ [Offline: X queued] [Save & Share →]      │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header (56dp height)

| Element | Spec |
|---------|------|
| Back button | ArrowLeft, 22dp, textPrimary |
| Title | "Add Entry", 18px bold, textPrimary |
| Sync status | SyncStatus component |
| Right badge | "INV-NEW" or "PAYMENT", pill style |

**INV Badge**:
- Background: primaryLight
- Border: 1dp primary
- Text: 13px bold, primary
- Shows current invoice number prefix

### 2. Customer Selector Card

| Element | Spec |
|---------|------|
| Container | bg-surface, border border-border, rounded-2xl |
| Content | flex-row, items-center, p-4 |
| Avatar | 52×52dp, rounded-full, deterministic color |
| Initials | 17px bold, white |
| Name | 17px bold, textPrimary |
| Subtitle | 14px textSecondary ("Choose from your people list below") |
| Edit icon | Pencil, 18dp, primary |

**Selector States**:

| State | Avatar | Name | Subtitle |
|-------|--------|------|---------|
| Not selected | gray border, "?" | "Select Person" | "Choose from your people list below" |
| Selected | deterministic color | Person name | - |

**Previous Balance Warning** (conditional):
- Shows when: selectedCustomer && previousBalance > 0
- Background: colors.dangerBg
- Text: "⚠️ Previous Balance: ₹X,XXX", 13px bold, danger

### 3. Inline People List

| Element | Spec |
|---------|------|
| Container | bg-surface, border border-border, rounded-2xl |
| Section label | "SELECT PERSON", 12px bold, textSecondary, tracking-widest |
| Search bar | Standard SearchBar component |
| List | FlatList with virtualization |
| Item | px-4 py-3, border-b border-border |

**List Item**:
- Padding: 12dp vertical, 16dp horizontal
- Name: 15px semibold, textPrimary
- Phone (if exists): 12px textSecondary
- Selected state: bg-primaryLight

**Empty State**:
- Text: "No people found" or "Offline — connect to load people"

### 4. Amount Input

| Element | Spec |
|---------|------|
| Label | "AMOUNT", 11px bold, textSecondary, tracking-widest |
| Container | bg-surface, border-2 border-primary, rounded-2xl |
| Padding | px-5 py-6 (24dp) |
| Currency symbol | "₹", 40px extrabold, primary |
| Input field | flex-1, 36px extrabold, textPrimary |
| Placeholder | "0" |
| Keyboard | numeric |
| Auto-focus | When no customer pre-selected |

### 5. Note Input

| Element | Spec |
|---------|------|
| Label | "NOTE (OPTIONAL)", 11px bold, textSecondary, tracking-widest |
| Container | bg-surface, border border-border, rounded-2xl |
| Padding | px-4 py-3 |
| Placeholder | "e.g., Rice purchase, Monthly bill..." |
| Multiline | true |

### 6. Summary Card

| Element | Spec |
|---------|------|
| Visibility | When entryType === "bill" && amount > 0 |
| Container | bg-surface, border border-border, rounded-2xl, p-4 |
| Row spacing | mb-2 |

**Summary Rows**:

| Label | Value Style |
|---------|-----------|
| Entry Amount | 14px textSecondary, 16px bold textPrimary |
| Previous Balance (if > 0) | 14px textSecondary, 16px bold danger |
| Divider | h-px, border color |
| Grand Total | 16px bold textPrimary, 24px extrabold primary |

### 7. BillFooter (Absolute Positioned)

| Element | Spec |
|---------|------|
| Position | absolute bottom-0, full-width |
| Offline indicator | Shows queue count |
| Primary button | Full width, primary |
| Label | "Save & Share" or "Record Payment" |
| Disabled state | When no customer or no amount |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Primary | #22C55E | primary |
| Primary Light | #DCFCE7 | primaryLight |
| Surface | #FFFFFF | surface |
| Border | #E2E8F0 | border |
| Danger | #EF4444 | danger |
| Danger BG | #FEF2F2 | dangerBg |
| Warning | #F59E0B | warning |

### Typography (from theme.ts)

| Element | Weight | Size | Usage |
|---------|--------|------|-------|
| Header title | Bold | 18px | Screen header |
| Customer name | Bold | 17px | Selector |
| Amount currency | ExtraBold | 40px | Amount input |
| Amount value | ExtraBold | 36px | Amount input |
| Section label | Bold | 11px | Labels |
| Note text | Regular | 15px | Input |
| Total | ExtraBold | 24px | Grand total |

### Spacing (from design-system.md)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4dp | Tight gaps |
| sm | 8dp | Chip padding |
| md | 16dp | Screen padding |
| lg | 24dp | Section spacing |

---

## Interactions

### Entry Types

The screen supports two modes:

| Mode | Trigger | Label | Behavior |
|-----|---------|-------|----------|
| Bill (default) | Default | "Save & Share" | Creates entry |
| Payment | amountParam present OR payment flow | "Record Payment" | Records payment |

### Tap Behaviors

| Element | Action |
|---------|--------|
| Back arrow | Navigate back |
| Customer selector | Opens inline picker (always visible) |
| Person item (list) | Select person, fetch previous balance |
| Amount input | Focus for typing |
| Save & Share | Create entry + generate PDF + share |
| Record Payment | Record payment against balance |

### Navigation Flows

**From Dashboard "Add Entry"**:
1. Navigate to `/entries/create`
2. Auto-focus amount field

**From People "Tap customer"**:
1. Navigate to `/entries/create?customer={json}`
2. Pre-fill customer
3. Pre-fetch previous balance

**From Customer Detail "Add Entry"**:
1. Navigate to `/entries/create?customer={json}&next=share`
2. After save → redirect to customer detail with share focus

**From Dashboard "Pay" button**:
1. Navigate to `/entries/create?customer={json}&amount={amount}`
2. Auto-set entryType = "payment"
3. Pre-fill amount

### PDF Generation

On "Save & Share":
1. Create entry via API
2. Generate PDF invoice
3. Open native share sheet
4. Show success toast
5. Navigate back

### Payment Validation

On "Record Payment":
1. Check customer has pending balance
2. Validate payment ≤ pending balance
3. Record payment via API
4. Refresh queries
5. Show success toast
6. Navigate back

---

## States

### Loading States

| State | Display |
|-------|----------|
| Creating entry | BillFooter shows loading |
| Recording payment | BillFooter shows loading |
| Fetching balance | Previous balance shows spinner |
| Generating PDF | Native share in progress |

### Validation States

| Scenario | Alert Title | Alert Message |
|----------|------------|--------------|
| No customer selected | Error | "Please select a person" |
| No amount for entry | Error | "Please enter an amount" |
| No amount for payment | Error | "Please enter a payment amount" |
| No pending for payment | Up to date | "{Person} has no pending entries to pay." |
| Payment > balance | Amount too high | "Payment exceeds the pending balance of ₹X." |

### Empty States

| Scenario | Display |
|----------|----------|
| No search results | "No people found" |
| Offline | "You're offline. People will load when back online." |

---

## Edge Cases

### No Previous Balance
- Don't show warning banner
- Summary shows only Entry Amount

### Very Large Amount
- Format with Lakhs: ₹5.25L
- Or Crores: ₹2.50Cr

### Customer Without Phone
- Show in picker list
- No special treatment

### Network Offline
- Show sync queue count in footer
- Show offline warning in picker
- Queue mutation for later sync

### Payment Exceeds Balance
- Alert user with current balance
- Don't allow recording

### Payment When No Pending
- Alert "Up to date"
- Don't create payment

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| Amount input | Screen reader announces "Enter amount in rupees" |
| Customer picker | VoiceOver navigation |
| Save button | Announces "Save and share entry" |
| Error alerts | Native accessibility |

---

## Performance

| Metric | Target |
|--------|--------|
| Initial render | < 300ms |
| Customer search filter | < 50ms |
| Entry creation | < 500ms perceived |
| PDF generation | < 1s |
| Share sheet open | Native (not measured) |

### Optimizations

- FlatList virtualization in picker
- React.memo on CustomerPicker
- useCallback for handlers
- Keyboard dismiss on select

---

## Implementation Checklist

- [x] Header with back button + sync status + invoice badge
- [x] Customer selector card (shows selected or prompts)
- [x] Inline people picker (search + list)
- [x] Amount input (amount-first, large, numeric)
- [x] Note input (optional, multiline)
- [x] Summary card (shows when amount entered)
- [x] Previous balance warning
- [x] BillFooter with Save & Share
- [x] Record Payment mode (via params)
- [x] PDF generation + share
- [x] Payment validation
- [x] Success/error toasts
- [x] Offline queue indicator

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens, typography |
| `docs/flows.md` | Navigation reference |
| `docs/STATUS.md` | What is implemented |
| `docs/flows/people.md` | People flow |
| `docs/components.md` | UI components |
| `app/(main)/entries/create.tsx` | Screen implementation |
| `src/components/picker/CustomerPicker.tsx` | Picker component |
| `src/utils/generateBillPdf.ts` | PDF generation |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Quick select recent** — Show recent customers at top
2. **Favorite customers** — Pin frequently used people
3. **Partial payment** — Pay towards specific entry
4. **Multiple items** — Product picker (removed, not returning)
5. **Custom invoice numbering** — User-defined prefix

---

_Last updated: April 20, 2026_