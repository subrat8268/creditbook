# KredBook — Entry Detail Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Entry Detail** screen shows a single entry's full details — items, summary, and payment history. It's accessed by tapping an entry from the Entries list.

**Primary Goals**:
1. **View details** — See full entry with all items
2. **Record payment** — Pay towards this entry
3. **Share entry** — Generate and share PDF invoice

**User Behavior**:
- Tap entry in list → View full details
- Scroll to see items, summary, payment history
- Tap "Record Payment" → Modal to enter amount
- Tap "Send Entry" → Generate PDF + share
- Tap phone/whatsapp → Quick contact shortcut for the customer

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, 56dp)                       │
│ [←] Entry #INV-001    [✏️] [📤] [📞] [💬]  │
├─────────────────────────────────────────────┤
│ SCROLLABLE CONTENT                          │
│ ┌─────────────────────────────────────────┐ │
│ │ STATUS HERO CARD                        │ │
│ │ TOTAL AMOUNT                            │ │
│ │ ₹25,000                                │ │
│ │ [PENDING pill]                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ PERSON CARD                            │ │
│ │ [Avatar] Name                Prev Bal   │ │
│ │ +91 Phone                  ₹20,000     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ITEMS CARD                             │ │
│ │ ITEMS                                  │ │
│ │ ─────────────────────────────────────  │ │
│ │ Rice (Basmati)            1 × ₹5,000    │ │
│ │                                 ₹5,000 │ │
│ │ Sugar                   2 × ₹800        │ │
│ │                                 ₹1,600 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ SUMMARY CARD                           │ │
│ │ Subtotal              ₹6,600            │ │
│ │ GST (5%)             ₹330              │ │
│ │ Previous Balance    ₹20,000            │ │
│ │ ─────────────────────────────────────  │ │
│ │ Grand Total       ₹26,330              │ │
│ │ [PENDING pill]                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ PAYMENTS CARD                           │ │
│ │ PAYMENTS                               │ │
│ │                                     │ │
│ │ 15 Jan 2026          +₹5,000         │ │
│ │ [UPI pill]          Rem: ₹21,330      │ │
│ │                                     │ │
│ │ No payments recorded yet              │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER ACTIONS                            │
│ [Send Entry]        [Record Payment]       │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header (56dp)

| Element | Spec |
|---------|------|
| Back button | Text "←", 18px, textPrimary |
| Title | "Entry #{bill_number}", 16px bold, textPrimary |
| Edit button | Pencil icon, 20dp (hidden when paid) |
| Share button | MessageCircle icon, 20dp |
| Call button | Phone icon, 20dp, primary (show when not paid + has phone) |
| WhatsApp button | MessageCircle icon, 20dp, #25D366 (show when not paid + has phone) |

**Visibility Rules**:
- Edit: Only when entry status !== "Paid"
- Call/WhatsApp: Only when entry not paid AND customer has phone

### 2. Status Hero Card (Gradient)

| Element | Spec |
|---------|------|
| Container | Full-width, rounded-2xl |
| Padding | p-6 (24dp) |
| Background | Gradient based on status |
| Label | "TOTAL amount", 11px bold, uppercase, white/80% |
| Amount | 38px extrabold, white |
| Status pill | White bg, status-colored text |

**Status Gradient Colors**:

| Status | Start | End | Label |
|--------|-------|-------|-------|
| Paid | #10B981 | #059669 | PAID |
| Pending | #9CA3AF | #6B7280 | PENDING |
| Partial | #F59E0B | #D97706 | PARTIAL |
| Overdue | #EF4444 | #DC2626 | OVERDUE |

### 3. Person Card

| Element | Spec |
|---------|------|
| Container | bg-surface, rounded-2xl, p-6, shadow |
| Avatar | 48×48dp, rounded-full, deterministic color |
| Initials | 17px bold, white |
| Name | 16px semibold, textPrimary |
| Phone | 13px, textSecondary, "+91 {phone}" |
| Previous balance | 11px textSecondary (label), 15px bold (amount) |

**Previous Balance Colors**:
- If > 0: danger color
- If ≤ 0: primary color

### 4. Items Card

| Element | Spec |
|---------|------|
| Container | bg-surface, rounded-2xl (top only), shadow |
| Section label | "ITEMS", 11px bold, uppercase, textSecondary |
| Item row | flex-row, p-3 |
| Item name | flex-1, 15px, textPrimary, 1 line |
| Item qty×price | 13px, textSecondary, mr-4 |
| Item total | 15px bold, textPrimary, minWidth 64, text-right |
| Divider | height 1dp, border color, between items |

### 5. Summary Card

| Element | Spec |
|---------|------|
| Container | bg-surface, rounded-2xl (bottom only), shadow |
| Row spacing | py-1 |

**Summary Rows**:

| Label | Style | Conditional |
|-------|-------|-------------|
| Subtotal | 14px textSecondary / textPrimary | Always |
| GST (X%) | 14px textSecondary / textPrimary | When tax_percent > 0 |
| Loading Charge | 14px textSecondary | When loading_charge > 0 |
| Previous Balance | 14px danger (if > 0) | When previous_balance > 0 |
| Divider | height 1dp, border | Always |
| Grand Total | 24px bold textPrimary | Always |
| Status pill | Uppercase, 11px bold | Always |

### 6. Payments Card

| Element | Spec |
|---------|------|
| Container | bg-surface, rounded-2xl, p-6, shadow |
| Section label | "PAYMENTS", 11px bold, uppercase, textSecondary |
| Empty state | "No payments recorded yet", 14px, textSecondary, centered |
| Payment row | flex-row, justify-between |

**Payment Row**:
- Date + mode (left): 14px bold textPrimary, mode pill below
- Amount + remaining (right): 16px bold primary, remaining below

**Mode Pills**:

| Mode | BG | Text |
|------|-----|------|
| Cash | paid.bg | paid.text |
| UPI | partial.bg | partial.text |
| NEFT | overdue.bg | warning |
| Cheque | successBg | primaryDark |

### 7. Footer Action Bar (Fixed)

| Element | Spec |
|---------|------|
| Position | absolute bottom-0 |
| Background | surface, border-top |
| Padding | px-6 pt-2 pb-6 |
| Gap | sm |

**Buttons**:

| Button | Style | Visibility |
|--------|-------|------------|
| Send Entry | flex-1, primary border, primary text | Always |
| Record Payment | flex-1, primary bg, surface text | Only when NOT paid |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Primary | #2563EB | primary |
| Danger | #EF4444 | danger |
| Surface | #FFFFFF | surface |
| Border | #E2E8F0 | border |

### Typography (from theme.ts)

| Element | Weight | Size |
|---------|--------|------|
| Hero amount | ExtraBold | 38px |
| Hero label | Bold | 11px |
| Card title | SemiBold | 16px |
| Summary total | Bold | 24px |
| Item name | Regular | 15px |
| Payment amount | Bold | 16px |

### Spacing (from design-system.md)

| Token | Value |
|-------|-------|
| xs | 4dp |
| sm | 8dp |
| md | 16dp |
| lg | 24dp |

---

## Interactions

### Tap Behaviors

| Element | Action |
|---------|--------|
| Back | Navigate back to entries |
| Edit | Navigate to /entries/[id]/edit |
| Send Entry | Generate PDF + native share |
| Record Payment | Open payment modal |
| Call | Open phone dialer |
| WhatsApp | Open WhatsApp with message |

### Payment Modal

Triggered by "Record Payment" button:
- Shows RecordCustomerPaymentModal
- Pre-fills balance due
- On success: refresh queries, show toast, close

### Quick Remind Message

**Call**:
- Opens `tel:{phone}`

**WhatsApp**:
- Pre-filled message: "Hi {name}, this is a reminder about your entry #{bill_number} of ₹{balance_due}. Please clear when convenient. - KredBook"

### PDF Generation

On "Send Entry":
1. Generate PDF with generateBillPdf
2. Open native share sheet
3. Fallback to WhatsApp if sharing unavailable

---

## States

### Loading States

| State | Display |
|-------|----------|
| Loading entry | Loader component |
| Loading payments | Loader in payments section |
| Sending entry | Button shows "Generating…" |

### Error States

| State | Display |
|-------|----------|
| Entry not found | EmptyState: "Entry not found" |
| API error | Toast with error message |

### Status States

| Status | Hero Gradient | Status Label | Payment Button |
|--------|---------------|--------------|---------------|
| Paid | Green | PAID | Hidden |
| Pending | Gray | PENDING | Visible |
| Partial | Amber | PARTIAL | Visible |
| Overdue | Red | OVERDUE | Visible |

---

## Edge Cases

### No Previous Balance
- Don't show previous balance row in person card to/from summary

### No Items (shouldn't happen)
- Show empty items card with note

### No Phone Number
- Hide call and WhatsApp buttons
- WhatsApp fallback still works with message only

### No Payments
- Show "No payments recorded yet" in payments section

### Entry Already Paid
- Hide Edit button
- Hide Record Payment button
- Show green gradient hero

### Very Large Amount
- Format with Lakhs: ₹5.25L
- Or Crores: ₹2.50Cr

### No Internet (while sending)
- Generate PDF offline
- Show toast on share failure

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| Hero amount | Screen reader announces "Total amount: rupees X" |
| Status | Announces status (Paid, Pending, etc.) |
| Action buttons | VoiceOver labels |

---

## Performance

| Metric | Target |
|--------|--------|
| Initial render | < 300ms |
| PDF generation | < 1s |
| Share sheet | Native (not measured) |

### Optimizations

- useMemo for derived values (heroGradient, sortedPayments, paymentRows)
- React Query caching

---

## Implementation Checklist

- [x] Header with back, edit, share, call, WhatsApp
- [x] Status hero card with gradient
- [x] Person card with avatar and previous balance
- [x] Items list with product details
- [x] Summary with subtotal, tax, loading, previous, grand total
- [x] Payments history section
- [x] Fixed footer with Send Entry + Record Payment buttons
- [x] Payment modal integration
- [x] PDF generation + share
- [x] Quick call/whatsapp buttons
- [x] Status gradient based on entry status

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens, typography |
| `docs/flows.md` | Navigation reference |
| `docs/STATUS.md` | What is implemented |
| `docs/flows/entries.md` | Entries list flow |
| `docs/flows/add-entry.md` | Add entry flow |
| `app/(main)/entries/[orderId].tsx` | Screen implementation |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Edit entry** — Modify entry items after creation
2. **Delete entry** — Remove entry entirely
3. **Print** — Direct printer integration
4. **Multiple payment modes** — Select default mode

---

_Last updated: April 20, 2026_
