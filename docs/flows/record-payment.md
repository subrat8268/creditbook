# KredBook — Record Payment UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Record Payment** modal is a bottom sheet that appears when recording a payment towards an entry. It's triggered from the Entry Detail screen or Customer Detail screen.

**Primary Goals**:
1. **Enter amount** — Input payment amount
2. **Select mode** — Choose payment method (Cash/UPI/NEFT/Draft/Cheque)
3. **Add note** — Optional notes about payment
4. **Submit** — Record payment and update balances

**User Behavior**:
- Tap "Record Payment" → Modal opens
- Enter amount (default: full balance)
- Select mode
- Add note (optional)
- Submit → Success toast → Lists refresh

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ BOTTOM SHEET (75% → 90%)                    │
│ ────────────────────────────────────────────│
│_record_payment                             │
│                                             │
│ [Avatar] Name                 [history icon]│
│ Balance: ₹25,000                            │
│                                             │
│ ────────────────────────────────────────────│
│ Amount Received                              │
│                                             │
│ ₹ [_________________0_________________]      │
│                                             │
│ Full balance: ₹25,000 (tap to fill)         │
│                                             │
│ ────────────────────────────────────────────│
│ Payment Mode                                │
│                                             │
│ [Cash] [UPI] [NEFT] [Draft] [Cheque]       │
│                                             │
│ ────────────────────────────────────────────│
│ Notes (optional)                            │
│                                             │
│ [Write a note about this payment...]        │
│                                             │
│ ────────────────────────────────────────────│
│ [Record Partial Payment] OR [Mark Full Paid]│
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Bottom Sheet Container

| Element | Spec |
|---------|------|
| Snap points | ["75%", "90%"] |
| Handle | 40dp width, 4dp height, colors.border |
| Background | surface, rounded-2xl (24dp) |
| Keyboard behavior | interactive |
| Keyboard blur | restore |

### 2. Header

| Element | Spec |
|---------|------|
| Title | "Record Payment", 20px bold, textPrimary |
| Margin bottom | mb-4 |

### 3. Person Card

| Element | Spec |
|---------|------|
| Container | flex-row, items-center, px-4 py-3, rounded-2xl, mb-5, bg-background |
| Avatar | 44×44dp (w-11 h-11), rounded-full, deterministic color |
| Initials | 15px bold, white |
| Margin right | mr-3 |
| Name | 15px bold, textPrimary |
| Balance label | 13px semibold, danger |
| Format | "Balance: ₹{amount}" |
| Right icon | History, 20dp, primary |

### 4. Amount Input

| Element | Spec |
|---------|------|
| Label | "Amount Received", 13px semibold, textPrimary, mb-3 |
| Container | flex-row, items-center, pb-3, mb-1, border-b-2 border-primary |
| Currency symbol | "₹", 30px (text-3xl), bold, textPrimary, mr-2 |
| Input | flex-1, 40px (text-4xl), extrabold, textPrimary |
| Keyboard | decimal-pad |
| Placeholder | "0" |

### 5. Full Balance Hint

| Element | Spec |
|---------|------|
| Container | TouchableOpacity, mb-5 |
| Text | 13px semibold, primary |
| Format | "Full balance: ₹{amount}" |
| Behavior | Tap sets amount = full balance |

### 6. Payment Mode Selector

| Element | Spec |
|---------|------|
| Label | "Payment Mode", 13px semibold, textPrimary, mb-3 |
| Container | ScrollView, horizontal, showsHorizontalScrollIndicator=false |
| Gap | 8dp |
| Padding bottom | pb-4 |

**Mode Chips**:

| Mode | Default | Selected BG | Selected Text | Unselected Border | Unselected Text |
|------|----------|--------------|----------------|--------------------| ----------------|
| Cash | Yes | primary | surface | border | textSecondary |
| UPI | No | primary | surface | border | textSecondary |
| NEFT | No | primary | surface | border | textSecondary |
| Draft | No | primary | surface | border | textSecondary |
| Cheque | No | primary | surface | border | textSecondary |

**Chip Style**:
- Padding: px-5 py-2
- Radius: full (pill)
- Border: 1dp

### 7. Notes Input

| Element | Spec |
|---------|------|
| Label | "Notes (optional)", 13px semibold, textPrimary, mb-2 |
| Container | BottomSheetTextInput, multiline |
| Placeholder | "Write a note about this payment…" |
| Number of lines | 3 |
| Min height | 80dp |
| Styling | rounded-xl, px-4 py-3, text-sm, border border-border, bg-background |
| Margin bottom | mb-6 |

### 8. Submit Button

**When Full Payment (isFullPaid = true)**:

| Element | Spec |
|---------|------|
| Container | flex-row, items-center, justify-center, rounded-xl, h-14 |
| Background | primary (when enabled), border (when disabled) |
| Text | "Mark Full Paid", 15px bold, surface |
| Right icon | Check, 16dp, surface, strokeWidth 3 |
| Disabled state | opacity reduced, bg-border |

**When Partial Payment (isFullPaid = false)**:

| Element | Spec |
|---------|------|
| Container | flex-row, items-center, justify-center, rounded-xl, h-14 |
| Background | warning (when enabled), border (when disabled) |
| Text | "Record Partial Payment", 15px bold, surface |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Primary | #2563EB | primary |
| Warning | #F59E0B | warning |
| Danger | #EF4444 | danger |
| Surface | #FFFFFF | surface |
| Background | #F6F7F9 | background |
| Border | #E2E8F0 | border |

### Typography (from theme.ts)

| Element | Weight | Size |
|---------|--------|------|
| Screen title | Bold | 20px |
| Person name | Bold | 15px |
| Balance | SemiBold | 13px |
| Amount label | SemiBold | 13px |
| Currency symbol | Bold | 30px |
| Amount input | ExtraBold | 40px |
| Full balance hint | SemiBold | 13px |
| Mode chip | SemiBold | 14px |
| Notes | Regular | 14px |
| Button | Bold | 15px |

### Spacing (from design-system.md)

| Token | Value |
|-------|-------|
| xs | 4dp |
| sm | 8dp |
| md | 16dp |
| lg | 24dp |

---

## Interactions

### Flow

**Triggered from**:
- Entry Detail screen → "Record Payment" button
- Customer Detail screen → "Record Payment" button

**On Open**:
1. Set default amount = balanceDue (or initialAmount if provided)
2. Set default mode = "Cash"
3. Clear notes
4. Expand bottom sheet to 75%

### Amount Behavior

| Action | Behavior |
|--------|-----------|
| Type amount | Updates local state |
| Tap "Full balance" | Sets amount = balanceDue |
| FullPaid calculation | parsedAmount >= balanceDue |

### Validation

| Scenario | Alert |
|----------|-------|
| Amount empty or ≤ 0 | "Enter a valid amount." |
| API error | "Failed to record payment." |

### On Success

1. Call onSuccess callback
2. Dismiss modal (if ref available)
3. Parent refreshes queries
4. Shows success toast

---

## States

### Loading States

| State | Button Text |
|-------|------------|
| Recording | "Recording..." |

### Button States

**Full Payment Button**:
| Is Full Paid | Disabled | Background | Text |
|-------------|----------|-------------|------|
| Yes | No | primary | "Mark Full Paid" |
| Yes | Yes (recording) | border | "Recording..." |
| No | No | warning | "Record Partial Payment" |
| No | Yes (amount ≤ 0) | border | "Recording..." |
| No | Yes (recording) | warning | "Recording..." |

---

## Edge Cases

### Initial Amount Provided
- Use initialAmount instead of balanceDue as default
- Allows pre-filling from external triggers

### Payment Mode Default
- Always reset to "Cash" when modal opens (not persisted)

### Notes Empty
- Submit with notes = undefined (optional field)

### Amount > Balance
- Treat as full payment
- Show "Mark Full Paid" button

### Amount < Balance
- Show "Record Partial Payment" button
- Submit as partial

### Keyboard Handling
- dismissible when tapping outside input
- keyboardBlurBehavior = "restore"

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| Amount input | Screen reader: "Enter amount in rupees" |
| Payment modes | VoiceOver reads selected mode |
| Submit button | Announces action |

---

## Performance

| Metric | Target |
|--------|--------|
| Modal open | < 250ms |
| Submit + refresh | < 500ms perceived |

---

## Implementation Checklist

- [x] Bottom sheet container (75%/90%)
- [x] Person card with avatar
- [x] Large amount input
- [x] Full balance tap-to-fill
- [x] Payment mode selector (horizontal scroll)
- [x] 5 modes: Cash, UPI, NEFT, Draft, Cheque
- [x] Optional notes
- [x] Full payment button (green, check icon)
- [x] Partial payment button (amber)
- [x] Loading state
- [x] Keyboard behavior
- [x] onSuccess callback
- [x] Auto-reset on open

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens, typography |
| `docs/flows/` | Flow index |
| `docs/STATUS.md` | What is implemented |
| `docs/flows/entry-detail.md` | Triggered from entry detail |
| `docs/flows/customer-detail.md` | Can also trigger |
| `src/components/people/RecordCustomerPaymentModal.tsx` | Component |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Payment history** — View all past payments (history icon)
2. **Auto-detect mode** — Suggest based on recent payments
3. **Multiple partials** — Split payment across multiple modes
4. **Receipt generation** — SMS/WhatsApp receipt on payment

---

_Last updated: April 20, 2026_
