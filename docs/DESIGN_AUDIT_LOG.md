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

### 4. Orders List (`app/(main)/orders/index.tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - Screen-level `SafeAreaView` using inline `style` prop instead of NativeWind `className`.
  - `OrderList.tsx`: `shadowColor: "#000000"` on order cards, `color: "#6B7280"` on "Loading more" footer text.
  - `FloatingActionButton.tsx` (shared): `color={"#FFFFFF"}` on Plus icon, `shadowColor: "#000000"` in StyleSheet.
- Fixes Applied:
  - `SafeAreaView` converted to `className="flex-1 bg-background"` for NativeWind consistency.
  - `OrderList.tsx` shadow hex mapped to `colors.textPrimary`; footer text color mapped to `colors.textSecondary`.
  - `FloatingActionButton.tsx` Plus icon color mapped to `colors.surface`; shadow mapped to `colors.textPrimary`.
  - **Ripple effect**: `FloatingActionButton` is a shared component — this fix propagates to every screen using the FAB.

### 5. Create Bill / New Order (`app/(main)/orders/create.tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - `create.tsx` itself: ✅ Already clean — NativeWind classes and `colors.*` tokens used correctly throughout.
  - `OrderBillSummary.tsx`: `backgroundColor: "#FFFFFF"` x2 (Other Charges card, Summary card), `shadowColor: "#000000"` x2.
  - `OrderItemCard.tsx`: `color={"#AEAEB2"}` on the X (remove) icon.
  - `BillFooter.tsx`: ✅ Already clean.
- Fixes Applied:
  - `OrderBillSummary.tsx`: Both card `backgroundColor` mapped to `colors.surface`; both `shadowColor` mapped to `colors.textPrimary`.
  - `OrderItemCard.tsx`: X icon color mapped from `"#AEAEB2"` to `colors.textSecondary`.
  - **Ripple effect**: `OrderBillSummary` and `OrderItemCard` are shared components — fixes propagate to Order Detail screen as well.

### 6. Order Detail (`app/(main)/orders/[orderId].tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - `STATUS_STYLES` object: all 4 entries used raw hex pairs duplicating what `colors.paid/partial/pending/overdue` already hold.
  - `PAYMENT_MODE_COLORS` object: all 5 entries used orphaned hex pairs not in the design system.
  - `AVATAR_COLORS` array: 5 raw hex values mixed with 3 `colors.*` refs — duplicated `colors.avatarPalette`.
  - `SHADOW` constant: `shadowColor: "#000"`.
  - `SafeAreaView`: `style={{ flex: 1, backgroundColor: colors.background }}` instead of `className`.
  - `RecordCustomerPaymentModal`: same broken `visible/onClose` API contract as Customer Detail — modal was never actually appearing.
- Fixes Applied:
  - `STATUS_STYLES` keys mapped to `colors.paid/partial/pending/overdue` token objects — zero hex literals remain.
  - `PAYMENT_MODE_COLORS` mapped to existing semantic tokens: Cash→paid, UPI→partial, NEFT→overdue.bg+warning, Draft→pending, Cheque→successBg+primaryDark.
  - `AVATAR_COLORS` collapsed to `[colors.danger, colors.warning, colors.primary, ...colors.avatarPalette]` — matches identical pattern in `OrderList.tsx`.
  - `SHADOW.shadowColor`: `"#000"` → `colors.textPrimary`.
  - `SafeAreaView` converted to `className="flex-1 bg-background"`.
  - **Architecture fix**: `paymentModalVisible` state + `setPaymentModalVisible` calls replaced with `paymentModalRef = useRef<any>()`, `ref.current?.present()` on button press, `ref.current?.dismiss()` on success. `useState` import kept for `sendingBill` state.
  - **Bonus fix**: `BillItem` map in `handleSendBill` was missing `rate` and `amount` fields causing a TS error — added both mapped from `i.price` and `i.subtotal`.

### 7. Products List (`app/(main)/products/index.tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - `products/index.tsx`: Missing `colors` import; `placeholderTextColor="#9ca3af"` raw hex; FAB `shadowColor: "#16A34A"` (orphaned green hex).
  - `ProductCard.tsx`: `bg-[#FFEDD5]` + `text-[#EA580C]` (warning); `bg-[#E0F2FE]` + `text-[#0284C7]` (blue) — arbitrary JIT hex classes; `shadowColor: "#000"`; icon colors via NativeWind `className` (unsupported by lucide — requires `color` prop).
  - `ProductActionsModal.tsx`: `bg-white`, `border-neutral-300` ×2, `color="white"` ×2, `text-white` ×2, `text-neutral-900`, `rounded-lg/rounded-md`.
- Fixes Applied:
  - `products/index.tsx`: Added `colors` import; `placeholderTextColor` → `colors.textSecondary`; FAB shadow → `colors.primaryDark`.
  - `ProductCard.tsx`: Added `colors` import; warning theme → `bg-warningBg`+`colors.warning`; blue theme → `bg-successBg`+`colors.primaryDark`; danger → `bg-dangerBg`; all icon colors switched from `className` to explicit `color={themeClass.iconColor}` prop; `shadowColor` → `colors.textPrimary`.
  - `ProductActionsModal.tsx`: `bg-white`→`bg-surface`; `border-neutral-300`→`border-border` ×2; `color="white"`→`colors.surface` ×2; `text-white`→`text-surface` ×2; `rounded-lg`→`rounded-2xl`; `text-neutral-900`→`text-textPrimary`.

### 8. Product Detail (`app/(main)/products/[productId].tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - Root container used `bg-surface` instead of `bg-background` — structural inconsistency with all other screens.
  - 7 lucide icons (ArrowLeft, Pencil, Package, Minus, Plus, ShoppingCart) using NativeWind `className` for color — lucide-react-native **ignores** NativeWind className; these icons were rendering in default black regardless of theme.
  - No raw hex codes found — file was otherwise well written.
  - `NewProductModal.tsx`: ✅ Already clean (no hex codes, no color prop issues).
- Fixes Applied:
  - Root `<View className="flex-1 bg-surface">` → `bg-background`.
  - Added `colors` import from `@/src/utils/theme`.
  - All 7 icon `className` color attributes replaced with explicit `color={colors.*}` props:
    - ArrowLeft → `colors.textPrimary`
    - Pencil (edit) → `colors.textSecondary`
    - Package (placeholder) → `colors.textSecondary` + `style={{ opacity: 0.4 }}`
    - Minus, Plus (stepper) → `colors.textPrimary`
    - Minus, Plus (stepper) → `colors.textPrimary`
    - ShoppingCart (CTA) → `colors.surface`

### 9. Suppliers List (`app/(main)/suppliers/index.tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - `suppliers/index.tsx`: `SafeAreaView` using inline `style={}` instead of `className`; `"#FCE7F3"` (pink-100) on "I Owe" badge bg; `"#FDF2F8"` (pink-50) on summary panel inner bg — both orphaned, no tokens existed.
  - `SupplierCard.tsx`: `AVATAR_BG` array (8 raw hex values) + `AVATAR_TEXT` array (6 raw hex + 2 `colors.*`) — all orphaned; `bg-[#FDF2F8]` JIT hex class on payable status badge.
  - `SupplierList.tsx`: ✅ Already clean — uses `colors.*` throughout.
  - `NewSupplierModal.tsx`: ✅ Already clean — no hex codes found.
- Fixes Applied:
  - **Theme extended**: Added `colors.supplierAvatarBg[]`, `colors.supplierAvatarText[]`, `colors.supplierBg`, `colors.supplierBadgeBg` to `src/utils/theme.ts` — these are now the canonical source of truth for all supplier-specific palette values.
  - `suppliers/index.tsx`: `SafeAreaView` → `className="flex-1 bg-background"`; `#FCE7F3` → `colors.supplierBadgeBg`; `#FDF2F8` → `colors.supplierBg`.
  - `SupplierCard.tsx`: `AVATAR_BG` → `colors.supplierAvatarBg`; `AVATAR_TEXT` → `colors.supplierAvatarText` (removed 14 raw hex literals in one shot); `bg-[#FDF2F8]` → `style={{ backgroundColor: colors.supplierBg }}` with conditional application.

### 10. Supplier Detail (`app/(main)/suppliers/[supplierId].tsx`)
_Status: ✅ Done_
- Discrepancies Found:
  - `HERO_GRADIENT` constant: `["#BE2D5C", "#E8427D"]` — unique rose gradient not in theme; closest token is `gradients.supplierHero` but shades differ.
  - `TimelineRow`: `bg-white` on card root; `shadowColor: "#000000"`.
  - `renderHeader`: `bg-white` on bank card; `backgroundColor: "#EFF6FF"` on bank icon bg (≈ `supplierAvatarBg[0]`); `color={"#4F9CFF"}` on Building2 icon (= `avatarPalette[0]`); `bg-white` ×2 on action strip buttons.
  - `SafeAreaView`: `style={{ backgroundColor: colors.background }}` (should be className).
  - Custom header bar: `bg-white` → `bg-surface`.
  - Gradient card rgba values (`rgba(255,255,255,0.75/0.8)`) and `#FFFFFF` kept — overlay transparency on colored bg has no theme token equivalent.
  - `RecordDeliveryModal.tsx`: ✅ Already clean.
  - `RecordPaymentMadeModal.tsx`: ✅ Already clean.
- Fixes Applied:
  - **Theme extended**: Added `gradients.supplierDetailHero` to `src/utils/theme.ts` for the unique rose gradient.
  - `HERO_GRADIENT` → `[gradients.supplierDetailHero.start, gradients.supplierDetailHero.end]`.
  - `TimelineRow` root: `bg-white` → `bg-surface`; `shadowColor: "#000000"` → `colors.textPrimary`.
  - Bank details card: `bg-white` → `bg-surface`.
  - Bank icon: `backgroundColor: "#EFF6FF"` → `colors.supplierAvatarBg[0]`; `color={"#4F9CFF"}` → `colors.avatarPalette[0]`.
  - Action strip buttons ×2: `bg-white` → `bg-surface`.
  - `SafeAreaView`: merged `style={}` into `className="flex-1 bg-background"`.
  - Custom header: `bg-white` → `bg-surface`.
