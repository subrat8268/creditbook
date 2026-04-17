# KredBook – Product Requirements Document

> **Version**: 3.0
> **Last Updated**: April 17, 2026
> **Status**: Simplified for focus — credit tracking only
> **Owner**: KredBook Product Team

---

## Product Identity

> **KredBook is a simple digital khata** — a mobile-first credit ledger for small businesses in India.
> 
> **Core philosophy**: Replace the physical notebook with a simple app. No complexity, no learning curve, no internet required.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [Key Features](#3-key-features)
   - 3.1 People & Credit Ledger
   - 3.2 Entry Recording
   - 3.3 Payment Tracking
   - 3.4 Financial Overview
   - 3.5 Offline-First Architecture
   - 3.6 Localization (EN/HI)
4. [Core Screens](#4-core-screens)
5. [UX Principles](#5-ux-principles)
6. [What's NOT in Scope](#6-whats-not-in-scope)
7. [Technology Stack](#7-technology-stack)
8. [Product Roadmap](#8-product-roadmap)
9. [Success Metrics](#9-success-metrics)

---

## 1. Product Overview

### The Problem

Hundreds of millions of small business owners across India still track customer credit using **physical khata books** — handwritten ledgers that are fragile, error-prone, and invisible to any digital workflow.

This creates compounding problems:

| Problem                           | Impact                                |
| :-------------------------------- | :------------------------------------ |
| **Lost or damaged records**       | Unrecoverable debt, customer disputes |
| **Manual calculation errors**     | Incorrect balances, trust breakdown   |
| **No visibility into total dues** | Owners cannot prioritize collection   |
| **No payment confirmation trail** | Disputes with no audit evidence       |

### The Solution

KredBook is a **simple digital khata** — a mobile app that replaces the physical notebook.

- Add a person (customer)
- Record what they owe (entry)
- Record payments they make
- See who owes what — instantly

**That's it.** No product catalog, no GST calculations, no supplier ledger, no complexity.

### Product Goal

> **The simplest digital khata for small businesses.**

Every feature is evaluated against this question: "Is this needed to track credit between two people?" If no, it's not shipped.

### Core Value Propositions

- **Instant balance visibility** — Know exactly who owes what at any moment
- **Fast entry recording** — Entry or payment in under 30 seconds
- **Reliable audit trail** — Sequential entries, payment history, shareable PDFs
- **Works offline** — No internet needed for core recording

### Business Model

> **KredBook is free for all users.** No paywalls, no subscriptions.

If the app grows, optional paid features may be added. **Core credit tracking will always be free.**

---

## 2. Target Users

### Who Uses KredBook

Anyone who extends credit to customers and wants to track it digitally:

- **Kirana / General Stores** — Track credit given to regular customers
- **Medical Shops** — Medicine on credit, track payments
- **Small Shops** — Any business with repeat customers on credit
- **Service Providers** — Repair shops, salons, tiffin services

**Single-user app** — Designed for one person managing their own customers. Not a team app.

**Primary Jobs To Be Done**:

1. Add a person (customer)
2. Record what they owe (entry)  
3. Record what they paid (payment)
4. See who owes what — instantly

**Pain Points Solved**:

- Lost notebook = lost records → Digital backup, works offline
- Mental math errors → Automatic balance calculation
- "Who owes me most?" → Sorted list, instant visibility
- Disputes → Payment history proof

---

## 3. Key Features

### 3.1 People & Credit Ledger

Track credit relationship with each person.

- Add person by name + phone (optional)
- Quick inline add on People screen
- Balance updated automatically on every entry/payment
- Color-coded: green (advance/paid), amber (pending), red (overdue)
- Overdue flag when unpaid for 30+ days

---

### 3.2 Entry Recording

Record what a person owes — quick amount-first flow.

- Enter amount only (no product catalog)
- Quick note (optional, e.g., "Rice", " Medicines")
- Previous balance shown automatically
- Share as PDF via WhatsApp

---

### 3.3 Payment Tracking

Record payments against outstanding balance.

- Supported modes: **Cash, UPI, Bank Transfer**
- Partial payments — record any amount
- Payment history per person
- Mark Full Paid on one tap

---

### 3.4 Financial Overview

Dashboard shows total outstanding.

- One number: Total Outstanding
- List of top overdue people
- One-tap to add new entry

---

### 3.5 Offline-First Architecture

All data stored locally, syncs when online.

- Works without internet
- Entries saved locally when offline
- Auto-sync when connection returns
- No data loss

---

---

## 4. Core Screens

### Navigation Structure

5 tabs at the bottom:

1. **Home** — Dashboard with total outstanding
2. **People** — List of all people (customers)
3. **Add** (center FAB) — Quick add entry
4. **Entries** — List of all entries/bills
5. **Profile** — Settings, language, business details

More sheet (slide up from tab bar):
- Profile Settings
- Export Data (CSV)
- Sign Out

---

### 4.1 Dashboard (Home Tab)

- Total Outstanding amount (hero)
- "X overdue" badge
- Add Entry button
- Top overdue people list
- Tap person → View ledger / Record payment

---

### 4.2 People Screen

- Search bar
- Inline add: Name + Phone → Add Person
- Person cards: Name, phone, balance (color-coded)
- Tap card → Open ledger / Create entry

---

### 4.3 Entry Detail (from Entries list)

- Entry number + date
- Person name + phone
- Amount + status (Paid/Pending)
- Payment history
- Send Entry (PDF)
- Record Payment button

---

### 4.4 Profile Screen

- Business name (editable)
- Language toggle (EN/HI)
- Sign Out

---

## 5. What's NOT in Scope

> These features existed in earlier versions but are **removed** to keep the app simple.

| Feature | Why Removed |
|---------|-----------|
| **Supplier Management** | Adds complexity, not needed for basic credit tracking |
| **Product Catalog** | Quick amount entry is simpler than product picker |
| **GST Calculations** | Most small businesses don't need invoicing |
| **Reports/Dashboards** | One number (total outstanding) is enough |
| **Multi-user/Team** | Single-user app for now |
| **Push Notifications** | Future feature, not core |
| **WhatsApp Reminders** | Future feature, not core |

> **Rule**: If it's not needed to track credit between two people, it's not in scope.

---

## 6. UX Principles

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

## 7. Technology Stack

| Layer                    | Technology              | Notes                    |
| :----------------------- | :---------------------- | :---------------------- |
| **App Framework**        | React Native + Expo     | Cross-platform mobile  |
| **Routing**              | Expo Router             | File-based routing     |
| **Styling**              | NativeWind             | Tailwind CSS          |
| **Backend / DB**         | Supabase               | PostgreSQL + Auth   |
| **State**                | Zustand                | Local state          |
| **Server State**         | TanStack Query        | Cache + offline      |
| **PDF**                  | expo-print              | Shareable PDFs       |
| **Offline**               | MMKV + Sync Queue     | Works without internet|

---

## 8. Product Roadmap

### v3.0 — Simple Digital Khata

Current simplified version.

- ✅ People management
- ✅ Quick entry recording
- ✅ Payment tracking
- ✅ Dashboard
- ✅ Offline-first
- ✅ EN/HI localization
- ✅ CSV Export

### Future Features (Not in Scope v3.0)

To be considered based on user feedback:

| Feature | Description |
|---------|-------------|
| WhatsApp Reminders | One-tap reminder |
| Push Notifications | Overdue alerts |
| UPI Payments | Collect via UPI |
| Business Logo | Custom PDF branding |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Daily Active Users | Track growth |
| Transactions/user/day | ≥ 3 |
| Day-7 retention | ≥ 40% |

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
