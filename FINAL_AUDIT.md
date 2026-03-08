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

### C-06 — Order Status Chip Has No Case for `"Overdue"` or `"Partially Paid"`

**File:** `src/components/orders/OrderList.tsx`  
**Category:** Breaking UI / wrong data displayed

The status chip logic is a two-branch conditional:

```typescript
item.status === "Paid"
  ? "bg-green-100 text-green-800"
  : "bg-yellow-100 text-yellow-800";
```

`"Overdue"` and `"Partially Paid"` both silently fall into the yellow `"Pending"` branch. An overdue bill looks identical to a pending bill. A partially-paid bill cannot be distinguished from an unpaid one. These are financially significant distinctions in a credit-book app.

---

### C-07 — `Button` Outline Spinner Shows Black, Not Primary Color

**File:** `src/components/ui/Button.tsx`  
**Category:** Breaking UI / wrong affordance

```typescript
<ActivityIndicator color={variant === "outline" ? "#000" : "#fff"} />
```

While an outline button has a white background and green text/border, its loading spinner shows black (`#000`). This is jarring and reads as a broken state. The correct color is `#22C55E` (primary).

---

### C-08 — `RecordDeliveryModal` Uses RN Built-in `Modal`, Not Bottom Sheet

**File:** `src/components/suppliers/RecordDeliveryModal.tsx`  
**Category:** Breaking navigation / wrong UX pattern

This modal is the most complex form in the suppliers flow (multi-line items, totals, scrollable). It uses the raw React Native `Modal` (full-screen overlay, no keyboard-aware scroll, no drag-to-dismiss) while both payment modals use `@gorhom/bottom-sheet` with `keyboardBehavior="interactive"`. On Android, typing into fields inside this modal frequently pushes content off-screen because the native Modal has no coordinated keyboard handling. This is a functional breakage on the most critical supplier data-entry screen.

---

## 🟠 MAJOR — Core UX and Architecture Problems

These do not crash the app but produce wrong UX patterns, design inconsistencies, or make the system hard to maintain correctly.

---

### M-01 — Three Modal Libraries in Production

**Files:** `RecordCustomerPaymentModal.tsx`, `RecordPaymentMadeModal.tsx`, `AppModal (Modal.tsx)`, `RecordDeliveryModal.tsx`  
**Category:** Wrong UX pattern / architecture

| Modal                                                     | Library                             |
| --------------------------------------------------------- | ----------------------------------- |
| `RecordCustomerPaymentModal`                              | `@gorhom/bottom-sheet`              |
| `RecordPaymentMadeModal`                                  | `@gorhom/bottom-sheet`              |
| `NewProductModal`, `NewCustomerModal`, `NewSupplierModal` | `react-native-modal` via `AppModal` |
| `RecordDeliveryModal`                                     | RN built-in `Modal`                 |

Each library has different animation, keyboard behavior, backdrop behavior, and closing gesture. Users experience three distinct modal interaction patterns in the same session.

---

### M-02 — Two Button Patterns: `Button.tsx` vs Raw `TouchableOpacity`

**Files:** `RecordCustomerPaymentModal.tsx`, `RecordPaymentMadeModal.tsx`  
**Category:** Wrong component / architecture

Both payment modals bypass `Button.tsx` entirely and use raw `TouchableOpacity`. These buttons have no shared disabled state, no consistent loading spinner behavior, non-standard border width (`border-[1.5px]`), and arbitrary radius (`rounded-[14px]`). Any future change to button behavior must be applied in three places instead of one.

---

### M-03 — `FilterBar` Has No Active/Selected State

**File:** `src/components/orders/FilterBar.tsx`  
**Category:** Wrong UX pattern

The Filter and Sort controls show the current selection as text label only. There is no background fill, border color change, or visual differentiation between an active filter and an inactive one. Users cannot tell at a glance whether a filter is set. All colors use `gray-*` Tailwind classes instead of theme tokens.

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

### M-09 — `reports/` Sub-folder Missing `_layout.tsx`

**File:** `app/(main)/reports/`  
**Category:** Architecture inconsistency

Every other sub-folder under `(main)` — `customers/`, `orders/`, `products/`, `suppliers/`, `profile/`, `dashboard/`, `export/` — has a `_layout.tsx`. `reports/` has only `index.tsx`. This breaks the project convention and could cause unexpected layout behavior if a second reports screen is added.

---

### M-10 — `useDashboardStore` is Dead Code

**File:** `src/store/dashboardStore.tsx`  
**Category:** Dead code

The Zustand store `useDashboardStore` is exported but never imported by any screen or hook. All dashboard state is managed by TanStack Query (`useDashboard`). The file is misleading — a developer adopting this codebase would assume Zustand manages dashboard state.

---

### M-11 — `AppModal` Uses `fadeIn` Animation for a Bottom-Anchored Sheet

**File:** `src/components/ui/Modal.tsx`  
**Category:** Wrong UX pattern

The `AppModal` wrapper positions its content at the bottom of the screen (`justifyContent: "flex-end"`) but uses `animationIn="fadeIn"` / `animationOut="fadeOut"`. A bottom-anchored modal should slide up (`slideInUp`) and slide down on close. The fade-in from bottom creates an uncanny animation where the content appears in place rather than entering from off-screen.

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

### M-15 — Three Missing DB Indexes on High-Traffic Queries

**File:** `schema.sql`  
**Category:** Performance

| Missing Index                      | Query That Needs It                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `supplier_deliveries(supplier_id)` | `fetchSupplierDetail` — joins by supplier ID on every detail page load        |
| `payments_made(supplier_id)`       | `fetchSuppliers` — runs per-supplier balance aggregation on list screen       |
| `payments(vendor_id)`              | `getDashboardData` — full scan of payments per vendor on every dashboard load |

---

## 🟡 MINOR — Visual Polish

These are visible inconsistencies that degrade the perceived quality of the UI but do not break any functionality.

---

### N-01 — 6 of 8 Avatar Colors Not in Design System

**File:** `src/components/customers/CustomerCard.tsx`

Purple (`#8B5CF6`), pink (`#EC4899`), teal (`#14B8A6`), orange (`#F97316`), yellow (`#EAB308`), and blue (`#3B82F6`) are all outside `theme.ts`. Should use colors from the `primary`, `danger`, `warning`, `info`, and `success` palette with `+22` transparency.

---

### N-02 — `CustomerCard` Status Badge Background Colors Are Off-System

**File:** `src/components/customers/CustomerCard.tsx`

`Overdue` bg `#FFF0EE` ≠ `danger.light` (`#FEE2E2`). `Pending` bg `#FFF8EE` ≠ `warning.light` (`#FEF3C7`). `Paid` bg `#EDFAF4` ≠ `success.light` (`#DCFCE7`). All chip colors are raw hex not referencing `theme.ts`.

---

### N-03 — `Paid` Badge Text Uses Wrong Contrast Token

**File:** `src/components/customers/CustomerCard.tsx`

`Paid` badge text color is `#2ECC71` (`success.DEFAULT` — a medium green) rendered on a light green background. Should use `success.text` (`#166534`, dark green) for accessibility contrast. Design system chip text tokens exist precisely for this.

---

### N-04 — `StatusDot` Colors Do Not Match Theme

**File:** `src/components/ui/StatusDot.tsx`

`bg-yellow-500` = `#EAB308` ≠ `warning.DEFAULT` (`#F39C12`). `bg-red-500` = `#EF4444` ≠ `danger.DEFAULT` (`#E74C3C`). The animated dot conveys payment urgency — using the wrong colors undermines the semantic signal.

---

### N-05 — `SupplierCard` Balance Badges Use Wrong Reds and Greens

**File:** `src/components/suppliers/SupplierCard.tsx`

`bg-red-50 text-red-600` — Tailwind `red-600` = `#DC2626` vs `danger.DEFAULT` = `#E74C3C`. `bg-green-50 text-green-600` ≠ `success.light` + `success.text`. "You owe" sub-label is `text-red-400` — not a theme token.

---

### N-06 — `Card.tsx` Uses Wrong Background and Text Colors

**File:** `src/components/ui/Card.tsx`

`text-gray-500` = Tailwind `#6B7280` ≠ `neutral.500` (`#8E8E93`). `bg-neutral-100` = Tailwind `#F5F5F5` ≠ theme `neutral.100` (`#F6F7FB`). Should use `bg-search` alias.

---

### N-07 — `EmptyState` Uses Wrong Gray Values

**File:** `src/components/feedback/EmptyState.tsx`

Icon background `#F3F4F6` = Tailwind `gray-100` ≠ `neutral.100` (`#F6F7FB`). Sub-text `#6B7280` = Tailwind `gray-500` ≠ `neutral.500` (`#8E8E93`). CTA button radius `12` is not in the `radius` token scale (`lg=10`, `xl=16`).

---

### N-08 — `Toast` Error Color Does Not Match `danger.DEFAULT`

**File:** `src/components/feedback/Toast.tsx`

Error background `#EF4444` ≠ `danger.DEFAULT` (`#E74C3C`). These are two visually distinct reds. The toast error color is brighter/more saturated than the danger color used on all badges and buttons. `borderRadius: 14` is also not in the `radius` token scale.

---

### N-09 — `AppModal` Corner Radius Too Small

**File:** `src/components/ui/Modal.tsx`

`rounded-lg` = 8px (`radius.md`). Bottom-anchored modals throughout the app use `borderTopLeftRadius: 28` (gorhom sheets) or `rounded-xl` (16px). The `AppModal` container looks noticeably squarer by comparison, especially on new product / supplier forms.

---

### N-10 — `FilterBar` Uses `gray-*` Classes Throughout

**File:** `src/components/orders/FilterBar.tsx`

`bg-gray-50`, `border-gray-300`, `text-gray-700`, `text-gray-500` — the entire component uses Tailwind's built-in gray scale instead of the `neutral` theme tokens. Icon colors are hardcoded `#4B5563` and `#6B7280`.

---

### N-11 — `CustomerCard` Body Text All Raw Hex

**File:** `src/components/customers/CustomerCard.tsx`

`text-[#1C1C1E]` (name), `text-[#8E8E93]` (phone), `border-[#F0F0F5]` (row divider — a non-existent color, closest is `neutral.200` = `#E5E5EA`). None reference Tailwind aliases or `theme.ts`.

---

### N-12 — `heroDecor` Color is Orphaned from Core Palette

**File:** `src/utils/theme.ts` / `src/utils/dashboardUi.ts`

`heroDecor: "#F5ECD8"` (warm cream) is defined in `dashboardPalette` as a one-off decorative value. It does not appear in `colors` in `theme.ts`. If the design system is extended it has no semantic home.

---

### N-13 — `SupplierCard` Has No Initials Avatar

**File:** `src/components/suppliers/SupplierCard.tsx`

`CustomerCard` generates a colored initials avatar per name. `SupplierCard` always shows a static amber building icon. Suppliers have names and should follow the same initials pattern for visual consistency across list screens.

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

| Priority | ID          | What                                                                           | Where                                                                                                                         |
| -------- | ----------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| ~~1~~    | ~~C-01~~ ✅ | ~~Fix all 4 supplier RLS policies~~ **DONE**                                   | Fixed March 8, 2026 — Supabase SQL Editor + `schema.sql` updated                                                              |
| ~~2~~    | ~~C-05~~ ✅ | ~~Align `dashboard_mode` DB constraint with TypeScript enum~~ **DONE**         | Fixed March 8, 2026 — types, role.tsx, DashboardScreen, SQL migration                                                         |
| ~~3~~    | ~~C-02~~ ✅ | ~~Fix `fetchOrders` search to use a `customers` join~~ **DONE**                | Fixed March 8, 2026 — `!inner` join + dot-notation `.or()` filter on `customers.name`/`customers.phone`                       |
| ~~4~~    | ~~C-03~~ ✅ | ~~Remove `reference` from export select or add column to `payments`~~ **DONE** | Fixed March 8, 2026 — `reference` removed from select + `ExportPayment` interface; `Payment.created_at` added                 |
| ~~5~~    | ~~C-04~~ ✅ | ~~Fix `fetchProducts` to join `product_variants`, align field names~~ **DONE** | Fixed March 8, 2026 — join added, `ProductVariant` interface aligned, `ProductCard`+`VariantPicker`+`NewProductModal` updated |
| 6        | C-06        | Add `Overdue` + `Partially Paid` chip cases to `OrderList`                     | `src/components/orders/OrderList.tsx`                                                                                         |
| 7        | C-07        | Fix outline spinner color in `Button.tsx`                                      | `src/components/ui/Button.tsx`                                                                                                |
| 8        | C-08        | Migrate `RecordDeliveryModal` to `@gorhom/bottom-sheet`                        | `src/components/suppliers/RecordDeliveryModal.tsx`                                                                            |
| 9        | M-01        | Consolidate to single modal library (`@gorhom/bottom-sheet`)                   | All modal components                                                                                                          |
| 10       | M-02        | Replace raw `TouchableOpacity` buttons with `Button.tsx`                       | Payment modals                                                                                                                |
| 11       | M-03        | Add active state to `FilterBar` chips                                          | `src/components/orders/FilterBar.tsx`                                                                                         |
| 12       | M-04        | Add Export to tab bar or make it a proper navigation destination               | `app/(main)/_layout.tsx`                                                                                                      |
| 13       | M-07        | Migrate `EmptyState` + `Toast` to NativeWind                                   | `src/components/feedback/`                                                                                                    |
| 14       | M-15        | Add 3 missing DB indexes                                                       | `schema.sql`                                                                                                                  |
| 15       | M-05–M-14   | Remaining architecture + data issues                                           | Various                                                                                                                       |
| 16       | N-01–N-15   | Visual polish pass                                                             | Various                                                                                                                       |
