# CreditBook UI Component Audit

> Date: March 8, 2026  
> Purpose: Pre-fix audit — DO NOT change code until issues are resolved per-ticket.  
> Design system reference: `src/utils/theme.ts` · Tailwind aliases: `tailwind.config.js`

---

## Key Design-System Tokens (Reference)

| Token             | Alias in Tailwind             | Value     |
| ----------------- | ----------------------------- | --------- |
| `primary.DEFAULT` | `bg-primary` / `text-primary` | `#22C55E` |
| `success.DEFAULT` | `bg-success`                  | `#2ECC71` |
| `success.light`   | —                             | `#DCFCE7` |
| `success.text`    | —                             | `#166534` |
| `danger.DEFAULT`  | `bg-danger`                   | `#E74C3C` |
| `danger.light`    | —                             | `#FEE2E2` |
| `warning.DEFAULT` | `bg-warning`                  | `#F39C12` |
| `warning.light`   | —                             | `#FEF3C7` |
| `info.DEFAULT`    | `bg-secondary` / `bg-info`    | `#4F9CFF` |
| `info.light`      | —                             | `#EAF0FB` |
| `info.text`       | —                             | `#0369A1` |
| `neutral.100`     | `bg-search`                   | `#F6F7FB` |
| `neutral.200`     | (not aliased)                 | `#E5E5EA` |
| `neutral.300`     | (`border-default`)            | `#C7C7CC` |
| `neutral.500`     | —                             | `#8E8E93` |
| `neutral.600`     | `text-textPrimary`            | `#636366` |
| `neutral.900`     | —                             | `#1C1C1E` |

> ⚠️ `neutral-100` through `neutral-900` as bare Tailwind classes are **NOT** aliased to theme values.  
> `bg-neutral-200` will use Tailwind's default `#E5E5E5`, not theme `#E5E5EA`.  
> `text-gray-500` will use Tailwind `#6B7280`, not theme `neutral.500` (`#8E8E93`).

---

## 1. Avatar Color System

---

### `CustomerCard.tsx`

**File:** `src/components/customers/CustomerCard.tsx`  
**Usage:** All customer list rows — renders coloured initials circle when no avatar image.

**Issues Found:**

| #   | Severity | Issue                                                                                                 |
| --- | -------- | ----------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | `AVATAR_COLORS[1]` = `#F97316` (orange) — not in design system                                        |
| 2   | 🔴 High  | `AVATAR_COLORS[2]` = `#EAB308` (yellow) — not in design system (`warning.DEFAULT` is `#F39C12`)       |
| 3   | 🔴 High  | `AVATAR_COLORS[4]` = `#14B8A6` (teal) — not in design system                                          |
| 4   | 🔴 High  | `AVATAR_COLORS[5]` = `#3B82F6` (blue) — not in design system (`info.DEFAULT` is `#4F9CFF`)            |
| 5   | 🔴 High  | `AVATAR_COLORS[6]` = `#8B5CF6` (purple) — not in design system                                        |
| 6   | 🔴 High  | `AVATAR_COLORS[7]` = `#EC4899` (pink) — not in design system                                          |
| 7   | 🟡 Med   | 6 of 8 avatar colors are off-system; only `#EF4444` and `#22C55E` approximate theme tokens            |
| 8   | 🟡 Med   | `#EF4444` is used but `danger.DEFAULT` is `#E74C3C` — slight mismatch even for the two "close" values |

---

### `SupplierCard.tsx`

**File:** `src/components/suppliers/SupplierCard.tsx`  
**Usage:** All supplier list rows — renders `Building2` icon in a tinted circle.

**Issues Found:**

| #   | Severity | Issue                                                                 |
| --- | -------- | --------------------------------------------------------------------- |
| 1   | 🔴 High  | Icon background `bg-amber-100` — `amber` is not a theme palette token |
| 2   | 🔴 High  | Icon color `#d97706` (amber-600) — not in design system               |
| 3   | 🟡 Med   | No initials avatar — inconsistent with `CustomerCard` pattern         |

---

## 2. Chip Components

---

### `CustomerCard.tsx` — Status Badge

**File:** `src/components/customers/CustomerCard.tsx`  
**Usage:** Inline status badge on every customer row (Overdue / Pending / Paid / Advance).

**Issues Found:**

| #   | Severity | Issue                                                                                                                                                 |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🟡 Med   | `Overdue` bg `#FFF0EE` — not in design system (`danger.light` = `#FEE2E2`)                                                                            |
| 2   | 🟡 Med   | `Pending` bg `#FFF8EE` — not in design system (`warning.light` = `#FEF3C7`)                                                                           |
| 3   | 🟡 Med   | `Paid` bg `#EDFAF4` — not in design system (`success.light` = `#DCFCE7`)                                                                              |
| 4   | 🔴 High  | `Paid` text/border `#2ECC71` — uses `success.DEFAULT`, not `success.text` (`#166534`). White text on green bg should use design-system contrast token |
| 5   | 🔴 High  | `Paid` border same color as text — chip border should use a lighter tint, not the same value as label                                                 |
| 6   | 🟢 OK    | `Advance` values (`#0369A1`, `#4F9CFF`, `#EAF0FB`) match `info.text`, `info.DEFAULT`, `info.light` ✅                                                 |
| 7   | 🔴 High  | All chip colors are raw hex literals — no reference to `theme.ts` or Tailwind aliases                                                                 |

---

### `OrderList.tsx` — Inline Status Chip

**File:** `src/components/orders/OrderList.tsx`  
**Usage:** Status pill on each order row inside `FlatList`.

**Issues Found:**

| #   | Severity | Issue                                                                                                              |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | 🔴 High  | Active chip uses `bg-green-100 text-green-800` — raw Tailwind, not theme-aliased tokens                            |
| 2   | 🔴 High  | Inactive chip uses `bg-yellow-100 text-yellow-800` — raw Tailwind, not theme tokens                                |
| 3   | 🔴 High  | Only `"Paid"` and `"other"` are handled — `"Partially Paid"` and `"Overdue"` both fall into yellow branch silently |
| 4   | 🟡 Med   | `"Partially Paid"` has no chip style at all — should map to `info` tokens                                          |
| 5   | 🟡 Med   | `"Overdue"` has no chip style — should map to `danger` tokens                                                      |

---

### `StatusBadge.tsx` — Dashboard Chips

**File:** `src/components/dashboard/StatusBadge.tsx`  
**Usage:** Recent-activity row status pill on Dashboard.

**Issues Found:**

| #   | Severity | Issue                                                                 |
| --- | -------- | --------------------------------------------------------------------- |
| 1   | 🟢 OK    | Uses `dashboardPalette` tokens which directly reference `theme.ts` ✅ |

---

### `StatusDot.tsx` — Animated Pulse Dot

**File:** `src/components/ui/StatusDot.tsx`  
**Usage:** Animated dot in order detail / payment views.

**Issues Found:**

| #   | Severity | Issue                                                                                          |
| --- | -------- | ---------------------------------------------------------------------------------------------- |
| 1   | 🟡 Med   | `bg-green-500` = Tailwind `#22C55E` — coincidentally matches `primary.DEFAULT` but not aliased |
| 2   | 🔴 High  | `bg-yellow-500` = Tailwind `#EAB308` — does NOT match `warning.DEFAULT` (`#F39C12`)            |
| 3   | 🔴 High  | `bg-red-500` = Tailwind `#EF4444` — does NOT match `danger.DEFAULT` (`#E74C3C`)                |
| 4   | 🟡 Med   | Uses raw Tailwind color classes — should use themed aliases or `style={{ backgroundColor }}`   |

---

### `RecordCustomerPaymentModal.tsx` — Payment Mode Chips

**File:** `src/components/customers/RecordCustomerPaymentModal.tsx`  
**Usage:** Selectable chip row for Cash / UPI / NEFT / Draft / Cheque.

**Issues Found:**

| #   | Severity | Issue                                                                                                                         |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🟢 OK    | Active chip: `bg-primary border-primary text-white` — correct ✅                                                              |
| 2   | 🟡 Med   | Inactive chip: `bg-search border-[#E5E5EA]` — `bg-search` is defined but `border-[#E5E5EA]` should use `border-default` alias |

---

### `RecordPaymentMadeModal.tsx` — Payment Mode Chips

**File:** `src/components/suppliers/RecordPaymentMadeModal.tsx`  
**Usage:** Selectable chip row for same payment modes on supplier side.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                                         |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🟢 OK    | Active: `bg-primary border-primary text-white` ✅                                                                                                             |
| 2   | 🟡 Med   | Inactive: `border-neutral-300` — uses bare Tailwind `neutral-300` (Tailwind `#D4D4D4`) not theme `neutral.300` (`#C7C7CC`). Should use `border-default` alias |
| 3   | 🟡 Med   | Chip shape differs from customer modal — `rounded-lg` vs `rounded-full` (inconsistent chip style across same app)                                             |

---

### `FilterBar.tsx`

**File:** `src/components/orders/FilterBar.tsx`  
**Usage:** Filter and Sort controls above order list.

**Issues Found:**

| #   | Severity | Issue                                                                                                                     |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | Uses `bg-gray-50 border-gray-300 text-gray-700 text-gray-500` — Tailwind `gray-*` palette, NOT the `neutral` theme tokens |
| 2   | 🟡 Med   | No active/selected state styling — a selected filter has no visual differentiation                                        |
| 3   | 🟡 Med   | Icon colors are literal `#4B5563` / `#6B7280` (Tailwind gray values), not theme tokens                                    |

---

## 3. Button Components

---

### `Button.tsx`

**File:** `src/components/ui/Button.tsx`  
**Usage:** Primary action button — login, save, submit forms. Used across auth, onboarding, modals.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                                                                 |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | `ActivityIndicator` for `outline` variant uses `color="#000"` — should be `#22C55E` (primary) to match the outlined text color                                                        |
| 2   | 🟡 Med   | `rounded-md` = 6px (`radius.md`) — buttons typically use `rounded-xl` (16px) or `rounded-lg` (10px) per design system; inconsistent with modals using `rounded-xl` / `rounded-[14px]` |
| 3   | 🟡 Med   | `bg-secondary` maps to `info.DEFAULT` (`#4F9CFF`, blue) — it is unclear if a "secondary" blue button is intentional; no usage of this variant has been found in current screens       |
| 4   | 🟡 Med   | No `size` prop — button height is fixed at `h-14`; no compact/small variant                                                                                                           |
| 5   | 🟢 OK    | `bg-primary`, `bg-danger`, `text-primary`, `bg-white border-primary` all use correct Tailwind aliases ✅                                                                              |

---

### `RecordCustomerPaymentModal.tsx` — Submit Buttons

**File:** `src/components/customers/RecordCustomerPaymentModal.tsx`  
**Usage:** "Record Partial" and "Mark Full Paid" inline action buttons.

**Issues Found:**

| #   | Severity | Issue                                                                                          |
| --- | -------- | ---------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | Buttons are raw `TouchableOpacity` — bypasses `Button.tsx` entirely                            |
| 2   | 🟡 Med   | `border-[1.5px]` is a non-standard border width — `Button.tsx` uses `1px` via Tailwind default |
| 3   | 🟡 Med   | `rounded-[14px]` — arbitrary radius not in `radius` token scale                                |
| 4   | 🟢 OK    | Colors `border-primary bg-white text-primary` / `bg-primary text-white` are correct ✅         |

---

### `RecordPaymentMadeModal.tsx` — Submit Buttons

**File:** `src/components/suppliers/RecordPaymentMadeModal.tsx`  
**Usage:** Cancel + Record Payment buttons.

**Issues Found:**

| #   | Severity | Issue                                                                              |
| --- | -------- | ---------------------------------------------------------------------------------- |
| 1   | 🔴 High  | Buttons are raw `TouchableOpacity` — bypasses `Button.tsx` entirely                |
| 2   | 🟡 Med   | Cancel button has no `disabled` state and no active-opacity feedback configuration |
| 3   | 🟢 OK    | `bg-primary text-white` on submit ✅                                               |

---

### `NewProductModal.tsx` — Submit Button

**File:** `src/components/products/NewProductModal.tsx`  
**Usage:** Add / Edit Product form submit.

**Issues Found:**

| #   | Severity | Issue                                           |
| --- | -------- | ----------------------------------------------- |
| 1   | 🟢 OK    | Uses `Button` component from `ui/Button.tsx` ✅ |

---

## 4. Card Components

---

### `Card.tsx`

**File:** `src/components/ui/Card.tsx`  
**Usage:** Generic stats widget — used in dashboard / summary views.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                                                           |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | `text-gray-500` — raw Tailwind gray (`#6B7280`), NOT `neutral.500` (`#8E8E93`)                                                                                                  |
| 2   | 🔴 High  | `bg-neutral-100` — Tailwind default `neutral-100` (`#F5F5F5`), NOT theme `neutral.100` (`#F6F7FB`). Should use `bg-search` alias                                                |
| 3   | 🟡 Med   | `bg-icon` for icon backing — token exists in Tailwind config (`colors.icon.bg` = `#22C55E22`) but `bg-icon` is the full translucent green; does not have separate sizing tokens |
| 4   | 🟡 Med   | Typography uses `text-2xl font-semibold` — not from the `typography` scale in `theme.ts`                                                                                        |
| 5   | 🟡 Med   | No padding/radius tokens — uses bare Tailwind `p-4 rounded-lg`                                                                                                                  |

---

### `CustomerCard.tsx`

**File:** `src/components/customers/CustomerCard.tsx`  
**Usage:** Every row in the customers list.

**Issues Found:**

| #   | Severity | Issue                                                                                                                |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | `text-[#1C1C1E]` — raw hex, should be `text-neutral-900` or a theme alias                                            |
| 2   | 🔴 High  | `text-[#8E8E93]` — raw hex for phone label, should be themed neutral token                                           |
| 3   | 🔴 High  | `border-[#F0F0F5]` — not in design system (`neutral.200` = `#E5E5EA`): use `border-light` or `border-default` alias  |
| 4   | 🟡 Med   | Amount `AMOUNT_COLOR.Paid` = `#1C1C1E` and `AMOUNT_COLOR.Advance` = `#1C1C1E` — hardcoded hex instead of theme token |
| 5   | 🟡 Med   | All status badge colors are raw hex (see chip section above)                                                         |

---

### `ProductCard.tsx`

**File:** `src/components/products/ProductCard.tsx`  
**Usage:** Every row in the products list.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                                                                   |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🟢 OK    | Uses `bg-neutral-200`, `text-neutral-900`, `text-primary`, `border-neutral-200` — consistent token usage                                                                                |
| 2   | 🟡 Med   | `bg-neutral-200` is bare Tailwind neutral (not aliased to theme) — Tailwind `neutral-200` = `#E5E5E5` vs theme `neutral.200` = `#E5E5EA`; visually identical but technically off-system |

---

### `SupplierCard.tsx`

**File:** `src/components/suppliers/SupplierCard.tsx`  
**Usage:** Every row in the suppliers list.

**Issues Found:**

| #   | Severity | Issue                                                                                                                |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | Balance badge uses `bg-red-50 text-red-600` — raw Tailwind red. `red-600` = `#DC2626` ≠ `danger.DEFAULT` (`#E74C3C`) |
| 2   | 🔴 High  | Clear badge uses `bg-green-50 text-green-600` — raw Tailwind green. `green-50` ≠ `primary.light` (`#DCFCE7`)         |
| 3   | 🔴 High  | Icon backing `bg-amber-100` + `#d97706` — amber is not a theme color                                                 |
| 4   | 🟡 Med   | Sub-label `text-red-400` for "You owe" — raw Tailwind, not a design system tone                                      |

---

### `DashboardHeroCard.tsx`

**File:** `src/components/dashboard/DashboardHeroCard.tsx`  
**Usage:** Large hero card on Dashboard showing total balance.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                      |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 🟢 OK    | All colors sourced from `dashboardPalette` tokens ✅                                                                                       |
| 2   | 🟡 Med   | `heroDecor: "#F5ECD8"` (warm cream) is defined in `dashboardPalette` but not in `colors` in `theme.ts` — a one-off not in the core palette |

---

### `DashboardStatCards.tsx`

**File:** `src/components/dashboard/DashboardStatCards.tsx`  
**Usage:** "Active Buyers" and "Overdue Accounts" stat tiles on Dashboard.

**Issues Found:**

| #   | Severity | Issue                                         |
| --- | -------- | --------------------------------------------- |
| 1   | 🟢 OK    | All colors sourced from `dashboardPalette` ✅ |

---

## 5. Modal Components

---

### `AppModal` (`Modal.tsx`)

**File:** `src/components/ui/Modal.tsx`  
**Usage:** Wrapper for `NewProductModal`, `NewCustomerModal`, `NewSupplierModal`, `ProductActionsModal`. Uses `react-native-modal`.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                                                                               |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | `rounded-lg` on modal container = 8px — should be `rounded-xl` (16px) per design system `radius.xl`                                                                                                 |
| 2   | 🟡 Med   | Close icon color `#374151` — Tailwind `gray-700`, NOT `neutral.700` (`#48484A`)                                                                                                                     |
| 3   | 🟡 Med   | `backdropOpacity={0.5}` hardcoded — not a design token                                                                                                                                              |
| 4   | 🟡 Med   | `animationIn="fadeIn"` — no slide-up on a bottom-anchored sheet; `slideInUp` would be more standard                                                                                                 |
| 5   | 🔴 High  | The flex layout (`flex: 1, justifyContent: "flex-end"`) inside `KeyboardAvoidingView` positions modal at bottom, but the modal visually appears centered on some screens — inconsistent positioning |

---

### `RecordCustomerPaymentModal.tsx`

**File:** `src/components/customers/RecordCustomerPaymentModal.tsx`  
**Usage:** Bottom sheet to record payment on a customer order. Uses `@gorhom/bottom-sheet`.

**Issues Found:**

| #   | Severity | Issue                                                                                                                       |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🟡 Med   | `handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}` — Tailwind `gray-300` (`#D1D5DB`) ≠ theme `neutral.300` (`#C7C7CC`) |
| 2   | 🟡 Med   | Text `text-[#1C1C1E]`, `text-[#8E8E93]`, `text-[#636366]` — all raw hex, should use theme aliases                           |
| 3   | 🟢 OK    | Buttons and chips use `bg-primary`, `text-primary`, `text-danger` ✅                                                        |

---

### `RecordPaymentMadeModal.tsx`

**File:** `src/components/suppliers/RecordPaymentMadeModal.tsx`  
**Usage:** Bottom sheet to record payment to a supplier. Uses `@gorhom/bottom-sheet`.

**Issues Found:**

| #   | Severity | Issue                                                                                       |
| --- | -------- | ------------------------------------------------------------------------------------------- |
| 1   | 🟡 Med   | `handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}` — same gray-300 issue as above      |
| 2   | 🟢 OK    | Text uses `text-neutral-500`, `text-neutral-700` via Tailwind ✅ (values approximate theme) |

---

### `RecordDeliveryModal.tsx`

**File:** `src/components/suppliers/RecordDeliveryModal.tsx`  
**Usage:** Modal to log incoming supplier delivery with line items. Uses RN built-in `Modal`.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                           |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | Uses `react-native` built-in `Modal` — 3rd modal library pattern (app has `@gorhom/bottom-sheet`, `react-native-modal`, and now native `Modal`) |
| 2   | 🟡 Med   | Color values need full review (only first 80 lines read — full inline styles likely contain off-system hex values)                              |

---

### Modal Library Pattern Inconsistency — Architectural Issue

| Component                                                        | Library Used           |
| ---------------------------------------------------------------- | ---------------------- |
| `RecordCustomerPaymentModal`                                     | `@gorhom/bottom-sheet` |
| `RecordPaymentMadeModal`                                         | `@gorhom/bottom-sheet` |
| `AppModal` (NewProductModal, NewCustomerModal, NewSupplierModal) | `react-native-modal`   |
| `RecordDeliveryModal`                                            | RN built-in `Modal`    |

> **Issue:** Three different modal libraries are used across the same app. This creates inconsistent animation, positioning, keyboard behavior, and backdropopacity behavior.

---

## 6. Empty State Component

---

### `EmptyState.tsx`

**File:** `src/components/feedback/EmptyState.tsx`  
**Usage:** Shown in `CustomerList`, `SupplierList`, `OrderList`, `PaymentHistory`, `BottomSheetPicker`, `DashboardScreen` when results are empty.

**Issues Found:**

| #   | Severity | Issue                                                                                                          |
| --- | -------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 High  | Icon background `#F3F4F6` — Tailwind `gray-100`, NOT `neutral.100` (`#F6F7FB`). Use `colors.neutral[100]`      |
| 2   | 🔴 High  | Sub-text color `#6B7280` — Tailwind `gray-500`, NOT theme `neutral.500` (`#8E8E93`)                            |
| 3   | 🟡 Med   | Heading color `#1C1C1E` is correct (`neutral.900`) ✅ but hardcoded as literal — should import from `theme.ts` |
| 4   | 🟡 Med   | CTA button `backgroundColor: "#22C55E"` — correct value but raw hex; import from `colors.primary.DEFAULT`      |
| 5   | 🟡 Med   | CTA `borderRadius: 12` — not in `radius` token scale (`radius.lg` = 10, `radius.xl` = 16)                      |
| 6   | 🟡 Med   | Uses `StyleSheet.create` — inconsistent with rest of app using NativeWind `className`                          |
| 7   | 🟢 OK    | CTA color value is correct (`#22C55E`) ✅                                                                      |

---

## 7. Toast System

---

### `Toast.tsx`

**File:** `src/components/feedback/Toast.tsx`  
**Usage:** Global imperative toast — mounted in `app/_layout.tsx`. Called via `useToast().show({ message, type })`.

**Issues Found:**

| #   | Severity | Issue                                                                                                                                                        |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1   | 🔴 High  | Error background `#EF4444` — does NOT match `danger.DEFAULT` (`#E74C3C`). These are two different reds                                                       |
| 2   | 🟡 Med   | Success background `#22C55E` ✅ matches `primary.DEFAULT` — but `success.DEFAULT` is `#2ECC71`; depending on intent, this may be intentional or inconsistent |
| 3   | 🟡 Med   | `borderRadius: 14` — not in `radius` token scale (`radius.lg` = 10, `radius.xl` = 16)                                                                        |
| 4   | 🟡 Med   | No `warning` or `info` toast type — only `success                                                                                                            | error` supported |
| 5   | 🟡 Med   | Uses `StyleSheet.create` — consistent with itself but mixed with NativeWind across the app                                                                   |
| 6   | 🟢 OK    | Animation (slide + fade), duration, and safe-area insets are well implemented ✅                                                                             |

---

## Summary Table

| Component                            | File                                                      | Severity | Issue Count                                                |
| ------------------------------------ | --------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `CustomerCard` avatar                | `src/components/customers/CustomerCard.tsx`               | 🔴 High  | 6 off-system avatar colors                                 |
| `CustomerCard` status badge          | `src/components/customers/CustomerCard.tsx`               | 🔴 High  | 5 issues — raw hex, wrong light bg, wrong text token       |
| `SupplierCard` avatar + badges       | `src/components/suppliers/SupplierCard.tsx`               | 🔴 High  | 4 issues — amber, off-system greens/reds                   |
| `OrderList` status chip              | `src/components/orders/OrderList.tsx`                     | 🔴 High  | 5 issues — raw Tailwind, missing Overdue/Partial states    |
| `StatusDot`                          | `src/components/ui/StatusDot.tsx`                         | 🔴 High  | `yellow-500` and `red-500` mismatch design system          |
| `FilterBar`                          | `src/components/orders/FilterBar.tsx`                     | 🔴 High  | All `gray-*` classes, no active state                      |
| `Button`                             | `src/components/ui/Button.tsx`                            | 🟡 Med   | Spinner color wrong on outline, `rounded-md` inconsistency |
| `RecordCustomerPaymentModal` buttons | `src/components/customers/RecordCustomerPaymentModal.tsx` | 🔴 High  | Raw `TouchableOpacity`, bypasses `Button.tsx`              |
| `RecordPaymentMadeModal` buttons     | `src/components/suppliers/RecordPaymentMadeModal.tsx`     | 🔴 High  | Raw `TouchableOpacity`, bypasses `Button.tsx`              |
| `AppModal`                           | `src/components/ui/Modal.tsx`                             | 🟡 Med   | `rounded-lg` too small, wrong close icon color             |
| `RecordDeliveryModal`                | `src/components/suppliers/RecordDeliveryModal.tsx`        | 🔴 High  | 3rd modal library pattern (RN built-in `Modal`)            |
| `Card`                               | `src/components/ui/Card.tsx`                              | 🔴 High  | `text-gray-500` wrong, `bg-neutral-100` wrong token        |
| `EmptyState`                         | `src/components/feedback/EmptyState.tsx`                  | 🔴 High  | `#F3F4F6` wrong bg, `#6B7280` wrong text color             |
| `Toast`                              | `src/components/feedback/Toast.tsx`                       | 🔴 High  | Error color `#EF4444` ≠ `danger.DEFAULT` `#E74C3C`         |
| `DashboardHeroCard`                  | `src/components/dashboard/DashboardHeroCard.tsx`          | 🟢 OK    | Clean — uses `dashboardPalette`                            |
| `DashboardStatCards`                 | `src/components/dashboard/DashboardStatCards.tsx`         | 🟢 OK    | Clean — uses `dashboardPalette`                            |
| `StatusBadge`                        | `src/components/dashboard/StatusBadge.tsx`                | 🟢 OK    | Clean — uses `dashboardPalette`                            |
| `ProductCard`                        | `src/components/products/ProductCard.tsx`                 | 🟡 Low   | `bg-neutral-200` bare Tailwind (values near-identical)     |
| `RecordCustomerPaymentModal` chips   | `src/components/customers/RecordCustomerPaymentModal.tsx` | 🟡 Low   | Minor `border-[#E5E5EA]` vs `border-default`               |
| `RecordPaymentMadeModal` chips       | `src/components/suppliers/RecordPaymentMadeModal.tsx`     | 🟡 Low   | Chip shape inconsistency (rounded-lg vs rounded-full)      |

---

## Cross-Cutting Issues

### A — `neutral-*` Tailwind Classes Not Aliased

`bg-neutral-100` through `bg-neutral-900` are **bare Tailwind classes** throughout the codebase.  
They do NOT resolve to theme values in `theme.ts`.  
Only `bg-search` = `neutral.100` is aliased. All others are off-system.

### B — `text-gray-*` vs `text-neutral-*`

`gray-500` = `#6B7280` · `neutral.500` (theme) = `#8E8E93` — a visible difference in body text.  
Files affected: `Card.tsx`, `FilterBar.tsx`, `EmptyState.tsx`, `Input.tsx` labels.

### C — Three Modal Library Patterns

`@gorhom/bottom-sheet` · `react-native-modal` · `react-native Modal` — all in production.  
Keyboard handling, backdrop behavior, and animation differ silently across patterns.

### D — Two Button Patterns

`Button.tsx` (ui component) vs raw `TouchableOpacity` used in payment modals.  
No shared press-state, loading spinner, or disabled styling in the raw version.

### E — `StyleSheet.create` vs NativeWind

`EmptyState.tsx` and `Toast.tsx` use `StyleSheet.create`.  
All other components use NativeWind `className`.  
This creates two style debugging surfaces and prevents Tailwind purging.
