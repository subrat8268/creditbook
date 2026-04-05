# KredBook Design Sync Audit Log

This document tracks all visual discrepancies found during the one-by-one screen audit, and how they were systematically fixed by mapping them to the `theme.ts` single source of truth.

---

## Phase 1: The Ledger Core

### 1. Dashboard (`app/(main)/dashboard/index.tsx`)
_Status: ✅ Done_
- Discrepancies Found: Hero card lacked gradient mapping, FAB drop shadow used a raw hex code (`#2563EB`), Top-level view was missing `SafeAreaView` causing notch collision, FAB dimensions were slightly large (64px).
- Fixes Applied: 
  - Substituted raw hex from FAB shadow with `colors.fab` token mapping.
  - Sized FAB correctly mapped to 56px (`w-14 h-14`) and positioned (`bottom-6`, `right-5`).
  - Wrapped parent component in `SafeAreaView` with `edges={["top"]}` to respect device status bars.
  - Linked the Hero Card background firmly to the `gradients.netPosition` explicit design.

### 2. Customers List (`app/(main)/customers/index.tsx`)
_Status: ✅ Done_
- Discrepancies Found: Pill-based filter tabs conflicted with underline tabs in list, duplicated filter state control across components, presence of extensive structural raw hex codes (`#111827`, `#AEAEB2`, `#FFFFFF`), and deterministic avatar color list mapped manually via hexes.
- Fixes Applied:
  - Eliminated conflicting pill-shaped filters in `index.tsx`; delegated exclusively to `CustomerList.tsx`'s underline tabs to match the "Pill search bar + underline tabs" specification.
  - Smashed raw hex codes gracefully across `CustomerList.tsx`, `CustomerCard.tsx`, `SearchBar.tsx`, `NewCustomerModal.tsx`, and `ContactsPickerModal.tsx`, mapping correctly to NativeWind token references via `colors.textSecondary`, `colors.successBg`, and `colors.surface`.
  - Re-anchored `NewCustomerModal.tsx`'s manual avatar palette array to use the central `theme.ts`'s `colors.avatarPalette` tokens dynamically.
  - Aligned native Status Bar rendering against the UI specification (transparent).
  - Corrected a TypeScript schema drift on `addCustomerMutation` missing phone number defaults.

### 3. Customer Detail (`app/(main)/customers/[customerId].tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - `bg-white` (hardcoded) used on Header, Footer, Action Buttons, and TransactionRow instead of `bg-surface`.
  - `shadowColor: "#000000"` x3 on action buttons — structural hex violation.
  - Gradient end color for danger card used orphaned hex `#B33226` (unlisted in design system).
  - Footer Download PDF button used two unlisted hexes: `#1C2333` (active state) and `#F1F5F9` (inactive).
  - `MessageCircle` and `Download` icons + footer labels used `"#FFFFFF"` raw hex.
  - Critical TS type mismatch: `RecordCustomerPaymentModal` is a `forwardRef<BottomSheetModal>` but parent was calling with `visible/onClose` props that don't exist — broken API contract.
- Fixes Applied:
  - Replaced all `bg-white` references in structural containers with `bg-surface` NativeWind token.
  - Mapped all `shadowColor: "#000000"` to `colors.textPrimary`.
  - Danger gradient end mapped from `#B33226` → `colors.danger` (with start using `colors.dangerStrong`).
  - Added `gradients` export to imports; mapped Download button active bg from `#1C2333` → `gradients.netPosition`, inactive bg from `#F1F5F9` → `colors.background`.
  - All `"#FFFFFF"` icon/text refs replaced with `colors.surface`.
  - **Architecture fix**: Migrated parent screen from state-based visibility (`visible/onClose`) to `ref.current?.present()` / `ref.current?.dismiss()` API, matching the `BottomSheetModal` forwardRef interface exactly. TypeScript error eliminated.
