# CreditBook Product Roadmap

> **Version**: 1.6
> **Last Updated**: March 11, 2026
> **Status**: Active Development
> **Current Phase**: Phase 6.7 complete → Phase 7 in progress

---

## Vision

> CreditBook aims to become the simplest and most trusted digital ledger for small businesses, replacing traditional khata books with a mobile-first fintech experience.

| Outcome                        | What It Means                                                           |
| :----------------------------- | :---------------------------------------------------------------------- |
| **Fast transaction entry**     | Any bill or payment recorded in under 60 seconds                        |
| **Clear financial visibility** | Net position and per-customer balance always visible without navigation |
| **Improved payment recovery**  | Reminders, overdue flagging, and payment clarity reduce collection lag  |

---

## Roadmap Overview

| Phase     | Title                                 | Status         | Key Deliverable                                                                                       |
| :-------- | :------------------------------------ | :------------- | :---------------------------------------------------------------------------------------------------- |
| Phase 1   | Core Ledger MVP                       | ✅ Complete    | Customer credit tracking and balance management                                                       |
| Phase 2   | Billing & Suppliers                   | ✅ Complete    | Itemized bills, supplier management, net position                                                     |
| Phase 3   | Indian Billing Suite                  | ✅ Complete    | GST, sequential IDs, loading charge, WhatsApp reminders                                               |
| Phase 4   | Platform Features                     | ✅ Complete    | Onboarding, Sentry, i18n, CSV export, contacts import                                                 |
| Phase 5   | Design System & Dashboard             | ✅ Complete    | Green (#22C55E) brand system, premium dashboard redesign                                              |
| Phase 6   | Customer UI Overhaul                  | ✅ Complete    | Transaction feed, payment modal, customer detail redesign                                             |
| Phase 6.2 | UI Audit — Icons, Colors & Components | ✅ Complete    | Lucide migration, @gorhom/bottom-sheet, Toast, Financial Position screen                              |
| Phase 6.3 | Production Hardening                  | ✅ Complete    | FlatList perf, KeyboardAvoidingView, icon/data audit, component organisation                          |
| Phase 6.4 | Production Bug Fix & Signoff          | ✅ Complete    | 27-item audit: DB/RLS bugs, broken search, export crash, UI token fixes                               |
| Phase 6.5 | Auth Hardening Sprint                 | ✅ Complete    | Password recovery race fix, secure storage, state machine compliance, 9 QA issues resolved            |
| Phase 6.6 | Screen Redesigns UI Sprint            | ✅ Complete    | 7 screens/components fully rewritten: SafeAreaView+StyleSheet, sub-components extracted, i18n removed |
| Phase 6.7 | Orders & Modal Hardening Sprint       | ✅ Complete    | Orders List + Order Detail screens built; NewCustomerModal + NewSupplierModal migrated to @gorhom     |
| Phase 7   | Growth & Retention                    | 🔄 In Progress | UPI, push notifications, staff accounts, analytics                                                    |
| Phase 8   | Financial Platform                    | 🗓 Planned     | Credit scoring, lending, automated bookkeeping                                                        |

---

## Phase 1 — Core Ledger MVP ✅ Complete

**Goal**: Launch the minimum viable credit ledger — enough for a shop owner to replace their physical khata book on day one.

| Feature                   | Description                                                                  |
| :------------------------ | :--------------------------------------------------------------------------- |
| **Customer Management**   | Create, edit, and manage customer profiles with name, phone, and address     |
| **Transaction Recording** | Record credit given (bills) and payments received against a customer account |
| **Balance Tracking**      | Automatically compute and display outstanding balance per customer           |
| **Dashboard Summary**     | Show total receivable and a summary of recent activity                       |
| **Authentication**        | Secure sign-in with Supabase Auth; per-vendor data isolation via RLS         |

---

## Phase 2 — Billing & Suppliers ✅ Complete

**Goal**: Expand beyond simple credit entries to professional bill generation and supplier-side balance tracking.

| Feature                       | Description                                                          |
| :---------------------------- | :------------------------------------------------------------------- |
| **Bill Creation**             | Create itemized bills with product catalog, quantity, and pricing    |
| **PDF Invoice Export**        | Generate branded PDF invoices with bank details and UPI QR           |
| **Supplier Management**       | Add suppliers and track goods received with delivery-level detail    |
| **Supplier Payment Tracking** | Record payments made to suppliers; compute balance owed per supplier |
| **Net Position Dashboard**    | Single-screen view of receivables vs payables vs net position        |
| **Transaction History**       | Chronological activity log per customer with running balance         |

---

## Phase 3 — Indian Billing Suite ✅ Complete

**Goal**: Localise the billing product for Indian market requirements — GST, sequential bill numbering, loading charges, and WhatsApp reminders.

| Feature                       | Description                                                                                   |
| :---------------------------- | :-------------------------------------------------------------------------------------------- |
| **Sequential Bill IDs**       | Auto-incrementing bill numbers per vendor with custom prefix (`INV-001`, `BILL-042`)          |
| **GST Support**               | Apply configurable GST % to the itemised total per bill                                       |
| **Loading Charge**            | Non-taxable transport/delivery fee added post-tax                                             |
| **Previous Balance Snapshot** | At bill creation, snapshot the customer's outstanding balance onto the invoice                |
| **Bank Details on Invoice**   | Print bank account, IFSC, and UPI ID on PDF footer                                            |
| **UPI QR on Invoice**         | Embed Google Charts QR code for scan-to-pay                                                   |
| **WhatsApp Reminders**        | One-tap pre-filled reminder via `Linking.openURL`                                             |
| **Overdue Flagging**          | Flag customers with unpaid balance older than 30 days; surface on dashboard and customer list |
| **Payment Mode Expansion**    | Support Cash / UPI / NEFT / Demand Draft / Cheque                                             |

---

## Phase 4 — Platform Features ✅ Complete

**Goal**: Add engagement, reliability, and data portability features to convert casual users into daily-active power users.

| Feature                    | Description                                                                                             |
| :------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Onboarding Flow**        | 3-step setup: phone, business details (name, GSTIN, prefix, UPI), ready screen                          |
| **Role Selection**         | Retailer / Wholesaler / Small Business picker that maps to dashboard mode                               |
| **Sentry Crash Reporting** | Automatic error tracking and crash reports via `@sentry/react-native`                                   |
| **Hindi Language Toggle**  | Full i18n with EN/HI via `i18next`; AsyncStorage persistence                                            |
| **CSV Data Export**        | Export orders, payments, customers, and suppliers as CSV; share via native sheet                        |
| **Contacts Import**        | Import customers from device phone book via `expo-contacts`; multi-select, bulk add, duplicate skipping |

---

## Phase 5 — Design System & Dashboard ✅ Complete

**Goal**: Establish a unified design system and premium UI across the application.

| Feature                  | Description                                                                                              |
| :----------------------- | :------------------------------------------------------------------------------------------------------- |
| **Unified Theme**        | `theme.ts` as single source of truth — colors, spacing, typography, radius                               |
| **Green Brand System**   | `#22C55E` primary, semantic green/red/amber/info tokens, iOS-style neutral scale                         |
| **Premium Dashboard**    | Gradient hero card, View Report/Remind action bar, stat cards, activity feed                             |
| **Dashboard Components** | 7 extracted components: Header, HeroCard, ActionBar, StatCards, RecentActivity, ActivityRow, StatusBadge |
| **Premium Tab Bar**      | White background, `#22C55E` active tint, shadow, 64dp height                                             |

---

## Phase 6 — Customer UI Overhaul ✅ Complete

**Goal**: Rebuild the customer-facing surfaces to match the design system and deliver a premium transaction experience.

| Feature                      | Description                                                                                        |
| :--------------------------- | :------------------------------------------------------------------------------------------------- |
| **Customer List Redesign**   | Initials avatar (8-color deterministic palette), color-coded balances, status badges, filter tabs  |
| **Customer Detail Redesign** | Gradient hero card, 3 action cards, unified transaction feed, date groups, running balance per row |
| **Transaction Feed**         | Merged bills + payments timeline, forward-pass running balance, newest-first display               |
| **Record Payment Modal**     | Bottom-sheet — amount input, 5 payment mode chips, Partial / Mark Full Paid actions                |
| **Download Statement**       | PDF generation + `expo-sharing` for full customer transaction history                              |

---

## Phase 6.2 — UI Audit: Icons, Colors & Components ✅ Complete

**Goal**: Complete the visual and component quality bar — migrate all icons to `lucide-react-native`, harden payment modals, add Toast feedback.

| Feature                       | Description                                                                                                              |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Lucide Icon Migration**     | Replaced all `@expo/vector-icons` with `lucide-react-native` across ~35 files; package removed                           |
| **@gorhom/bottom-sheet**      | Upgraded `RecordCustomerPaymentModal` and `RecordPaymentMadeModal` to v5.2.6                                             |
| **Toast Component**           | Built `Toast.tsx` with `ToastProvider` / `useToast()` hook; success (green) + error (red); wired into root `_layout.tsx` |
| **EmptyState Upgrade**        | Enhanced with `title`, `description`, `cta`, `onCta` props + `CircleOff` icon + green CTA button                         |
| **Financial Position Screen** | New screen at `app/(main)/reports/index.tsx`; shows receivables, payables, and net position                              |
| **Dashboard "Both" Mode**     | Split hero card: green `#F0FDF4` YOU RECEIVE panel + red `#FEF2F2` YOU OWE panel + net position row                      |

---

## Phase 6.3 — Production Hardening ✅ Complete

**Goal**: Performance, safety, and code-quality pass to bring all screens to production-ready quality.

| Feature                    | Description                                                                                                |
| :------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **FlatList Performance**   | Added `getItemLayout`, `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize` to all 4 list screens  |
| **KeyboardAvoidingView**   | Wrapped `CreateOrderScreen` body in `KeyboardAvoidingView` with platform-aware `behavior` prop             |
| **Icon & Data Audit**      | Confirmed zero `@expo/vector-icons` imports; confirmed zero PKR / +92 data; Sentry DSN verified            |
| **Component Organisation** | Moved `FloatingActionButton` and `SearchBar` from root into `src/components/ui/`; all import paths updated |

---

## Phase 6.4 — Production Bug Fix & Signoff ✅ Complete

**Goal**: Fix all 38 real codebase bugs discovered by audit (8 critical, 15 major, 15 minor). All 27 prompt-tracked items resolved. Pending: device verification on target hardware (Pixel 4a).

**Audit source**: `FINAL_AUDIT.md` — generated March 9, 2026 from scan of `schema.sql`, `src/api/*.ts`, `src/types/*.ts`, all screen and component files.

### Database Fixes (P01–P05)

| ID  | Fix                                                                                                              | Status |
| :-- | :--------------------------------------------------------------------------------------------------------------- | :----- |
| P01 | Fixed 4 supplier table RLS policies (broken `vendor_id = auth.uid()` → join-through-profiles)                    | ✅     |
| P02 | Aligned `dashboard_mode` DB constraint with TypeScript types and onboarding write                                | ✅     |
| P03 | Fixed `fetchProducts` to join `product_variants`; aligned `variant_name` field name                              | ✅     |
| P04 | Fixed `fetchOrders` search (`!inner` join + dot notation); removed nonexistent `reference` column                | ✅     |
| P05 | Added 3 missing indexes: `supplier_deliveries(supplier_id)`, `payments_made(supplier_id)`, `payments(vendor_id)` | ✅     |

### Logic Fixes (P06–P09)

| ID  | Fix                                                                                                 | Status |
| :-- | :-------------------------------------------------------------------------------------------------- | :----- |
| P06 | Added Overdue (red) and Partially Paid (blue) chips to `OrderList` `STATUS_STYLES` map              | ✅     |
| P07 | Fixed `Button.tsx` outline spinner: `color="#000"` → `color="#22C55E"`; `rounded-md` → `rounded-xl` | ✅     |
| P08 | Migrated `RecordDeliveryModal` from RN built-in Modal to `@gorhom/bottom-sheet` v5                  | ✅     |
| P09 | Fixed `RecordPaymentMadeModal` validation: `>= balanceOwed` → `> balanceOwed`                       | ✅     |

### Architecture Fixes (P10–P13)

| ID  | Fix                                                                                          | Status |
| :-- | :------------------------------------------------------------------------------------------- | :----- |
| P10 | Deleted 3 dead files: `PdfPreviewModal.tsx`, `QuickAction.tsx`, `dashboardStore.tsx`         | ✅     |
| P11 | Replaced raw `TouchableOpacity` in both payment modals with `Button.tsx`; unified chip shape | ✅     |
| P12 | Added active-state styling to `FilterBar` chips; replaced all `gray-*` Tailwind with tokens  | ✅     |
| P13 | Created `app/(main)/reports/_layout.tsx` with `headerShown: false`                           | ✅     |

### Design Token Fixes (P14–P17)

| ID  | Fix                                                                                                    | Status |
| :-- | :----------------------------------------------------------------------------------------------------- | :----- |
| P14 | `CustomerCard`: fixed all 3 status chip colors and Paid text to `success.text` (`#166534`)             | ✅     |
| P15 | `SupplierCard`: added initials avatar (matching `CustomerCard`); replaced all amber with theme tokens  | ✅     |
| P16 | `EmptyState`: migrated `StyleSheet` → NativeWind; fixed icon bg to `#F6F7F9`. `Toast`: error `#E74C3C` | ✅     |
| P17 | `StatusDot`: replaced `bg-yellow-500` / `bg-red-500` with inline theme values. `AppModal`: `slideInUp` | ✅     |

### Screen Fixes (P18–P21)

| ID  | Fix                                                                                                      | Status |
| :-- | :------------------------------------------------------------------------------------------------------- | :----- |
| P18 | `DashboardHeader`: time-based greeting, initials avatar, overdue bell red dot                            | ✅     |
| P19 | `CustomerDetail`: exact "Send Reminder" label, `MODE_LABEL` map, ₹0 balance → green "ALL SETTLED" hero   | ✅     |
| P20 | `CreateOrderScreen`: Grand Total `fontSize: 28`, Previous Balance red, formula verified clean            | ✅     |
| P21 | `ProfileScreen`: filled green avatar, mode toggle Seller/Distributor/Both order, `ExportScreen` back btn | ✅     |

### Cross-Cutting Fixes (P22–P27)

| ID  | Fix                                                                                            | Status |
| :-- | :--------------------------------------------------------------------------------------------- | :----- |
| P22 | Added 5 missing `invalidateQueries` across 4 mutation files; dashboard now updates immediately | ✅     |
| P23 | `FlatList` full optimisation: `useCallback`, `getItemLayout`, all perf props on 4 lists        | ✅     |
| P24 | `KeyboardAvoidingView` in `CreateOrderScreen`; login + business already compliant              | ✅     |
| P25 | Confirmed zero `@expo/vector-icons` imports — `lucide-react-native` is sole icon library       | ✅     |
| P26 | Confirmed zero Pakistani data; `sentry.ts` + `Sentry.wrap(RootLayout)` verified                | ✅     |
| P27 | `FloatingActionButton` + `SearchBar` moved to `src/components/ui/`; 7 import paths updated     | ✅     |

### Deferred to v3.5 (non-breaking)

| ID        | Issue                                                        | Reason                                        |
| :-------- | :----------------------------------------------------------- | :-------------------------------------------- |
| M-01      | `NewProductModal` / `AppModal` still uses react-native-modal | Full modal consolidation is a larger refactor |
| M-04      | Export screen not in tab bar                                 | UX decision pending                           |
| M-05–M-08 | Architecture cleanup items (screens indirection, etc.)       | Non-breaking; queued for v3.5                 |
| N-12      | `heroDecor` orphaned color in `theme.ts`                     | Cosmetic; no user impact                      |
| N-14      | Payment mode chip border token mismatch                      | Cosmetic                                      |
| N-15      | `Button.tsx` corner radius inconsistency                     | Cosmetic                                      |

---

## Phase 6.5 — Auth Hardening Sprint ✅ Complete

**Goal**: Comprehensive QA audit of the authentication system followed by resolution of all identified issues — covering security, reliability, UX, and navigation correctness.

**Audit methodology**: Simulated 8 real user journeys through the 8-state auth machine (INITIALISING → UNAUTHENTICATED_WELCOME → UNAUTHENTICATED_LOGIN → PROFILE_LOADING → PROFILE_ERROR → ONBOARDING → AUTHENTICATED → PASSWORD_RECOVERY). Produced 1 FAIL and 8 WARN findings, all resolved.

### Security & Reliability Fixes

| ID      | Fix                                                                                                   | Status |
| :------ | :---------------------------------------------------------------------------------------------------- | :----- |
| FAIL-01 | `isRecoveryMode` flag in authStore; top-priority Stack.Screen prevents dashboard evicting recovery    | ✅     |
| C1      | `AuthProfileErrorScreen` + `profile-error` route — dead-state recovery with Retry and Logout          | ✅     |
| C4      | `set-new-password.tsx` + `PASSWORD_RECOVERY` Supabase event handler + `redirectTo: Linking.createURL` | ✅     |
| C5      | Google OAuth `createMinimalProfile()` + 3 × 600 ms retry loop for DB trigger race                     | ✅     |
| B1      | `src/lib/secureStorage.ts` — chunked expo-secure-store adapter; JWT no longer in AsyncStorage         | ✅     |
| WARN-06 | `signOut()` + `setRecoveryMode(false)` before `router.replace(login)` prevents dashboard flash        | ✅     |
| WARN-08 | `redirectTo: Linking.createURL("/")` added to `resetPasswordForEmail`                                 | ✅     |

### State Machine Compliance Fixes

| ID  | Fix                                                                                                    | Status |
| :-- | :----------------------------------------------------------------------------------------------------- | :----- |
| V1  | Atomic `setUser` — single `set({ user, loading: true })` eliminates intermediate PROFILE_ERROR flicker | ✅     |
| V2  | `_fetchInProgress` closure gate in authStore factory — no duplicate HTTP fetch on hot reload           | ✅     |
| V3  | `useLogin.onSuccess` null-profile guard routes to `/profile-error` instead of crashing                 | ✅     |
| R1  | `SIGNED_IN` handler checks `isRecoveryMode` before triggering profile fetch                            | ✅     |
| R2  | `USER_UPDATED` race eliminated by `signOut()` in `set-new-password.tsx` before navigation              | ✅     |

### Monitoring & UX Fixes

| ID      | Fix                                                                              | Status |
| :------ | :------------------------------------------------------------------------------- | :----- |
| B6      | 6 Sentry `addBreadcrumb` calls across 6 auth transitions                         | ✅     |
| WARN-01 | `useSignUp.onSuccess` null-profile fallback routes to `/profile-error`           | ✅     |
| WARN-02 | `google_oauth_start` breadcrumb moved to `mutationFn` (fires before OAuth)       | ✅     |
| WARN-03 | `hasSeenWelcome` AsyncStorage deletion documented in `useLogout.onSuccess`       | ✅     |
| WARN-04 | Signup confirm-password eye-toggle (`showConfirmPassword` state in `signup.tsx`) | ✅     |
| WARN-05 | `Loader.tsx` 2-second `setTimeout` shows "Loading your profile…" hint            | ✅     |
| WARN-09 | `router.push` (not `replace`) in `role.tsx` preserves back-stack                 | ✅     |

### New Files Added

| File                                     | Purpose                                                                          |
| :--------------------------------------- | :------------------------------------------------------------------------------- |
| `src/lib/secureStorage.ts`               | Chunked expo-secure-store adapter (1800-byte chunks, backwards-compatible)       |
| `src/screens/AuthProfileErrorScreen.tsx` | Dead-state recovery UI: Retry + Logout for PROFILE_ERROR state                   |
| `app/profile-error.tsx`                  | Route wrapper for `AuthProfileErrorScreen`                                       |
| `app/(auth)/set-new-password.tsx`        | Password recovery form (Formik + Yup); calls `setRecoveryMode(false)` on success |

---

## Phase 6.6 — Screen Redesigns UI Sprint ✅ Complete

**Goal**: Fully redesign 7 screens and components to match final screenshot specs. Migrate all screens from ScreenWrapper + NativeWind to SafeAreaView + StyleSheet.create, extract reusable sub-components from each screen, and remove i18n / ScreenWrapper dependencies.

**Constraint**: All changes must be zero-TypeScript-error. No new dependencies added.

### Screens & Components Redesigned

| Screen / Component             | Key Changes                                                                                                                                                                                                                                                            |
| :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CreateOrderScreen.tsx`        | Custom back-arrow header; sticky footer; `OrderBillSummary` inline sub-component; removed ScreenWrapper                                                                                                                                                                |
| `NewProductModal.tsx`          | Variants-only (no Base Price); `RupeeInput` sub-component; `FieldArray` for variant rows; sticky CTA; removed AppModal dependency                                                                                                                                      |
| `ConfirmModal.tsx` (NEW)       | New reusable destructive-confirm component in `src/components/ui/`; `AlertTriangle` + Delete/Cancel + `loading` prop                                                                                                                                                   |
| `ProductCard.tsx`              | Compact single-row: icon box + bold name + "N variants" subtitle + ₹price + ChevronRight; no image / expand                                                                                                                                                            |
| `ProductsScreen.tsx`           | SafeAreaView + StyleSheet; custom header with green count badge; Search/X toggle; horizontal `CATEGORIES` chip bar; `ConfirmModal` for delete                                                                                                                          |
| `app/(main)/reports/index.tsx` | Full inline rewrite: `StatCard` / `NetCard` / `InsightPill` sub-components; green + `#E0336E` + dark `#1C2333` cards; Monthly Report download card                                                                                                                     |
| `ExportScreen.tsx`             | `ExportRow` + `DateInput` sub-components; All-time / This-month date presets; `loadingKey` prevents concurrent exports; removed ScreenWrapper / NativeWind / i18n                                                                                                      |
| `ProfileScreen.tsx`            | `SectionCard` + `DetailRow` + `SegmentControl<T>` sub-components; green-bordered avatar ring + initials; `maskAccount()` helper; Sign Out with `Alert.alert` confirmation; removed SubscriptionCard / ImagePickerField / uploadImage / i18n / inline TextInput editing |

### Files Modified

- `src/screens/ExportScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/ProductsScreen.tsx`
- `src/screens/CreateOrderScreen.tsx`
- `src/components/products/NewProductModal.tsx`
- `src/components/products/ProductCard.tsx`
- `app/(main)/reports/index.tsx`

### Files Created

- `src/components/ui/ConfirmModal.tsx`

### Architecture Notes

- **Styling pattern**: `SafeAreaView` from `react-native-safe-area-context` + `StyleSheet.create()` is now the canonical pattern for all main screens. `ScreenWrapper` + NativeWind className string usage is deprecated for screen-level code.
- **Sub-components**: All screen-level sub-components (SectionCard, DetailRow, SegmentControl, ExportRow, DateInput, StatCard, NetCard, InsightPill) are declared inline in their parent screen file — no separate file per sub-component.
- **i18n removal**: `ExportScreen` and `ProfileScreen` no longer call `useTranslation()`. Language-aware text is plain string literals pending a future i18n re-audit.

---

## Phase 6.7 — Orders & Modal Hardening Sprint ✅ Complete

**Goal**: Build the Orders List and Order Detail screens from scratch; migrate remaining AppModal-based forms to `@gorhom/bottom-sheet`.

**Constraint**: Zero new dependencies. Zero TypeScript errors on all changed files.

### Features Completed

| Component / Screen                | Changes                                                                                                                                                                                                                                          |
| :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OrdersScreen.tsx`                | Full rewrite: `SafeAreaView edges={['top']}`; "Orders" header + collapsible Search icon toggle; inline filter chips (All/Paid/Partial/Pending/Overdue); Overdue as client-side `daysSince > 30` sub-filter; Sort chip → local BottomSheet; FAB   |
| `OrderList.tsx`                   | Full redesign: 44 dp avatar + customer name (15 sp bold) + bill number + date row + ₹amount (17 sp) + status chip; `STATUS_STYLES` updated to exact spec hex; `ORDER_ITEM_H=108`; `onCreateBill` prop; inline empty state with "Create Bill" CTA |
| `app/(main)/orders/[orderId].tsx` | New Order Detail screen: Customer card + Items card + Bill Summary (flush-joined) + Payment History (running balance, mode chips) + Fixed Action Bar (Send Bill → expo-sharing/WhatsApp; Record Payment → RecordCustomerPaymentModal)            |
| `app/(main)/orders/_layout.tsx`   | Header renderer updated to accept dynamic `options.title` from child `Stack.Screen` — enables `Order #INV-001` dynamic title                                                                                                                     |
| `src/api/orders.ts`               | `Order` interface extended with `customer?: { id, name, phone } \| null`                                                                                                                                                                         |
| `NewCustomerModal.tsx` (M-01)     | Migrated from `react-native-modal` (AppModal) to `@gorhom/bottom-sheet` — `snapPoints:["90%"]`, `BottomSheetScrollView`, `BottomSheetBackdrop`                                                                                                   |
| `NewSupplierModal.tsx` (M-01)     | Same migration as `NewCustomerModal`                                                                                                                                                                                                             |

### Files Modified

- `src/screens/OrdersScreen.tsx`
- `src/components/orders/OrderList.tsx`
- `app/(main)/orders/[orderId].tsx`
- `app/(main)/orders/_layout.tsx`
- `src/api/orders.ts`
- `src/components/customers/NewCustomerModal.tsx`
- `src/components/suppliers/NewSupplierModal.tsx`

---

## Phase 7 — Growth & Retention 🔄 In Progress

**Goal**: Drive user retention and daily engagement through notifications, faster authentication, and staff collaboration features.

**Pre-requisite completed**: Phase 6.4 production signoff + Phase 6.5 auth hardening + Phase 6.7 Orders screens. All critical bugs resolved before Phase 7 work begins.

**Business Model Note**: CreditBook is and will remain **free for all users**. No premium subscription is planned. Phase 7 features grow the user base and increase daily engagement — not revenue extraction. If the product demonstrates significant organic growth, optional paid upgrades may be evaluated in Phase 9+.

### Features

| Feature                      | Priority | Description                                                                   | Dependency          |
| :--------------------------- | :------- | :---------------------------------------------------------------------------- | :------------------ |
| **Phone OTP Login**          | High     | Replace email/password with mobile OTP (Supabase Phone Auth via Twilio/MSG91) | None                |
| **WhatsApp Business API**    | High     | Auto-send PDF bill to customer on creation via WhatsApp Business API          | None                |
| **Push Notifications (FCM)** | High     | Overdue payment alerts and transaction confirmations via Firebase             | None                |
| **Inventory Stock Tracking** | Medium   | `stock_quantity` on products; low-stock alert banner                          | P03 variants fix ✅ |
| **Staff Accounts**           | Medium   | Role-based access: Owner / Billing Staff / View-Only                          | None                |
| **Cloud Backup & Restore**   | Medium   | Export full dataset to Google Drive or Supabase Storage                       | None                |
| **Online Storefront**        | Low      | Shareable product catalog with WhatsApp order CTA                             | None                |

### GitHub Issues

```
[ ] feat: Integrate Supabase Phone Auth (OTP via Twilio or MSG91)
[ ] feat: WhatsApp Business API — auto-send PDF on bill creation
[ ] feat: Push notifications (FCM) — overdue alerts + payment confirmations
[ ] feat: Add stock_quantity field to products table; update on order creation
[ ] feat: Low-stock alert banner on Products screen and Dashboard
[ ] feat: Staff accounts — invite by phone; role-based tab/action visibility
[ ] feat: Cloud Backup — export full dataset to Google Drive
[ ] feat: Online Storefront — public product page with WhatsApp order CTA
```

---

## Phase 8 — Financial Platform 🗓 Planned

**Goal**: Leverage CreditBook's transaction data to build advanced financial tools and expand into lending and bookkeeping.

| Feature                          | Description                                                                                     |
| :------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Credit Scoring**               | Generate a customer reliability score based on payment history, frequency, and balance patterns |
| **Payment Prediction**           | ML model to predict likelihood and timing of customer payments                                  |
| **Automated Bookkeeping**        | Auto-categorise transactions into income, expense, and tax buckets                              |
| **GST Filing Assistance**        | Aggregate GST data from invoices; export in GSTR-1/GSTR-3B compatible format                    |
| **Business Financing**           | Offer working capital loans underwritten by CreditBook transaction data                         |
| **Lending Partner Integrations** | API integration with NBFCs and fintech lenders for embedded credit                              |

---

## Milestones

| Milestone                       | Description                                                                                                       | Status     |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------- | :--------- |
| **MVP Launch**                  | Core ledger — customers, transactions, balance tracking, dashboard                                                | ✅ Shipped |
| **Billing Launch**              | Itemized bills, PDF export, supplier management, net position                                                     | ✅ Shipped |
| **India Suite Launch**          | GST, sequential IDs, loading charge, WhatsApp reminders, overdue flagging                                         | ✅ Shipped |
| **Platform Launch**             | Onboarding, i18n, Sentry, CSV export, contacts import                                                             | ✅ Shipped |
| **Design System Launch**        | Green (#22C55E) brand system, premium dashboard, unified theme                                                    | ✅ Shipped |
| **Customer UI Launch**          | Transaction feed, payment modal, Customer Detail redesign                                                         | ✅ Shipped |
| **UI Audit Launch**             | Lucide icons, @gorhom/bottom-sheet, Toast, Financial Position screen                                              | ✅ Shipped |
| **Production Hardening Launch** | FlatList perf, KeyboardAvoidingView, icon/data audit, component organisation                                      | ✅ Shipped |
| **Production Signoff**          | All 27-item audit resolved; app submitted for TestFlight / Play Store Internal Testing                            | ✅ Shipped |
| **Auth Hardening**              | 9 QA issues resolved; password recovery race fixed; secure JWT storage; full state machine compliance             | ✅ Shipped |
| **Screen Redesigns Launch**     | 7 screens fully rewritten to SafeAreaView+StyleSheet pattern; Phase 6.6 complete                                  | ✅ Shipped |
| **Orders & Modals Launch**      | Orders List + Order Detail screens built; NewCustomerModal/NewSupplierModal @gorhom migration; Phase 6.7 complete | ✅ Shipped |
| **Device Verification**         | P01–P38 sign-off checklist run on target hardware (Pixel 4a + iPhone)                                             | ⏳ Pending |
| **Growth Launch**               | OTP login, push notifications, WhatsApp Business API, staff accounts                                              | 🔄 Q2 2026 |
| **Financial Platform Launch**   | Credit scoring, GST filing, lending integration                                                                   | 🗓 Q4 2026 |

---

## Success Metrics

| Metric                              | Description                                                | Target                  |
| :---------------------------------- | :--------------------------------------------------------- | :---------------------- |
| **Daily Active Users (DAU)**        | Unique users recording ≥ 1 transaction per day             | 10,000 by end of Year 1 |
| **Transactions per user / day**     | Average bills or payments per active session               | ≥ 5                     |
| **Payment recovery rate**           | % of WhatsApp reminders resulting in payment within 7 days | ≥ 35%                   |
| **Avg. time to record transaction** | Seconds from screen open to confirmation                   | < 60 seconds            |
| **Day-30 retention**                | Users returning within 30 days of signup                   | ≥ 30%                   |
| **Net Promoter Score (NPS)**        | In-app survey score                                        | ≥ 50                    |

---

## Long-Term Vision

CreditBook's long-term goal is to become the **financial operating system for small businesses in emerging markets** — starting with the ledger and expanding into the full financial stack.

| Horizon     | Focus                                                                         |
| :---------- | :---------------------------------------------------------------------------- |
| **Year 1**  | Replace the khata book — credit ledger, billing, reminders, supplier tracking |
| **Year 2**  | Credit intelligence — payment prediction, customer reliability scoring        |
| **Year 3**  | Business financing — working capital loans underwritten by CreditBook data    |
| **Year 4+** | Automated bookkeeping — P&L, GST filing, accountant and ERP integrations      |

India has approximately **63 million MSMEs**, most of which manage credit manually. CreditBook is positioned to become the default tool for informal credit management before expanding into the broader financial services stack.

---

_This roadmap is a living document. Phase boundaries and feature priorities are updated as user research, retention data, and business context evolve._
