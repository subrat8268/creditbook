# CreditBook — Project Architecture

> **Last Updated**: March 9, 2026
> **App Version**: 3.3
> **Status**: Active Development

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Key Architecture Files](#2-key-architecture-files)
3. [Screens by Route Group](#3-screens-by-route-group)
4. [Modal Components](#4-modal-components)
5. [Zustand Stores](#5-zustand-stores)
6. [TanStack Query Hooks](#6-tanstack-query-hooks)
7. [Supabase Tables](#7-supabase-tables)
8. [API Functions](#8-api-functions)
9. [Global UI Components](#9-global-ui-components)
10. [Duplicate Components & Dead Files](#10-duplicate-components--dead-files)

---

## 1. Folder Structure

### `/app`

```
app/
├── _layout.tsx                   ← Root layout (QueryClient, ToastProvider, auth guard)
├── index.tsx                     ← Welcome / splash route
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── resetPassword.tsx
│   └── onboarding/
│       ├── _layout.tsx
│       ├── index.tsx             ← Step 1: Phone / intro
│       ├── business.tsx          ← Step 2: Business details
│       ├── ready.tsx             ← Step 3: Completion screen
│       └── role.tsx              ← Role selection (Retailer / Wholesaler / Small Business)
│
└── (main)/
    ├── _layout.tsx               ← Bottom tab navigator (5 tabs)
    ├── dashboard/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── customers/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   └── [customerId].tsx      ← Customer detail (dynamic route)
    ├── orders/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── create.tsx
    │   └── [orderId].tsx         ← Order detail (dynamic route)
    ├── products/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── suppliers/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   └── [supplierId].tsx      ← Supplier detail (dynamic route)
    ├── profile/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── reports/
    │   └── index.tsx             ← Financial Position screen (no tab; linked from dashboard)
    └── export/
        ├── _layout.tsx
        └── index.tsx
```

### `/src`

```
src/
├── api/           ← All Supabase data-fetching functions
├── components/    ← All UI components (see sections 4 and 9)
├── database/      ← Local DB models + sync (offline support)
│   ├── models/
│   └── sync/
├── hooks/         ← TanStack Query + utility hooks
├── i18n/          ← EN + HI translation files
├── screens/       ← Screen-level components (consumed by app/ routes)
├── services/      ← supabase.ts, sentry.ts
├── store/         ← Zustand stores
├── types/         ← TypeScript interfaces
└── utils/         ← theme, dashboardUi, helpers, schemas
```

### `/src/components`

```
src/components/
├── BottomSheetForm.tsx            ← Generic bottom-sheet form wrapper (used in ProductsScreen)
├── ImagePickerField.tsx           ← Camera/gallery image picker input
├── ScreenWrapper.tsx              ← Safe-area wrapper used by 5+ screens; uses SafeAreaView from react-native-safe-area-context
├── SearchablePickerModal.tsx      ← Full-screen picker (React Native Modal)
├── SubscriptionCard.tsx           ← Used only in ProfileScreen
│
├── customers/
│   ├── ContactsPickerModal.tsx
│   ├── CustomerCard.tsx
│   ├── CustomerList.tsx
│   ├── NewCustomerModal.tsx
│   └── RecordCustomerPaymentModal.tsx   ← @gorhom/bottom-sheet, snapPoints ["65%"]
│
├── dashboard/
│   ├── ActivityRow.tsx
│   ├── DashboardActionBar.tsx
│   ├── DashboardHeader.tsx
│   ├── DashboardHeroCard.tsx
│   ├── DashboardRecentActivity.tsx
│   ├── DashboardStatCards.tsx
│   └── StatusBadge.tsx
│
├── feedback/
│   ├── EmptyState.tsx             ← title/description/cta/onCta; CircleOff icon
│   ├── ErrorState.tsx
│   ├── Loader.tsx
│   └── Toast.tsx                  ← ToastProvider + useToast(); success/error
│
├── onboarding/
│   └── OnboardingProgress.tsx
│
├── orders/
│   ├── CustomerSelector.tsx
│   ├── FilterBar.tsx
│   ├── OrderBillSummary.tsx
│   ├── OrderItemCard.tsx
│   ├── OrderList.tsx
│   ├── OrderSummary.tsx
│   ├── PaymentHistory.tsx
│   └── RecordPayments.tsx
│
├── picker/
│   ├── BottomSheetPicker.tsx
│   ├── CustomerPicker.tsx
│   ├── ProductPicker.tsx
│   └── VariantPicker.tsx
│
├── products/
│   ├── NewProductModal.tsx
│   ├── ProductActionsModal.tsx
│   └── ProductCard.tsx
│
├── suppliers/
│   ├── NewSupplierModal.tsx
│   ├── RecordDeliveryModal.tsx
│   ├── RecordPaymentMadeModal.tsx  ← @gorhom/bottom-sheet, snapPoints ["62%"]
│   ├── SupplierCard.tsx
│   └── SupplierList.tsx
│
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── FloatingActionButton.tsx    ← Moved from root components/ (P-27) — 5 importers
    ├── Input.tsx
    ├── Modal.tsx                   ← Wraps react-native-modal (legacy pattern)
    ├── SearchBar.tsx               ← Moved from root components/ (P-27) — 5 importers
    └── StatusDot.tsx
```

### `/src/screens`

```
src/screens/
├── CreateOrderScreen.tsx
├── CustomersScreen.tsx
├── DashboardScreen.tsx
├── ExportScreen.tsx
├── OrdersScreen.tsx
├── ProductsScreen.tsx
├── ProfileScreen.tsx
└── SuppliersScreen.tsx
```

> All 8 screens are thin wrappers imported 1:1 by a corresponding `app/(main)/*/index.tsx` route.
> `customers/[customerId].tsx`, `suppliers/[supplierId].tsx`, `orders/[orderId].tsx`, and `reports/index.tsx`
> are implemented inline in `app/` with no matching screen file.

### `/src/api`

```
src/api/
├── auth.ts
├── customers.ts
├── dashboard.ts
├── export.ts
├── orders.ts
├── products.ts
├── profiles.ts
├── suppliers.ts
└── upload.ts
```

### `/src/utils`

```
src/utils/
├── theme.ts               ← Single source of truth for colors, spacing, dashboardPalette
├── dashboardUi.ts         ← Re-exports dashboardPalette; formatINR, formatDashboardDate
├── ThemeProvider.tsx      ← Context wrapper
├── exportCsv.ts
├── generateBillPdf.ts
├── helper.ts
├── phone.ts
├── schemas.ts             ← Zod validation schemas
└── uploadPdfToSupabase.ts
```

### `/src/store`

```
src/store/
├── authStore.ts
├── customersStore.ts
├── dashboardStore.tsx     ← ⚠️ CONFIRMED DEAD — `useDashboardStore` never imported; delete in v3.4 cleanup
├── languageStore.ts
├── orderStore.ts
└── suppliersStore.ts
```

---

## 2. Key Architecture Files

| File                    | Location                                 | Notes                                                                                                                                                     |
| :---------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **theme.ts**            | `src/utils/theme.ts`                     | `colors` (primary `#22C55E`, success, danger, warning, info, neutral), `dashboardPalette`, `spacing`. Single source of truth — 163 lines.                 |
| **tailwind.config.js**  | root                                     | Reads from `theme.ts` via `require`. Maps `primary`, `danger`, `success`, `warning`, `info`, `textPrimary`, font family tokens.                           |
| **dashboardUi.ts**      | `src/utils/dashboardUi.ts`               | Re-exports `dashboardPalette` from `theme.ts`. Adds `formatINR()` and `formatDashboardDate()`.                                                            |
| **Toast.tsx**           | `src/components/feedback/Toast.tsx`      | Context: `ToastProvider` + `useToast()`. Hook exposes `show({ message, type, duration? })`. Slide-down animation. Success = `#22C55E`, Error = `#E74C3C`. |
| **EmptyState.tsx**      | `src/components/feedback/EmptyState.tsx` | Props: `message?` (legacy), `title?`, `description?`, `cta?`, `onCta?`. Icon: `CircleOff`. CTA button is green `#22C55E`.                                 |
| **\_layout.tsx** (root) | `app/_layout.tsx`                        | Mounts `QueryClientProvider` → `ThemeProvider` → `GestureHandlerRootView` → `ToastProvider` → `Stack`. Handles auth guard + onboarding routing.           |
| **DashboardScreen.tsx** | `src/screens/DashboardScreen.tsx`        | Reads `profile.dashboard_mode`. Renders split hero (`isBothMode`) or single (`isVendorMode`). Uses all 7 dashboard sub-components.                        |

---

## 3. Screens by Route Group

### Auth Screens

```
app/(auth)/login.tsx
app/(auth)/signup.tsx
app/(auth)/resetPassword.tsx
app/(auth)/onboarding/index.tsx        ← Step 1 (phone/intro)
app/(auth)/onboarding/business.tsx     ← Step 2 (business details)
app/(auth)/onboarding/ready.tsx        ← Step 3 (completion)
app/(auth)/onboarding/role.tsx         ← Role selection
```

### Main Screens (Tab Bar)

```
app/(main)/dashboard/index.tsx         ← Home tab (House icon)
app/(main)/customers/index.tsx         ← Customers tab (Users icon)
app/(main)/customers/[customerId].tsx  ← Customer detail (dynamic)
app/(main)/orders/index.tsx            ← Orders tab (FileText icon)
app/(main)/orders/create.tsx           ← New bill screen
app/(main)/orders/[orderId].tsx        ← Order detail (dynamic)
app/(main)/products/index.tsx          ← Products tab
app/(main)/suppliers/index.tsx         ← Suppliers tab (Truck icon)
app/(main)/suppliers/[supplierId].tsx  ← Supplier detail (dynamic)
app/(main)/profile/index.tsx           ← Profile tab (UserCircle icon)
```

### Non-Tab Main Screens

```
app/(main)/reports/index.tsx           ← Financial Position (linked from DashboardActionBar)
app/(main)/reports/_layout.tsx         ← Layout file (created P-13 — prevents double header)
app/(main)/export/index.tsx            ← Data export screen
```

---

## 4. Modal Components

### `@gorhom/bottom-sheet`

```
src/components/customers/RecordCustomerPaymentModal.tsx    snapPoints: ["65%"]
src/components/suppliers/RecordPaymentMadeModal.tsx        snapPoints: ["62%"]
src/components/BottomSheetForm.tsx                         Generic wrapper
src/components/picker/BottomSheetPicker.tsx
```

### `react-native-modal`

```
src/components/ui/Modal.tsx            AppModal wrapper (legacy — no active screen usage)
```

### React Native built-in `Modal`

```
src/components/SearchablePickerModal.tsx
```

### Custom overlay views (no modal library)

```
src/components/customers/NewCustomerModal.tsx
src/components/customers/ContactsPickerModal.tsx
src/components/suppliers/NewSupplierModal.tsx
src/components/suppliers/RecordDeliveryModal.tsx
src/components/products/NewProductModal.tsx
src/components/products/ProductActionsModal.tsx
```

> ⚠️ Three different modal patterns are in use across the codebase.

---

## 5. Zustand Stores

| Store               | File                 | Purpose                                                           |
| :------------------ | :------------------- | :---------------------------------------------------------------- |
| `useAuthStore`      | `authStore.ts`       | `user`, `profile`, `loading`, `setUser`, `fetchProfile`, `logout` |
| `useCustomersStore` | `customersStore.ts`  | Local customer list state                                         |
| `useSuppliersStore` | `suppliersStore.ts`  | Local supplier list state                                         |
| `useOrderStore`     | `orderStore.ts`      | Current order / cart state                                        |
| `useLanguageStore`  | `languageStore.ts`   | Active language (EN/HI), `loadLanguage()`                         |
| `useDashboardStore` | `dashboardStore.tsx` | ⚠️ **DEAD** — exported but never imported anywhere in the app     |

---

## 6. TanStack Query Hooks

All hooks live in `src/hooks/`:

| Hook                                         | File                   | Type                                                               |
| :------------------------------------------- | :--------------------- | :----------------------------------------------------------------- |
| `useDashboard(vendorId)`                     | `useDashboard.ts`      | Query                                                              |
| `useCustomers(vendorId, search)`             | `useCustomer.ts`       | Infinite query                                                     |
| `useAddCustomer(vendorId)`                   | `useCustomer.ts`       | Mutation                                                           |
| `useCustomerDetail(customerId)`              | `useCustomer.ts`       | Query                                                              |
| `useOrders(vendorId, filters)`               | `useOrders.ts`         | Infinite query                                                     |
| `useOrderDetail(orderId)`                    | `useOrders.ts`         | Query                                                              |
| `useCreateOrder(vendorId)`                   | `useOrders.ts`         | Mutation                                                           |
| `usePayments(orderId, vendorId)`             | `usePayments.ts`       | Query + Mutation                                                   |
| `useProducts(vendorId, search)`              | `useProducts.ts`       | Infinite query                                                     |
| `useAddProduct(vendorId)`                    | `useProducts.ts`       | Mutation                                                           |
| `useUpdateProduct(vendorId)`                 | `useProducts.ts`       | Mutation                                                           |
| `useDeleteProduct(vendorId)`                 | `useProducts.ts`       | Mutation                                                           |
| `useSuppliers(vendorId, search)`             | `useSuppliers.ts`      | Infinite query                                                     |
| `useAddSupplier(vendorId)`                   | `useSuppliers.ts`      | Mutation                                                           |
| `useSupplierDetail(supplierId)`              | `useSuppliers.ts`      | Query                                                              |
| `useRecordDelivery(vendorId, supplierId)`    | `useSuppliers.ts`      | Mutation                                                           |
| `useRecordPaymentMade(vendorId, supplierId)` | `useSuppliers.ts`      | Mutation                                                           |
| `useOrderFilters()`                          | `useOrderFilters.ts`   | Local UI state only                                                |
| `useInfiniteScroll(onLoadMore)`              | `useInfiniteScroll.ts` | Utility                                                            |
| `useDebounce(value, delay)`                  | `useDebounce.ts`       | Utility                                                            |
| `useFontsLoader()`                           | `useFontsLoader.ts`    | Loads Inter font family                                            |
| `useLogin()`                                 | `useLogin.ts`          | Wraps `loginApi` + `useAuthStore.setUser`                          |
| `useAuth()`                                  | `useAuth.ts`           | Sets up `supabase.auth.onAuthStateChange` — mounted in root layout |

---

## 7. Supabase Tables

| Table                     | Used In                                                                  |
| :------------------------ | :----------------------------------------------------------------------- |
| `profiles`                | `api/auth.ts`, `api/profiles.ts`, `store/authStore.ts`                   |
| `customers`               | `api/customers.ts`, `api/export.ts`                                      |
| `orders`                  | `api/orders.ts`, `api/customers.ts`, `api/dashboard.ts`, `api/export.ts` |
| `order_items`             | `api/orders.ts`                                                          |
| `payments`                | `api/orders.ts`, `api/dashboard.ts`, `api/export.ts`                     |
| `products`                | `api/products.ts`                                                        |
| `suppliers`               | `api/suppliers.ts`                                                       |
| `supplier_deliveries`     | `api/suppliers.ts`, `api/dashboard.ts`, `api/export.ts`                  |
| `supplier_delivery_items` | `api/suppliers.ts`                                                       |
| `payments_made`           | `api/suppliers.ts`, `api/dashboard.ts`                                   |

**Total: 10 tables**

---

## 8. API Functions

### `auth.ts`

- `loginApi(values)`
- `signUpApi(values)`
- `resetPasswordApi(email)`
- `logoutApi()`

### `customers.ts`

- `fetchCustomers(vendorId, page, search)`
- `addCustomer(vendorId, data)`
- `fetchCustomerDetail(customerId)`

### `dashboard.ts`

- `getDashboardData(vendorId)`

### `export.ts`

- `fetchOrdersForExport(vendorId, filters)`
- `fetchPaymentsForExport(vendorId, filters)`
- `fetchCustomersForExport(vendorId)`
- `fetchSupplierPurchasesForExport(vendorId, filters)`

### `orders.ts`

- `fetchOrders(vendorId, page, filters)`
- `fetchOrderDetail(orderId)`
- `fetchPayments(orderId)`
- `recordPayment(vendorId, orderId, data)`
- `getNextBillNumber(vendorId, prefix)`
- `getCustomerPreviousBalance(vendorId, customerId)`
- `createOrder(vendorId, data)`

### `products.ts`

- `fetchProducts(vendorId, page, search)`
- `addProduct(vendorId, data)`
- `updateProduct(productId, data)`
- `deleteProduct(productId)`

### `profiles.ts`

- `getProfile(user_id)`

### `suppliers.ts`

- `fetchSuppliers(vendorId, page, search)`
- `addSupplier(vendorId, data)`
- `fetchSupplierDetail(supplierId)`
- `recordDelivery(vendorId, supplierId, data)`
- `recordPaymentMade(vendorId, supplierId, data)`

### `upload.ts`

- `uploadImage(uri)`

---

## 9. Global UI Components

### `src/components/feedback/`

| File             | Purpose                                                               |
| :--------------- | :-------------------------------------------------------------------- |
| `EmptyState.tsx` | Empty list/screen state with optional CTA button                      |
| `ErrorState.tsx` | Error screen state                                                    |
| `Loader.tsx`     | Full-screen loading spinner                                           |
| `Toast.tsx`      | `ToastProvider` + `useToast()` — animated success/error notifications |

### `src/components/ui/`

| File                       | Purpose                                        |
| :------------------------- | :--------------------------------------------- |
| `Button.tsx`               | Reusable button (primary/secondary variants)   |
| `Card.tsx`                 | White card container                           |
| `FloatingActionButton.tsx` | Reusable FAB (moved from root — P-27)          |
| `Input.tsx`                | Styled text input                              |
| `Modal.tsx`                | `AppModal` wrapper around `react-native-modal` |
| `SearchBar.tsx`            | Shared search input (moved from root — P-27)   |
| `StatusDot.tsx`            | Colored indicator dot                          |

### `src/components/dashboard/`

| File                          | Purpose                                        |
| :---------------------------- | :--------------------------------------------- |
| `DashboardHeader.tsx`         | Business name + avatar + settings icon         |
| `DashboardHeroCard.tsx`       | Hero amount card (single or split "both" mode) |
| `DashboardActionBar.tsx`      | "View Report" / "Send Reminder" buttons        |
| `DashboardStatCards.tsx`      | Active Buyers + Overdue count stat cards       |
| `DashboardRecentActivity.tsx` | Last N activity rows container                 |
| `ActivityRow.tsx`             | Single activity feed row                       |
| `StatusBadge.tsx`             | PAID / PENDING / OVERDUE / PARTIAL pill chip   |

---

## 10. Duplicate Components & Dead Files

### Dead Files (never imported)

| File                                 | Reason                                                                                                                                                                                                                     | Status                                              |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| `src/components/PdfPreviewModal.tsx` | No import found anywhere in the codebase                                                                                                                                                                                   | ✅ **Deleted** (P-10, March 8, 2026)                |
| `src/components/QuickAction.tsx`     | No import found; name only appears in i18n string keys                                                                                                                                                                     | ✅ **Deleted** (P-10, March 8, 2026)                |
| `src/store/dashboardStore.tsx`       | `useDashboardStore` is never imported; dashboard data flows through `useDashboard` → TanStack Query. The store's field names (`totalRevenue`, `outstandingAmount`) are also outdated vs. the current `DashboardData` shape | ⚠️ **Confirmed dead** — queued for deletion in v3.4 |

### Three Conflicting Modal Patterns

| Pattern           | Library                | Files                                                                                          |
| :---------------- | :--------------------- | :--------------------------------------------------------------------------------------------- |
| Bottom sheet (v5) | `@gorhom/bottom-sheet` | `RecordCustomerPaymentModal`, `RecordPaymentMadeModal`, `BottomSheetForm`, `BottomSheetPicker` |
| Full-screen modal | `react-native-modal`   | `src/components/ui/Modal.tsx` (`AppModal`)                                                     |
| Native modal      | RN built-in `Modal`    | `SearchablePickerModal.tsx`                                                                    |

`AppModal` (`react-native-modal`) appears to be a legacy pattern — it is absent from all currently active screens.

### Unorganized Root-Level Components

All multi-screen shared utilities have been moved to domain subfolders. Remaining root-level files:

| File                        | Used By                                                                                                   | Status                                                                |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `BottomSheetForm.tsx`       | `ProductsScreen.tsx`                                                                                      | Active; 1 importer — kept at root until second consumer warrants move |
| `ImagePickerField.tsx`      | Onboarding / profile screens                                                                              | Active                                                                |
| `ScreenWrapper.tsx`         | `SuppliersScreen`, `ProfileScreen`, `ProductsScreen`, `OrdersScreen`, `ExportScreen`, `CreateOrderScreen` | Active                                                                |
| `SearchablePickerModal.tsx` | Order creation flow                                                                                       | Active                                                                |
| `SubscriptionCard.tsx`      | `ProfileScreen` only                                                                                      | Active                                                                |

> **P-27 (March 9, 2026):** `FloatingActionButton.tsx` and `SearchBar.tsx` were moved from root to `src/components/ui/`. All 10 import paths updated across 7 files.

### Inconsistent `src/screens/` Indirection Layer

8 of 12 main routes delegate to `src/screens/`:

```
app/(main)/dashboard/index.tsx  →  src/screens/DashboardScreen.tsx
app/(main)/customers/index.tsx  →  src/screens/CustomersScreen.tsx
app/(main)/orders/index.tsx     →  src/screens/OrdersScreen.tsx
app/(main)/orders/create.tsx    →  src/screens/CreateOrderScreen.tsx
app/(main)/products/index.tsx   →  src/screens/ProductsScreen.tsx
app/(main)/suppliers/index.tsx  →  src/screens/SuppliersScreen.tsx
app/(main)/profile/index.tsx    →  src/screens/ProfileScreen.tsx
app/(main)/export/index.tsx     →  src/screens/ExportScreen.tsx
```

The other 4 routes (`[customerId].tsx`, `[supplierId].tsx`, `[orderId].tsx`, `reports/index.tsx`) implement their logic directly inside `app/`. This creates an inconsistent pattern with no clear rule for where screen logic should live.

---

_This document is auto-generated from a full codebase scan. Update whenever screens, stores, API functions, or components are added or removed._
