# CreditBook Product Roadmap

> **Version**: 1.0
> **Last Updated**: March 5, 2026
> **Status**: Active Development
> **Current Phase**: Phase 6 (complete) → Phase 7 (in progress)

---

## Vision

> CreditBook aims to become the simplest and most trusted digital ledger for small businesses, replacing traditional khata books with a mobile-first fintech experience.

The product is built around three core outcomes:

| Outcome                        | What It Means                                                           |
| :----------------------------- | :---------------------------------------------------------------------- |
| **Fast transaction entry**     | Any bill or payment recorded in under 60 seconds                        |
| **Clear financial visibility** | Net position and per-customer balance always visible without navigation |
| **Improved payment recovery**  | Reminders, overdue flagging, and payment clarity reduce collection lag  |

---

## Roadmap Overview

| Phase   | Title                     | Status         | Key Deliverable                                           |
| :------ | :------------------------ | :------------- | :-------------------------------------------------------- |
| Phase 1 | Core Ledger MVP           | ✅ Complete    | Customer credit tracking and balance management           |
| Phase 2 | Billing & Suppliers       | ✅ Complete    | Itemized bills, supplier management, net position         |
| Phase 3 | Indian Billing Suite      | ✅ Complete    | GST, sequential IDs, loading charge, WhatsApp reminders   |
| Phase 4 | Platform Features         | ✅ Complete    | Onboarding, Sentry, i18n, CSV export, contacts import     |
| Phase 5 | Design System & Dashboard | ✅ Complete    | Green (#22C55E) brand system, premium dashboard redesign  |
| Phase 6 | Customer UI Overhaul      | ✅ Complete    | Transaction feed, payment modal, customer detail redesign |
| Phase 7 | Growth & Monetisation     | 🔄 In Progress | UPI, push notifications, analytics, premium tier          |
| Phase 8 | Financial Platform        | 🗓 Planned     | Credit scoring, lending, automated bookkeeping            |

---

## Phase 1 — Core Ledger MVP

**Goal**: Launch the minimum viable credit ledger — enough for a shop owner to replace their physical khata book on day one.

**Status**: ✅ Complete

### Features

| Feature                   | Description                                                                  |
| :------------------------ | :--------------------------------------------------------------------------- |
| **Customer Management**   | Create, edit, and manage customer profiles with name, phone, and address     |
| **Transaction Recording** | Record credit given (bills) and payments received against a customer account |
| **Balance Tracking**      | Automatically compute and display outstanding balance per customer           |
| **Dashboard Summary**     | Show total receivable and a summary of recent activity                       |
| **Authentication**        | Secure sign-in with Supabase Auth; per-vendor data isolation via RLS         |

### GitHub Issues

```
[ ] feat: Create customers table schema with RLS policies
[ ] feat: Implement customer CRUD API (create, update, delete, list)
[ ] feat: Build customer list screen with search
[ ] feat: Build customer detail screen with transaction history
[ ] feat: Implement transaction recording flow (credit / payment)
[ ] feat: Implement automatic balance calculation logic
[ ] feat: Build dashboard summary cards (total receivable, recent activity)
[ ] feat: Set up Supabase Auth with email login
[ ] feat: Implement vendor-scoped data isolation (RLS)
[ ] feat: Root layout auth guard (redirect unauthenticated users)
```

---

## Phase 2 — Billing & Suppliers

**Goal**: Expand beyond simple credit entries to professional bill generation and supplier-side balance tracking.

**Status**: ✅ Complete

### Features

| Feature                       | Description                                                          |
| :---------------------------- | :------------------------------------------------------------------- |
| **Bill Creation**             | Create itemized bills with product catalog, quantity, and pricing    |
| **PDF Invoice Export**        | Generate branded PDF invoices with bank details and UPI QR           |
| **Supplier Management**       | Add suppliers and track goods received with delivery-level detail    |
| **Supplier Payment Tracking** | Record payments made to suppliers; compute balance owed per supplier |
| **Net Position Dashboard**    | Single-screen view of receivables vs payables vs net position        |
| **Transaction History**       | Chronological activity log per customer with running balance         |

### GitHub Issues

```
[ ] feat: Create suppliers, supplier_deliveries, supplier_delivery_items, payments_made schemas
[ ] feat: Supplier CRUD API and list screen
[ ] feat: Build supplier detail screen (balance card, delivery history, bank details)
[ ] feat: Implement Record Delivery modal (itemized rows, loading charge, advance paid)
[ ] feat: Implement Record Payment Made modal (amount, mode, notes)
[ ] feat: Build bill creation screen (product search, cart, rate editing)
[ ] feat: Implement PDF generation via expo-print
[ ] feat: Net position dashboard — Customers Owe Me / I Owe Suppliers / Net Position cards
[ ] feat: Dashboard mode toggle in Profile (Seller / Distributor / Both)
[ ] feat: Transaction history feed with running balance
```

---

## Phase 3 — Indian Billing Suite

**Goal**: Localise the billing product for Indian market requirements — GST, sequential bill numbering, loading charges, and WhatsApp reminders.

**Status**: ✅ Complete

### Features

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

### GitHub Issues

```
[ ] feat: Implement get_next_bill_number RPC with custom prefix support
[ ] feat: Add UNIQUE(vendor_id, bill_number) constraint
[ ] feat: Add tax_percent and loading_charge fields to orders table
[ ] feat: Add previous_balance snapshot logic to order creation
[ ] feat: Add bank_name, account_number, ifsc_code to profiles table
[ ] feat: Embed bank details and UPI QR in PDF template
[ ] feat: Build WhatsApp reminder deep link (pre-filled message with balance)
[ ] feat: Implement overdue detection logic (balance_due > 0 AND last_order > 30 days ago)
[ ] feat: Overdue badge on CustomerCard
[ ] feat: Overdue warning banner on Customer Detail screen
[ ] feat: Overdue count card on Dashboard
[ ] feat: Expand payment_mode CHECK constraint to 5 modes
```

---

## Phase 4 — Platform Features

**Goal**: Add engagement, reliability, and data portability features to convert casual users into daily-active power users.

**Status**: ✅ Complete

### Features

| Feature                    | Description                                                                                             |
| :------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Onboarding Flow**        | 3-step setup: phone, business details (name, GSTIN, prefix, UPI), ready screen                          |
| **Role Selection**         | Retailer / Wholesaler / Small Business picker that maps to dashboard mode                               |
| **Sentry Crash Reporting** | Automatic error tracking and crash reports via `@sentry/react-native`                                   |
| **Hindi Language Toggle**  | Full i18n with EN/HI via `i18next`; AsyncStorage persistence                                            |
| **CSV Data Export**        | Export orders, payments, customers, and suppliers as CSV; share via native sheet                        |
| **Contacts Import**        | Import customers from device phone book via `expo-contacts`; multi-select, bulk add, duplicate skipping |

### GitHub Issues

```
[ ] feat: Build 3-step onboarding flow (phone → business → ready)
[ ] feat: Add onboarding_complete flag to profiles; root layout routing guard
[ ] feat: Build role selection screen (Retailer / Wholesaler / Small Business)
[ ] feat: Integrate @sentry/react-native with DSN env var
[ ] feat: Set up i18next with EN and HI translation files (10 namespaces)
[ ] feat: Add language toggle chip in Profile screen with AsyncStorage persistence
[ ] feat: Build ExportScreen with date range filter and 4 export buttons
[ ] feat: Implement toCsv<T>() builder and shareCsv() utility
[ ] feat: Build ContactsPickerModal (expo-contacts, multi-select, search, select-all)
[ ] feat: Add Import Customers FAB on Customers screen
```

---

## Phase 5 — Design System & Dashboard

**Goal**: Establish a unified design system and premium UI across the application.

**Status**: ✅ Complete

### Features

| Feature                  | Description                                                                                              |
| :----------------------- | :------------------------------------------------------------------------------------------------------- |
| **Unified Theme**        | `theme.ts` as single source of truth — colors, spacing, typography, radius                               |
| **Green Brand System**   | `#22C55E` primary, semantic green/red/amber tokens, iOS-style neutral scale                              |
| **Premium Dashboard**    | Gradient hero card, View Report/Remind action bar, stat cards, activity feed                             |
| **Dashboard Components** | 7 extracted components: Header, HeroCard, ActionBar, StatCards, RecentActivity, ActivityRow, StatusBadge |
| **Premium Tab Bar**      | White background, `#22C55E` active tint, shadow, 64dp height                                             |
| **DB Trigger Fix**       | `handle_new_user` inserts `name = ''` to satisfy NOT NULL on profiles                                    |

### GitHub Issues

```
[ ] feat: Create theme.ts with full color system, spacing, and typography tokens
[ ] feat: Create dashboardUi.ts as thin re-export + formatter utilities
[ ] feat: Redesign Dashboard screen with gradient hero card and activity feed
[ ] feat: Extract 7 dashboard components into src/components/dashboard/
[ ] feat: Extend dashboard API (activeBuyers, recentActivity with status resolution)
[ ] feat: Apply premium tab bar styling (white bg, green tint, shadow, 64dp)
[ ] feat: Build role selection screen with image banner cards
[ ] fix: Update handle_new_user DB trigger to insert name = '' (NOT NULL fix)
[ ] feat: Extend auth.ts types for wholesaler / retailer / small-business dashboard_mode values
```

---

## Phase 6 — Customer UI Overhaul

**Goal**: Rebuild the customer-facing surfaces to match the design system and deliver a premium transaction experience.

**Status**: ✅ Complete

### Features

| Feature                      | Description                                                                                        |
| :--------------------------- | :------------------------------------------------------------------------------------------------- |
| **Customer List Redesign**   | Initials avatar (8-color deterministic palette), color-coded balances, status badges, filter tabs  |
| **Customer Detail Redesign** | Gradient hero card, 3 action cards, unified transaction feed, date groups, running balance per row |
| **Transaction Feed**         | Merged bills + payments timeline, forward-pass running balance, newest-first display               |
| **Record Payment Modal**     | Bottom-sheet — amount input, 5 payment mode chips, Partial / Mark Full Paid actions                |
| **Download Statement**       | PDF generation + `expo-sharing` for full customer transaction history                              |
| **Navigation Fixes**         | Edge-to-edge tab bar height fix; Customer Detail status bar overlap fix                            |
| **NativeWind Conversion**    | All 4 customer files converted from StyleSheet to NativeWind `className`                           |

### GitHub Issues

```
[ ] feat: Add Transaction type to customer.ts (type, amount, runningBalance, billNumber, status, paymentMode)
[ ] feat: Rewrite fetchCustomerDetail — merge orders + payments, forward-pass balance, newest-first
[ ] feat: Build RecordCustomerPaymentModal (amount input, 5 mode chips, partial/full paid)
[ ] feat: Redesign [customerId].tsx — hero card, action cards, transaction feed, date groups
[ ] feat: Add Download Statement footer with expo-print + expo-sharing
[ ] feat: Redesign CustomerCard — initials avatar, color-coded balance, status badge
[ ] feat: Add filter tabs to CustomersScreen (All / Overdue / Paid / Pending)
[ ] fix: Tab bar height for edge-to-edge Android (useSafeAreaInsets + insets.bottom)
[ ] fix: Customer Detail status bar overlap (SafeAreaView edges include 'top')
[ ] refactor: Convert CustomerCard, CustomersScreen, RecordCustomerPaymentModal, [customerId].tsx to NativeWind
```

---

## Phase 7 — Growth & Monetisation

**Goal**: Drive retention through engagement features and introduce the premium subscription tier.

**Status**: 🔄 In Progress

### Features

| Feature                      | Priority | Description                                                      |
| :--------------------------- | :------- | :--------------------------------------------------------------- |
| **Phone OTP Login**          | High     | Replace email/password with mobile OTP for frictionless signup   |
| **WhatsApp Business API**    | High     | Auto-send bill to customer on creation via WhatsApp Business API |
| **Push Notifications**       | High     | Overdue payment alerts and transaction confirmations             |
| **Inventory Stock Tracking** | Medium   | Track stock levels per product; surface low-stock alerts         |
| **Staff Accounts**           | Medium   | Role-based access (Owner / Billing Staff / View-Only)            |
| **Premium Subscription**     | Medium   | ₹149–₹199/month for multi-user, analytics, custom branding       |
| **Cloud Backup & Restore**   | Medium   | Manual and scheduled backup to Google Drive or Supabase storage  |
| **Online Storefront**        | Low      | Shareable product catalog link for customer-facing orders        |

### GitHub Issues

```
[ ] feat: Integrate Supabase Phone Auth (OTP via Twilio or MSG91)
[ ] feat: WhatsApp Business API integration — auto-send PDF on bill creation
[ ] feat: Push notification service (FCM) — overdue alerts and payment confirmations
[ ] feat: Add stock_quantity field to products table; update on order creation
[ ] feat: Low-stock alert banner on Products screen and Dashboard
[ ] feat: Staff accounts — invite by phone; role-based tab/action visibility
[ ] feat: Build SubscriptionScreen with plan comparison and Razorpay/IAP integration
[ ] feat: Gate premium features behind subscription check
[ ] feat: Implement Cloud Backup — export full dataset to Google Drive
[ ] feat: Build Online Storefront — public product page with WhatsApp order CTA
```

---

## Phase 8 — Financial Platform

**Goal**: Leverage CreditBook's transaction data to build advanced financial tools and expand into lending and bookkeeping.

**Status**: 🗓 Planned

### Features

| Feature                          | Description                                                                                     |
| :------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Credit Scoring**               | Generate a customer reliability score based on payment history, frequency, and balance patterns |
| **Payment Prediction**           | ML model to predict likelihood and timing of customer payments                                  |
| **Automated Bookkeeping**        | Auto-categorise transactions into income, expense, and tax buckets                              |
| **GST Filing Assistance**        | Aggregate GST data from invoices; export in GSTR-1/GSTR-3B compatible format                    |
| **Business Financing**           | Offer working capital loans underwritten by CreditBook transaction data                         |
| **Lending Partner Integrations** | API integration with NBFCs and fintech lenders for embedded credit                              |

### GitHub Issues

```
[ ] research: Define credit scoring model inputs (payment frequency, overdue rate, average balance)
[ ] feat: Build credit score calculation service (rules-based v1)
[ ] feat: Display customer credit badge on Customer Detail screen
[ ] research: Evaluate ML framework for payment prediction (TensorFlow Lite / server-side inference)
[ ] feat: Build transaction auto-categorisation engine
[ ] feat: GST report export (GSTR-1 compatible CSV)
[ ] research: Lending partner evaluation (NBFCs, Fintech APIs)
[ ] feat: Loan eligibility check flow within app
```

---

## Milestones

| Milestone                     | Description                                                               | Target     |
| :---------------------------- | :------------------------------------------------------------------------ | :--------- |
| **MVP Launch**                | Core ledger — customers, transactions, balance tracking, dashboard        | ✅ Shipped |
| **Billing Launch**            | Itemized bills, PDF export, supplier management, net position             | ✅ Shipped |
| **India Suite Launch**        | GST, sequential IDs, loading charge, WhatsApp reminders, overdue flagging | ✅ Shipped |
| **Platform Launch**           | Onboarding, i18n, Sentry, CSV export, contacts import                     | ✅ Shipped |
| **Design System Launch**      | Green (#22C55E) brand system, premium dashboard, unified theme            | ✅ Shipped |
| **Customer UI Launch**        | Transaction feed, payment modal, Customer Detail redesign                 | ✅ Shipped |
| **Growth Launch**             | OTP login, push notifications, WhatsApp Business API, premium tier        | 🔄 Q2 2026 |
| **Financial Platform Launch** | Credit scoring, GST filing, lending integration                           | 🗓 Q4 2026 |

---

## Success Metrics

| Metric                              | Description                                                | Target                  |
| :---------------------------------- | :--------------------------------------------------------- | :---------------------- |
| **Daily Active Users (DAU)**        | Unique users recording ≥ 1 transaction per day             | 10,000 by end of Year 1 |
| **Transactions per user / day**     | Average bills or payments per active session               | ≥ 5                     |
| **Payment recovery rate**           | % of WhatsApp reminders resulting in payment within 7 days | ≥ 35%                   |
| **Avg. time to record transaction** | Seconds from screen open to confirmation                   | < 60 seconds            |
| **Day-30 retention**                | Users returning within 30 days of signup                   | ≥ 30%                   |
| **Premium conversion rate**         | % of active users on paid plan                             | ≥ 8% by Month 6         |
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

India has approximately **63 million MSMEs**, most of which manage credit manually. CreditBook is positioned to become the default tool for informal credit management before expanding into the broader financial services stack that serves these businesses.

---

_This roadmap is a living document. Phase boundaries and feature priorities are updated as user research, retention data, and business context evolve. All phase completions are reflected in [`docs/prd.md`](./prd.md) and [`README.md`](../README.md)._
