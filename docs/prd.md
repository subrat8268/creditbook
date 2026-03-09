# CreditBook – Product Requirements Document

> **Version**: 1.2
> **Last Updated**: March 9, 2026
> **Status**: Active Development
> **Owner**: CreditBook Product Team

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [Key Features](#3-key-features)
4. [Core Screens](#4-core-screens)
5. [UX Principles](#5-ux-principles)
6. [Design System Summary](#6-design-system-summary)
7. [Technology Stack](#7-technology-stack)
8. [Performance Requirements](#8-performance-requirements)
9. [Future Enhancements](#9-future-enhancements)
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

CreditBook provides a **simple digital ledger with real-time balance visibility, payment tracking, and one-tap bill generation.**

It replaces the khata book with a mobile experience that requires no accounting knowledge, no training, and no internet dependency for core recording operations.

### Product Goal

> Create the simplest and most reliable digital credit ledger for small businesses.

Every product decision is evaluated against this goal. Features that add complexity without proportionally improving reliability or simplicity are not shipped.

### Core Value Propositions

- **Instant balance visibility** — Know exactly who owes what at any moment
- **Fast transaction recording** — Bill or payment recorded in under 60 seconds
- **Reliable audit trail** — Sequential bills, immutable records, payment history
- **Supplier-side tracking** — Balance what you're owed vs. what you owe

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

## 4. Core Screens

### 4.1 Welcome / Onboarding

**Purpose**: Introduce the product and complete initial setup.

**Steps**:

1. Phone number entry and OTP verification
2. Business setup (business name, GSTIN, UPI ID, bill prefix, bank details)
3. Ready screen — summary of setup with nudge to add first customer

**Exit condition**: `profiles.onboarding_complete = true`; subsequent logins skip onboarding.

---

### 4.2 Role Selection

**Purpose**: Determine which product surfaces to activate.

**Options**:

| Role               | Dashboard Mode | Tab Bar                                         |
| :----------------- | :------------- | :---------------------------------------------- |
| **Retailer**       | Seller         | Customers, Orders, Products, Suppliers, Profile |
| **Wholesaler**     | Distributor    | Customers, Orders, Products, Suppliers, Profile |
| **Small Business** | Seller         | Customers, Orders, Products, Suppliers, Profile |

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

**Contents**:

- Customer selector with previous balance auto-populated
- Product search with cart-add interface
- Per-item rate editing
- GST % input
- Loading charge input
- Live total breakdown: Items + Tax + Loading + Previous Balance
- Bill number auto-assigned (RPC `get_next_bill_number`)
- Submit → generates PDF and saves order

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

### 4.8 Net Position Screen

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

**Contents**:

- Header with back navigation and title "Financial Position"
- **Customers Owe Me** card (green `#F0FDF4` background, `#22C55E` text): total receivables from all customers
- **I Owe Suppliers** card (red `#FEF2F2` background, `#E74C3C` text): total payables to all suppliers
- **Net Position** row: `receivables − payables`; green if positive (`#22C55E`), red if negative (`#E74C3C`)
- Trend icons: `TrendingUp` (green) / `TrendingDown` (red) from `lucide-react-native`
- Loading and error states handled gracefully

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
| `warning` (Amber)         | `#F59E0B` | Pending, partial, reminder state                       |
| `background` (Light Gray) | `#F6F7F9` | App background                                         |
| `surface` (White)         | `#FFFFFF` | Cards, modals                                          |
| `text-primary`            | `#1C1C1E` | Headings, body, financial values                       |
| `text-secondary`          | `#6B7280` | Labels, captions, metadata                             |
| `divider`                 | `#E5E7EB` | Row separators, input borders                          |

The color system encodes financial status visually — users can assess ledger health from a list view without reading individual balances.

---

## 7. Technology Stack

| Layer                    | Technology                              | Rationale                                                                                          |
| :----------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **App Framework**        | React Native 19.1 + Expo                | Cross-platform iOS/Android, OTA updates, rich native module ecosystem                              |
| **Routing**              | Expo Router 6.0                         | File-based routing, deep linking, native stack navigation                                          |
| **Styling**              | NativeWind 4.2                          | Tailwind CSS utility classes — rapid UI iteration, consistent token usage                          |
| **Backend / DB**         | Supabase (PostgreSQL + Auth + Realtime) | Managed Postgres, built-in RLS, real-time subscriptions, edge functions                            |
| **State Management**     | Zustand                                 | Lightweight global state for auth and user profile                                                 |
| **Server State**         | TanStack Query                          | Cache management, optimistic updates, infinite scroll, background refresh                          |
| **PDF Engine**           | `expo-print`                            | HTML-to-PDF generation; supports custom templates                                                  |
| **File Sharing**         | `expo-sharing` + `expo-file-system`     | Share PDFs and CSV exports to any app (WhatsApp, email, Drive)                                     |
| **Authentication**       | Supabase Auth (Email + Password)        | MVP authentication uses email + password to avoid SMS costs. Phone OTP login is a Phase 7 feature. |
| **Crash Reporting**      | `@sentry/react-native`                  | Error tracking, crash reports, performance tracing                                                 |
| **Contacts Import**      | `expo-contacts`                         | Import customers from device contacts                                                              |
| **Internationalisation** | `i18next` + `react-i18next`             | EN/HI language toggle with AsyncStorage persistence                                                |
| **Icons**                | `lucide-react-native`                   | Sole icon library — `@expo/vector-icons` removed; all icons migrated to Lucide in v3.3             |
| **Bottom Sheets**        | `@gorhom/bottom-sheet` v5.2.6           | Payment recording modals (`RecordCustomerPaymentModal`, `RecordPaymentMadeModal`)                  |
| **Toast / Feedback**     | Custom `Toast.tsx` + `ToastProvider`    | Animated slide-down toasts for success/error feedback; wired into root layout                      |

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

## 9. Future Enhancements

### Phase 7 — Growth (Planned)

| Feature                          | Description                                                               |
| :------------------------------- | :------------------------------------------------------------------------ |
| **UPI Payment Integration**      | In-app payment collection via UPI deep links or Razorpay SDK              |
| **Automated Payment Reminders**  | Scheduled WhatsApp/SMS reminders for overdue customers                    |
| **GST-Ready Invoice Export**     | GSTIN-compliant invoice format with HSN codes and tax breakdown           |
| **Multi-User Business Accounts** | Staff accounts with role-based access (owner / billing staff / view-only) |
| **Analytics Dashboard**          | Revenue trends, top customers, collection rate, monthly comparison        |
| **AI Payment Prediction**        | Predict likelihood of payment based on customer history                   |
| **Phone OTP Login**              | Replace email/password with mobile OTP for frictionless signup            |
| **Cloud Backup & Restore**       | Manual and scheduled backup to user's Google Drive or Supabase storage    |
| **Online Customer Storefront**   | Shareable product catalog link for customer-facing orders                 |
| **Inventory Alerts**             | Low-stock notifications based on transaction velocity                     |
| **Premium Subscription**         | ₹149–₹199/month for multi-user, analytics, custom branding, no watermark  |

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

| Metric                      | Description                                                    |
| :-------------------------- | :------------------------------------------------------------- |
| **Premium conversion rate** | % of active users upgrading to paid plan                       |
| **Businesses onboarded**    | Unique business profiles with ≥ 1 customer and ≥ 1 transaction |
| **NPS**                     | Net Promoter Score from in-app survey                          |

---

## 11. Vision

### Mission Statement

> CreditBook aims to become the default digital khata book for small businesses in emerging markets.

The immediate goal is to digitize the credit ledger for Indian SMBs. The long-term opportunity is to become the financial operating system for informal businesses — starting with ledger management and expanding into the broader financial stack.

### Long-Term Roadmap

| Horizon     | Opportunity                                                                      |
| :---------- | :------------------------------------------------------------------------------- |
| **Year 1**  | Replace the physical khata — credit ledger, billing, payments, reminders         |
| **Year 2**  | Credit scoring — use transaction history to generate a business credit profile   |
| **Year 3**  | Business financing — offer working capital loans underwritten by CreditBook data |
| **Year 4+** | Automated bookkeeping — P&L, GST filing assistance, accountant integrations      |

### Market Opportunity

India has approximately **63 million MSMEs**, the majority of which still operate without digital financial tools. The informal credit economy represents hundreds of billions of rupees in untracked receivables. CreditBook is positioned to capture this market by solving the most fundamental and universal problem first: knowing who owes what.

---

_This document is the primary product specification for CreditBook. Engineering, design, and QA decisions should be validated against the requirements defined here. Update this document when features are added, changed, or deprecated._
