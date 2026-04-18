# KredBook — Current Status

**Last Updated:** April 18, 2026

## Version

**KredBook v3.0** — Simple Digital Khata

---

## What's Implemented

### Core Features (v3.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Working | Email + Google OAuth |
| Dashboard | ✅ Working | Total outstanding + top 3 overdue |
| People/Customers | ✅ Working | Add, list, search |
| Customer Detail | ✅ Working | Hero card, CTAs, transaction list |
| Entries | ✅ Working | Create, list, detail |
| Payments | ✅ Working | Record, history |
| Profile | ✅ Working | Business name, language, export, sign out |
| Offline-first | ✅ Working | MMKV queue, auto-sync |
| Localization | ✅ Working | EN/HI toggle |
| Export | ✅ Working | CSV export |

### Navigation Structure

- **5 tabs**: Home → People → Add (FAB) → Entries → Profile
- **More sheet**: Profile Settings, Export, Sign Out

---

## What's NOT in Scope v3.0

| Feature | Status | Reason |
|---------|--------|--------|
| Suppliers | ❌ Removed | No longer needed |
| Products Catalog | ❌ Removed | Quick amount only |
| Reports | ❌ Removed | Single number is enough |
| GST | ❌ Removed | Not for small businesses |
| Multi-user | ❌ Removed | Single user app |
| Notifications | ❌ Removed | Future feature |

---

## Cleanup Performed (April 18, 2026)

### Deleted Unused Files

**Components (10 files removed):**
- `src/components/orders/` (8 files) - order components from v2
- `src/components/onboarding/` (1 file) - unused onboarding
- `src/components/SearchablePickerModal.tsx` (1 file) - orphaned utility

**Types (1 file removed):**
- `src/types/supplier.ts` - unused supplier type definition

### Current Component Count

- Before: 44 component files
- After: 34 component files

---

## Performance Optimizations (April 18, 2026)

### FlatList Optimizations

| Component | Fix Applied |
|-----------|-------------|
| `CustomerPicker.tsx` | Added initialNumToRender=8, maxToRenderPerBatch=10, windowSize=5, removeClippedSubviews |
| `BottomSheetPicker.tsx` | Added initialNumToRender=12, maxToRenderPerBatch=10, windowSize=5 |

### React.memo Applied

**List Items (Critical):**
- `CustomerCard.tsx` - memo wrapped
- `ActivityRow.tsx` - memo wrapped
- `EntryCard.tsx` (inline in entries/index.tsx) - memo wrapped

**Headers:**
- `DashboardHeader.tsx` - memo + useMemo for derived values
- `CustomersHeader.tsx` - memo wrapped

**UI Components:**
- `Button.tsx` - memo wrapped
- `Input.tsx` - memo wrapped
- `SearchBar.tsx` - memo wrapped
- `Card.tsx` - memo wrapped
- `Avatar.tsx` - memo wrapped
- `StatusBadge.tsx` - memo wrapped

**Feedback/Modals:**
- `EmptyState.tsx` - memo wrapped
- `ConfirmModal.tsx` - memo wrapped

### Result

- Reduced unnecessary re-renders across all list items and UI components
- Optimized FlatList rendering for large lists (people, entries, pickers)
- Target: 60fps smooth scrolling

---

## UX Micro-interactions (April 18, 2026)

### New Components

| Component | Purpose |
|-----------|---------|
| `Skeleton.tsx` | Shimmer loading placeholders with pulse animation |
| `SkeletonCard` | Pre-built skeleton for list items |
| `SkeletonList` | Loading state for FlatList |

### Enhanced Components

| Component | Enhancement |
|-----------|-------------|
| `Button.tsx` | Press feedback with scale animation (spring to 0.96) |
| `Toast.tsx` | Icon bounce animation on show |
| `EmptyState.tsx` | Fade-in animation on mount |

### Implementation

- Button: Uses Animated.spring for tactile press feel
- Toast: Icon scales from 0.5 → 1 with bounce
- EmptyState: 400ms fade-in on mount
- Skeleton: 1200ms shimmer loop with opacity interpolation

---

## Architecture Notes

- Routes use `/entries/` (NOT `/orders/`)
- Main tab FAB points to `/entries/create`
- "People" = Customers (unified)
- Quick amount-first entry (no product picker)

---

## Updates Required

When making changes to the product:

1. **Update this STATUS.md** with feature status
2. **Update PRD** if scope changes
3. Keep documentation in sync with implementation

**Rule:** If it's not needed to track credit between two people, it's not in scope.

---

## Documentation Rule

> **When any major change is made to the product, update this document.**

**What to update:**

| If you... | Then update... |
|----------|----------------|
| Add a new feature | PRD §3 (Key Features) + STATUS |
| Remove a feature | PRD §6 (What's NOT in Scope) + STATUS |
| Change navigation | PRD §4 (Core Screens) + STATUS |
| Change architecture | ARCHITECTURE.md + STATUS |

**Always keep:**
- This STATUS.md in sync with implementation
- PRD aligned with product scope
- Architecture docs match code