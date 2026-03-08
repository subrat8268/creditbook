# CreditBook — Final Pre-Fix Audit Report

> **Date:** March 8, 2026  
> **Sources:** UI_AUDIT.md · DATABASE_REPORT.md · SCREEN_INVENTORY.md · ARCHITECTURE.md  
> **Total issues:** 38 (8 Critical · 15 Major · 15 Minor)  
> **Status:** DO NOT fix anything until issues are triaged and assigned.

---

## 🔴 CRITICAL — Fix Before Anything Else

These are breaking bugs. Features either crash, return wrong data, or behave differently from what the user sees on screen.

---

### ✅ C-01 — Supplier Module RLS — FIXED (March 8, 2026)

**Files:** `schema.sql` — all 4 supplier table RLS policies  
**Category:** Broken data / silent failure

All 4 supplier table RLS policies have been corrected from:

```sql
USING (vendor_id = auth.uid())  -- WRONG: compared profiles.id against auth.users.id
```

to the correct join-through-profiles pattern:

```sql
USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
```

Policies renamed to `"Vendors can manage own suppliers/deliveries/delivery items/payments made"`. Applied via Supabase SQL Editor. `schema.sql` updated to match.

---

### ✅ C-02 — Order Search — FIXED (March 8, 2026)

**File:** `src/api/orders.ts` → `fetchOrders()`  
**Category:** Incorrect calculation / broken feature

Fixed with a join-aware query and Supabase dot-notation `.or()` filter:

```typescript
// selectClause dynamically uses !inner when a search string is present
const selectClause = search?.trim()
  ? "*, customers!inner(id, name, phone)"
  : "*, customers(id, name, phone)";

// .or() now references the joined customers table using dot notation
query = query.or(
  `bill_number.ilike.${searchTerm},customers.name.ilike.${searchTerm},customers.phone.ilike.${searchTerm}`,
);
```

`!inner` ensures only orders with a matching customer are returned. Searching by bill number, customer name, or phone now works correctly.

---

### ✅ C-03 — Export Feature Crashes at Runtime — FIXED (March 8, 2026)

**File:** `src/api/export.ts` → `fetchPaymentsForExport()`  
**Category:** Breaking UI / runtime error

`reference` removed from the select — column does not exist in the `payments` schema. Select updated to include `total_amount` for completeness:

```typescript
.select(`payment_date, amount, payment_mode,
  orders ( bill_number, total_amount, customers ( name, phone ) )`)
```

`ExportPayment` interface updated: `reference: string` field removed.  
`Payment` interface in `orders.ts` updated: `created_at: string` field added (DB column was missing from the type).

---

### ✅ C-04 — Product Variants Never Load — FIXED (March 8, 2026)

**Files:** `src/api/products.ts`, `src/components/products/ProductCard.tsx`, `src/components/products/NewProductModal.tsx`, `src/components/picker/VariantPicker.tsx`  
**Category:** Breaking UI / incorrect data

Four changes applied:

1. **`src/api/products.ts`** — `fetchProducts()` select updated to join `product_variants`:

   ```typescript
   .select(`id, vendor_id, name, base_price, image_url, created_at,
     product_variants ( id, variant_name, price, created_at )`)
   ```

   Return value maps `product_variants` → `variants` so all existing consumers need no field rename.

2. **`ProductVariant` interface** — aligned to DB column names:

   ```typescript
   interface ProductVariant {
     id: string;
     variant_name: string;
     price: number;
     created_at: string;
   }
   ```

3. **`ProductCard.tsx`** — `variant.name` → `variant.variant_name`

4. **`NewProductModal.tsx`** — Formik field keys updated: `variants[n].name` → `variants[n].variant_name`

5. **`VariantPicker.tsx`** — local `Variant` interface renamed `name` → `variant_name`; all filter/render/select call sites updated

---

### ✅ C-05 — `dashboard_mode` Constraint Mismatch — FIXED (March 8, 2026)

**Files:** `schema.sql`, `src/types/auth.ts`, `src/screens/DashboardScreen.tsx`, `app/(auth)/onboarding/role.tsx`  
**Category:** Breaking UI / incorrect data

All four layers aligned to the DB CHECK constraint `('seller', 'distributor', 'both')`:

1. **`src/types/auth.ts`** — `dashboard_mode` narrowed to `"seller" | "distributor" | "both" | null`
2. **`app/(auth)/onboarding/role.tsx`** — `dashboardModeFor()` replaced with:
   ```typescript
   const MODE_MAP = {
     retailer: "seller",
     wholesaler: "distributor",
     "small-business": "seller",
   } as const;
   ```
   Third role renamed from `"user"` → `"small-business"` / "Small Business Owner".
3. **`src/screens/DashboardScreen.tsx`** — mode constants replaced:
   ```typescript
   const isSellerMode = mode === "seller";
   const isDistributor = mode === "distributor";
   const isBothMode = mode === "both";
   ```
   All `isVendorMode` references replaced with `isSellerMode`. `roleLabel` block updated to `"CreditBook Distributor"` / `"CreditBook Business"` / `"CreditBook Seller"`.
4. **Supabase SQL Editor migration** (run once on existing data):
   ```sql
   UPDATE profiles SET dashboard_mode = 'seller' WHERE dashboard_mode NOT IN ('seller','distributor','both');
   ```

---

### ✅ C-06 — Order Status Chip Has No Case for `"Overdue"` or `"Partially Paid"` — FIXED March 8, 2026

**File:** `src/components/orders/OrderList.tsx`  
**Category:** Breaking UI / wrong data displayed

**Fix applied:**

- Replaced 2-branch `className` conditional with a `STATUS_STYLES` lookup map covering all 4 states.
- `"Overdue"` is UI-derived: `status === "Pending" && daysSince(created_at) > 30`.
- `daysSince()` helper added to `src/utils/helper.ts`.
- Chip renders via inline `style` props (not Tailwind classes) for precise color control.

```typescript
// src/utils/helper.ts
export const daysSince = (date: string): number =>
  Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);

// src/components/orders/OrderList.tsx
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Paid: { bg: "#DCFCE7", text: "#16A34A", label: "PAID" },
  "Partially Paid": { bg: "#EFF6FF", text: "#1D4ED8", label: "PARTIAL" },
  Pending: { bg: "#FEF3C7", text: "#D97706", label: "PENDING" },
  Overdue: { bg: "#FEE2E2", text: "#DC2626", label: "OVERDUE" },
};
const isOverdue = item.status === "Pending" && daysSince(item.created_at) > 30;
const statusKey = isOverdue ? "Overdue" : item.status;
const chipStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["Pending"];
```

| Status           | Before         | After           |
| ---------------- | -------------- | --------------- |
| Paid             | green          | ✅ green        |
| Partially Paid   | yellow (wrong) | ✅ blue PARTIAL |
| Pending (fresh)  | yellow         | ✅ yellow       |
| Pending >30 days | yellow (wrong) | ✅ red OVERDUE  |

---

### ✅ C-07 — `Button` Outline Spinner Shows Black, Not Primary Color — FIXED March 8, 2026

**File:** `src/components/ui/Button.tsx`  
**Category:** Breaking UI / wrong affordance

**Fix applied:**

- Spinner color: `"#000"` → `"#22C55E"` for outline variant; `"#fff"` → `"#FFFFFF"` for all others (no functional change, explicit).
- Border radius: `rounded-md` (6 px) → `rounded-xl` (16 px) — aligns with modal action buttons.

```typescript
// Before
<ActivityIndicator color={variant === "outline" ? "#000" : "#fff"} />
const baseStyle = "w-full py-3 rounded-md items-center justify-center h-14 flex-row";

// After
<ActivityIndicator color={variant === "outline" ? "#22C55E" : "#FFFFFF"} />
const baseStyle = "w-full py-3 rounded-xl items-center justify-center h-14 flex-row";
```

---

### ✅ C-08 — `RecordDeliveryModal` Uses RN Built-in `Modal`, Not Bottom Sheet — FIXED March 8, 2026

**File:** `src/components/suppliers/RecordDeliveryModal.tsx`  
**Category:** Breaking navigation / wrong UX pattern

**Fix applied:**

- Replaced `Modal` import with `BottomSheet`, `BottomSheetScrollView`, `BottomSheetBackdrop` from `@gorhom/bottom-sheet`.
- Removed `ActivityIndicator`, `ScrollView`, `Modal` from react-native imports; added `useEffect`, `useMemo`, `useRef`.
- `sheetRef` + `snapPoints = ["90%"]` added; `useEffect` watches `visible` prop and calls `expand()` / `close()`.
- `BottomSheet` uses `index={-1}` (starts closed), `enablePanDownToClose`, `keyboardBehavior="interactive"`, `keyboardBlurBehavior="restore"`, `BottomSheetBackdrop` with `opacity={0.4}`.
- Full-screen header replaced with a compact in-sheet title bar (Cancel left, title center, spacer right).
- `ScrollView` replaced with `BottomSheetScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}`.
- Old header Save action replaced with full-width `<Button title="Record Delivery" />` at bottom of scroll content.
- `Button` component import added from `../ui/Button`.

All form fields (date, line items, charges, notes, summary) are unchanged.

---

### ✅ C-09 — `RecordPaymentMadeModal` Validation Allows Over-Payment (>= vs >) — FIXED March 8, 2026

**File:** `src/components/suppliers/RecordPaymentMadeModal.tsx`  
**Category:** Wrong financial logic / broken validation UX

**Fix applied:**

- Added `inputNum`, `showWarning`, `isValid` derived constants before the `return`:
  ```typescript
  const inputNum = parseFloat(amount) || 0;
  const showWarning = inputNum > 0 && inputNum > balanceOwed; // strict > only
  const isValid = inputNum > 0 && inputNum <= balanceOwed && mode !== null;
  ```
- Added inline red warning text below the amount field when `showWarning` is true:
  ```
  Amount exceeds balance owed (₹{balanceOwed.toLocaleString("en-IN")})
  ```
- Record Payment button: `disabled={loading}` → `disabled={loading || !isValid}`; button bg becomes `bg-neutral-300` when disabled.
- `handleSubmit` guard `if (num > balanceOwed)` was already correct (strict `>`) — no change needed there.

| Input                        | Before                                | After                                 |
| ---------------------------- | ------------------------------------- | ------------------------------------- |
| Exact balance (e.g. ₹24,000) | button enabled, no warning ✅         | same ✅                               |
| Over balance (e.g. ₹24,001)  | button enabled (only alert on submit) | button disabled, inline warning shown |
| Partial (e.g. ₹10,000)       | button enabled ✅                     | same ✅                               |

---

## 🟠 MAJOR — Core UX and Architecture Problems

These do not crash the app but produce wrong UX patterns, design inconsistencies, or make the system hard to maintain correctly.

---

### M-01 — Three Modal Libraries in Production (Partially Resolved)

**Files:** `RecordCustomerPaymentModal.tsx`, `RecordPaymentMadeModal.tsx`, `AppModal (Modal.tsx)`, `RecordDeliveryModal.tsx`  
**Category:** Wrong UX pattern / architecture

| Modal                                                     | Library                                |
| --------------------------------------------------------- | -------------------------------------- |
| `RecordCustomerPaymentModal`                              | `@gorhom/bottom-sheet` ✅              |
| `RecordPaymentMadeModal`                                  | `@gorhom/bottom-sheet` ✅              |
| `RecordDeliveryModal`                                     | `@gorhom/bottom-sheet` ✅ (fixed C-08) |
| `NewProductModal`, `NewCustomerModal`, `NewSupplierModal` | `react-native-modal` via `AppModal` ⚠️ |

All transaction modals are now on `@gorhom/bottom-sheet`. The remaining `react-native-modal` usage is isolated to the `AppModal` wrapper used by entity-creation forms (Product/Customer/Supplier). Consolidating those is tracked as a lower-priority cleanup.

---

### ✅ M-02 — Two Button Patterns: `Button.tsx` vs Raw `TouchableOpacity` — FIXED March 8, 2026

**Files:** `RecordCustomerPaymentModal.tsx`, `RecordPaymentMadeModal.tsx`  
**Category:** Wrong component / architecture

**Fix applied:**

- `ActivityIndicator` removed from both modals' react-native imports.
- `import Button from "../ui/Button"` added to both.
- `RecordCustomerPaymentModal`: two raw `TouchableOpacity` buttons replaced with `<Button variant="outline" title="Record Partial" ...>` and `<Button variant="primary" title="Mark Full Paid" ...>`; disabled state wired (`!amount || !mode || loading` for partial, `!mode || loading` for full).
- `RecordPaymentMadeModal`: two raw `TouchableOpacity` buttons replaced with `<Button variant="outline" title="Cancel" ...>` and `<Button variant="primary" title="Record Payment" ...>`; disabled state uses pre-existing `isValid` flag.
- `RecordPaymentMadeModal` payment mode chips: `rounded-lg` → `rounded-full` — now matches `RecordCustomerPaymentModal` pill shape.
- Outline spinner is green (`#22C55E`) automatically from the C-07 fix.

---

### ✅ M-03 — `FilterBar` Has No Active/Selected State — FIXED March 8, 2026

**File:** `src/components/orders/FilterBar.tsx`  
**Category:** Wrong UX pattern

**Fix applied:**

- Filter chip row was **entirely missing** from the render (`filters` prop was received but never mapped to JSX). Row added as a horizontal `ScrollView` above the Filter/Sort controls.
- `getChipStyle(isActive)` helper: active → `bg-primary border-primary`; inactive → `bg-search border-default`.
- `getTextStyle(isActive)` helper: active → `text-white font-inter-semibold`; inactive → `text-textPrimary font-inter-medium`.
- Filter and Sort control buttons: all `gray-*` classes replaced with theme aliases (`bg-search`, `border-default`, `text-textPrimary`).
- Icon colors: `"#4B5563"` → `colors.neutral[600]`; `"#6B7280"` → `colors.neutral[500]` (imported from `theme.ts`).
- Filter button label simplified to static `"Filter"` (was showing `selectedFilter` which duplicated the chip row).
- Added `ScrollView` import from react-native for horizontal chip scrolling.

---

### M-04 — `export/` Screen Not Reachable from Navigation

**File:** `app/(main)/_layout.tsx`, `src/screens/ExportScreen.tsx`  
**Category:** Broken navigation

The Export screen exists and works but is not in the tab bar. It is only reachable via `router.push('/(main)/export')` from a button buried inside the Profile screen. There is no bottom-nav tab, no back path from the export screen back to profile, and no entry from the data screens themselves.

---

### M-05 — `SupplierCard` Uses Amber Color Not in Design System

**File:** `src/components/suppliers/SupplierCard.tsx`  
**Category:** Design inconsistency

The supplier avatar icon uses `bg-amber-100` and `#d97706`. Amber does not exist in `theme.ts`. The design system has `primary` (green), `danger` (red), `warning` (orange/`#F39C12`), and `info` (blue). The balance badge uses raw `red-600`/`green-600` Tailwind classes that do not match `danger.DEFAULT` or `primary.DEFAULT`.

---

### M-06 — Payment Mode Chip Shape Inconsistent Across Two Screens

**Files:** `RecordCustomerPaymentModal.tsx`, `RecordPaymentMadeModal.tsx`  
**Category:** Design inconsistency

Customer payment modal: chips are `rounded-full` (pill shape).  
Supplier payment modal: chips are `rounded-lg` (square-ish).  
Same content, same interaction, different shape. No design reason for the difference.

---

### M-07 — `StyleSheet.create` vs NativeWind Mixed in Same App

**Files:** `src/components/feedback/EmptyState.tsx`, `src/components/feedback/Toast.tsx`  
**Category:** Wrong pattern / architecture

`EmptyState` and `Toast` — both global feedback components — use `StyleSheet.create` with hardcoded hex values. All other components use NativeWind `className`. This creates two separate styling systems to debug, prevents Tailwind purging from including these components' tokens, and means design-system changes to `theme.ts` do not propagate to these components.

---

### M-08 — Inline Screens vs `src/screens/` Split Has No Rule

**Files:** `app/(main)/customers/[customerId].tsx`, `app/(main)/suppliers/[supplierId].tsx`, `app/(main)/orders/[orderId].tsx`, `app/(main)/reports/index.tsx`  
**Category:** Architecture inconsistency

8 routes delegate to `src/screens/*.tsx`. 4 routes implement their full logic inline inside `app/`. There is no stated rule for when a screen lives in `app/` vs `src/screens/`. Detail screens (`[customerId]`, `[supplierId]`, `[orderId]`) are the longest files in the app but have no `src/screens/` equivalent.

---

### ✅ M-09 — `reports/` Sub-folder Missing `_layout.tsx` — FIXED March 8, 2026

**File:** `app/(main)/reports/`  
**Category:** Architecture inconsistency

**Fix applied:** Created `app/(main)/reports/_layout.tsx` with `headerShown: false` and `animation: "slide_from_right"`. Reports index screen implements its own custom ArrowLeft header — `headerShown: false` prevents a double header.

---

### ✅ M-10 — Dead Code: `useDashboardStore`, `PdfPreviewModal`, `QuickAction` — FIXED March 8, 2026

**Files:** `src/store/dashboardStore.tsx`, `src/components/PdfPreviewModal.tsx`, `src/components/QuickAction.tsx`  
**Category:** Dead code

**Fix applied:** All three files deleted. Confirmed zero external imports for each via `grep` before deletion. `npx tsc --noEmit` produced no new errors after deletion.

| File                  | Was Used?                                                             | Action  |
| --------------------- | --------------------------------------------------------------------- | ------- |
| `dashboardStore.tsx`  | Never imported — all dashboard state via `useDashboard` TanStack hook | Deleted |
| `PdfPreviewModal.tsx` | Never imported in any screen or component                             | Deleted |
| `QuickAction.tsx`     | Never imported; `quickActions` key is i18n string only                | Deleted |

---

### ✅ M-11 — `AppModal` Uses `fadeIn` Animation for a Bottom-Anchored Sheet — FIXED March 8, 2026

**File:** `src/components/ui/Modal.tsx`  
**Category:** Wrong UX pattern

`animationIn="fadeIn"` → `animationIn="slideInUp"`. `animationOut="fadeOut"` → `animationOut="slideOutDown"`. Modal now enters from the bottom edge matching its `justifyContent: "flex-end"` layout position.

---

### ✅ M-12 — `balance_due` Recalculated in JS — FIXED (March 8, 2026)

**File:** `src/api/orders.ts` → `fetchOrders()`  
**Category:** Incorrect calculation risk

Removed the JS override:

```typescript
// REMOVED:
// balance_due: Number(o.total_amount) - Number(o.amount_paid)
// NOW:
balance_due: Number(o.balance_due), // DB GENERATED column — single source of truth
```

---

### M-13 — `customers.email` Field in TypeScript Type Has No DB Column

**File:** `src/types/customer.ts`, `schema.sql`  
**Category:** Data inconsistency

`CustomerDetail` interface declares `email?: string`. No `email` column exists in the `customers` table. The field is currently unused in the UI but represents a contract violation between the type system and the database.

---

### ✅ M-14 — `product_variants` DB Column vs TypeScript Field Name — FIXED (March 8, 2026)

**Files:** `src/api/products.ts`, `src/components/products/ProductCard.tsx`  
**Category:** Data inconsistency

`ProductVariant.name` renamed to `ProductVariant.variant_name` to match the DB column. All consumer sites (`ProductCard`, `NewProductModal`, `VariantPicker`) updated in the same pass as C-04.

---

### ✅ M-15 — Three Missing DB Indexes Added (March 8, 2026)

**File:** `schema.sql`  
**Category:** Performance

All 3 indexes added to `schema.sql` and run in Supabase SQL Editor:

```sql
CREATE INDEX IF NOT EXISTS idx_supplier_deliveries_supplier ON supplier_deliveries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_made_supplier       ON payments_made(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor              ON payments(vendor_id);
```

| Index                              | Table               | Eliminates Full Scan On                                     |
| ---------------------------------- | ------------------- | ----------------------------------------------------------- |
| `idx_supplier_deliveries_supplier` | supplier_deliveries | `fetchSupplierDetail` — joins by supplier_id on detail load |
| `idx_payments_made_supplier`       | payments_made       | `fetchSuppliers` — per-supplier balance aggregation on list |
| `idx_payments_vendor`              | payments            | `getDashboardData` — all payments scan per vendor on load   |

---

## 🟡 MINOR — Visual Polish

These are visible inconsistencies that degrade the perceived quality of the UI but do not break any functionality.

---

### ✅ N-01 — 6 of 8 Avatar Colors Not in Design System — FIXED March 8, 2026

**File:** `src/components/customers/CustomerCard.tsx`

`AVATAR_COLORS` replaced with theme-token values: `colors.danger.DEFAULT`, `colors.warning.DEFAULT`, `colors.primary.DEFAULT`, `colors.info.DEFAULT`, plus 4 semantic near-fits (`#9B59B6` purple, `#E91E8C` pink, `#00BCD4` teal, `#FF5722` deep orange). Algorithm unchanged.

---

### ✅ N-02 — `CustomerCard` Status Badge Background Colors Are Off-System — FIXED March 8, 2026

**File:** `src/components/customers/CustomerCard.tsx`

`STATUS_STYLES` rewritten with `colors.danger.light` / `colors.warning.light` / `colors.success.light` / `colors.info.light` for bg; `colors.danger.DEFAULT` / `colors.warning.DEFAULT` / `colors.success.text` / `colors.info.text` for text. `colors` imported from `../../utils/theme`.

---

### ✅ N-03 — `Paid` Badge Text Uses Wrong Contrast Token — FIXED March 8, 2026

**File:** `src/components/customers/CustomerCard.tsx`

`Paid` badge text: `"#2ECC71"` (success.DEFAULT, medium green on light green — poor contrast) → `colors.success.text` (`#166534`, dark green). Fixed as part of the `STATUS_STYLES` rewrite in P14.

---

### ✅ N-04 — `StatusDot` Colors Do Not Match Theme — FIXED March 8, 2026

**File:** `src/components/ui/StatusDot.tsx`

Replaced Tailwind class map with `DOT_COLOR` record using correct hex values: `Paid` → `#22C55E`, `Pending` → `#F39C12` (`warning.DEFAULT`), `Partially Paid` → `#E74C3C` (`danger.DEFAULT`). Both the pulsing `Animated.View` and the static `View` now use `style={{ backgroundColor: dotColor }}` instead of `className={...}`.

---

### ✅ N-05 — `SupplierCard` Balance Badges Use Wrong Reds and Greens — FIXED March 8, 2026

**File:** `src/components/suppliers/SupplierCard.tsx`

`bg-red-50 text-red-600` (Tailwind) → `colors.danger.light` bg + `colors.danger.DEFAULT` text. `bg-green-50 text-green-600` → `colors.success.light` bg + `colors.success.text` text. `text-red-400` "You owe" label → `colors.danger.DEFAULT`. `ChevronRight` icon `"#999"` → `colors.neutral[400]`. Single `balanceBadge` object drives all badge state. Fixed as part of P15.

---

### ✅ N-06 — `Card.tsx` Uses Wrong Background and Text Colors — FIXED March 8, 2026

**File:** `src/components/ui/Card.tsx`

`bg-neutral-100` → `bg-search` (theme alias for `#F6F7FB`). `text-gray-500` → `style={{ color: "#8E8E93" }}` (`neutral.500`).

---

### ✅ N-07 — `EmptyState` Uses Wrong Gray Values — FIXED March 8, 2026

**File:** `src/components/feedback/EmptyState.tsx`

- Icon bg: `#F3F4F6` (Tailwind gray-100) → `#F6F7FB` (neutral.100)
- Sub-text: `#6B7280` (Tailwind gray-500) → `#8E8E93` (neutral.500)
- CTA `borderRadius: 12` → `rounded-xl` (16px)
- Fully migrated from `StyleSheet.create` to NativeWind `className` + `style` for raw values; `StyleSheet` import removed.

---

### ✅ N-08 — `Toast` Error Color Does Not Match `danger.DEFAULT` — FIXED March 8, 2026

**File:** `src/components/feedback/Toast.tsx`

Error bg: `#EF4444` → `#E74C3C` (`danger.DEFAULT`). Animation logic, auto-dismiss (2800ms), and `StyleSheet` retained unchanged.

---

### ✅ N-09 — `AppModal` Corner Radius Too Small — FIXED March 8, 2026

**File:** `src/components/ui/Modal.tsx`

`rounded-lg` (8px) → `rounded-xl` (16px) on the inner `View` container. Matches @gorhom sheets and `Button.tsx` corner radius. Fixed together with M-11 (animation pass).

---

### ✅ N-10 — `FilterBar` Uses `gray-*` Classes Throughout — FIXED March 8, 2026 (P12)

**File:** `src/components/orders/FilterBar.tsx`

All `gray-*` classes replaced with theme aliases (`bg-search`, `border-default`, `text-textPrimary`). Icon colors: `"#4B5563"` → `colors.neutral[600]`; `"#6B7280"` → `colors.neutral[500]`. Fixed as part of P12 FilterBar active-state rewrite.

---

### ✅ N-11 — `CustomerCard` Body Text All Raw Hex — FIXED March 8, 2026

**File:** `src/components/customers/CustomerCard.tsx`

`text-[#1C1C1E]` → `style={{ color: colors.neutral[900] }}`. `text-[#8E8E93]` → `style={{ color: colors.neutral[500] }}`. `border-[#F0F0F5]` → `border-light` (neutral[200]). Fixed as part of P14.

---

### N-12 — `heroDecor` Color is Orphaned from Core Palette

**File:** `src/utils/theme.ts` / `src/utils/dashboardUi.ts`

`heroDecor: "#F5ECD8"` (warm cream) is defined in `dashboardPalette` as a one-off decorative value. It does not appear in `colors` in `theme.ts`. If the design system is extended it has no semantic home.

---

### ✅ N-13 — `SupplierCard` Has No Initials Avatar — FIXED March 8, 2026

**File:** `src/components/suppliers/SupplierCard.tsx`

`Building2` icon with `bg-amber-100` background replaced with initials avatar using the same `AVATAR_COLORS[8]` array and hash algorithm as `CustomerCard`. `Building2` import removed. Fixed as part of P15.

---

### N-14 — Payment Mode Inactive Chip Border Token Mismatch

**Files:** `RecordCustomerPaymentModal.tsx`, `RecordPaymentMadeModal.tsx`

Customer modal: `border-[#E5E5EA]` — raw hex, should be `border-default` alias.  
Supplier modal: `border-neutral-300` — Tailwind bare class (`#D4D4D4`) ≠ theme `neutral.300` (`#C7C7CC`). Both should use `border-default`.

---

### N-15 — `Button.tsx` Corner Radius Inconsistent with Modals

**File:** `src/components/ui/Button.tsx`

`rounded-md` = 6px (`radius.md`). Modal action buttons use `rounded-[14px]` or `rounded-xl` (16px). The main app `Button` component looks noticeably sharper than the in-modal buttons users see on the same action flows.

---

## Issue Count by Severity and Source

| Severity    | UI     | Database | Navigation / Architecture | Total  |
| ----------- | ------ | -------- | ------------------------- | ------ |
| 🔴 Critical | 2      | 4        | 2                         | **8**  |
| 🟠 Major    | 6      | 4        | 5                         | **15** |
| 🟡 Minor    | 13     | 0        | 2                         | **15** |
| **Total**   | **21** | **8**    | **9**                     | **38** |

---

## Recommended Fix Order

| Priority | ID                                                                                                                                                                | What                                                                                                      | Where                                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ~~1~~    | ~~C-01~~ ✅                                                                                                                                                       | ~~Fix all 4 supplier RLS policies~~ **DONE**                                                              | Fixed March 8, 2026 — Supabase SQL Editor + `schema.sql` updated                                                                          |
| ~~2~~    | ~~C-05~~ ✅                                                                                                                                                       | ~~Align `dashboard_mode` DB constraint with TypeScript enum~~ **DONE**                                    | Fixed March 8, 2026 — types, role.tsx, DashboardScreen, SQL migration                                                                     |
| ~~3~~    | ~~C-02~~ ✅                                                                                                                                                       | ~~Fix `fetchOrders` search to use a `customers` join~~ **DONE**                                           | Fixed March 8, 2026 — `!inner` join + dot-notation `.or()` filter on `customers.name`/`customers.phone`                                   |
| ~~4~~    | ~~C-03~~ ✅                                                                                                                                                       | ~~Remove `reference` from export select or add column to `payments`~~ **DONE**                            | Fixed March 8, 2026 — `reference` removed from select + `ExportPayment` interface; `Payment.created_at` added                             |
| ~~5~~    | ~~C-04~~ ✅                                                                                                                                                       | ~~Fix `fetchProducts` to join `product_variants`, align field names~~ **DONE**                            | Fixed March 8, 2026 — join added, `ProductVariant` interface aligned, `ProductCard`+`VariantPicker`+`NewProductModal` updated             |
| ~~6~~    | ~~C-06~~ ✅                                                                                                                                                       | ~~Add `Overdue` + `Partially Paid` chip cases to `OrderList`~~ **DONE**                                   | Fixed March 8, 2026 — `STATUS_STYLES` map; `Overdue` derived from Pending >30 days; `daysSince()` added to `helper.ts`                    |
| ~~7~~    | ~~C-07~~ ✅                                                                                                                                                       | ~~Fix outline spinner color in `Button.tsx`~~ **DONE**                                                    | Fixed March 8, 2026 — spinner `#000` → `#22C55E`; `rounded-md` → `rounded-xl`                                                             |
| ~~8~~    | ~~C-08~~ ✅                                                                                                                                                       | ~~Migrate `RecordDeliveryModal` to `@gorhom/bottom-sheet`~~ **DONE**                                      | Fixed March 8, 2026 — `BottomSheet`+`BottomSheetScrollView`, `keyboardBehavior="interactive"`, `index={-1}`, `Button` at bottom           |
| ~~9~~    | ~~C-09~~ ✅                                                                                                                                                       | ~~Fix `RecordPaymentMadeModal` over-pay validation + proactive button disable~~ **DONE**                  | Fixed March 8, 2026 — `showWarning`/`isValid` derived; inline warning; `disabled={loading \| !isValid}`                                   |
| ~~9~~    | M-01 ⚠️                                                                                                                                                           | Modal library consolidation (partially resolved — AppModal still react-native-modal)                      | `NewProductModal`, `NewCustomerModal`, `NewSupplierModal` via `AppModal`                                                                  |
| ~~10~~   | ~~M-02~~ ✅                                                                                                                                                       | ~~Replace raw `TouchableOpacity` buttons with `Button.tsx`~~ **DONE**                                     | Fixed March 8, 2026 — Both payment modals use `Button.tsx`; chips `rounded-full`; `ActivityIndicator` removed                             |
| ~~11~~   | ~~M-03~~ ✅                                                                                                                                                       | ~~Add active state to `FilterBar` chips~~ **DONE**                                                        | Fixed March 8, 2026 — chip row was missing entirely; added `ScrollView` chips with `getChipStyle`/`getTextStyle`; `gray-*` → theme tokens |
| 12       | M-04                                                                                                                                                              | Add Export to tab bar or make it a proper navigation destination                                          | `app/(main)/_layout.tsx`                                                                                                                  |
| ~~13~~   | ~~M-07~~ ✅                                                                                                                                                       | ~~Migrate `EmptyState` + `Toast` to NativeWind~~ **DONE**                                                 | Fixed March 8, 2026 — EmptyState: `StyleSheet` → NativeWind, colors fixed; Toast: error bg `#EF4444` → `#E74C3C`                          |
| ~~14~~   | ~~M-15~~ ✅                                                                                                                                                       | ~~Add 3 missing DB indexes~~ **DONE**                                                                     | Fixed March 8, 2026 — added to `schema.sql` + run via Supabase SQL Editor                                                                 |
| 15       | ~~M-10~~ ✅ ~~M-09~~ ✅ ~~M-11~~ ✅ + M-05–M-08, M-12–M-14                                                                                                        | ~~Delete dead files~~ ~~Add reports/\_layout.tsx~~ ~~Fix AppModal animation~~ **DONE** + remaining issues | M-09, M-10 & M-11 fixed March 8, 2026; others still open                                                                                  |
| 16       | ~~N-01~~ ✅ ~~N-02~~ ✅ ~~N-03~~ ✅ ~~N-04~~ ✅ ~~N-05~~ ✅ ~~N-06~~ ✅ ~~N-07~~ ✅ ~~N-08~~ ✅ ~~N-09~~ ✅ ~~N-10~~ ✅ ~~N-11~~ ✅ ~~N-13~~ ✅ + N-12, N-14–N-15 | Visual polish — 12 of 15 done                                                                             | N-04, N-06, N-09 fixed March 8, 2026; 3 still open                                                                                        |
