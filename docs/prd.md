# KredBook – Product Requirements Document

> **Version**: 2.1
> **Last Updated**: April 9, 2026
> **Status**: Phase 3 shipped — see docs/STATUS.md for current implementation state
> **Owner**: KredBook Product Team

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [Key Features](#3-key-features)
   - 3.1 Customer Credit Ledger
   - 3.2 Payment Recording
   - 3.3 Bill Creation
   - 3.4 Supplier Management
   - 3.5 Net Position Dashboard
   - 3.6 Transaction History
   - 3.7 Payment Reminders
   - **3.8 Offline-First Architecture** _(new)_
   - **3.9 Localization** _(new)_
4. [Core Screens](#4-core-screens)
5. [UX Principles](#5-ux-principles)
6. [Design System Summary](#6-design-system-summary)
7. [Technology Stack](#7-technology-stack)
8. [Performance Requirements](#8-performance-requirements)
9. [Product Roadmap](#9-product-roadmap) _(v1.0 → v1.1 → v1.2 → v2.0)_
10. [Success Metrics](#10-success-metrics)
11. [Vision](#11-vision)

---

## 1. Product Overview

### The Problem

Hundreds of millions of small business owners across India still track customer credit using **physical khata books** — handwritten ledgers that are fragile, error-prone, and invisible to any digital workflow.

This creates compounding problems at scale:

| Problem                           | Impact                                |
| :-------------------------------- | :------------------------------------ |
| **Lost or damaged records**       | Unrecoverable debt, customer disputes |
| **Manual calculation errors**     | Incorrect balances, trust breakdown   |
| **No visibility into total dues** | Owners cannot prioritize collection   |
| **No payment confirmation trail** | Disputes with no audit evidence       |
| **Delayed payment collection**    | Cash flow deterioration               |

### The Solution

KredBook provides a **simple digital ledger with real-time balance visibility, payment tracking, and one-tap bill generation.**

It replaces the khata book with a mobile experience that requires no accounting knowledge, no training, and no internet dependency for core recording operations.

### Product Goal

> Create the simplest and most reliable digital credit ledger for small businesses.

Every product decision is evaluated against this goal. Features that add complexity without proportionally improving reliability or simplicity are not shipped.

### Core Value Propositions

- **Instant balance visibility** — Know exactly who owes what at any moment
- **Fast transaction recording** — Bill or payment recorded in under 60 seconds
- **Reliable audit trail** — Sequential bills, immutable records, payment history
- **Supplier-side tracking** — Balance what you're owed vs. what you owe

### Business Model

> **KredBook is free for all users.** No paywalls, no feature gating, no subscription required.

All core features — credit tracking, billing, payments, supplier management, PDF export, and reminders — are available to every business at zero cost. The product succeeds by becoming indispensable through daily use, not by locking features behind subscriptions.

If the app grows significantly, optional value-add features (multi-user access, advanced analytics, custom invoice branding) may be considered as additive paid upgrades. **Core ledger functionality will never be gated.**

---

## 2. Target Users

### 2.1 Retailers

**Description**: Shop owners who sell goods directly to local customers and extend credit on purchases.

**Examples**: Kirana stores, medical shops, hardware shops, clothing retailers

**Primary Jobs To Be Done**:

- Record what each customer owes after each sale
- Track partial payments made over multiple visits
- Send reminders to customers with outstanding dues
- Generate a printed or PDF bill for record-keeping

**Pain Points**:

- Forgetting to record a transaction in the khata
- Customers disputing balances on old entries
- No way to know total recoverable debt across all customers

---

### 2.2 Wholesalers

**Description**: Distributors who supply goods to multiple retailers in bulk and manage complex credit cycles.

**Examples**: FMCG distributors, vegetable/grain wholesalers, textile suppliers

**Primary Jobs To Be Done**:

- Track credit extended to each retail buyer
- Record deliveries with item-level detail
- Manage transport (loading) charges separately from goods
- Monitor which retailers have overdue balances

**Pain Points**:

- High transaction volume makes manual tracking unreliable
- Multiple partial payments on a single delivery are hard to reconcile
- No consolidated view of net receivables across all buyers

---

### 2.3 Small Businesses

**Description**: Service providers and specialty retailers who extend informal credit to regular customers.

**Examples**: Auto repair shops, pharmacies, tiffin services, building material suppliers

**Primary Jobs To Be Done**:

- Record service charges and dues against named customers
- Track payments received in cash, UPI, or cheque
- Identify customers who have not paid in 30+ days

**Pain Points**:

- No consistent format for tracking; different staff record differently
- Cannot distinguish between cash paid and credit still outstanding

---

## 3. Key Features

### 3.1 Customer Credit Ledger

Track the complete credit relationship with each customer from the first transaction.

- Lifetime transaction history per customer (bills + payments in one unified feed)
- Running balance updated automatically on every transaction
- Balance color-coded by state: green (paid/advance), amber (pending), red (overdue)
- Customer-level overdue flag when balance is unpaid for 30+ days

---

### 3.2 Payment Recording

Record multiple payment types against any open bill or customer balance.

- Supported modes: **Cash, UPI, NEFT, Demand Draft, Cheque**
- Partial payment support — record any amount without closing the bill
- Mark Full Paid — one tap to settle the entire outstanding balance
- Payment history visible per customer and per bill

---

### 3.3 Bill Creation

Generate itemized bills with professional formatting suitable for WhatsApp sharing or PDF printing.

- Product catalog with real-time search
- Variant support (size, weight, unit) with distinct pricing
- Dynamic rate editing per bill (for deal pricing)
- **GST %** applied to item total (configurable per bill)
- **Loading Charge** added post-tax (non-taxable transport/delivery fee)
- Previous balance pulled automatically at bill creation
- Sequential bill IDs (`INV-001`, `INV-002`) with custom prefix support
- PDF output with business name, GSTIN, UPI QR, and bank details

---

### 3.4 Supplier Management

Track what the business owes to its own suppliers and distributors.

- Supplier directory with name, phone, address, and bank details
- Record deliveries with itemized rows (item × qty × rate), loading charge, and advance paid
- Record payments made to suppliers with mode and notes
- Balance owed = `SUM(deliveries)` − `SUM(payments made)` per supplier
- Suppliers sorted by highest balance owed

---

### 3.5 Net Position Dashboard

Give the business owner a single-screen financial health summary.

- **Customers Owe Me** (green): sum of all positive customer balances
- **I Owe Suppliers** (red): sum of all outstanding supplier balances
- **Net Position** (green if positive, amber if negative): `receivable − payable`
- Dashboard mode toggle: Seller / Distributor / Both — controls which cards appear
- Recent activity feed with status chips and customer/supplier names

---

### 3.6 Transaction History

Full chronological activity log at both customer and account level.

- Unified feed: bills and payments on the same timeline, newest first
- Date-group separators (Today / Yesterday / date)
- Running balance shown per transaction row
- Filterable by type: All / Bills / Payments

---

### 3.7 Payment Reminders

Allow sending payment reminders to customers without leaving the app.

- One-tap WhatsApp reminder with pre-filled message including customer name, balance, and business name
- Deep link to WhatsApp via `Linking.openURL('whatsapp://send?text=...')`
- Reminder visible from Customer Detail screen and Customer List screen

---

### 3.8 Offline-First Architecture

The app must function without an internet connection. Recording a bill or payment must never fail due to network conditions.

To achieve extreme performance and offline reliability without the heavy overhead of WatermelonDB / SQLite, KredBook v1.0 uses an **MMKV + React Query hybrid approach**.

#### 3.8.1 Read Strategy (React Query)

- All `useQuery` hooks (Customers, Orders, Products, Suppliers) have extended `staleTime` and `gcTime` to maximise cache reuse.
- Queries are persisted to disk using `@tanstack/react-query-persist-client` with an MMKV storage persister, enabling instant cold boots even while offline.
- After the first network sync, all subsequent reads are served from the TanStack Query cache — no network round-trip required.
- Stale data is refetched in the background when the app regains connection.

#### 3.8.2 Write Strategy (MMKV Mutation Queue)

- When offline, `useMutation` calls intercept network failures and push the mutation payload (e.g., `{ operation: 'INSERT_ORDER', payload: {...} }`) into a local Zustand store backed by `react-native-mmkv` (`@kredbook/sync-queue`).
- **Optimistic UI**: The UI updates instantly as if the mutation succeeded (e.g., Dashboard balance increases immediately, newly created Customer appears in the list, recent bill shows in the Orders feed). This gives the user instant feedback and maintains perceived speed.
- **Background Sync**: A network listener (via `@react-native-community/netinfo`) watches for connection restoration. On reconnect, the queue is dequeued **sequentially** (FIFO) and each mutation is replayed against Supabase in order.
- **Conflict Resolution**: Last-write-wins per entity. Sufficient for v1.0 (single user per account). If a server-side update occurred while the user was offline, the local write overwrites it upon sync.
- **UI Feedback**: A dismissible sync status banner appears at the top of the screen in three states:
  1. **Offline (red)**: "No internet — entries are saved locally" — shows queued entry count
  2. **Syncing (amber)**: "Syncing X entries..." — spinner animation
  3. **Synced (green)**: "All entries synced" — auto-dismisses after 2 seconds

#### 3.8.3 Authentication Architecture

- Supabase GoTrue client handles Email/Password and Google OAuth flows.
- Session tokens are securely stored in the device's encrypted keychain (via `@kredbook/secure-storage`).
- Token refresh occurs transparently — if expired, GoTrue refreshes it in the background without user intervention.
- Sign-out clears the session token from secure storage and resets Zustand auth state.

#### 3.8.4 Implementation Files

- `src/lib/syncQueue.ts` — MMKV queue management (enqueue, dequeue, flush, state)
- `src/hooks/useNetworkSync.ts` — Network listener + background replay logic
- `src/components/ui/SyncStatusBanner.tsx` — 3-state sync indicator
- `src/services/supabase.ts` — Enhanced with error → queue fallback

---

### 3.9 Localization

English and Hindi are both supported from day one.

- All UI strings are externalised to `src/i18n/en.ts` and `src/i18n/hi.ts`
- Language preference is persisted to AsyncStorage and restored on app start via `languageStore`
- Language toggle is available in Profile & Settings screen
- No string literal is permitted directly in component JSX — all copy must go through `i18next` `t()` calls

---

## 4. Core Screens

### 4.1 Welcome / Onboarding

**Purpose**: Introduce the product and complete initial setup.

**Steps**:

1. Email/password sign-up **or** Google OAuth — no phone OTP in v1.0
2. Role selection (Retailer / Wholesaler / Small Business)
3. Business setup (business name, GSTIN, UPI ID, bill prefix, bank details)
4. Ready screen — summary of setup with nudge to add first customer

**Exit condition**: `profiles.onboarding_complete = true`; subsequent logins skip onboarding.

---

### 4.2 Role Selection

**Purpose**: Determine which product surfaces to activate.

**Options**:

| Role               | Dashboard Mode | Bottom Tab Bar                                 |
| :----------------- | :------------- | :--------------------------------------------- |
| **Retailer**       | Seller         | Home · Customers · ➕ New Bill · Orders · More |
| **Wholesaler**     | Distributor    | Home · Customers · ➕ New Bill · Orders · More |
| **Small Business** | Seller         | Home · Customers · ➕ New Bill · Orders · More |

> **Suppliers** is accessible from the **More** bottom sheet on all roles. It is not a persistent tab. This keeps the tab bar focused on the highest-frequency daily actions.

Role maps to `dashboard_mode` on the `profiles` table and controls which net-position cards appear on the dashboard.

---

### 4.3 Home Dashboard

**Purpose**: Single-screen financial health snapshot.

**Contents**:

- Business name + avatar header
- **Hero card**: gradient net receivable amount; in `dashboard_mode = 'both'`, splits into a green "YOU RECEIVE" panel (`#F0FDF4`) + red "YOU OWE" panel (`#FEF2F2`) + net position row
- **Action bar**: "View Report" (navigates to Financial Position screen at `/(main)/reports`) / "Send Reminder" quick actions
- Active Buyers count + Overdue count stat cards
- Recent Activity feed (last 5 transactions with status chips)
- FAB for creating a new bill

---

### 4.4 Customers Screen

**Purpose**: Browse and manage all customers.

**Contents**:

- Pill-shaped search bar
- Filter tabs: All / Overdue / Paid / Pending
- Customer cards with:
  - Initials avatar (deterministic color per name)
  - Balance right-aligned and color-coded
  - Status badge (OVERDUE / PENDING / PAID / ADVANCE)
- FAB: add new customer
- Secondary FAB: import from phone contacts

---

### 4.5 Customer Detail Screen

**Purpose**: Full financial history and actions for a single customer.

**Contents**:

- Back navigation + customer name + last-active subtitle
- Hero card: Total Balance Due (gradient), overdue flag, last bill info
- Quick action cards: New Bill / Received / Send Reminder
- Transaction feed with sub-tabs (All / Bills Given / Payments)
- Date-group separators, running balance per row
- Download Statement footer (PDF via `expo-print` + `expo-sharing`)
- Record Payment bottom-sheet modal

---

### 4.6 New Bill Screen

**Purpose**: Create an itemized bill for a customer.

**Contents** (v3.9):

- Customer selector with previous balance auto-populated from RPC `get_customer_previous_balance`
- **Product picker** (stay-open sheet): search products, tap to add; variant sub-view renders inline in same sheet with Back button; "Done" button for explicit close; 1.2 s checkmark flash confirms each add
- **Smart cart dedup**: tapping the same product/variant increments quantity instead of adding a duplicate row
- **Editable rates**: each `OrderItemCard` row has an inline `TextInput` for rate override (commits on blur, reverts on invalid input)
- GST % and loading charge inputs
- Live total breakdown: Items + Tax + Loading + Previous Balance = Grand Total
- Two action buttons: **"Save Bill"** (outline, saves to DB only) · **"Save & Share"** (solid, saves → real `bill_number` → PDF → native share sheet via `expo-sharing`)
- Bill PDF is **never generated before a successful DB save** — invoice number is always the real sequential `bill_number`

---

### 4.7 Suppliers Screen

**Purpose**: Manage all supplier relationships and outstanding balances.

**Contents**:

- Supplier list sorted by highest balance owed
- Balance card per supplier (red)
- Record Delivery modal (itemized rows, loading charge, advance paid)
- Record Payment Made modal (amount, mode, notes)
- Supplier detail: balance card, delivery history, bank details

---

### 4.8 Financial Position Screen

**Purpose**: Aggregate financial health view.

**Contents**:

- Customers Owe Me card (green)
- I Owe Suppliers card (red)
- Net Position card (green/amber)
- Only shown if `dashboard_mode = 'both'`; seller/distributor views show subset

---

### 4.9 Financial Position Screen

**Route**: `/(main)/reports`  
**Purpose**: Dedicated full-screen financial breakdown; accessible from the "View Report" button in the Dashboard action bar.

**Contents** (v3.9):

- Header with back navigation + title "Financial Position" + today's date subtitle
- **`StatCard` — Customers Owe Me**: green background, `colors.primary` amount text, `TrendingUp` icon
- **`StatCard` — I Owe Suppliers**: uses `colors.supplierPrimary` (`#DB2777`) for amount text — all colors via theme tokens
- **`NetCard`**: uses `gradients.netPosition` (`#0F172A → #334155`) background via `LinearGradient`; white amount text
- Loading spinner and error state handled gracefully

---

### 4.10 Export Data Screen

**Route**: `/(main)/export` (hidden tab; pushed from ProfileScreen)  
**Purpose**: Export business data as CSV for external analysis.

**Contents** (v3.6 redesign):

- Custom header with back button + “Export Data” title + subtitle
- **Date Filter card** (FILTER BY DATE — OPTIONAL): `DateInput` sub-components for From / To; “All time” and “This month” preset chips
- **Export Type card** (CHOOSE EXPORT TYPE): 4 `ExportRow` sub-components
  - Orders & Bills (green pill)
  - Payments Received (green pill)
  - Customer Balances (blue pill)
  - Supplier Purchases (amber pill)
- Each row has a loading state; `loadingKey` prevents concurrent exports
- Info banner (blue border): explains format + date range behaviour
- “KredBook Export” footer

---

### 4.11 Orders List Screen

**Route**: `/(main)/orders/` (tab root — no back arrow)  
**Purpose**: Browse and filter all bills created by the vendor.

**Contents** (v3.7):

- `SafeAreaView edges={['top']}` with `#F6F7F9` background
- **Header row**: "Orders" title (22 sp bold, `#1C1C1E`) + Search icon — tap to expand a collapsible `SearchBar`; tap again to collapse and clear
- **Filter chips** (horizontal `ScrollView`, 32 dp height, pill radius):
  - All · Paid · Partial · Pending · Overdue
  - Active chip: `#22C55E` background/border, white text
  - Inactive: `#F6F7F9` bg, `#E5E7EB` border, `#6B7280` text
  - **"Overdue"** is a client-side sub-filter — API fetches Pending; `useMemo` filters `daysSince(created_at) > 30`
  - **Sort chip** at end of row: opens BottomSheet with Newest / Oldest / High Amount / Low Amount options
- **Order Card** (white, `radius:12`, `mx:16`, `mb:12`, `elevation:2`):
  - Left: 44 dp initials avatar + customer name (15 sp bold) + bill number (13 sp `#6B7280`)
  - Right: `₹amount` (17 sp bold) + status chip (PAID / PARTIAL / PENDING / OVERDUE)
  - Bottom row: formatted date e.g. "15 Feb 2026" (13 sp `#6B7280`)
- **Empty state**: "No orders yet" message + "Create Bill" green CTA button
- **FAB**: 56 dp circle, `#2563EB`, `+` icon, bottom-right
- **Performance**: `getItemLayout` (108 dp/item), `windowSize:10`, `removeClippedSubviews`, `useCallback` on `renderItem`

---

### 4.12 Order Detail Screen

**Route**: `/(main)/orders/[orderId]` (stack-pushed — back arrow, dynamic title)  
**Purpose**: Full bill view with payment recording and WhatsApp / PDF sharing.

**Contents** (v3.7):

- Stack header: `Order #<bill_number>` (dynamic, from loaded order data)
- `SafeAreaView edges={['bottom']}` — floats action bar above tab bar

**1. Customer Card** (white, `radius:16`):

- 48 dp initials avatar + customer name (17 sp bold) + phone (13 sp `#6B7280`)
- Previous Balance label + amount — red if `> 0`, green `#22C55E` if `= 0`

**2. Items Card** (top-rounded `radius:16`, flush-joined with Bill Summary below):

- Section label: "ITEMS" (13 sp uppercase `#6B7280`)
- Each row: product name (15 sp) · `qty × ₹price` (13 sp `#6B7280`) · `₹subtotal` (15 sp bold)

**3. Bill Summary Card** (bottom-rounded, top flush — joined to Items):

- Subtotal / GST (shown only if `tax_percent > 0`) / Loading Charge (shown only if `> 0`) / Previous Balance (shown only if `> 0`, in `#E74C3C`)
- Divider then Grand Total (22 sp bold) + status chip right-aligned

**4. Payment History Card** (white, `radius:16`):

- Sorted oldest → newest; running "Remaining: ₹X" below each payment
- Mode chips: Cash=green, UPI=blue, NEFT=purple, Draft=amber, Cheque=sky
- Payment amounts in `#22C55E`; empty state: "No payments recorded yet"

**5. Fixed Action Bar** (absolute bottom, white bg, `borderTop: #E5E7EB`):

- **"Send Bill"** (outline green): `generateBillPdf()` → `expo-sharing` native share sheet
- **"Record Payment"** (filled green): opens `RecordCustomerPaymentModal` (uses `useRecordPayment` hook — no direct API calls in modal); hidden when `status === "Paid"`
- On modal success: hook invalidates `orderKeys.all`, `orderDetail`, `payments`, `customers`, `customerDetail`, `dashboard` caches

---

## 5. UX Principles

### 5.1 Simplicity

Users should be able to **record any transaction in under 3 taps**:

1. Tap FAB
2. Select customer / enter amount
3. Confirm

No transaction flow should require more than 2 screens. No form should have more required fields than the minimum needed to save the record.

---

### 5.2 Financial Clarity

**Balances must always be visible and unambiguous.**

- The most important number on any screen must be the largest element
- Color always communicates financial state — green / red / amber — without requiring the user to read text
- Running balances are shown per transaction row so users never need to calculate manually
- Status chips replace plain text labels on all transaction lists

---

### 5.3 Speed

**Interactions must feel instant.**

- Optimistic UI: transactions appear in the feed immediately on submission, before network confirmation
- TanStack Query cache invalidation refreshes data silently after success
- Network errors surface via toast notification; UI reverts cleanly
- App launch must complete in under 2 seconds on mid-range Android hardware

---

## 6. Design System Summary

Full design system documentation is available in [`docs/design-system.md`](./design-system.md).

### Color Tokens

| Token                     | Hex       | Financial Meaning                                      |
| :------------------------ | :-------- | :----------------------------------------------------- |
| `primary` (Green)         | `#22C55E` | Brand identity, CTAs, active navigation, confirmations |
| `primary-dark`            | `#16A34A` | Hover / pressed state for primary green                |
| `fab`                     | `#2563EB` | Floating Action Button                                 |
| `success` (Green)         | `#22C55E` | Money received, paid balance, positive state           |
| `danger` (Red)            | `#E74C3C` | Money owed, overdue, negative state                    |
| `dangerStrong`            | `#DC2626` | Dashboard customer balance card gradient               |
| `supplierPrimary` (Pink)  | `#DB2777` | Supplier Financial Position card                       |
| `warning` (Amber)         | `#F59E0B` | Pending, partial, reminder state                       |
| `background` (Light Gray) | `#F6F7F9` | App background                                         |
| `surface` (White)         | `#FFFFFF` | Cards, modals                                          |
| `text-primary`            | `#1C1C1E` | Headings, body, financial values                       |
| `text-secondary`          | `#6B7280` | Labels, captions, metadata                             |
| `divider`                 | `#E5E7EB` | Row separators, input borders                          |

> **Enforcement**: All colors reference `src/utils/theme.ts` tokens. No raw hex values are permitted in component files.

---

## 7. Technology Stack

| Layer                    | Technology                                    | Rationale                                                                                                                                                      |
| :----------------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App Framework**        | React Native 19.1 + Expo                      | Cross-platform iOS/Android, OTA updates, rich native module ecosystem                                                                                          |
| **Routing**              | Expo Router 6.0                               | File-based routing, deep linking, native stack navigation                                                                                                      |
| **Styling**              | NativeWind 4.2                                | Tailwind CSS utility classes — rapid UI iteration, consistent token usage                                                                                      |
| **Backend / DB**         | Supabase (PostgreSQL + Auth + Realtime)       | Managed Postgres, built-in RLS, real-time subscriptions, edge functions                                                                                        |
| **State Management**     | Zustand                                       | Lightweight global state for auth and user profile                                                                                                             |
| **Server State**         | TanStack Query                                | Cache management, optimistic updates, infinite scroll, background refresh                                                                                      |
| **PDF Engine**           | `expo-print`                                  | HTML-to-PDF generation; supports custom templates                                                                                                              |
| **File Sharing**         | `expo-sharing` + `expo-file-system`           | Share PDFs and CSV exports to any app (WhatsApp, email, Drive)                                                                                                 |
| **Authentication**       | Supabase Auth — Email/Password + Google OAuth | v1.0 supports email/password and Google Sign-In only. Phone/OTP authentication is explicitly excluded from v1.0 and is not planned until v1.2 at the earliest. |
| **Crash Reporting**      | `@sentry/react-native`                        | Error tracking, crash reports, performance tracing                                                                                                             |
| **Contacts Import**      | `expo-contacts`                               | Import customers from device contacts                                                                                                                          |
| **Internationalisation** | `i18next` + `react-i18next`                   | EN/HI language toggle with AsyncStorage persistence                                                                                                            |
| **Icons**                | `lucide-react-native`                         | Sole icon library — `@expo/vector-icons` removed; all icons migrated to Lucide in v3.3                                                                         |
| **Bottom Sheets**        | `@gorhom/bottom-sheet` v5.2.6                 | Payment recording modals (`RecordCustomerPaymentModal`, `RecordPaymentMadeModal`)                                                                              |
| **Toast / Feedback**     | Custom `Toast.tsx` + `ToastProvider`          | Animated slide-down toasts for success/error feedback; wired into root layout                                                                                  |

---

## 8. Performance Requirements

| Requirement               | Target                             | Measurement                                                      |
| :------------------------ | :--------------------------------- | :--------------------------------------------------------------- |
| **App cold launch**       | < 2 seconds                        | Time from tap to interactive home screen                         |
| **Transaction recording** | Feels instant                      | Optimistic UI — row appears before API responds                  |
| **Offline support**       | Core recording works offline       | Bills and payments queue locally; sync on reconnect              |
| **PDF generation**        | < 3 seconds                        | From "Download Statement" tap to share sheet                     |
| **List rendering**        | 60 fps scroll on mid-range Android | FlatList with `keyExtractor`, `removeClippedSubviews`, windowing |
| **API response**          | < 500ms for all read queries       | Supabase indexed queries; TanStack Query caching                 |

---

## 9. Product Roadmap

### v1.0 — Foundation _(First Release, Android)_

> **Scope locked.** Everything in §3 Key Features is in scope. Nothing else.

| Area                | Shipped                                             |
| :------------------ | :-------------------------------------------------- |
| Authentication      | Email/Password + Google OAuth                       |
| Platform            | Android only                                        |
| Navigation          | Home · Customers · New Bill FAB · Orders · More     |
| Core ledger         | Customer credit, bill creation, payment recording   |
| Supplier management | Deliveries, payments made, balance tracking         |
| Product catalog     | Full inventory with variants and category filters   |
| PDF generation      | Bill PDF + Net Position report PDF                  |
| Reminders           | WhatsApp deep-link reminders                        |
| Offline-first       | MMKV write queue + sync status banner               |
| Localization        | English + Hindi                                     |
| Export              | CSV export — Orders, Payments, Customers, Suppliers |

---

### v1.1 — Delight _(~6–8 weeks post-launch)_

Improvements driven by early user feedback and Play Store reviews.

| Feature                        | Description                                                      |
| :----------------------------- | :--------------------------------------------------------------- |
| **Push notifications**         | Local scheduled reminders for overdue customers                  |
| **WhatsApp delivery receipts** | Detect if reminder was read (WhatsApp Business API read receipt) |
| **Bill PDF improvements**      | Business logo upload, bill footer custom message                 |
| **Play Store rating prompt**   | In-app NPS + review nudge after 5th bill created                 |

---

### v1.2 — Growth _(~3 months post-launch)_

| Feature                     | Description                                                                   |
| :-------------------------- | :---------------------------------------------------------------------------- |
| **UPI payment collection**  | Generate UPI QR / deep link embedded in bill PDF                              |
| **Multi-user staff access** | Owner + billing-staff roles; owner has full access, staff can record only     |
| **iOS release**             | App Store submission after Android stability is proven                        |
| **Weekly digest**           | Monday summary: top overdue customers, collection score, week-over-week trend |
| **Phone OTP login**         | Optional alongside email — for users who prefer mobile-number sign-in         |

---

### v2.0 — Platform _(6–12 months post-launch)_

| Feature                     | Description                                                                 |
| :-------------------------- | :-------------------------------------------------------------------------- |
| **GSTN integration**        | GST-ready invoice format with HSN codes, tax breakdown, filing-ready export |
| **WhatsApp Business API**   | Automated templated reminders, delivery confirmations, payment receipts     |
| **Custom invoice branding** | Upload logo, choose accent colour, custom bill footer                       |
| **KredBook for Web**        | Progressive web app for desktop order entry and reporting                   |
| **AI payment prediction**   | Predict payment likelihood from customer history to prioritise collection   |

> **Pricing policy**: Core ledger features (credit tracking, billing, payments, reminders, PDF, export) are **free forever**. Paid upgrades, if introduced, will be additive only — multi-user access, advanced analytics, custom branding.

---

## 10. Success Metrics

### Engagement Metrics

| Metric                          | Description                                             | Target (Year 1) |
| :------------------------------ | :------------------------------------------------------ | :-------------- |
| **Daily Active Users (DAU)**    | Unique users recording at least one transaction per day | 10,000          |
| **Transactions per user / day** | Average bills or payments recorded per active user      | ≥ 5             |
| **Session length**              | Average time in-app per session                         | 3–6 minutes     |

### Financial Metrics

| Metric                       | Description                                         | Target                      |
| :--------------------------- | :-------------------------------------------------- | :-------------------------- |
| **Payment reminders sent**   | Total WhatsApp reminders dispatched per month       | Track MoM growth            |
| **Payment recovery rate**    | % of reminders that result in payment within 7 days | ≥ 35%                       |
| **Total credit tracked (₹)** | Aggregate receivable value across all users         | Indicator of economic value |

### Retention Metrics

| Metric               | Description                              | Target      |
| :------------------- | :--------------------------------------- | :---------- |
| **Day-7 retention**  | Users returning within 7 days of signup  | ≥ 50%       |
| **Day-30 retention** | Users returning within 30 days of signup | ≥ 30%       |
| **Churn rate**       | Monthly active users lost                | < 10%/month |

### Business Metrics

| Metric                     | Description                                                          |
| :------------------------- | :------------------------------------------------------------------- |
| **Businesses onboarded**   | Unique business profiles with ≥ 1 customer and ≥ 1 transaction       |
| **Bills generated (MoM)**  | Total PDF invoices created per month — core value delivery indicator |
| **Payment reminders sent** | Total WhatsApp reminders dispatched per month (track MoM growth)     |
| **NPS**                    | Net Promoter Score from in-app survey                                |

---

## 11. Vision

### Mission Statement

> KredBook aims to become the default digital khata book for small businesses in emerging markets.

The immediate goal is to digitize the credit ledger for Indian SMBs. The long-term opportunity is to become the financial operating system for informal businesses — starting with ledger management and expanding into the broader financial stack.

### Long-Term Roadmap

| Horizon     | Opportunity                                                                    |
| :---------- | :----------------------------------------------------------------------------- |
| **Year 1**  | Replace the physical khata — credit ledger, billing, payments, reminders       |
| **Year 2**  | Credit scoring — use transaction history to generate a business credit profile |
| **Year 3**  | Business financing — offer working capital loans underwritten by KredBook data |
| **Year 4+** | Automated bookkeeping — P&L, GST filing assistance, accountant integrations    |

### Market Opportunity

India has approximately **63 million MSMEs**, the majority of which still operate without digital financial tools. The informal credit economy represents hundreds of billions of rupees in untracked receivables. KredBook is positioned to capture this market by solving the most fundamental and universal problem first: knowing who owes what.

---

_This document is the primary product specification for KredBook. Engineering, design, and QA decisions should be validated against the requirements defined here. Update this document when features are added, changed, or deprecated._
