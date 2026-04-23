# KredBook — Customer Detail Screen UX Specification

> **Last Updated**: April 17, 2026
> **Version**: v3.0 Enhanced

---

## Screen Purpose

The **Customer Detail** screen is the **most important screen** in the app. It's where shopkeepers spend 80% of their time — checking balances, recording payments, and viewing transaction history.

**Primary Goal**: Make the balance instantly visible and actions instantly accessible.

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, 56dp)                        │
│ [←]  Customer Name           [PDF] [Call]   │
├─────────────────────────────────────────────┤
│ SCROLLABLE CONTENT                          │
│ ┌─────────────────────────────────────────┐ │
│ │ HERO BALANCE CARD                       │ │
│ │ Total Balance Due        [OVERDUE]     │ │
│ │ ₹25,000                                 │ │
│ │ Last entry: 15 Jan 2026                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ PRIMARY CTAs                           │ │
│ │ [Add Entry 🟢]  [Record Payment 🔴]     │ │
│ │ [Share] [Quick Pay ₹Xk]                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ TRANSACTION LIST                        │ │
│ │ [All] [Entries] [Payments] (tabs)      │ │
│ │ ─────────────────────────────────────  │ │
│ │ ● Entry #001  ₹5,000    15 Jan         │ │
│ │   Bal: ₹25,000                          │ │
│ │ ─────────────────────────────────────  │ │
│ │ ● Payment  -₹2,000   14 Jan           │ │
│ │   Bal: ₹20,000                          │ │
│ │ ─────────────────────────────────────  │ │
│ │ ● Entry #002  ₹7,000   10 Jan         │ │
│ │   Bal: ₹22,000                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ FOOTER ACTIONS                          │ │
│ │ [Download PDF]  [Share WhatsApp]        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header (56dp height)

| Element | Spec |
|---------|------|
| Back button | 44×44dp touch target, ArrowLeft icon |
| Title | Customer name, 17px bold, single line |
| Right actions | PDF (icon), Call (icon), 44dp each |

### 2. Hero Balance Card

| Element | Spec |
|---------|------|
| Height | 140dp |
| Background | Gradient: Red when due, Green when clear |
| Amount | 38px, bold, white |
| Label | 11px, uppercase, white/70% |
| Status badge | "OVERDUE · 15 days" pill when overdue |
| Fallback text | "No outstanding balance" when cleared |

### 3. Primary CTAs

**Row 1 — Main Actions**

| Button | Style | Behavior |
|--------|-------|----------|
| Add Entry | Primary (`colors.primary`), full-width | Opens create screen with customer pre-filled |
| Record Payment | Danger (`colors.danger`) when due, gray when settled | Opens payment modal |

**Row 2 — Quick Actions**

| Button | Style | Behavior |
|--------|-------|----------|
| Share | White with border | Share ledger via WhatsApp |
| Quick Pay | Shows pending amount | One-tap to record payment |

### 4. Transaction List

**Filter Tabs**

| Tab | Shows |
|-----|-------|
| All | Both entries and payments |
| Entries | Bills/entries only |
| Payments | Payments only |

**Transaction Row**

| Element | Spec |
|---------|------|
| Left border | 4dp, Green for payment, Red for entry |
| Icon | 38dp circle with arrow (up=entry, down=payment) |
| Title | "Entry #001" or "Payment" |
| Subtitle | Mode (Cash/UPI) or date |
| Amount | Right-aligned, 16px bold, colored |
| Running balance | Below title, 12px, gray |

### 5. Empty State

When no transactions:
- Dashed border icon
- "No transactions yet" message
- "Add an entry to start this ledger" subtitle

---

## Visual Design

### Color System

| State | Background | Text |
|-------|------------|------|
| Balance Due | `#DC2626 → #B91C1C` (red gradient) | White |
| Balance Cleared | `#16A34A → #15803D` (green gradient) | White |
| Payment | Left border green | Amount green |
| Entry | Left border red | Amount red |
| Overdue badge | `rgba(255,255,255,0.18)` (white/18%) | White |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Balance amount | Inter | 38px | 800 |
| Transaction title | Inter | 15px | 700 |
| Transaction amount | Inter | 16px | 800 |
| Running balance | Inter | 12px | 500 |
| Tab labels | Inter | 13px | 600 |
| Button text | Inter | 14px | 700 |

### Spacing

| Element | Value |
|---------|-------|
| Screen padding | 16dp |
| Card padding | 22dp |
| Card border radius | 20dp |
| Button height | 52dp |
| Button border radius | 16dp |
| Transaction row padding | 14dp |
| Section gap | 16dp |

---

## Interactions

### Tap Behaviors

| Element | Action |
|---------|--------|
| Back arrow | Navigate back |
| Customer name (header) | None (static) |
| PDF icon | Download statement PDF |
| Call icon | Open phone dialer |
| Add Entry button | Navigate to create screen |
| Record Payment button | Open payment modal |
| Share button | Share ledger via WhatsApp |
| Quick Pay button | Record payment with pre-filled amount |
| Transaction row | Navigate to entry detail |
| Filter tab | Filter transaction list |

### Animations

| Action | Animation |
|--------|-----------|
| Screen transition | Slide from right (300ms) |
| Modal open | Slide up from bottom (250ms) |
| Button press | Scale to 0.96 (100ms) |
| Tab switch | Fade (150ms) |

---

## States

### Balance States

| State | Hero Background | Amount Color | Status |
|-------|-----------------|--------------|--------|
| Has dues | Red gradient | White | Shows "TOTAL BALANCE DUE" |
| Overdue | Red gradient | White | Shows "OVERDUE · X days" |
| Cleared (₹0) | Green gradient | White | Shows "No outstanding balance" |
| Advance (negative) | Green gradient | White | Shows "Advance: ₹X,XXX" |

### Button States

| Button | Has Balance | No Balance |
|--------|-------------|-------------|
| Add Entry | Green, enabled | Green, enabled |
| Record Payment | Red, enabled | Gray, disabled |
| Quick Pay | Shows amount | Hidden |

---

## Edge Cases

### Long Customer Name

- Truncate with ellipsis after 20 characters
- Full name shown in Customer Detail

### Very Large Amount

- Format with Lakhs: ₹5.25L
- Or Crores: ₹2.50Cr

### No Transactions

- Show empty state with CTA to add entry
- No "0 transactions" text without guidance

### Network Offline

- Show last cached data
- Queue all mutations
- Show sync status banner

### Customer Has No Phone

- Hide call button in header

---

## Accessibility

| Element | Accessibility |
|---------|---------------|
| Balance amount | Screen reader announces "Balance: ₹X,XXX" |
| Status badge | Announces "Overdue, X days" |
| Transaction amount | Announces "Payment received: ₹X" or "Entry: ₹X" |
| Buttons | Minimum 44dp touch target |

---

## Performance

| Metric | Target |
|--------|--------|
| Initial render | < 300ms |
| Transaction list scroll | 60fps |
| Payment modal open | < 250ms |

---

## Implementation Checklist

- [x] Hero balance card with gradient
- [x] Add Entry primary button (green)
- [x] Record Payment button (red when due)
- [x] Quick Pay with amount
- [x] Share ledger button
- [x] Transaction list with tabs
- [x] Transaction row with color coding
- [x] Running balance per row
- [x] Empty state
- [x] Call button (when phone exists)
- [x] PDF download button
- [x] Filter tabs (All/Entries/Payments)

---

## Related Documentation

- `docs/design-system.md` — Color tokens, typography
- `docs/flows.md` — Record Payment flow
- `docs/ARCHITECTURE.md` — Data layer

---

*This screen is optimized for quick actions. Every element should answer: "How much?" or "What do I do next?"*
