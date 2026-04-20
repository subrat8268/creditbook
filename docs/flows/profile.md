# KredBook — Profile Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Profile** screen is the settings and account management screen. It's where users manage their business details, bank account, language preferences, and export data.

**Primary Goals**:
1. **View profile** — See business details at a glance
2. **Edit profile** — Update business name, GST, UPI, bank details
3. **Set preferences** — Language toggle (EN/HI)
4. **Export data** — Download CSV backup
5. **Sign out** — Securely sign out of the app

**User Behavior**:
- Tap profile tab → View business details
- Tap "Edit Profile" → Update business information
- Toggle language → Switch between English and Hindi
- Tap "Export All Data" → Download CSV
- Tap "Sign Out" → Confirm and sign out

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, 56dp)                       │
│ [←] Profile & Settings                  [ ]   │
├─────────────────────────────────────────────┤
│ SCROLLABLE CONTENT                         │
│ ┌─────────────────────────────────────────┐ │
│ │ AVATAR SECTION                       │ │
│ │         [Avatar Circle]              │ │
│ │        Business Name               │ │
│ │        email@example.com           │ │
│ │     [Edit Profile button]          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ BUSINESS DETAILS                       │ │
│ │ NAME          Business Name        [>]  │ │
│ │ GSTIN         27AABCU9603R1ZM    [>]  │ │
│ │ PREFIX        INV               [>]  │ │
│ │ UPI ID       upi@bank           [>]  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ BANK ACCOUNT                          │ │
│ │ BANK NAME     HDFC Bank          [>]  │ │
│ │ ACC NO        **** **** 1234    [>]  │ │
│ │ IFSC         HDFC0XXXXXX       [>]  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ APP PREFERENCES                       │ │
│ │ Language        [EN] [Hindi]         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ SUPPORT                              │ │
│ │ HELP          Contact Support   [>]   │ │
│ │ ABOUT        KredBook v1.0.0     [>]   │ ��
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ DATA                                  │ │
│ │ Export All Data     CSV backup   [>]    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ SIGN OUT                             │ │
│ │        [Sign Out button]              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ KredBook Systems • v1.0.0                  │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header (56dp height)

| Element | Spec |
|---------|------|
| Back button | ArrowLeft, 24dp, textPrimary |
| Title | "Profile & Settings", 18px extrabold, textPrimary |
| Right spacer | 40dp (for balance) |

### 2. Avatar Section

| Element | Spec |
|---------|------|
| Container | items-center, py-4, mb-4 |
| Avatar circle | 80×80dp (w-20 h-20), rounded-full, border-4, bg-success, border-successLight |
| Initials | 28px black, white |
| Business name | 20px black, textPrimary |
| Email | 14px semibold, textSecondary |
| Edit button | px-8 py-2, border-2 border-primary, rounded-full |

**Edit Button**:
- Text: "Edit Profile", 14px bold, primary
- Border: 2dp primary
- Tap action: Navigate to /profile/edit

### 3. SectionCard (Reusable)

| Element | Spec |
|---------|------|
| Container | px-4 pt-4 pb-2 mb-4, border shadow-sm, bg-surface, rounded-2xl, border-border |
| Section label | 11px font-bold uppercase, tracking-widest, mb-3 |
| Section title format | e.g., "BUSINESS DETAILS", "BANK ACCOUNT" |

### 4. DetailRow (Reusable)

| Element | Spec |
|---------|------|
| Container | flex-row, items-center, py-3, border (except last) |
| Icon container | w-10 h-10, rounded-xl, bg-primaryLight |
| Icon | 20dp, primary, strokeWidth 2 |
| Left margin | ml-3 |
| Label | 10px font-bold uppercase, tracking-wide, mb-0.5, textSecondary |
| Value | 14px font-bold, textPrimary, ellipsis |
| Right chevron | ChevronRight, 18dp, textSecondary, strokeWidth 2 |

**DetailRow Variants**:

| Icon | Label | Value Source | Tap Action |
|------|-------|-------------|------------|
| Store | NAME | profile.business_name | Navigate to edit |
| Receipt | GSTIN | profile.gstin | Navigate to edit |
| Hash | PREFIX | profile.bill_number_prefix | Navigate to edit |
| Smartphone | UPI ID | profile.upi_id | Navigate to edit |
| Building2 | BANK NAME | profile.bank_name | Navigate to edit |
| CreditCard | ACC NO | maskAccount() | Navigate to edit |
| Info | IFSC | profile.ifsc_code | Navigate to edit |
| Download | Export All Data | "CSV backup" | Navigate to /export |
| HelpCircle | HELP | "Contact Support" | Alert |
| Info | ABOUT | "KredBook v1.0.0" | Alert |

### 5. Language Toggle

| Element | Spec |
|---------|------|
| Container | flex-row, justify-between, py-2, mb-2 |
| Left section | flex-row, items-center, gap-3 |
| Icon container | w-10 h-10, rounded-xl, bg-primaryLight |
| Label | 15px bold, textPrimary |
| Right section | flex-row, gap-2 |

**Language Buttons**:

| State | Background | Text | Border |
|------|------------|------|--------|
| EN active | primary | surface | primary |
| EN inactive | background | textSecondary | border |
| HI active | primary | surface | primary |
| HI inactive | background | textSecondary | border |

**Language Button**:
- Padding: py-2 px-4 (EN), py-2 px-3 (HI)
- Border radius: xl
- Text: "EN" or Hindi flag emoji

### 6. Sign Out Button

| Element | Spec |
|---------|------|
| Container | mt-2 mb-4, border shadow-sm, bg-surface, rounded-2xl, border-border |
| Button | flex-row, items-center, justify-center, gap-2, py-4 |
| Icon | LogOut, 20dp, danger, strokeWidth 2.5 |
| Text | 16px extrabold, danger |

### 7. Footer Text

| Element | Spec |
|---------|------|
| Text | 12px semibold, textSecondary, text-center, mt-2, mb-4, opacity-50 |
| Content | "KredBook Systems • v1.0.0" |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Primary | #22C55E | primary |
| Primary Light | #DCFCE7 | primaryLight |
| Success | #22C55E | success |
| Success Light | #DCFCE7 | successLight |
| Danger | #EF4444 | danger |
| Surface | #FFFFFF | surface |
| Background | #F6F7F9 | background |
| Border | #E2E8F0 | border |

### Typography (from theme.ts)

| Element | Weight | Size |
|---------|--------|------|
| Header title | ExtraBold | 18px |
| Avatar initials | Black | 28px |
| Business name | Black | 20px |
| Section label | Bold | 11px |
| Detail label | Bold | 10px |
| Detail value | Bold | 14px |
| Toggle label | Bold | 15px |
| Sign out | ExtraBold | 16px |
| Footer | SemiBold | 12px |

### Spacing (from design-system.md)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4dp | Tight gaps |
| sm | 8dp | Chip padding |
| md | 16dp | Screen padding |
| lg | 24dp | Section spacing |

---

## Interactions

### Tap Behaviors

| Element | Action |
|---------|--------|
| Back arrow | Navigate back |
| Edit Profile | Navigate to /profile/edit |
| Detail row (tappable) | Navigate to edit screen |
| Export All Data | Navigate to /export |
| Help | Show Alert |
| About | Show Alert |
| Sign Out | Show confirm Alert |
| EN language | Switch to English |
| HI language | Switch to Hindi |

### Navigation Flows

**From Profile**:
- Edit Profile → /profile/edit
- Export → /export

### Alert Dialogs

**Sign Out Confirmation**:
```
Title: "Sign Out"
Message: "Are you sure you want to sign out?"
Buttons: "Cancel" (cancel), "Sign Out" (destructive)
```

**Help**:
```
Title: "Help & Support"
Message: "Contact us at support@kredbook.in"
```

**About**:
```
Title: "About KredBook"
Message: "KredBook v1.0.0\nBuilt for Indian kirana stores and small businesses."
```

---

## States

### Loading States

| State | Display |
|-------|----------|
| Initial load | ActivityIndicator centered |
| No profile | Shows activity indicator |

### Auth States

| State | Display |
|-------|----------|
| Not logged in | Redirects to login (handled by auth guard) |
| Profile loading | ActivityIndicator |

### Interaction States

| Action | Feedback |
|--------|----------|
| Language toggle | Instant (no loading) |
| Sign out | Alert confirm |
| Export | Navigate to export screen |

---

## Edge Cases

### No Business Name
- Show "Your Business" as default
- Avatar shows "CB" initials

### No Email
- Hide email line entirely
- Show only business name

### No Bank Details
- Show "—" for masked value
- Click triggers edit navigation (empty fields can be filled)

### No GSTIN
- Show "—" 
- Click triggers edit

### No UPI ID
- Show "—"
- Click triggers edit

### Masked Account Number
- Format: "**** **** {last4}"
- If ≤ 4 digits: show as-is

### Very Long Business Name
- Truncate with ellipsis
- Full name shown in edit screen

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| All rows | Minimum 44dp touch target |
| Language toggle | VoiceOver reads current language |
| Sign out | VoiceOver "Sign out button" |

---

## Performance

| Metric | Target |
|--------|--------|
| Initial render | < 200ms |
| Language switch | Instant |

---

## Implementation Checklist

- [x] Header with back button and title
- [x] Avatar section with initials and business name
- [x] Edit Profile button (pill style)
- [x] SectionCard component (reusable)
- [x] DetailRow component (reusable)
- [x] Business details section (name, GSTIN, prefix, UPI)
- [x] Bank account section (bank name, account, IFSC)
- [x] Language toggle (EN/HI)
- [x] Support section (help, about)
- [x] Export data row
- [x] Sign out button (danger)
- [x] Footer version text
- [x] Alert dialogs (help, about, sign out)
- [x] Masked account number

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens |
| `docs/flows.md` | Navigation reference |
| `app/(main)/profile/index.tsx` | Screen implementation |
| `app/(main)/profile/edit.tsx` | Edit screen |
| `app/(main)/export/index.tsx` | Export screen |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Profile picture** — Upload business logo
2. **Multiple businesses** — Handle multiple stores
3. **Dark mode** — Theme toggle
4. **Notification settings** — Push notification preferences

---

_Last updated: April 20, 2026_