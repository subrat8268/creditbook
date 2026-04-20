# KredBook — Onboarding Flow UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Onboarding Flow** guides new users through setting up their business. It's triggered after Sign Up / phone-setup.

**Primary Goals**:
1. **Business setup** — Enter business name, GSTIN, invoice prefix
2. **Bank details** — Enter UPI, bank name, account, IFSC
3. **Completion** — Mark onboarding complete, go to app

**Flow**:
```
Sign Up/Phone Setup → business.tsx (Step 1) → bank.tsx (Step 2) → ready.tsx
```

---

## Screen 1: Business Setup (Step 1 of 2)

### Layout

```
┌─────────────────────────────────────────────┐
│ [←]                                         │
│                                             │
│ Step 1 of 2                                 │
│ [████████░░] Progress bar                  │
│                                             │
│ Set up your business                        │
│ Just your business name is enough to get   │
│ started!                                    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ BUSINESS CARD                       │ │
│ │                                     │ │
│ │ Business Name *                    │ │
│ │ [________________________]        │ │
│ │                                     │ │
│ │ Advanced Settings (optional) [▼]   │ │
│ │                                     │ │
│ │ (Collapsible: GSTIN, Prefix)        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Continue button]                           │
│ [Skip for now]                              │
└─────────────────────────────────────────────┘
```

### Components

| Element | Spec |
|---------|------|
| Back button | ArrowLeft, w-10 h-10, rounded-full, border |
| Progress | "Step 1 of 2", 13px, textSecondary |
| Progress bar | 2 bars, flex-1, first filled, second empty |
| Title | "Set up your business", 24px extrabold |
| Subtitle | "Just your business name is enough...", 14px, textSecondary |
| Card | bg-surface, rounded-2xl, p-5, shadow |
| Business Name input | Required, with asterisk |
| Advanced toggle | Expandable section |
| GSTIN (optional) | With OPTIONAL badge |
| Invoice Prefix (optional) | Default "INV" |

---

## Screen 2: Bank Setup (Step 2 of 2)

### Layout

```
┌─────────────────────────────────────────────┐
│ [←]                                         │
│                                             │
│ Step 2 of 2                                 │
│ [████████████] Progress bar                 │
│                                             │
│ Bank & Payment Info                         │
│ Your customers will see this on their bills.│
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ BANK CARD                               │ │
│ │                                         │ │
│ │ UPI ID           [OPTIONAL badge]       │ │
│ │ [________________________]              │ │
│ │                                         │ │
│ │ Bank Name       [OPTIONAL badge]        │ │
│ │ [________________________]              │ │
│ │                                         │ │
│ │ Account Number [OPTIONAL badge]         │ │
│ │ [________________________]              │ │
│ │                                         │ │
│ │ IFSC Code        [OPTIONAL badge]       │ │
│ │ [________________________]              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Continue button]                           │
│ [Skip for now]                              │
└─────────────────────────────────────────────┘
```

### Components

| Element | Spec |
|---------|------|
| Progress | "Step 2 of 2" |
| Progress bar | Both bars filled |
| Title | "Bank & Payment Info", 24px extrabold |
| Subtitle | "Your customers will see this...", 14px |

**Fields**:

| Field | Label | Placeholder | Optional? |
|-------|-------|-------------|------------|
| UPI ID | UPI ID | e.g. sharma@upi | Yes |
| Bank Name | Bank Name | e.g. State Bank of India | Yes |
| Account Number | Account Number | e.g. 00112233445566 | Yes |
| IFSC Code | IFSC Code | e.g. SBIN0001234 | Yes |

---

## Screen 3: Ready (Completion)

### Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│           [Large Check Image]              │
│                                             │
│         You're all set!                    │
│                                             │
│ KredBook is ready to replace your khata    │
│ book. Start tracking credit instantly.    │
│                                             │
│ [Business Setup badge]                    │
│ [Ledger ready badge]                      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │      Add Your First Person            │   │
│ └─────────────────────────────────────┘   │
│                                             │
│        Go to Dashboard                     │
└─────────────────────────────────────────────┘
```

### Components

| Element | Spec |
|---------|------|
| Success image | large-check.png (120×120dp) |
| Title | "You're all set!", 24px extrabold |
| Subtitle | "KredBook is ready to replace...", 15px |
| Business badge | CalendarDays icon, shows business name / "Setup pending" |
| Ledger badge | CheckCircle2 icon, "Ledger ready" |
| CTA 1 | "Add Your First Person", primary, full width |
| CTA 2 | "Go to Dashboard", text link |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary/Dark |
| Secondary | #6B7280 | textSecondary |
| Primary | #22C55E | primary |
| Primary Light | #DCFCE7 | primaryLight |
| Surface | #FFFFFF | surface |
| Background | #F6F7F9 | background |
| Border | #E2E8F0 | border |
| Danger | #EF4444 | danger |

### Typography

| Element | Weight | Size |
|---------|--------|------|
| Heading | ExtraBold | 24px |
| Subtitle | Regular | 14-15px |
| Input label | SemiBold | 14px |
| Badge | Bold | 11px uppercase |

### Spacing

| Token | Value |
|-------|-------|
| xs | 4dp |
| sm | 8dp |
| md | 16dp |
| lg | 24dp |

---

## Flows

### Business Setup Flow

1. User enters business name (required)
2. Optionally expands advanced
3. Enters GSTIN / invoice prefix
4. Taps Continue → Save to Supabase
5. Navigate to bank screen
6. Or taps Skip → Go directly to bank

### Bank Details Flow

1. User enters optional bank details
2. Taps Continue → Save + mark onboarding_complete
3. Navigate to ready screen
4. Or taps Skip → Save + navigate

### Ready Completion

1. Taps "Add Your First Person" → Complete onboarding + go to People with add action
2. Taps "Go to Dashboard" → Complete onboarding + go to Dashboard

---

## Edge Cases

### Skip Flow
- Both screens have "Skip for now"
- Skipping still saves entered data
- On ready screen, completing onboarding required

### No Business Name
- Shows error: "Business name is required."
- Cannot proceed without

### Very Long Business Name
- TextInput handles with ellipsis (handled by native)

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| All inputs | Native VoiceOver |
| Progress | "Step X of 2" |
| Skip links | Native accessibility |

---

## Performance

| Metric | Target |
|--------|--------|
| Screen render | < 200ms |
| Save to Supabase | < 500ms |

---

## Implementation Checklist

- [x] Business setup screen (business.tsx)
- [x] Progress indicator (Step 1 of 2)
- [x] Business name required field
- [x] Advanced section (GSTIN, Prefix) - collapsible
- [x] Bank details screen (bank.tsx)
- [x] Progress indicator (Step 2 of 2)
- [x] Optional fields with badges
- [x] Ready completion screen (ready.tsx)
- [x] Success image
- [x] Two CTAs (Add Person / Go to Dashboard)
- [x] Skip functionality
- [x] Keyboard handling

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `app/(auth)/signup.tsx` | Preceding screen |
| `app/(auth)/phone-setup.tsx` | Can precede |
| `app/(main)/dashboard` | Next screen |
| `app/(main)/people` | Add person flow |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Role selection** — Originally had role picker (vendor/customer)
2. **Business logo upload** — Profile picture for business
3. **Multiple businesses** — Handle multiple stores

---

_Last updated: April 20, 2026_