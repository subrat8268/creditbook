# CreditBook — Screen Inventory

> **Last Updated**: March 8, 2026
> **App Version**: 3.3
> **Audit Status**: Complete codebase scan

---

## Legend

| Symbol | Meaning                       |
| :----- | :---------------------------- |
| ✅     | Exists and correctly routed   |
| ⚠️     | Exists with a note or concern |
| ❌     | Missing — no file found       |

---

## AUTH

| Screen Name    | File Path                        | Exists | Notes                                                                     |
| :------------- | :------------------------------- | :----: | :------------------------------------------------------------------------ |
| Welcome        | `app/index.tsx`                  |   ✅   | Splash / welcome screen. Guarded by `hasSeenWelcome` in AsyncStorage      |
| Login          | `app/(auth)/login.tsx`           |   ✅   | Email + password auth via Supabase                                        |
| Signup         | `app/(auth)/signup.tsx`          |   ✅   | Email + password registration                                             |
| Reset Password | `app/(auth)/resetPassword.tsx`   |   ✅   | Sends Supabase password reset email                                       |
| Role Selection | `app/(auth)/onboarding/role.tsx` |   ✅   | Retailer / Wholesaler / Small Business; saves `dashboard_mode` to profile |

---

## ONBOARDING

| Screen Name               | File Path                            | Exists | Notes                                                   |
| :------------------------ | :----------------------------------- | :----: | :------------------------------------------------------ |
| Step 1 — Phone / Intro    | `app/(auth)/onboarding/index.tsx`    |   ✅   | Entry point for onboarding flow                         |
| Step 2 — Business Details | `app/(auth)/onboarding/business.tsx` |   ✅   | Business name, GSTIN, UPI ID, bill prefix, bank details |
| Step 3 — Ready            | `app/(auth)/onboarding/ready.tsx`    |   ✅   | Completion screen; sets `onboarding_complete = true`    |

---

## DASHBOARD

| Screen Name           | File Path                         | Exists | Notes                                                                                                                                                     |
| :-------------------- | :-------------------------------- | :----: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seller Dashboard      | `src/screens/DashboardScreen.tsx` |   ⚠️   | **Not a separate file.** Mode is `vendor` / `seller` / `wholesaler` / `retailer`. `isVendorMode = true` → single green hero card showing `customersOweMe` |
| Distributor Dashboard | `src/screens/DashboardScreen.tsx` |   ⚠️   | **Not a separate file.** Mode is `distributor`. `isVendorMode = false`, `isBothMode = false` → single red hero card showing `iOweSuppliers`               |
| Both Dashboard        | `src/screens/DashboardScreen.tsx` |   ⚠️   | **Not a separate file.** Mode is `both`. `isBothMode = true` → split hero card: green YOU RECEIVE panel + red YOU OWE panel + net position row            |

> ⚠️ **All three dashboard modes render inside a single `DashboardScreen.tsx`.** There are no separate screen files per mode. The route is always `app/(main)/dashboard/index.tsx`.

---

## CUSTOMERS

| Screen Name          | File Path                                | Exists | Notes                                                                                                                                                                  |
| :------------------- | :--------------------------------------- | :----: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customers List       | `src/screens/CustomersScreen.tsx`        |   ✅   | Route: `app/(main)/customers/index.tsx`. Filter tabs (All / Overdue / Paid / Pending), search, FAB                                                                     |
| Customer Detail      | `app/(main)/customers/[customerId].tsx`  |   ✅   | Implemented inline — no `src/screens/` file. Hero card, transaction feed, record payment, download statement                                                           |
| Customer Empty State | `src/components/feedback/EmptyState.tsx` |   ⚠️   | **Not a standalone screen.** `EmptyState` component is rendered inside `CustomerList.tsx` when the filtered list is empty. No dedicated empty-state screen file exists |

---

## SUPPLIERS

| Screen Name          | File Path                                | Exists | Notes                                                                                                                         |
| :------------------- | :--------------------------------------- | :----: | :---------------------------------------------------------------------------------------------------------------------------- |
| Suppliers List       | `src/screens/SuppliersScreen.tsx`        |   ✅   | Route: `app/(main)/suppliers/index.tsx`. Sorted by highest balance owed                                                       |
| Supplier Detail      | `app/(main)/suppliers/[supplierId].tsx`  |   ✅   | Implemented inline — no `src/screens/` file. Balance card, delivery history, Record Delivery + Pay Supplier modals            |
| Supplier Empty State | `src/components/feedback/EmptyState.tsx` |   ⚠️   | **Not a standalone screen.** `EmptyState` rendered inside `SupplierList.tsx`. Shared component — same as Customer Empty State |

---

## BILLING

| Screen Name        | File Path                                     | Exists | Notes                                                                                                                                                                               |
| :----------------- | :-------------------------------------------- | :----: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Bill Screen    | `src/screens/CreateOrderScreen.tsx`           |   ✅   | Route: `app/(main)/orders/create.tsx`. Customer selector, product search, line items, GST %, loading charge, live total                                                             |
| Add Product Modal  | `src/components/products/NewProductModal.tsx` |   ⚠️   | **Shared with Edit.** Same component for Add and Edit — differentiated by `title` prop (`"Add"` vs `"Edit"`) and presence of `initialValues`. Wraps `AppModal` (react-native-modal) |
| Edit Product Modal | `src/components/products/NewProductModal.tsx` |   ⚠️   | **Same file as Add Product Modal.** Edit is triggered via `ProductActionsModal` (action chooser) → re-opens `NewProductModal` with pre-filled `initialValues`                       |

> ⚠️ `ProductActionsModal.tsx` is a separate "Edit or Delete" action picker — it is not itself an edit form. The actual edit form is `NewProductModal.tsx`.

---

## TRANSACTIONS

| Screen Name             | File Path                                                 | Exists | Notes                                                                                                       |
| :---------------------- | :-------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------------------------------- |
| Orders List             | `src/screens/OrdersScreen.tsx`                            |   ✅   | Route: `app/(main)/orders/index.tsx`. Infinite scroll, filters, search                                      |
| Order Detail            | `app/(main)/orders/[orderId].tsx`                         |   ✅   | Implemented inline — no `src/screens/` file. Bill summary, payment history, PDF export                      |
| Record Customer Payment | `src/components/customers/RecordCustomerPaymentModal.tsx` |   ✅   | `@gorhom/bottom-sheet`, `snapPoints: ["65%"]`. Amount input, 5 payment mode chips, Partial / Mark Full Paid |
| Record Delivery         | `src/components/suppliers/RecordDeliveryModal.tsx`        |   ✅   | RN built-in `Modal`. Itemized rows (item × qty × rate), loading charge, advance paid                        |
| Pay Supplier            | `src/components/suppliers/RecordPaymentMadeModal.tsx`     |   ✅   | `@gorhom/bottom-sheet`, `snapPoints: ["62%"]`. Amount, payment mode, notes                                  |

---

## REPORTS

| Screen Name        | File Path                      | Exists | Notes                                                                                                                                               |
| :----------------- | :----------------------------- | :----: | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| Financial Position | `app/(main)/reports/index.tsx` |   ✅   | Implemented inline — no `src/screens/` file. Customers Owe Me + I Owe Suppliers + Net Position. Linked from `DashboardActionBar` "View Report"      |
| Export Data        | `src/screens/ExportScreen.tsx` |   ✅   | Route: `app/(main)/export/index.tsx`. Date-range filter, 4 export buttons (Orders, Payments, Customers, Supplier Purchases), CSV via `expo-sharing` |

---

## PROFILE

| Screen Name        | File Path                       | Exists | Notes                                                                                                                                |
| :----------------- | :------------------------------ | :----: | :----------------------------------------------------------------------------------------------------------------------------------- |
| Profile & Settings | `src/screens/ProfileScreen.tsx` |   ✅   | Route: `app/(main)/profile/index.tsx`. Business details, dashboard mode toggle, language toggle, export, subscription card, sign out |

---

## UTILITY

| Screen Name    | File Path                                          | Exists | Notes                                                                                                                                                  |
| :------------- | :------------------------------------------------- | :----: | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contact Picker | `src/components/customers/ContactsPickerModal.tsx` |   ✅   | `expo-contacts` permissions, multi-select, search, select-all, bulk import with per-contact error skipping. Opened from Customers screen secondary FAB |
| Success Toast  | `src/components/feedback/Toast.tsx`                |   ✅   | `ToastProvider` + `useToast()`. Slide-down from top. Success = `#22C55E`, Error = `#EF4444`. Auto-dismiss at 2800ms. Mounted in `app/_layout.tsx`      |

---

## Summary

### Counts

| Status                         |  Count |
| :----------------------------- | -----: |
| ✅ Exists and correctly routed |     22 |
| ⚠️ Exists with concern         |      8 |
| ❌ Missing                     |      0 |
| **Total expected**             | **30** |

---

## Issues

### 1. Missing Screens

None. All 30 expected surfaces have implementations.

---

### 2. Duplicate / Merged Screens

| Issue                               | Detail                                                                                                                                                               |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add Product = Edit Product**      | `NewProductModal.tsx` handles both Add and Edit via `title` prop + `initialValues`. Functionally correct but semantically they are one component masquerading as two |
| **Customer / Supplier Empty State** | Both share the single `EmptyState` component from `src/components/feedback/`. They are not separate screens; they are component-level states                         |

---

### 3. Incorrect / Inconsistent Routes

| Issue                                        | Detail                                                                                                                                                                                                                    |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Inline vs. `src/screens/` split**          | 8 routes delegate to `src/screens/*.tsx`; 4 routes (`[customerId].tsx`, `[supplierId].tsx`, `[orderId].tsx`, `reports/index.tsx`) implement logic directly inside `app/`. No consistent rule for where screen logic lives |
| **`reports/index.tsx` has no `_layout.tsx`** | Every other `(main)` sub-folder has a `_layout.tsx`. `reports/` has only `index.tsx` — works fine today but breaks the project convention                                                                                 |
| **`export/` is not in the tab bar**          | `app/(main)/export/` exists and renders, but it has no tab entry in `app/(main)/_layout.tsx`. It is only reachable via a programmatic `router.push('/(main)/export')` from ProfileScreen                                  |
| **Three modal patterns in use**              | `@gorhom/bottom-sheet` (payment modals), `react-native-modal` (NewProductModal via AppModal), RN built-in `Modal` (RecordDeliveryModal, SearchablePickerModal). No single standard                                        |
| **`useDashboardStore` is dead**              | `src/store/dashboardStore.tsx` exports `useDashboardStore` but it is never imported anywhere. Dashboard state flows entirely through TanStack Query (`useDashboard`)                                                      |

---

_This inventory is derived from a full codebase scan as of March 8, 2026. Update whenever screens, modals, or routes are added, removed, or renamed._
