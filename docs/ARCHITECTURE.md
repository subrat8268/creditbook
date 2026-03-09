# CreditBook — Project Architecture

> **Last Updated**: March 9, 2026
> **App Version**: 3.4
> **Status**: Production code complete — pending device verification

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
10. [Known Architecture Notes](#10-known-architecture-notes)

---

## 1. Folder Structure

### `/app`

```
app/
├── _layout.tsx                   ← Root layout (QueryClient, ToastProvider, auth guard, Sentry.wrap)
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
    │   └── [customerId].tsx      ← Customer detail (inline, no src/screens/ file)
    ├── orders/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── create.tsx
    │   └── [orderId].tsx         ← Order detail (inline)
    ├── products/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── suppliers/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   └── [supplierId].tsx      ← Supplier detail (inline)
    ├── profile/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── reports/
    │   ├── _layout.tsx           ← Created P-13 (headerShown: false, slideFromRight)
    │   └── index.tsx             ← Financial Position screen (linked from dashboard)
    └── export/
        ├── _layout.tsx
        └── index.tsx             ← Hidden from tab bar; push from ProfileScreen
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
├── BottomSheetForm.tsx            ← Generic bottom-sheet wrapper (1 importer: ProductsScreen)
├── ImagePickerField.tsx           ← Camera/gallery image picker input
├── ScreenWrapper.tsx              ← Safe-area wrapper; uses SafeAreaView from react-native-safe-area-context
├── SearchablePickerModal.tsx      ← Full-screen picker (React Native built-in Modal)
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
│   ├── EmptyState.tsx             ← NativeWind; title/description/cta/onCta; CircleOff icon
│   ├── ErrorState.tsx
│   ├── Loader.tsx
│   └── Toast.tsx                  ← ToastProvider + useToast(); success (#22C55E) / error (#E74C3C)
│
├── onboarding/
│   └── OnboardingProgress.tsx
│
├── orders/
│   ├── CustomerSelector.tsx
│   ├── FilterBar.tsx              ← Active chip state added (P-12); theme tokens only
│   ├── OrderBillSummary.tsx
│   ├── OrderItemCard.tsx
│   ├── OrderList.tsx              ← STATUS_STYLES map: Paid/Partial/Pending/Overdue (P-06)
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
│   ├── NewProductModal.tsx        ← Still uses AppModal (react-native-modal) — deferred M-01
│   ├── ProductActionsModal.tsx
│   └── ProductCard.tsx
│
├── suppliers/
│   ├── NewSupplierModal.tsx
│   ├── RecordDeliveryModal.tsx    ← Migrated to @gorhom/bottom-sheet (P-08)
│   ├── RecordPaymentMadeModal.tsx ← @gorhom/bottom-sheet, snapPoints ["62%"]
│   ├── SupplierCard.tsx           ← Initials avatar added (P-15); amber → theme tokens
│   └── SupplierList.tsx
│
└── ui/
    ├── Button.tsx                 ← Outline spinner color fixed to #22C55E (P-07)
    ├── Card.tsx
    ├── FloatingActionButton.tsx   ← Moved from root (P-27)
    ├── Input.tsx
    ├── Modal.tsx                  ← AppModal (react-native-modal legacy); animationIn="slideInUp" (P-17)
    ├── SearchBar.tsx              ← Moved from root (P-27)
    └── StatusDot.tsx              ← DOT_COLOR record using theme values (P-17)
```

### `/src/screens`

```
src/screens/
├── CreateOrderScreen.tsx          ← KeyboardAvoidingView added (P-24)
├── CustomersScreen.tsx
├── DashboardScreen.tsx            ← isSellerMode fixed from stale 'vendor' check (P-02)
├── ExportScreen.tsx               ← ArrowLeft back button added (P-21)
├── OrdersScreen.tsx
├── ProductsScreen.tsx
├── ProfileScreen.tsx              ← Mode toggle Seller/Distributor/Both; filled avatar (P-21)
└── SuppliersScreen.tsx
```

---

## 2. Key Architecture Files

| File                       | Purpose                                                                                                               |
| :------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `app/_layout.tsx`          | Root layout — `QueryClientProvider → ThemeProvider → GestureHandlerRootView → ToastProvider → Stack`; `Sentry.wrap()` |
| `src/utils/theme.ts`       | **Single source of truth** for all color tokens, spacing, radius, typography                                          |
| `src/utils/dashboardUi.ts` | Thin re-export of `dashboardPalette` from `theme.ts` + INR/date formatters                                            |
| `src/services/sentry.ts`   | `initSentry()` + DSN env guard; called at module level in root layout                                                 |
| `schema.sql`               | Master DB schema — tables, RLS policies, RPC functions, indexes                                                       |
| `tailwind.config.js`       | NativeWind token aliases mapping to `theme.ts` values                                                                 |

---

## 3. Screens by Route Group

### Auth Screens (`app/(auth)/`)

| Screen         | File                                 | Pattern |
| :------------- | :----------------------------------- | :------ |
| Welcome        | `app/index.tsx`                      | Inline  |
| Login          | `app/(auth)/login.tsx`               | Inline  |
| Signup         | `app/(auth)/signup.tsx`              | Inline  |
| Reset Password | `app/(auth)/resetPassword.tsx`       | Inline  |
| Onboarding 1   | `app/(auth)/onboarding/index.tsx`    | Inline  |
| Onboarding 2   | `app/(auth)/onboarding/business.tsx` | Inline  |
| Onboarding 3   | `app/(auth)/onboarding/ready.tsx`    | Inline  |
| Role Selection | `app/(auth)/onboarding/role.tsx`     | Inline  |

### Main Screens (`app/(main)/`)

| Screen             | Route file                   | Screen file                         | Pattern   |
| :----------------- | :--------------------------- | :---------------------------------- | :-------- |
| Dashboard          | `dashboard/index.tsx`        | `src/screens/DashboardScreen.tsx`   | Delegated |
| Customers List     | `customers/index.tsx`        | `src/screens/CustomersScreen.tsx`   | Delegated |
| Customer Detail    | `customers/[customerId].tsx` | _(inline)_                          | Inline    |
| Orders List        | `orders/index.tsx`           | `src/screens/OrdersScreen.tsx`      | Delegated |
| New Bill           | `orders/create.tsx`          | `src/screens/CreateOrderScreen.tsx` | Delegated |
| Order Detail       | `orders/[orderId].tsx`       | _(inline)_                          | Inline    |
| Products           | `products/index.tsx`         | `src/screens/ProductsScreen.tsx`    | Delegated |
| Suppliers List     | `suppliers/index.tsx`        | `src/screens/SuppliersScreen.tsx`   | Delegated |
| Supplier Detail    | `suppliers/[supplierId].tsx` | _(inline)_                          | Inline    |
| Profile            | `profile/index.tsx`          | `src/screens/ProfileScreen.tsx`     | Delegated |
| Financial Position | `reports/index.tsx`          | _(inline)_                          | Inline    |
| Export Data        | `export/index.tsx`           | `src/screens/ExportScreen.tsx`      | Delegated |

> **Architecture note**: 8 routes delegate to `src/screens/`; 4 routes implement logic inline in `app/`. No single rule governs this split. Queued for rationalisation in v3.5 (M-05–M-08).

---

## 4. Modal Components

| Component                    | Library                | Snap / Size | Used In                         |
| :--------------------------- | :--------------------- | :---------- | :------------------------------ |
| `RecordCustomerPaymentModal` | `@gorhom/bottom-sheet` | `["65%"]`   | Customer Detail screen          |
| `RecordPaymentMadeModal`     | `@gorhom/bottom-sheet` | `["62%"]`   | Supplier Detail screen          |
| `RecordDeliveryModal`        | `@gorhom/bottom-sheet` | `["90%"]`   | Supplier Detail screen (P-08)   |
| `BottomSheetForm`            | `@gorhom/bottom-sheet` | Custom      | ProductsScreen                  |
| `BottomSheetPicker`          | `@gorhom/bottom-sheet` | Custom      | CustomerSelector, order flow    |
| `NewCustomerModal`           | `react-native-modal`   | Full-screen | CustomersScreen                 |
| `NewSupplierModal`           | `react-native-modal`   | Full-screen | SuppliersScreen                 |
| `NewProductModal`            | `react-native-modal`   | Full-screen | ProductsScreen (deferred M-01)  |
| `SearchablePickerModal`      | RN built-in `Modal`    | Full-screen | Order creation flow             |
| `ContactsPickerModal`        | `@gorhom/bottom-sheet` | Custom      | CustomersScreen (secondary FAB) |

> **Three modal patterns in use.** Full consolidation to `@gorhom/bottom-sheet` is deferred (M-01). `AppModal` (`react-native-modal`) is used by NewCustomer/Supplier/ProductModal. RN built-in `Modal` is used by SearchablePickerModal only.

---

## 5. Zustand Stores

| Store                   | File                               | Purpose                                           | Status     |
| :---------------------- | :--------------------------------- | :------------------------------------------------ | :--------- |
| `useAuthStore`          | `src/store/authStore.ts`           | Authenticated user profile, vendor ID             | ✅ Active  |
| `useLanguageStore`      | `src/store/languageStore.ts`       | Language toggle (EN/HI), AsyncStorage persistence | ✅ Active  |
| `useOrderStore`         | `src/store/orderStore.ts`          | Draft order state during bill creation            | ✅ Active  |
| `useCustomersStore`     | `src/store/customersStore.ts`      | Customer list local cache                         | ✅ Active  |
| `useSuppliersStore`     | `src/store/suppliersStore.ts`      | Supplier list local cache                         | ✅ Active  |
| ~~`useDashboardStore`~~ | ~~`src/store/dashboardStore.tsx`~~ | ~~Unused — never imported~~ — **Deleted (P-10)**  | ❌ Deleted |

---

## 6. TanStack Query Hooks

| Hook                                         | File                   | Purpose                                                            |
| :------------------------------------------- | :--------------------- | :----------------------------------------------------------------- |
| `useDashboard(vendorId)`                     | `useDashboard.ts`      | Dashboard summary data — invalidated by all financial mutations    |
| `useCustomers(vendorId, page, search)`       | `useCustomers.ts`      | Paginated customer list                                            |
| `useCustomerDetail(customerId)`              | `useCustomerDetail.ts` | Full customer detail + transaction feed                            |
| `useOrders(vendorId, page, filters, search)` | `useOrders.ts`         | Paginated order list with search (customer join fixed — P-04)      |
| `useOrderDetail(orderId)`                    | `useOrderDetail.ts`    | Single order + payment history                                     |
| `useProducts(vendorId, page, search)`        | `useProducts.ts`       | Paginated product list; variants joined (P-03)                     |
| `useSuppliers(vendorId, page, search)`       | `useSuppliers.ts`      | Paginated supplier list                                            |
| `useSupplierDetail(supplierId)`              | `useSupplierDetail.ts` | Single supplier + delivery history                                 |
| `useFontsLoader()`                           | `useFontsLoader.ts`    | Loads Inter font family                                            |
| `useLogin()`                                 | `useLogin.ts`          | Wraps `loginApi` + `useAuthStore.setUser`                          |
| `useAuth()`                                  | `useAuth.ts`           | Sets up `supabase.auth.onAuthStateChange` — mounted in root layout |

### Cache Invalidation Matrix (P-22)

| Mutation            | Invalidates                                                        |
| :------------------ | :----------------------------------------------------------------- |
| `recordPayment`     | `["customer", id]`, `["customers"]`, `["dashboard"]`               |
| `createOrder`       | `["customer", id]`, `["customers"]`, `["orders"]`, `["dashboard"]` |
| `recordDelivery`    | `["supplier", id]`, `["suppliers"]`, `["dashboard"]`               |
| `recordPaymentMade` | `["supplier", id]`, `["suppliers"]`, `["dashboard"]`               |

---

## 7. Supabase Tables

| Table                     | Used In                                                                  | RLS Status      |
| :------------------------ | :----------------------------------------------------------------------- | :-------------- |
| `profiles`                | `api/auth.ts`, `api/profiles.ts`, `store/authStore.ts`                   | ✅ Correct      |
| `customers`               | `api/customers.ts`, `api/export.ts`                                      | ✅ Correct      |
| `orders`                  | `api/orders.ts`, `api/customers.ts`, `api/dashboard.ts`, `api/export.ts` | ✅ Correct      |
| `order_items`             | `api/orders.ts`                                                          | ✅ Correct      |
| `payments`                | `api/orders.ts`, `api/dashboard.ts`, `api/export.ts`                     | ✅ Correct      |
| `products`                | `api/products.ts`                                                        | ✅ Correct      |
| `product_variants`        | `api/products.ts` (joined via P-03)                                      | ✅ Correct      |
| `suppliers`               | `api/suppliers.ts`                                                       | ✅ Fixed (P-01) |
| `supplier_deliveries`     | `api/suppliers.ts`, `api/dashboard.ts`, `api/export.ts`                  | ✅ Fixed (P-01) |
| `supplier_delivery_items` | `api/suppliers.ts`                                                       | ✅ Fixed (P-01) |
| `payments_made`           | `api/suppliers.ts`, `api/dashboard.ts`                                   | ✅ Fixed (P-01) |

**Total: 11 tables.** All RLS policies use the correct join-through-profiles pattern:

```sql
USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
```

**Indexes added (P-05):**

- `idx_supplier_deliveries_supplier` on `supplier_deliveries(supplier_id)`
- `idx_payments_made_supplier` on `payments_made(supplier_id)`
- `idx_payments_vendor` on `payments(vendor_id)`

---

## 8. API Functions

### `auth.ts`

- `loginApi(values)`, `signUpApi(values)`, `resetPasswordApi(email)`, `logoutApi()`

### `customers.ts`

- `fetchCustomers(vendorId, page, search)`, `addCustomer(vendorId, data)`, `fetchCustomerDetail(customerId)`

### `dashboard.ts`

- `getDashboardData(vendorId)` → `{ customersOweMe, iOweSuppliers, netPosition, activeBuyers, overdueCount, recentActivity }`

### `export.ts`

- `fetchOrdersForExport(vendorId, filters)`, `fetchPaymentsForExport(vendorId, filters)` _(reference column removed — P-04)_, `fetchCustomersForExport(vendorId)`, `fetchSupplierPurchasesForExport(vendorId, filters)`

### `orders.ts`

- `fetchOrders(vendorId, page, filters)` _(search uses !inner join — P-04)_, `fetchOrderDetail(orderId)`, `fetchPayments(orderId)`, `recordPayment(vendorId, orderId, data)`, `getNextBillNumber(vendorId, prefix)`, `getCustomerPreviousBalance(vendorId, customerId)`, `createOrder(vendorId, data)`

### `products.ts`

- `fetchProducts(vendorId, page, search)` _(now joins product_variants — P-03)_, `addProduct(vendorId, data)`, `updateProduct(productId, data)`, `deleteProduct(productId)`

### `profiles.ts`

- `getProfile(user_id)`

### `suppliers.ts`

- `fetchSuppliers(vendorId, page, search)`, `addSupplier(vendorId, data)`, `fetchSupplierDetail(supplierId)`, `recordDelivery(vendorId, supplierId, data)`, `recordPaymentMade(vendorId, supplierId, data)`

### `upload.ts`

- `uploadImage(uri)` → Supabase Storage bucket `product-images`

---

## 9. Global UI Components

### `src/components/feedback/`

| File             | Purpose                                                                   |
| :--------------- | :------------------------------------------------------------------------ |
| `EmptyState.tsx` | Empty list/screen state with optional CTA — NativeWind, icon bg `#F6F7F9` |
| `ErrorState.tsx` | Error screen state                                                        |
| `Loader.tsx`     | Full-screen loading spinner                                               |
| `Toast.tsx`      | `ToastProvider` + `useToast()` — success `#22C55E` / error `#E74C3C`      |

### `src/components/ui/`

| File                       | Purpose                                                                   |
| :------------------------- | :------------------------------------------------------------------------ |
| `Button.tsx`               | Primary/outline variants; outline spinner `#22C55E` (P-07)                |
| `Card.tsx`                 | White card container                                                      |
| `FloatingActionButton.tsx` | Reusable FAB — moved from root (P-27)                                     |
| `Input.tsx`                | Styled text input                                                         |
| `Modal.tsx`                | `AppModal` wrapper (react-native-modal); `animationIn="slideInUp"` (P-17) |
| `SearchBar.tsx`            | Shared search input — moved from root (P-27)                              |
| `StatusDot.tsx`            | Colored indicator dot — `DOT_COLOR` uses theme values (P-17)              |

### `src/components/dashboard/`

| File                          | Purpose                                                |
| :---------------------------- | :----------------------------------------------------- |
| `DashboardHeader.tsx`         | Time-based greeting, initials avatar, overdue bell dot |
| `DashboardHeroCard.tsx`       | Hero amount card (single or split "both" mode)         |
| `DashboardActionBar.tsx`      | "View Report" / "Send Reminder" buttons                |
| `DashboardStatCards.tsx`      | Active Buyers + Overdue count stat cards               |
| `DashboardRecentActivity.tsx` | Last N activity rows container                         |
| `ActivityRow.tsx`             | Single activity feed row                               |
| `StatusBadge.tsx`             | PAID / PENDING / OVERDUE / PARTIAL pill chip           |

---

## 10. Known Architecture Notes

### Deferred Items (v3.5)

| Issue     | Detail                                                                                                                                                                                 |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M-01      | Modal library not fully consolidated — `NewProductModal` / `NewCustomerModal` / `NewSupplierModal` still use `react-native-modal` via `AppModal`. Full migration is a larger refactor. |
| M-04      | Export screen not in tab bar — only reachable via `router.push` from ProfileScreen. UX decision pending.                                                                               |
| M-05–M-08 | Architecture cleanup: rationalise `src/screens/` indirection inconsistency (4 inline vs 8 delegated).                                                                                  |

### Icon Library

`lucide-react-native` is the **sole icon library** as of v3.3. `@expo/vector-icons` has been fully removed. `grep "@expo/vector-icons"` → 0 results.

### Three Modal Patterns (partially resolved)

| Pattern           | Library                | Files                                                                                                                            |
| :---------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| Bottom sheet v5   | `@gorhom/bottom-sheet` | RecordCustomerPaymentModal, RecordPaymentMadeModal, RecordDeliveryModal, BottomSheetForm, BottomSheetPicker, ContactsPickerModal |
| Full-screen modal | `react-native-modal`   | AppModal wrapper used by New\*Modal components (deferred M-01)                                                                   |
| Native modal      | RN built-in `Modal`    | SearchablePickerModal only                                                                                                       |

---

_This document reflects the codebase state as of Phase 6.4 completion (March 9, 2026). Update whenever screens, stores, API functions, or components are added or removed._
