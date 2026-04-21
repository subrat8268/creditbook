# KredBook — Export Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Export** screen allows users to download a CSV backup of all their data. It's accessed from the Profile screen.

**Primary Goals**:
1. **Export data** — Download all entries as CSV
2. **Privacy assurance** — Show that data stays on device

**User Behavior**:
- Navigate to Export from Profile
- Tap "Download CSV Backup"
- File saves to device / opens share sheet
- Open in Excel or Google Sheets

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, ~56dp)                     │
│ [←] Backup & Download                    │
│     Export all your entries                 │
├─────────────────────────────────────────────┤
│ SCROLLABLE CONTENT                       │
│ ┌─────────────────────────────────────────┐ │
│ │ DOWNLOAD CARD                        │ │
│ │ DOWNLOAD                             │ │
│ │                                     │ │
│ │ [Download CSV Backup button]          │ │
│ │                                     │ │
│ │ Exports all your entries (bills,     │ │
│ │ customers, payments). Open in Excel │ │
│ │ or Google Sheets.                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ INFO BANNER                          │ │
│ │ [i] Your data is never shared.        │ │
│ │ Files are saved only to your device.     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Header

| Element | Spec |
|---------|------|
| Container | flex-row, align-center, px-4 py-4, bg-surface, border-bottom |
| Back button | ArrowLeft, 22dp, textPrimary, hitSlop 8 |
| Back btn width | 36dp, centered |
| Title area | flex-1, centered |
| Title | 16px, cardTitle weight, textPrimary |
| Subtitle | 12px, textSecondary, marginTop 1 |

**Title/Subtitle**:
| Element | Text |
|---------|------|
| Title | "Backup & Download" |
| Subtitle | "Export all your entries" |

### 2. ScrollView

| Element | Spec |
|---------|------|
| Style | flex-1 |
| Content container | p-4, pb-6, gap-4 |
| showsVerticalScrollIndicator | false |

### 3. Download Card

| Element | Spec |
|---------|------|
| Container | bg-surface, rounded-2xl, p-4, shadow |
| Shadow | elevation 2, opacity 0.04 |
| Section label | "DOWNLOAD", 11px overline, textSecondary, uppercase |

### 4. Download Button

| Element | Spec |
|---------|------|
| Container | flex-row, align-center, justify-center, gap-2.5, bg-primary, rounded-xl, py-4, px-5 |
| When loading | opacity 0.6 |
| Icon | Download, 20dp, surface |
| Text | "Download CSV Backup", 16px, bold, surface |
| When loading | ActivityIndicator small, surface |

**States**:

| State | Display |
|-------|----------|
| Default | Download icon + "Download CSV Backup" text |
| Loading | ActivityIndicator (no icon, no text) |

### 5. Help Text

| Element | Spec |
|---------|------|
| Container | Below button, mt-3 |
| Text | 13px, textSecondary, lineHeight 18 |
| Content | "Exports all your entries (bills, customers, payments). Open in Excel or Google Sheets." |

### 6. Info Banner

| Element | Spec |
|---------|------|
| Container | flex-row, align-start, bg-primaryBlueBg, border, rounded-xl, p-3, gap-2 |
| Icon | Info, 16dp, fab color |
| Text | flex-1, 13px, fab color, lineHeight 18 |
| Content | "Your data is never shared. Files are saved only to your device." |

**Info Banner Colors**:
| Element | Color |
|---------|-------|
| Background | primaryBlueBg (#EFF6FF) |
| Icon | fab (#2563EB) |
| Text | fab (#2563EB) |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Primary | #22C55E | primary |
| Surface | #FFFFFF | surface |
| Background | #F6F7F9 | background |
| Border | #E2E8F0 | border |
| FAB | #2563EB | fab |
| Primary Blue BG | #EFF6FF | primaryBlueBg |

### Typography (from theme.ts)

| Element | Weight | Size |
|---------|--------|------|
| Header title | Bold | 16px |
| Header subtitle | Regular | 12px |
| Button text | Bold | 16px |
| Help text | Regular | 13px |
| Info text | Regular | 13px |
| Section label | Bold | 11px |

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
| Back arrow | Navigate back to Profile |
| Download button | Fetch data → Generate CSV → Share |

### Export Flow

1. User taps "Download CSV Backup"
2. Show loading state
3. Fetch all export rows via `fetchOrdersForExport(vendorId)`
4. Convert to CSV via `toCsv(rows)`
5. If no data: Alert "No data", show "You have no entries to export."
6. Generate filename: `creditbook_backup_{YYYY-MM-DD}.csv`
7. Share via `shareCsv(csv, filename)`
8. On error: Alert "Export failed"

### Error Handling

| Scenario | Alert Title | Alert Message |
|----------|------------|-------------|
| No data to export | "No data" | "You have no entries to export." |
| Export failed | "Export failed" | err?.message or "Something went wrong." |

---

## States

### Loading States

| State | Button Shows |
|-------|------------|
| Exporting | ActivityIndicator, disabled button |

### Empty States

| Scenario | Message |
|----------|---------|
| Zero entries | "No data" alert on tap |

---

## Edge Cases

### No Entries
- Alert "No data" when trying to export
- Do not generate empty file

### Very Large Dataset
- Loading state visible during fetch
- CSV generation may take time

### Filename Format
- Date format: `creditbook_backup_2026-04-20.csv`

### Network Offline
- Works offline (local data only)
- Data stored locally in Supabase/MMKV

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| Download button | VoiceOver "Download CSV Backup button" |
| Info banner | VoiceOver reads privacy message |

---

## Performance

| Metric | Target |
|--------|--------|
| Screen render | < 200ms |
| Export (1000 entries) | < 2s |
| Share sheet | Native |

---

## Implementation Checklist

- [x] Header with back button
- [x] Title "Backup & Download"
- [x] Subtitle "Export all your entries"
- [x] Download card with section label
- [x] Download CSV button (primary)
- [x] Loading state with ActivityIndicator
- [x] Help text below button
- [x] Info banner with privacy message
- [x] CSV generation via toCsv
- [x] Filename with date
- [x] Share via shareCsv
- [x] Error handling with alerts
- [x] No data handling

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens |
| `docs/flows.md` | Navigation reference |
| `docs/flows/profile.md` | Triggered from Profile |
| `app/(main)/export/index.tsx` | Screen implementation |
| `src/utils/exportCsv.ts` | CSV generation |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Date range filter** — Export only specific dates
2. **Selective export** — Choose what to include (entries, customers, payments)
3. **PDF export** — Alternative format
4. **Email export** — Send directly via email

---

_Last updated: April 20, 2026_
