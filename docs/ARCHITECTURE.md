# KredBook — Project Architecture

> **Last Updated**: April 7, 2026
> **App Version**: 4.1
> **Status**: Offline-first architecture complete — MMKV-based mutation queuing + React Query cache persistence; auto-sync on reconnect; optimistic updates for payments/orders; all core ledger features + offline support implemented

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Key Architecture Files](#2-key-architecture-files)
3. [Screens by Route Group](#3-screens-by-route-group)
4. [Offline-First Architecture (v1.0)](#4-offline-first-architecture-v10)
5. [Modal Components](#5-modal-components)
6. [Zustand Stores](#6-zustand-stores)
7. [TanStack Query Hooks](#7-tanstack-query-hooks)
8. [Supabase Tables](#8-supabase-tables)
9. [API Functions](#9-api-functions)
10. [Global UI Components](#10-global-ui-components)
11. [Known Architecture Notes](#11-known-architecture-notes)

---

## 1. Folder Structure

### `/app`

```
app/
├── _layout.tsx                   ← Root layout (QueryClient, ToastProvider, auth guard, Sentry.wrap)
├── index.tsx                     ← Welcome / splash route
├── profile-error.tsx             ← Profile fetch failure route (re-exports AuthProfileErrorScreen)  ← v3.4
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── resetPassword.tsx
│   ├── set-new-password.tsx          ← Password recovery form (Formik, Yup, eye-toggle, signOut on success)  ← v3.4
│   └── onboarding/
│       ├── _layout.tsx
│       ├── index.tsx             ← Redirect → role (phone OTP deferred to Phase 7)  ← v3.8
│       ├── business.tsx          ← Step 2: Business details
│   ├── ready.tsx             ← Step 3: Completion — "Enter KredBook" button, calls fetchProfile, routing delegated to _layout.tsx  ← v3.9
│       └── role.tsx              ← Step 1: Role selection (Retailer / Wholesaler / Small Business)
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
    │   ├── _layout.tsx           ← Stack navigator; header renders `options.title ?? config.title` (dynamic title for Order Detail)  ← v3.7
    │   ├── index.tsx
    │   ├── create.tsx            ← v3.9: save-first data integrity (handleSaveAndShare); CartItem.productId/rate; smart dedup addItem; updateRate(); expo-sharing replaces uploadPdfToSupabase+Linking; VariantPicker removed (inline in ProductPicker)
    │   └── [orderId].tsx         ← Order Detail: handlePaymentSuccess uses orderKeys.all + customerDetail invalidation  ← v3.9
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
    │   └── index.tsx             ← Financial Position screen: StatCard colors use theme tokens (supplierPrimary); NetCard uses gradients.netPosition  ← v3.9
    ├── notifications/
    │   └── index.tsx             ← v4.0 NEW: overdue follow-ups + recent activity; bell wired from DashboardHeader
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
├── lib/           ← Low-level adapters (← v3.4)
│   └── secureStorage.ts  ← expo-secure-store chunked adapter (≤1800B/chunk); Supabase storage impl
├── screens/       ← Screen-level components (consumed by app/ routes)
│   └── AuthProfileErrorScreen.tsx  ← Dead-state recovery UI: Retry + Logout  (← v3.4)
├── services/      ← supabase.ts, sentry.ts
├── store/         ← Zustand stores
├── types/         ← TypeScript interfaces
└── utils/         ← theme, dashboardUi, helpers, schemas
```

### `/src/components`

```
src/components/
├── navigation/
│   └── StackHeader.tsx            ← v3.8 NEW: shared back-arrow header; props: { title, showBack? };
│                                  ←   height: 44+insets.top, paddingTop: insets.top; hitSlop on back btn
├── BottomSheetForm.tsx            ← Generic bottom-sheet wrapper (no active importers as of v3.6)
├── ImagePickerField.tsx           ← Camera/gallery image picker input (removed from ProfileScreen in v3.6)
├── ScreenWrapper.tsx              ← Safe-area wrapper; legacy — new screens use SafeAreaView + StyleSheet directly
├── SearchablePickerModal.tsx      ← Full-screen picker (React Native built-in Modal)
├── SubscriptionCard.tsx           ← Removed from ProfileScreen in v3.6; no active importers
│
├── customers/
│   ├── ContactsPickerModal.tsx
│   ├── CustomerCard.tsx
│   ├── CustomerList.tsx
│   ├── NewCustomerModal.tsx       ← v3.7 M-01: migrated to @gorhom/bottom-sheet; snapPoints:["90%"], BottomSheetScrollView, BottomSheetBackdrop
│   └── RecordCustomerPaymentModal.tsx   ← v3.9: uses useRecordPayment hook; no direct API import; no local queryClient; AVATAR_COLORS → colors.avatarPalette; snapPoints ["75%"]
│
├── dashboard/
│   ├── ActivityRow.tsx
│   ├── DashboardActionBar.tsx
│   ├── DashboardHeader.tsx            ← bell onPressNotifications wired to /(main)/notifications  ← v4.0
│   ├── DashboardHeroCard.tsx
│   ├── DashboardPendingFollowups.tsx  ← v4.0: overdue follow-up cards with WhatsApp remind
│   ├── DashboardRecentActivity.tsx
│   ├── DashboardStatCards.tsx
│   └── StatusBadge.tsx
│
├── feedback/
│   ├── EmptyState.tsx             ← NativeWind; title/description/cta/onCta; CircleOff icon
│   ├── ErrorState.tsx
│   ├── Loader.tsx                 ← Delayed "Loading your profile…" hint after 2 s  (← v3.5)
│   └── Toast.tsx                  ← ToastProvider + useToast(); success (#22C55E) / error (#E74C3C)
│
├── onboarding/
│   └── OnboardingProgress.tsx
│
├── orders/
│   ├── CustomerSelector.tsx
│   ├── FilterBar.tsx              ← No longer used by OrdersScreen (v3.7 moved to inline chips); may be removed in a future cleanup
│   ├── OrderBillSummary.tsx
│   ├── OrderItemCard.tsx          ← v3.9: price→rate prop; onUpdateRate?: (rate: number) => void; inline TextInput for rate editing (onBlur commit)
│   ├── OrderList.tsx              ← v3.9: all raw hex removed; AVATAR_COLORS spreads colors.avatarPalette; STATUS_STYLES maps to theme tokens
│   ├── OrderSummary.tsx
│   ├── PaymentHistory.tsx
│
├── picker/
│   ├── BottomSheetPicker.tsx      ← Generic sheet used by CustomerPicker; NOT used by ProductPicker (v3.9 ProductPicker owns its sheet)
│   ├── CustomerPicker.tsx
│   ├── ProductPicker.tsx          ← v3.9 FULL REWRITE: owns BottomSheet directly; inline variant sub-view; stay-open bulk-add; Done button; 1.2s checkmark flash feedback
│
├── products/
│   ├── NewProductModal.tsx        ← v3.6 rewrite: variants-only (no Base Price); RupeeInput sub-component; FieldArray; sticky CTA; no AppModal
│   ├── ProductActionsModal.tsx
│   └── ProductCard.tsx            ← v3.6 rewrite: compact single-row (icon box + name + "N variants" + ₹price + ChevronRight)
│
├── suppliers/
│   ├── NewSupplierModal.tsx       ← v3.7 M-01: migrated to @gorhom/bottom-sheet (snapPoints:["90%"], BottomSheetScrollView, BottomSheetBackdrop)
│   ├── RecordDeliveryModal.tsx    ← @gorhom/bottom-sheet (P-08 + v4.1 migration)
│   ├── RecordPaymentMadeModal.tsx ← @gorhom/bottom-sheet, snapPoints ["62%"]
│   ├── SupplierCard.tsx           ← Initials avatar added (P-15); amber → theme tokens
│   └── SupplierList.tsx
│
└── ui/
    ├── Button.tsx                 ← Outline spinner color fixed to #22C55E (P-07)
    ├── Card.tsx
    ├── ConfirmModal.tsx           ← v3.6 NEW: reusable destructive confirm sheet; AlertTriangle icon; Delete+Cancel; loading prop
    ├── FloatingActionButton.tsx   ← Moved from root (P-27)
    ├── Input.tsx
    ├── Modal.tsx                  ← Removed in v4.1 (AppModal legacy retired)
    ├── SearchBar.tsx              ← Moved from root (P-27)
    └── StatusDot.tsx              ← DOT_COLOR record using theme values (P-17)
```

### `/src/screens`

```
src/screens/
├── CreateOrderScreen.tsx          ← KeyboardAvoidingView added (P-24)
├── CustomersScreen.tsx
├── DashboardScreen.tsx            ← isSellerMode fixed from stale 'vendor' check (P-02)
├── ExportScreen.tsx               ← v3.6 full rewrite: ExportRow+DateInput sub-components; date presets; loadingKey; removed ScreenWrapper/i18n
├── OrdersScreen.tsx               ← v3.7 full rewrite: SafeAreaView edges=['top']; "Orders" header + collapsible Search toggle; inline filter chips (All/Paid/Partial/Pending/Overdue); Overdue = client-side daysSince>30 sub-filter; Sort chip → local BottomSheet ref; FAB; FilterBar + useOrderFilters removed
├── ProductsScreen.tsx             ← v3.6 rewrite: SafeAreaView+StyleSheet; category chips; Search toggle; ConfirmModal for delete
├── ProfileScreen.tsx              ← v3.6 full rewrite: SectionCard+DetailRow+SegmentControl sub-components; read-only; removed SubscriptionCard/ImagePickerField/i18n
└── SuppliersScreen.tsx
```

---

## 2. Key Architecture Files

| File                       | Purpose                                                                                                                                                                                                                                                                                                                                          |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/_layout.tsx`          | Root layout — `QueryClientProvider → ThemeProvider → GestureHandlerRootView → ToastProvider → Stack`; `Sentry.wrap()`                                                                                                                                                                                                                            |
| `src/utils/theme.ts`       | **Single source of truth** for all color tokens, spacing, radius, typography                                                                                                                                                                                                                                                                     |
| `src/utils/dashboardUi.ts` | Thin re-export of `dashboardPalette` from `theme.ts` + INR/date formatters                                                                                                                                                                                                                                                                       |
| `src/services/sentry.ts`   | `initSentry()` + DSN env guard; called at module level in root layout                                                                                                                                                                                                                                                                            |
| `schema.sql`               | Master DB schema v1.9 — 11 tables, indexes, RLS policies, RPC functions (`get_next_bill_number`, `get_customer_previous_balance`, `handle_new_user`, `link_user_profile`, `update_order_status`), triggers (`on_auth_user_created`, `link_profile_after_signup`, `on_payment_upsert`), incremental migrations. Synced to live DB March 16, 2026. |
| `tailwind.config.js`       | NativeWind token aliases mapping to `theme.ts` values                                                                                                                                                                                                                                                                                            |

---

## 3. Screens by Route Group

### Auth Screens (`app/(auth)/`)

| Screen           | File                                                               | Pattern   |
| :--------------- | :----------------------------------------------------------------- | :-------- |
| Welcome          | `app/index.tsx`                                                    | Inline    |
| Login            | `app/(auth)/login.tsx`                                             | Inline    |
| Signup           | `app/(auth)/signup.tsx`                                            | Inline    |
| Reset Password   | `app/(auth)/resetPassword.tsx`                                     | Inline    |
| Set New Password | `app/(auth)/set-new-password.tsx`                                  | Inline    |
| Profile Error    | `app/profile-error.tsx` → `src/screens/AuthProfileErrorScreen.tsx` | Delegated |
| Onboarding Role  | `app/(auth)/onboarding/role.tsx`                                   | Inline    |
| Onboarding 2     | `app/(auth)/onboarding/business.tsx`                               | Inline    |
| Onboarding 3     | `app/(auth)/onboarding/ready.tsx`                                  | Inline    |
| Onboarding Index | `app/(auth)/onboarding/index.tsx` → Redirect to role               | Inline    |

### Main Screens (`app/(main)/`)

| Screen             | Route file                    | Screen file                       | Pattern   |
| :----------------- | :---------------------------- | :-------------------------------- | :-------- |
| Dashboard          | `dashboard/index.tsx`         | `src/screens/DashboardScreen.tsx` | Delegated |
| Customers List     | `customers/index.tsx`         | _(inline — v4.0 full rewrite)_    | Inline    |
| Customer Detail    | `customers/[customerId].tsx`  | _(inline)_                        | Inline    |
| Orders List        | `orders/index.tsx`            | _(inline — v4.0 full rewrite)_    | Inline    |
| New Bill           | `orders/create.tsx`           | _(inline — v4.0 polish)_          | Inline    |
| Order Detail       | `orders/[orderId].tsx`        | _(inline)_                        | Inline    |
| Products           | `products/index.tsx`          | `src/screens/ProductsScreen.tsx`  | Delegated |
| Suppliers List     | `suppliers/index.tsx`         | _(inline — v4.0 full rewrite)_    | Inline    |
| Supplier Detail    | `suppliers/[supplierId].tsx`  | _(inline)_                        | Inline    |
| Profile            | `profile/index.tsx`           | `src/screens/ProfileScreen.tsx`   | Delegated |
| Financial Position | `reports/index.tsx`           | _(inline)_                        | Inline    |
| **Notifications**  | **`notifications/index.tsx`** | _(inline — v4.0 NEW)_             | Inline    |
| Export Data        | `export/index.tsx`            | `src/screens/ExportScreen.tsx`    | Delegated |

> **Architecture note**: 8 routes delegate to `src/screens/`; 4 routes implement logic inline in `app/`. No single rule governs this split. **Modal consolidation**: All bottom-sheet entry modals now use `@gorhom/bottom-sheet` (M-01 complete). `react-native-modal` has been fully removed.

---

## 4. Offline-First Architecture (v1.0)

KredBook implements a **hybrid offline-first strategy** combining React Query read-side caching with Zustand mutation queuing. The architecture prioritizes **instant, optimistic user feedback** while ensuring **background synchronization** of queued mutations when connectivity returns.

### 4.1 Read Strategy

**Reads happen entirely from the TanStack Query cache after the initial network fetch.** Upon first tap to a screen, React Query fetches from Supabase; thereafter, all queries use the in-memory cache.

- **TanStack Query + Persist Client**: `@tanstack/react-query` + `@tanstack/react-query-persist-client` (separate package) handles server state.
- **MMKV Persister**: The persist client uses `react-native-mmkv` as the backing store — queries are serialized to MMKV on every cache update.
- **Cold Boot Offline**: When the app restarts offline, the MMKV cache is restored into React Query's cache automatically; cached data loads instantly without network.
- **Stale-While-Revalidate**: In connect mode, queries are soft-refreshed from Supabase in the background; UI updates incrementally if new data arrives (no full screen reload).
- **No Local DB Overhead**: MMKV is a lightweight key-value store — no SQL, ORM, or WatermelonDB complexity.

### 4.2 Write Strategy

**When offline, mutations fail fast and are captured into a persistent queue; the user sees optimistic UI feedback immediately.**

- **Zustand + MMKV Mutation Queue**: When a mutation (e.g., `CREATE order`, `UPDATE customer`) is attempted offline, the call fails → the mutation logic captures the request into a Zustand store that persists to MMKV as a serialized array of `{ id, operation, payload, timestamp }` objects.
- **Optimistic UI**: The component does NOT wait for server confirmation before updating the UI. E.g., when recording a payment, the customer's balance decreases immediately, the payment appears in the list, and the modal closes. Optimistic state is reset if the mutation later fails on sync.
- **Background FIFO Sync**: `@react-native-community/netinfo` listens for connectivity changes. On reconnect, a background job dequeues mutations in FIFO order and replays them to Supabase. Each mutation waits for server response before dequeuing the next (sequential, not parallel).
- **Conflict Resolution**: Last-write-wins per entity. In v1.0 (single-user account), concurrent writes are rare; this strategy suffices.
- **Retry + Error UI**: If a dequeued mutation fails on sync (e.g., 400/validation error), it is logged and removed from the queue (not retried infinitely). The user sees a dismissible "Sync failed" toast with a "Retry" action.

### 4.3 Auth Architecture

**Auth tokens are stored securely and transparently refreshed in the background.**

- **Secure Token Storage**: Supabase GoTrue auth tokens (access + refresh) are stored via the `src/lib/secureStorage.ts` module, which uses encrypted keychain (platform-native secure storage) — not AsyncStorage.
- **Auto-Refresh**: The Supabase client is configured to automatically refresh the access token before expiry via the `refreshSession()` method. If a token is stale, GoTrue silently refreshes it in the background.
- **Offline Auth**: In offline mode, the app uses the cached access token. If a token is expired and the user makes a request, the request fails (app is offline) and is queued; on sync, the token is refreshed and the mutation is replayed.
- **Session Persistence**: On app restart, `secureStorage` restores the last-saved tokens; if valid, the user remains logged in without a network fetch.

### 4.4 Implementation Files

The following four files implement the offline-first architecture:

| File                                     | Responsibility                                                                                                                                   |
| :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/syncQueue.ts`                   | MMKV queue manager: `enqueue(mutation)`, `dequeue()`, `list()`, `clear()`; serializes `{ id, operation, payload, timestamp }` objects to MMKV.   |
| `src/hooks/useNetworkSync.ts`            | Network listener (netinfo) + background replay: listens for connect event → calls `dequeue()` loop → replays mutations to Supabase sequentially. |
| `src/components/ui/SyncStatusBanner.tsx` | 3-state UI: Offline (red, shows queued count) → Syncing (amber, spinner) → Synced (green, auto-dismiss 2s). Wired to netinfo + queue length.     |
| `src/services/supabase.ts`               | Enhanced error handler: catches network-induced mutation failures → calls `syncQueue.enqueue()` instead of propagating error to component.       |

### 4.5 Implementation Status (v4.1)

**Status**: ✅ **COMPLETE** (April 7, 2026)

All offline-first architecture components have been implemented and integrated into the codebase. The system is fully operational with mutation queuing, automatic sync, optimistic updates, and error handling.

#### Infrastructure (4 files created)

| File                                     | Status | Notes                                                                                                                                         |
| :--------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/syncQueue.ts`                   | ✅     | FIFO queue with max size 100, max retries 3; methods: `enqueue()`, `dequeue()`, `remove()`, `incrementRetry()`, `list()`, `getStats()`        |
| `src/lib/mmkvPersister.ts`               | ✅     | React Query cache persister adapter; bridges TanStack persist API to MMKV; cache key: `react_query_cache`                                     |
| `src/hooks/useNetworkSync.ts`            | ✅     | Network listener + auto-sync trigger; `replayMutation()` maps all 9 mutation types to correct API call signatures; returns sync state + queue |
| `src/components/ui/SyncStatusBanner.tsx` | ✅     | 3-state UI (offline amber / syncing blue / synced green); queue count indicator; animated fade transitions; tappable dismiss                  |

#### Core Integration (3 files modified)

| File                      | Changes                                                                                                                            | Status |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------- | :----- |
| `src/utils/theme.ts`      | Added `colors.sync.*` tokens: `offlineBg/Text`, `syncingBg/Text`, `syncedBg/Text`                                                  | ✅     |
| `src/services/supabase.ts` | Added `isNetworkError(error)` detector + `executeWithOfflineQueue<T>()` wrapper for mutation queueing                             | ✅     |
| `app/_layout.tsx`         | Replaced `QueryClientProvider` with `PersistQueryClientProvider`; added MMKV persister; mounted `<SyncStatusBanner />` in layout  | ✅     |

#### API Layer — Mutation Wrappers (4 files, 9 functions)

All high-frequency mutations are wrapped with `executeWithOfflineQueue()` to enable offline queueing:

| File                   | Wrapped Functions                                              | Status |
| :--------------------- | :------------------------------------------------------------- | :----- |
| `src/api/orders.ts`    | `createOrder()`, `recordPayment()`                             | ✅     |
| `src/api/customers.ts` | `addCustomer()`                                                | ✅     |
| `src/api/products.ts`  | `addProduct()`, `updateProduct()`, `deleteProduct()`           | ✅     |
| `src/api/suppliers.ts` | `addSupplier()`, `recordDelivery()`, `recordPaymentMade()`     | ✅     |

#### Optimistic Updates (3 hooks enhanced)

| Hook                       | File                    | Optimistic Behavior                                                                                          | Status |
| :------------------------- | :---------------------- | :----------------------------------------------------------------------------------------------------------- | :----- |
| `useRecordPayment()`       | `src/hooks/usePayments.ts` | Updates order balance/status, adds payment to history, updates customer balance; rollback on error           | ✅     |
| `useCreateOrder()`         | `src/hooks/useOrders.ts`   | Creates optimistic order with temp ID, calculates totals client-side, updates customer balance; rollback on error | ✅     |
| `useRecordPaymentMade()`   | `src/hooks/useSuppliers.ts` | Updates supplier balance, adds payment to timeline, updates supplier list; rollback on error                  | ✅     |

#### Key Implementation Decisions

1. **MMKV v4.x API**: Uses `createMMKV()` factory and `storage.remove(key)` instead of deprecated `new MMKV()` / `storage.delete(key)`
2. **Mutation Replay Mapping**: Each queued mutation type (`order.CREATE`, `payment.CREATE`, etc.) is mapped to the correct API function with proper parameter destructuring (6-8 individual parameters, not objects)
3. **Conflict Resolution**: Last-write-wins strategy (suitable for single-user v1.0)
4. **Error Handling**: Network errors are queued; validation/auth errors fail immediately with user-facing toast
5. **Optimistic Updates**: Handle both infinite query structures (`pages[]`) and flat arrays; snapshot old data for rollback
6. **Cache Persistence**: TanStack Query cache is persisted to MMKV on every update; restored on cold boot for instant offline access

#### Dependencies Installed

| Package                                     | Version  | Purpose                                              |
| :------------------------------------------ | :------- | :--------------------------------------------------- |
| `react-native-mmkv`                         | `4.3.1`  | High-performance key-value storage (queue + cache)   |
| `@react-native-community/netinfo`           | `12.0.1` | Network state monitoring for auto-sync trigger       |
| `@tanstack/react-query-persist-client`      | `5.96.2` | React Query cache persistence layer                  |

#### Testing Strategy

Manual testing via 5 test scenarios (see `docs/OFFLINE_TESTING.md`):
1. Offline order creation + sync on reconnect
2. Offline payment recording + optimistic UI
3. Network recovery auto-sync with multiple queued mutations
4. Queue overflow handling (>100 mutations)
5. Sync error recovery (retry mechanism)

#### Deferred Items

- **Documentation**: `docs/OFFLINE_TESTING.md` testing checklist (low priority)
- **Automated E2E Tests**: Deferred to v2.0 (Detox or Maestro)

---

## 5. Modal Components

| Component                    | Library                | Snap / Size | Used In                                                   |
| :--------------------------- | :--------------------- | :---------- | :-------------------------------------------------------- |
| `RecordCustomerPaymentModal` | `@gorhom/bottom-sheet` | `["65%"]`   | Customer Detail screen                                    |
| `RecordPaymentMadeModal`     | `@gorhom/bottom-sheet` | `["62%"]`   | Supplier Detail screen                                    |
| `RecordDeliveryModal`        | `@gorhom/bottom-sheet` | `["90%"]`   | Supplier Detail screen (P-08 + v4.1 migration)            |
| `NewCustomerModal`           | `@gorhom/bottom-sheet` | `["90%"]`   | CustomersScreen                                           |
| `NewSupplierModal`           | `@gorhom/bottom-sheet` | `["90%"]`   | SuppliersScreen                                           |
| `BottomSheetForm`            | `@gorhom/bottom-sheet` | Custom      | No active importers (v3.6)                                |
| `BottomSheetPicker`          | `@gorhom/bottom-sheet` | Custom      | CustomerSelector, order flow                              |
| `ContactsPickerModal`        | `@gorhom/bottom-sheet` | Custom      | CustomersScreen (secondary FAB)                           |
| `NewProductModal`            | RN built-in `Modal`    | Full-screen | ProductsScreen (v3.6 rewrite — AppModal removed)          |
| `ConfirmModal`               | RN built-in `Modal`    | Bottom card | ProductsScreen (v3.6 NEW)                                 |
| `SearchablePickerModal`      | RN built-in `Modal`    | Full-screen | Order creation flow                                       |

> **Two modal patterns in use.** Bottom-sheet modals use `@gorhom/bottom-sheet`; RN built-in `Modal` is used by `SearchablePickerModal` and `ConfirmModal`. `react-native-modal` has been fully removed.

---

## 6. Zustand Stores

| Store                   | File                               | Purpose                                                                                                                                                                                    | Status     |
| :---------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| `useAuthStore`          | `src/store/authStore.ts`           | `isInitialized`, `isFetchingProfile`, `isRecoveryMode`, `user`, `profile`; `setAuth(user)` triggers `fetchProfile`; `logout` clears state; simple boolean gate replaces `_fetchInProgress` | ✅ Active  |
| `useLanguageStore`      | `src/store/languageStore.ts`       | Language toggle (EN/HI), AsyncStorage persistence                                                                                                                                          | ✅ Active  |
| `useOrderStore`         | `src/store/orderStore.ts`          | Draft order state during bill creation                                                                                                                                                     | ✅ Active  |
| `useCustomersStore`     | `src/store/customersStore.ts`      | Customer list local cache                                                                                                                                                                  | ✅ Active  |
| `useSuppliersStore`     | `src/store/suppliersStore.ts`      | Supplier list local cache                                                                                                                                                                  | ✅ Active  |
| ~~`useDashboardStore`~~ | ~~`src/store/dashboardStore.tsx`~~ | ~~Unused — never imported~~ — **Deleted (P-10)**                                                                                                                                           | ❌ Deleted |

### `useAuthStore` Architecture (v3.9 — simplified)

```typescript
// New flat API — no factory pattern needed
{
  isInitialized: boolean,      // false until first onAuthStateChange fires
  isFetchingProfile: boolean,  // true while supabase profile query is in-flight
  isRecoveryMode: boolean,
  user: User | null,
  profile: Profile | null,
  setAuth(user),               // sets user, triggers fetchProfile(user.id)
  fetchProfile(userId),        // idempotent: guarded by isFetchingProfile boolean
  logout(),
  setRecoveryMode(v),
}
```

**Auth routing logic in `_layout.tsx`** — guards on `isInitialized`; early-returns if `user && isFetchingProfile && !profile`.

| State               | Condition                                                                       | Screen                    |
| :------------------ | :------------------------------------------------------------------------------ | :------------------------ |
| `INITIALIZING`      | `!fontsLoaded \|\| !isInitialized \|\| (user && isFetchingProfile && !profile)` | `<Loader />`              |
| `UNAUTHENTICATED`   | `!user`                                                                         | `app/index.tsx` or login  |
| `PROFILE_ERROR`     | `user && !profile && !isFetchingProfile`                                        | `profile-error`           |
| `ONBOARDING`        | `user && profile && !onboarding_complete`                                       | `(auth)/onboarding`       |
| `AUTHENTICATED`     | `user && profile && onboarding_complete`                                        | `(main)/dashboard`        |
| `PASSWORD_RECOVERY` | `isRecoveryMode === true`                                                       | `(auth)/set-new-password` |

---

## 7. TanStack Query Hooks

| Hook                                              | File                   | Purpose                                                                                                                                       |
| :------------------------------------------------ | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `useDashboard(vendorId)`                          | `useDashboard.ts`      | Dashboard summary data — invalidated by all financial mutations                                                                               |
| `useCustomers(vendorId, page, search)`            | `useCustomers.ts`      | Paginated customer list                                                                                                                       |
| `useCustomerDetail(customerId)`                   | `useCustomerDetail.ts` | Full customer detail + transaction feed                                                                                                       |
| `useOrders(vendorId, page, filters, search)`      | `useOrders.ts`         | Paginated order list with search; `useCreateOrder` returns `OrderDetail` with real `bill_number`                                              |
| `useOrderDetail(orderId)`                         | `useOrderDetail.ts`    | Single order + payment history                                                                                                                |
| `useProducts(vendorId, page, search)`             | `useProducts.ts`       | Paginated product list; variants joined                                                                                                       |
| `useSuppliers(vendorId, page, search)`            | `useSuppliers.ts`      | Paginated supplier list                                                                                                                       |
| `useSupplierDetail(supplierId)`                   | `useSupplierDetail.ts` | Single supplier + delivery history                                                                                                            |
| `useFontsLoader()`                                | `useFontsLoader.ts`    | Loads Inter font family                                                                                                                       |
| `useLogin()`                                      | `useAuth.ts`           | One-liner: sets `hasSeenWelcome`; routing delegated to `_layout.tsx`                                                                          |
| `useAuth()`                                       | `useAuth.ts`           | Mounts `onAuthStateChange`; calls `setAuth(user)` → triggers `fetchProfile`; `PASSWORD_RECOVERY` sets `isRecoveryMode`                        |
| `usePayments(orderId, vendorId, customerId)`      | `usePayments.ts`       | Payment history query + delegates to `useRecordPayment`                                                                                       |
| `useRecordPayment(orderId, vendorId, customerId)` | `usePayments.ts`       | Mutation-only; comprehensive `onSuccess` invalidation: `orderKeys.all`, `orderDetail`, `payments`, `customers`, `customerDetail`, `dashboard` |

### Cache Invalidation Matrix (v3.9)

| Mutation            | Invalidates                                                                                                                           |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| `recordPayment`     | `orderKeys.all(vendorId)`, `orderDetail`, `["payments", orderId]`, `["customers"]`, `["customerDetail", customerId]`, `["dashboard"]` |
| `createOrder`       | `orderKeys.all(vendorId)` (via `invalidateQueries`); seeds `orderDetail` cache via `setQueryData`                                     |
| `recordDelivery`    | `["supplier", id]`, `["suppliers"]`, `["dashboard"]`                                                                                  |
| `recordPaymentMade` | `["supplier", id]`, `["suppliers"]`, `["dashboard"]`                                                                                  |

---

## 8. Supabase Tables

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

**Indexes added (P-05 + v1.9 sync, March 16, 2026):**

- `idx_supplier_deliveries_supplier` on `supplier_deliveries(supplier_id)`
- `idx_payments_made_supplier` on `payments_made(supplier_id)`
- `idx_payments_vendor` on `payments(vendor_id)`
- `customers_phone_idx` — UNIQUE on `customers(phone)` (global uniqueness)
- `customers_vendor_phone_idx` — UNIQUE composite on `customers(vendor_id, phone)` (per-vendor uniqueness)
- `orders_vendor_customer_idx` — composite on `orders(vendor_id, customer_id)` (customer order lookups)
- `products_vendor_name_idx` — composite on `products(vendor_id, name)` (product name search)

> Note: `order_items_order_idx` and `payments_order_idx` are duplicate indexes present in the live DB (redundant with `idx_order_items_order` and `idx_payments_order` respectively). They are candidates for `DROP INDEX`.

### `generateBillPdf.ts`

- `invoiceNumber` is a **required** param in `InvoiceOptions` — no timestamp fallback. PDF is only generated after a successful DB save (real `bill_number` is passed from `createOrderMutation` return value).
- Footer: "Made with ❤️ by KredBook"
- PDF shared via `expo-sharing` native share sheet; no Supabase upload or WhatsApp deep-link.

---

## 9. API Functions

### `auth.ts`

- `loginApi(values)`, `signUpApi(values)`, `resetPasswordApi(email)` _(now passes `redirectTo: Linking.createURL("/")` — v3.5)_, `logoutApi()`

### `customers.ts`

- `fetchCustomers(vendorId, page, search)`, `addCustomer(vendorId, data)`, `fetchCustomerDetail(customerId)`

### `dashboard.ts`

### `getDashboardData(vendorId)` → `{ customersOweMe, iOweSuppliers, netPosition, activeBuyers, overdueCount, overdueCustomersList, recentActivity, weekDelta, weekDeltaPct }`

- `overdueCustomersList`: top-5 overdue customers sorted by balance (id, name, phone, balance, daysSince)
- `weekDelta`: absolute ₹ change in outstanding orders vs prior 7-day window
- `weekDeltaPct`: percentage change in net position vs prior 7-day window

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

## 10. Global UI Components

### `src/components/feedback/`

| File             | Purpose                                                                       |
| :--------------- | :---------------------------------------------------------------------------- |
| `EmptyState.tsx` | Empty list/screen state with optional CTA — NativeWind, icon bg `#F6F7F9`     |
| `ErrorState.tsx` | Error screen state                                                            |
| `Loader.tsx`     | Full-screen loading spinner; shows `"Loading your profile…"` after 2 s (v3.5) |
| `Toast.tsx`      | `ToastProvider` + `useToast()` — success `#22C55E` / error `#E74C3C`          |

### `src/components/ui/`

| File                       | Purpose                                                                   |
| :------------------------- | :------------------------------------------------------------------------ |
| `Button.tsx`               | Primary/outline variants; outline spinner `#22C55E` (P-07)                |
| `Card.tsx`                 | White card container                                                      |
| `FloatingActionButton.tsx` | Reusable FAB — moved from root (P-27)                                     |
| `Input.tsx`                | Styled text input                                                         |
| `Modal.tsx`                | Removed in v4.1 (AppModal retired)                                          |
| `SearchBar.tsx`            | Shared search input — moved from root (P-27)                              |
| `StatusDot.tsx`            | Colored indicator dot — `DOT_COLOR` uses theme values (P-17)              |

### `src/components/dashboard/`

| File                            | Purpose                                                                                                         |
| :------------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| `DashboardHeader.tsx`           | Time-based greeting, initials avatar, overdue bell dot; `onPressNotifications` → `/(main)/notifications` (v4.0) |
| `DashboardHeroCard.tsx`         | Hero amount card (single or split "both" mode)                                                                  |
| `DashboardActionBar.tsx`        | "View Report" / "Send Reminder" buttons                                                                         |
| `DashboardStatCards.tsx`        | Active Buyers + Overdue count stat cards                                                                        |
| `DashboardPendingFollowups.tsx` | Overdue follow-up cards with customer name, days overdue, balance, WhatsApp remind button (v4.0)                |
| `DashboardRecentActivity.tsx`   | Last N activity rows container                                                                                  |
| `ActivityRow.tsx`               | Single activity feed row                                                                                        |
| `StatusBadge.tsx`               | PAID / PENDING / OVERDUE / PARTIAL pill chip                                                                    |

---

## 11. Known Architecture Notes

### Auth System (v3.9)

| Topic                         | Detail                                                                                                                                                             |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session storage               | `expo-secure-store` via `src/lib/secureStorage.ts` chunked adapter (≤1800B/chunk)                                                                                  |
| `isInitialized` flag          | Set to `true` after the first `onAuthStateChange` event fires in `useAuth()`                                                                                       |
| `isFetchingProfile` gate      | Simple boolean — replaced `_fetchInProgress` closure. `setAuth` sets it `true`; `fetchProfile` sets it `false` on completion                                       |
| `setAuth` → `fetchProfile`    | `setAuth(user)` sets `user` and calls `fetchProfile(user.id)` immediately — single call site, no race                                                              |
| `PASSWORD_RECOVERY` isolation | `onAuthStateChange` SIGNED_IN events during recovery set `isRecoveryMode` without calling `setAuth` — prevents routing to dashboard before user types new password |
| Auth breadcrumbs              | Sentry `addBreadcrumb` fires at: `auth_login_success`, `google_oauth_start`, `google_oauth_success`, `signup_success`, `onboarding_complete`, `logout`             |
| `hasSeenWelcome` on logout    | Intentionally deleted on every logout for re-engagement on next launch                                                                                             |

### Deferred Items (v3.9)

| Issue     | Detail                                                                                                                                                                                                                   |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M-01      | **Resolved** — All entry modals now use `@gorhom/bottom-sheet`; `react-native-modal` removed.                                                                                                                             |
| M-04      | Export screen not in tab bar — only reachable from ProfileScreen. UX decision pending.                                                                                                                                   |
| M-05–M-08 | Rationalise `src/screens/` indirection inconsistency — now mostly inline. `CustomerScreen.tsx`, `SuppliersScreen.tsx`, `OrdersScreen.tsx`, `CreateOrderScreen.tsx` in `src/screens/` are **stale** (no longer imported). |
| M-09      | **Resolved** — removed orphaned `VariantPicker.tsx` and `RecordPayments.tsx`.                                                                                                                         |
| M-10      | `order_items` table has no `variant_id` column — DB migration required before variant-level inventory reporting is possible.                                                                                             |
| M-11      | Notifications screen (`/(main)/notifications`) has no dedicated `_layout.tsx` — uses parent stack navigator. Add if custom back-nav is needed.                                                                           |

### Icon Library

`lucide-react-native` is the **sole icon library** as of v3.3. `@expo/vector-icons` has been fully removed. `grep "@expo/vector-icons"` → 0 results.

### Two Modal Patterns

| Pattern           | Library                | Files                                                                                                                            |
| :---------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| Bottom sheet v5   | `@gorhom/bottom-sheet` | RecordCustomerPaymentModal, RecordPaymentMadeModal, RecordDeliveryModal, NewCustomerModal, NewSupplierModal, BottomSheetForm, BottomSheetPicker, ContactsPickerModal |
| Native modal      | RN built-in `Modal`    | SearchablePickerModal, ConfirmModal                                                                                              |

---

_This document reflects the codebase state as of v4.1 (April 7, 2026). Update whenever screens, stores, API functions, or components are added or removed. DB schema notes reflect live Supabase introspection performed March 16, 2026 (schema.sql v1.9)._
