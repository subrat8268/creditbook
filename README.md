# KredBook App - Complete Project Documentation

> **Last Updated**: March 16, 2026
> **Version**: 3.8
> **Status**: Active Development
> **Bundle ID**: `com.kredbook.app` · **Slug**: `kredbook`
> **Target Market**: Indian SMBs (Retailers, Wholesalers, Distributors)

---

## 📚 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Requirements Document (PRD)](#2-product-requirements-document-prd)
3. [Business Requirements Document (BRD)](#3-business-requirements-document-brd)
4. [Technical Requirements Document (TRD)](#4-technical-requirements-document-trd)
   - [4.1 Tech Stack](#41-tech-stack)
   - [4.2 Project Structure](#42-project-structure)
   - [4.3 Database Schema (SQL)](#43-database-schema-sql)
   - [4.4 Core Algorithms & Logic](#44-core-algorithms--logic)
   - [4.5 Security Architecture (RLS)](#45-security-architecture-rls)
5. [Brand Guidelines & Design System](#5-brand-guidelines--design-system)
   - [5.1 Brand Identity](#51-brand-identity)
   - [5.2 Design Philosophy](#52-design-philosophy)
   - [5.3 Color System](#53-color-system)
   - [5.4 UX Language System](#54-ux-language-system)
   - [5.5 UI Structure](#55-ui-structure)
   - [5.6 UI Patterns](#56-ui-patterns)
   - [5.7 Typography](#57-typography)
   - [5.8 Design Goals](#58-design-goals)
6. [Indian Billing Features 🇮🇳](#6-indian-billing-features-)
7. [Installation & Setup](#7-installation--setup)
8. [Roadmap](#8-roadmap)
9. [Recent Updates & Changelog](#9-recent-updates--changelog)

---

## 1. Executive Summary

**KredBook** is a mobile-first **digital ledger and billing application** designed specifically for small and medium-sized businesses (SMBs) in India. It digitizes the traditional "Khata" (credit book) system, enabling shopkeepers to track customer credit, manage inventory, and generate professional GST-compliant invoices.

**Core Value Proposition**:

- Eliminate paper ledgers and manual calculation errors.
- Accelerate payment recovery via automated reminders and billing transparency.
- Professionalize business operations with sequential, branded digital invoices (PDF).
- **Free forever** — no paywalls, no feature gating, no subscription required.

---

## 2. Product Requirements Document (PRD)

### 2.1 User Personas

| Persona    | Role                   | Pain Points                                                                        | Goals                                                                           |
| :--------- | :--------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **Rajesh** | Retail Shop Owner      | Looses track of credit; calculation errors; forgets to collect due payments        | Track huge customer lists; send professional bills; get paid faster             |
| **Amit**   | Wholesaler/Distributor | Complex delivery charges; tax calculations manually done; difficult reconciliation | Sequential bill numbering; managing transport (loading) charges; tax compliance |

### 2.2 Core Features

#### 📦 Inventory Management

- **Product Catalog**: Add/Edit/Delete products.
- **Variants**: Support for sizes/colors (e.g., "500g", "1kg" packs) with distinct pricing.
- **Real-time Search**: Instant product lookup during billing.

#### 👥 Customer Management

- **Digital Khata**: Track lifetime credit history per customer.
- **Outstanding Dashboard**: Aggregate view of total recoverable debt.
- **Fast Import**: ✅ Import from phone contacts via `expo-contacts` — multi-select picker with search, bulk add, and duplicate-skipping (v2.4).
- **Customer List Redesign** ← v3.1: Initials avatar (deterministic colors), color-coded balance amounts (red=overdue, amber=pending, black=paid), status badges, filter tabs (All / Overdue / Paid / Pending), pill-shaped search bar.
- **Customer Detail Redesign** ← v3.1: Red gradient hero card (Total Balance Due), 3 quick-action cards (New Bill / Received / Remind), unified transaction feed with date-grouping and running balance per row, one-tap PDF statement download.
- **Transaction Feed**: Unified `bills + payments` timeline per customer — newest first, forward-pass running balance, type-keyed with `bill` (red/up) and `payment` (green/down) visual states.
- **Record Payment Modal** ← v3.1: In-screen bottom-sheet — amount input, 5-mode payment chips (Cash/UPI/NEFT/Draft/Cheque), Partial / Mark Full Paid buttons; invalidates query cache on success.

#### 🧾 Order & Billing System

- **Cart Building**: Quick-add interface for high-volume billing.
- **Dynamic Pricing**: Edit rates on the fly for specific deals.
- **Tax & Fees**:
  - **GST %**: Applied to taxable goods (configurable per order).
  - **Loading Charge**: Non-taxable transport/delivery fees.
- **Bill Generation**: PDF invoices with business branding, sequential IDs, and bank details.

#### 💸 Payment Tracking

- **Partial Payments**: Record split payments (Cash / UPI / NEFT / Draft / Cheque).
- **Live Balance**: Order form shows "Previous Balance" from history instantly.
- **Reminders**: One-tap WhatsApp payment reminders with pre-filled details.

#### 🏭 Supplier / Distributor Management

- **Supplier Directory**: Add suppliers with name, phone, address, basket mark, and bank details.
- **Record Deliveries**: Log deliveries with dynamic item rows (name × qty × rate), loading charge, and advance paid.
- **Payments Made**: Record payments to suppliers; tracks outstanding balance per supplier.
- **Balance Owed**: `SUM(deliveries.total_amount) − SUM(payments_made.amount)` per supplier, sorted highest first.

#### 📊 Net Position Dashboard

- **Customers Owe Me** (green card): Sum of all `balance_due > 0` across customer orders.
- **I Owe Suppliers** (red card): Total supplier balance owed across all suppliers.
- **Net Position** (green if positive, amber if negative): `customersOweMe − iOweSuppliers`.
- **Dashboard Mode Switch**: Vendors choose Seller / Distributor / Both in Profile to control which cards appear.

---

## 3. Business Requirements Document (BRD)

### 3.1 Business Goals

1. **Digitization**: Convert 10,000 active paper-based businesses to digital in Year 1.
2. **Efficiency**: Reduce billing time from 5 mins to <1 min per customer.
3. **Recovery**: Improve debt recovery rates by 30% via transparent billing and reminders.

### 3.2 Monetization Strategy

- **Freemium Model**:
  - **Free**: Basic ledger, unlimited customers, standard PDF bills.
  - **Premium**: Multi-user access, inventory alerts, advanced analytics, custom invoice branding (no watermark), Cloud Backup.

### 3.3 Compliance Requirements

- **GST Compliance**: Invoices must support GSTIN and tax breakdowns.
- **Data Privacy**: Secure storage of customer financial data (Supabase RLS).
- **Audit Trail**: Sequential bill numbering (INV-001, INV-002) that cannot be deleted or reordered easily to prevent fraud.

---

## 4. Technical Requirements Document (TRD)

This section contains the deep technical details required for an AI or developer to understand the full system without code access.

### 4.1 Tech Stack

| Layer              | Technology                  | Rationale                                                                            |
| :----------------- | :-------------------------- | :----------------------------------------------------------------------------------- |
| **App Framework**  | **React Native 19.1**       | Cross-platform (iOS/Android), high performance.                                      |
| **Routing**        | **Expo Router 6.0**         | File-based routing, deep linking support.                                            |
| **Styling**        | **NativeWind 4.2**          | Tailwind CSS utility classes for rapid UI dev.                                       |
| **Backend / DB**   | **Supabase**                | PostgreSQL, Auth, Realtime, Edge Functions.                                          |
| **State Mgmt**     | **Zustand**                 | Lightweight global state (Auth, User Profile).                                       |
| **Server State**   | **TanStack Query**          | Caching, optimistic updates, infinite scroll.                                        |
| **PDF Engine**     | **expo-print**              | Robust HTML-to-PDF generation.                                                       |
| **i18n**           | **i18next + react-i18next** | EN/HI language toggle with AsyncStorage persistence. v2.2                            |
| **Crash Reports**  | **@sentry/react-native**    | Error tracking + crash reporting (free tier). v2.1                                   |
| **Contacts**       | **expo-contacts**           | Import customers from phone contacts. v2.4                                           |
| **File System**    | **expo-file-system/legacy** | CSV export — write to device cache, share sheet. v2.3                                |
| **Secure Storage** | **expo-secure-store**       | JWT session tokens stored in iOS Keychain / Android Keystore (chunked adapter). v3.4 |

### 4.2 Project Structure

```bash
/
├── app/                  # Expo Router Pages
│   ├── (auth)/           # Login, Register, Recover (Unprotected)
│   │   ├── set-new-password.tsx  # Password recovery form (Formik, eye-toggle)   ← v3.4
│   │   └── onboarding/           # 3-step onboarding + role selection    ← v2.0 / v3.0
│   │       └── role.tsx          # Role picker: Wholesaler / Retailer / Small Business ← v3.0
│   ├── profile-error.tsx  # Shown when user exists but profile fetch failed    ← v3.4
│   ├── (main)/           # Main App (Protected)
│   │   ├── customers/    # Customer List & Detail Pages
│   │   ├── orders/       # Order Management & Creation
│   │   ├── products/     # Inventory Management
│   │   ├── suppliers/    # Supplier/Distributor Pages            ← v1.7
│   │   │   ├── index.tsx          # Supplier list
│   │   │   ├── [supplierId].tsx   # Supplier detail
│   │   │   └── _layout.tsx        # Stack navigator
│   │   ├── export/       # CSV/Excel export screen (hidden tab)  ← v2.3
│   │   │   └── index.tsx
│   │   ├── reports/      # Financial Position screen             ← v3.2
│   │   │   └── index.tsx # Net receivables vs payables breakdown
│   │   ├── profile/      # User Settings & Business Profile
│   │   └── dashboard/    # Analytics & Overview
│   └── _layout.tsx       # Root Layout (Auth Check + i18n + Sentry)
├── src/
│   ├── api/
│   │   ├── suppliers.ts  # fetchSuppliers, addSupplier, recordDelivery, recordPaymentMade
│   │   ├── dashboard.ts  # getDashboardData (customersOweMe, iOweSuppliers, netPosition) ← v1.8
│   │   ├── export.ts     # 4 export queries: orders, payments, customers, suppliers ← v2.3
│   │   └── ...           # customers, orders, products, profiles, auth, upload
│   ├── components/
│   │   ├── feedback/     # App-wide feedback components
│   │   │   ├── Toast.tsx         # ToastProvider + useToast hook   ← v3.2
│   │   │   └── EmptyState.tsx    # Upgraded: title/description/cta ← v3.2
│   │   ├── dashboard/    # Extracted premium dashboard UI blocks          ← v3.0
│   │   │   ├── DashboardHeader.tsx       # Avatar, business name, icon row
│   │   │   ├── DashboardHeroCard.tsx     # Gradient hero amount card
│   │   │   ├── DashboardActionBar.tsx    # View Report / Send Reminder row
│   │   │   ├── DashboardStatCards.tsx    # Active Buyers + Overdue counts
│   │   │   ├── DashboardRecentActivity.tsx # Scrollable activity feed
│   │   │   ├── ActivityRow.tsx           # Single transaction row
│   │   │   └── StatusBadge.tsx           # Paid/Pending/Overdue/Partial chip
│   │   ├── suppliers/    # SupplierCard, SupplierList, NewSupplierModal,
│   │   │                 # RecordDeliveryModal, RecordPaymentMadeModal  ← v1.7
│   │   ├── customers/    # CustomerCard (initials avatar, color-coded)   ← v3.1
│   │   │                 # CustomerList (filter tabs: All/Overdue/Paid/Pending)
│   │   │                 # NewCustomerModal, ContactsPickerModal          ← v2.4
│   │   │                 # RecordCustomerPaymentModal (partial/full pay)  ← v3.1
│   │   └── ...           # orders/, products/, ui/, feedback/, onboarding/
│   ├── hooks/
│   │   ├── useSuppliers.ts  # TanStack Query hooks for all supplier operations ← v1.7
│   │   └── ...           # useCustomer, useOrders, useDashboard, useProducts …
│   ├── i18n/                                                     ← v2.2
│   │   ├── en.ts         # English translations (10 namespaces)
│   │   ├── hi.ts         # Hindi translations (10 namespaces)
│   │   └── index.ts      # i18next config + language init
│   ├── lib/
│   │   └── secureStorage.ts  # expo-secure-store chunked adapter (≤1800 bytes/chunk) ← v3.4
│   ├── screens/
│   │   ├── AuthProfileErrorScreen.tsx  # Profile fetch failure UI (Retry + Logout) ← v3.4
│   │   ├── SuppliersScreen.tsx    ← v1.7
│   │   ├── ExportScreen.tsx       # Date-range filter + 4 export buttons ← v2.3
│   │   └── ...           # Dashboard, Customers, Orders, Products, Profile
│   ├── services/
│   │   └── sentry.ts     # initSentry() + Sentry.wrap()          ← v2.1
│   ├── store/
│   │   ├── suppliersStore.ts      ← v1.7
│   │   ├── languageStore.ts       # Language toggle, AsyncStorage persist ← v2.2
│   │   └── ...           # authStore (+ isRecoveryMode, _fetchInProgress gate) ← v3.4
│   ├── types/
│   │   ├── supplier.ts   # Supplier, SupplierDetail, SupplierDelivery  ← v1.7
│   │   └── customer.ts   # Customer, CustomerDetail, Transaction          ← v3.1
│   │                     # (transactions[], lastActiveAt, pendingOrderId)
│   └── utils/
│       ├── theme.ts      # Single source of truth: colors, dashboardPalette,  ← v3.0
│       │                 # spacing, radius, fonts, typography
│       ├── dashboardUi.ts # Re-exports dashboardPalette + INR/date formatters  ← v3.0
│       ├── exportCsv.ts  # toCsv<T>() + shareCsv() via expo-file-system/legacy ← v2.3
│       └── ...           # generateBillPdf, helper, phone, schemas, ThemeProvider
├── supabase/             # Migration Files & Config
├── schema.sql            # Master Database Schema (Source of Truth)
└── app.json              # Expo Configuration (Sentry plugin added v2.1)
```

### 4.3 Database Schema (SQL)

The database is designed with **Row Level Security (RLS)** to ensure complete data isolation between vendors.

#### **Key Tables & Relationships**

**1. `profiles`** (The Vendor)

- One-to-one link with `auth.users` (UNIQUE, NOT NULL).
- `name TEXT NOT NULL` — set during onboarding; `handle_new_user` trigger inserts `''` on signup.
- `phone TEXT UNIQUE` — globally unique; used for pre-login phone lookup (`Allow phone lookup before login` RLS policy).
- `role TEXT DEFAULT 'vendor'`.
- `billing_address TEXT` — note: column is `billing_address` (not `business_address`).
- `subscription_expiry DATE` — stored as `DATE` type (not TIMESTAMPTZ).
- Stores `business_name`, `gstin`, `bill_number_prefix`.
- **Bank Details**: `bank_name`, `account_number`, `ifsc_code` (for invoice footer).
- **`dashboard_mode`** (`seller` | `distributor` | `both`, default `both`) — controls which net-position cards appear on the dashboard. ← v1.8

**2. `customers`**

- `vendor_id` (FK): Links to profile.
- Tracks `name`, `phone`, `address`.
- `phone` is indexed with two indexes: a global UNIQUE index (`customers_phone_idx`) and a per-vendor UNIQUE composite index (`customers_vendor_phone_idx` on `(vendor_id, phone)`).

**3. `products`**

- `vendor_id` (FK), `name TEXT NOT NULL`, `base_price NUMERIC(10,2)`, `image_url TEXT`.
- `variants JSONB` — legacy JSON column for inline variant storage (live DB has this column at position 6). Structured variants use the `product_variants` table instead.

**3a. `product_variants`**

- `product_id` (FK), `vendor_id` (FK), `variant_name TEXT NOT NULL`, `price NUMERIC(10,2)`.
- Each row = one size/color/SKU variant of a product.

**4. `orders`** (The Invoice)

- `bill_number TEXT` — nullable in live DB (added via ALTER after initial creation); no UNIQUE constraint on `(vendor_id, bill_number)` exists in live — desirable integrity constraint to be applied via migration.
- `total_amount NUMERIC(10,2) NOT NULL` — no DEFAULT in live DB.
- `status TEXT NOT NULL DEFAULT 'Unpaid'` — no CHECK constraint in live DB; values in use: `'Paid'`, `'Pending'`, `'Partially Paid'`, `'Unpaid'`.
- `previous_balance NUMERIC` — snapshot of customer debt _at that moment_.
- `loading_charge NUMERIC` — transport fees.
- `tax_percent NUMERIC` — GST applied to items.
- `amount_paid` is kept in sync by the `update_order_status` DB trigger whenever a `payments` row is inserted or updated.

**4. `order_items`**

- Links `orders` to `products`.
- `product_id UUID NOT NULL` — NOT NULL in live DB.
- `quantity INTEGER NOT NULL CHECK (quantity > 0)` — CHECK constraint exists in live.
- Stores snapshot of `price` and `product_name` (preserving history if product changes).

**5. `payments`**

- `vendor_id` (FK), `order_id` (FK), `amount NUMERIC(10,2)`, `payment_mode TEXT NOT NULL DEFAULT 'Cash'`.
- `payment_mode` CHECK: `('Cash', 'UPI', 'NEFT', 'Draft', 'Cheque')`.
- `payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `notes TEXT`.
- Note: `created_at` column is **not** in the live DB (was in the v1.8 schema file but never applied).
- Inserting or updating a row fires the `on_payment_upsert` trigger which syncs `orders.amount_paid` and `orders.status`.

**7. `suppliers`** ← v1.7

- `vendor_id` (FK), `name`, `phone`, `address`, `basket_mark`.
- Bank details: `bank_name`, `account_number`, `ifsc_code`.
- `upi TEXT` — UPI ID for making payments to the supplier (added v1.9 sync).

**8. `supplier_deliveries`** ← v1.7

- `vendor_id`, `supplier_id` (FK), `delivery_date`, `loading_charge`, `advance_paid`, `total_amount`, `notes`.
- `total_amount` = itemsTotal + loading_charge (computed and stored at record time).

**9. `supplier_delivery_items`** ← v1.7

- `delivery_id` (FK), `vendor_id`, `item_name`, `quantity`, `rate`.
- **`subtotal`** is a generated column: `quantity * rate` (STORED).

**10. `payments_made`** ← v1.7

- Records payments from vendor → supplier.
- `vendor_id`, `supplier_id` (FK), `delivery_id` (FK nullable), `amount`, `payment_mode` (same 5-mode CHECK as `payments`), `notes`.
- **Balance**: `balanceOwed = SUM(supplier_deliveries.total_amount) − SUM(payments_made.amount)` per supplier.

#### **Critical SQL Functions (RPC)**

- **`get_next_bill_number(vendor_uuid, prefix)`**
  - **Logic**: `prefix_offset = LENGTH(prefix) + 2`; regex-matches `^PREFIX-[0-9]+$`; finds MAX number and increments.
  - **Return**: Formatted string `PREFIX-001`, `PREFIX-042`, `PREFIX-1000`.
- **`get_customer_previous_balance(customer_uuid, vendor_uuid)`** — takes **2 params** (customer + vendor)
  - **Logic**: Sums `(total_amount - amount_paid)` for all orders matching both `customer_id` and `vendor_id`.

#### **DB Triggers**

- **`on_auth_user_created`** (`AFTER INSERT ON auth.users`) → calls `handle_new_user()`
  - Inserts a `profiles` row with `name = ''`, `onboarding_complete = FALSE` on every new signup. Errors are swallowed (`EXCEPTION WHEN OTHERS`) so auth is never blocked.
- **`link_profile_after_signup`** (`AFTER INSERT ON auth.users`) → calls `link_user_profile()`
  - If a profile with a matching `phone` already exists (admin/invite flow) and has no `user_id`, links the two rows.
- **`on_payment_upsert`** (`AFTER INSERT OR UPDATE ON public.payments`) → calls `update_order_status()`
  - Recalculates `amount_paid = SUM(payments.amount WHERE order_id)` and sets `status` to `'Paid'` / `'Partially Paid'` / `'Pending'` automatically.

### 4.4 Core Algorithms & Logic

#### **A. The Grand Total Formula**

When creating a bill, the math is handled in `src/utils/generateBillPdf.ts`:

```typescript
Subtotal      = Sum(Item Price * Quantity) - Discount
Taxable Base  = Subtotal
Tax Amount    = (Taxable Base * Tax %) / 100
Order Total   = Taxable Base + Tax Amount + Loading Charge
Grand Total   = Order Total + Previous Balance (Outstanding Debt)
```

_Note: Loading Charge is added AFTER tax (it is usually a non-taxable reimbursement or separate service in this context)._

#### **B. Sequential Billing**

To prevent race conditions or gaps:

1.  Frontend requests new ID via RPC `get_next_bill_number(vendor_uuid, prefix)` just before saving.
2.  A `UNIQUE(vendor_id, bill_number)` constraint is **desirable but not currently present** in the live DB (listed in migrations as a pending `ALTER TABLE` to apply). Without it, the suffix-increment RPC provides best-effort sequential numbering.
3.  Users can change prefix in Profile (e.g., switch from "INV" to "FY24"), resetting the counter for that new series.

### 4.5 Security Architecture (RLS)

Every table has RLS enabled with policies like:

```sql
CREATE POLICY "Vendors can view own data"
ON table_name
FOR SELECT
USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
```

- **Result**: A user can physically only CRUD their own data.
- **Isolation**: Critical for multi-tenant financial apps.

---

## 5. Brand Guidelines & Design System

### 5.1 Brand Identity

| Field            | Value                                                   |
| :--------------- | :------------------------------------------------------ |
| **Brand Name**   | KredBook                                                |
| **App Slug**     | `kredbook`                                              |
| **Bundle ID**    | `com.kredbook.app`                                      |
| **Tagline**      | Track Credit. Get Paid Faster.                          |
| **Product Type** | Mobile-first digital ledger for Indian small businesses |
| **Target Users** | Retailers, wholesalers, shop owners, distributors       |

**Product Description**

KredBook is a modern digital ledger that helps shop owners track customer credit, record payments, manage suppliers, and maintain clear financial visibility. It combines the familiarity of a traditional khata (ledger book) with modern fintech UX. The app is **completely free** — all core features are available to every business at zero cost.

**Brand Personality**

| Trait           | Expression                                                    |
| :-------------- | :------------------------------------------------------------ |
| **Trustworthy** | Consistent color signals; no ambiguity in financial states    |
| **Simple**      | Minimal screens, short labels, single primary action per view |
| **Fast**        | Optimistic UI updates; transactions appear instantly          |
| **Friendly**    | Accessible to non-technical shop owners; no financial jargon  |

---

### 5.2 Design Philosophy

**"Digital Khata Book"**

KredBook uses a Digital Khata Book design philosophy. The UI mimics the simplicity of traditional Indian ledger books while adding modern fintech-style visual clarity.

| Principle                        | Intent                                                                                                                                                            |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Instant financial visibility** | The most important number — total balance due — is always the first element on screen, never buried.                                                              |
| **Minimal cognitive load**       | Soft neutral backgrounds (`#F6F7F9`) and clean white surfaces are the default state. High-intensity colors appear only when user attention is genuinely required. |
| **Quick transaction recording**  | Every screen maintains a reachable primary action — FAB for new entries, action cards for payment and reminders.                                                  |
| **Clear visual signals**         | Money received and money owed are always distinguished by color, never by text alone.                                                                             |

> The interface should feel like: **"A modern mobile version of a shopkeeper's khata book."**

---

### 5.3 Color System

| Usage                 | Color Name | Hex Code  | Purpose                                                |
| :-------------------- | :--------- | :-------- | :----------------------------------------------------- |
| **Primary / Success** | Green      | `#22C55E` | Primary actions, FAB, payments received, confirmations |
| **Primary Dark**      | Dark Green | `#16A34A` | Hover / pressed state for primary green                |
| **Danger**            | Red        | `#EF4444` | Money owed, overdue balances, negative values          |
| **Warning**           | Amber      | `#F59E0B` | Pending payments, reminders, alerts                    |
| **FAB**               | Blue       | `#2563EB` | Floating Action Button                                 |
| **Background**        | Light Gray | `#F6F7F9` | App background                                         |
| **Surface**           | White      | `#FFFFFF` | Cards and panels                                       |
| **Primary Text**      | Near Black | `#1C1C1E` | Headings and body text                                 |
| **Secondary Text**    | Cool Gray  | `#6B7280` | Labels, captions, metadata                             |
| **Border**            | Light Gray | `#E5E7EB` | Row separators, input borders                          |

**Dashboard Gradient Cards**

| Card             | Gradient            | Purpose                                |
| :--------------- | :------------------ | :------------------------------------- |
| Customer Balance | `#DC2626 → #B91C1C` | Outstanding balance due from customers |
| Supplier Payable | `#DB2777 → #BE185D` | Balance owed to suppliers              |
| Net Position     | `#0F172A → #334155` | Overall net financial summary          |

---

### 5.4 UX Language System

The app uses short, action-oriented language. Every label describes what the user is doing, not the underlying system concept.

| Feature          | UI Label          |
| :--------------- | :---------------- |
| Add transaction  | **New Entry**     |
| Record payment   | **Received**      |
| Give credit      | **Give Credit**   |
| Send reminder    | **Send Reminder** |
| Create invoice   | **Create Bill**   |
| Supplier payment | **Pay Supplier**  |

---

### 5.5 UI Structure

| Screen              | Description                                                                                                                                                                                   |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home Dashboard**  | Shows net credit position, quick actions (View Report, Send Reminder), active buyer count, overdue count, and recent activity feed.                                                           |
| **Customers**       | Customer list with initials avatar, color-coded balance (red = overdue, amber = pending), status badge, and filter tabs (All / Overdue / Paid / Pending).                                     |
| **Customer Detail** | Hero card showing total balance due; 3 quick-action cards (New Bill / Received / Remind); unified transaction feed with date grouping and running balance per row; Download Statement footer. |
| **New Bill**        | Itemized bill creation — product search, quantity, dynamic pricing, GST %, loading charge, previous balance shown live.                                                                       |
| **Suppliers**       | Supplier list sorted by highest balance owed; record deliveries and payments made; balance owed per supplier.                                                                                 |
| **Net Position**    | Aggregate view: Customers Owe Me (green) vs. I Owe Suppliers (red) vs. Net Position (green/amber).                                                                                            |

---

### 5.6 UI Patterns

**Color-Coded Financial States**

Every transaction row and order item uses a status chip, not plain text:

| State   | Color | Hex       | Chip: Background | Chip: Text |
| :------ | :---- | :-------- | :--------------- | :--------- |
| Paid    | Green | `#22C55E` | `#DCFCE7`        | `#16A34A`  |
| Pending | Amber | `#F59E0B` | `#FEF3C7`        | `#D97706`  |
| Overdue | Red   | `#EF4444` | `#FEE2E2`        | `#DC2626`  |

**Floating Action Button**

The FAB uses a solid blue (`#2563EB`) with a white `+` icon. It is the highest-elevation element on every list screen, ensuring new transaction entry is always one tap away.

**Status Chips**

Pill-shaped chips replace plain text labels for transaction status. Chips are 24–28 dp tall with 8 dp horizontal padding and 500-weight font. This allows a user to scan a full list and assess financial health in under three seconds.

**Optimistic UI Updates**

Transactions appear in the feed immediately on submission while syncing in the background via TanStack Query cache invalidation. This eliminates perceived latency during high-frequency billing sessions.

---

### 5.7 Typography

| Element              | Font                            | Weight        | Size | Notes                                                    |
| :------------------- | :------------------------------ | :------------ | :--- | :------------------------------------------------------- |
| **Primary Font**     | Inter (system default fallback) | —             | —    | Readable, high contrast, mobile-optimized                |
| **Title**            | Inter                           | Bold (700)    | 24px | Screen titles, section headers                           |
| **Financial Values** | Inter                           | Bold (700)    | 28px | Hero card amounts, totals — always bold, never truncated |
| **Body**             | Inter                           | Regular (400) | 16px | Labels, descriptions, list items                         |
| **Captions / Meta**  | Inter                           | Medium (500)  | 13px | Secondary text color `#6B7280`                           |

---

### 5.8 Design Goals

KredBook blends the familiarity of a traditional ledger with modern fintech dashboards. The design prioritizes financial clarity, speed, simplicity, and trust. The UI remains minimal while clearly highlighting important financial information using color-coded balances and gradient summary cards.

- Financial status is visible without any navigation.
- Recording a payment or creating a bill takes fewer than 3 taps.
- Color alone communicates whether a customer owes money or has paid.
- The interface imposes no cognitive overhead on users who are not financially literate.

---

## 6. Indian Billing Features 🇮🇳

Specific adaptations for the Indian market implemented in the app:

| Feature                    | Description                                                    | Technical Implementation                                                                              |
| :------------------------- | :------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Sequential Bills**       | Auto-incrementing numbers (e.g., INV-001, BILL-042).           | PostgreSQL RPC `get_next_bill_number` with custom prefix support.                                     |
| **Khata Balance**          | Show previous debt on current bill.                            | Auto-calculated `previous_balance` field snapshot on every new order.                                 |
| **Loading Charge**         | Transport/Hamali charges (Non-taxable).                        | Separate `loading_charge` column excluded from GST calculation.                                       |
| **GST Support**            | Apply tax percentage to items.                                 | `tax_percent` field applied to `itemsTotal` only.                                                     |
| **Bank Details**           | Print bank info on footer for NEFT/RTGS.                       | `profiles` table fields (`account_number`, `ifsc_code`, `bank_name`).                                 |
| **UPI QR**                 | Scan-to-pay on PDF.                                            | Google Charts API embedded in PDF HTML template.                                                      |
| **Payment Modes**          | Cash / UPI / NEFT / Draft / Cheque.                            | `payment_mode CHECK` constraint on both `payments` and `payments_made` tables.                        |
| **Overdue Flagging**       | Customers with dues unpaid for 30+ days highlighted red.       | `isOverdue = balance_due > 0 AND last_order_date < NOW() - 30 days`. Badge + banner + dashboard card. |
| **WhatsApp Reminders**     | One-tap reminder with pre-filled balance message.              | `Linking.openURL('whatsapp://send?text=...')` constructed per customer.                               |
| **Supplier Tracking**      | Record goods received; track what you owe distributors.        | 4 new tables: `suppliers`, `supplier_deliveries`, `supplier_delivery_items`, `payments_made`.         |
| **Net Position Dashboard** | Single-glance: owed to me vs. owed to suppliers.               | `customersOweMe − iOweSuppliers`; green/amber/red cards driven by `dashboard_mode`.                   |
| **Dashboard Mode**         | Seller / Distributor / Both — filters visible dashboard cards. | `dashboard_mode` on `profiles`; 3-chip toggle in Profile screen.                                      |

---

## 7. Installation & Setup

1.  **Clone Repository**

    ```bash
    git clone https://github.com/your-repo/kredbook-app.git
    cd kredbook-app
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create `.env` file:

    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    - Run the contents of `schema.sql` in your Supabase SQL Editor.
    - This creates all tables, RLS policies, and RPC functions.

5.  **Run App**
    ```bash
    npx expo start
    ```

---

## 8. Roadmap

- [x] **Phase 1: Foundation (Completed)**
  - Auth, Profiles, Core Schema, Basic Ordering, PDF Generation.
- [x] **Phase 2: Indian Billing (v1.1–v1.6 Completed)**
  - Sequential Bill IDs, Previous Balance, Loading Charge, Bank Details, WhatsApp Reminders.
  - Overdue Customer Flagging (Dashboard count + Customer list badge + Detail warning banner).
- [x] **Phase 3: Supplier / Distributor Mode (v1.7 Completed)**
  - Full supplier management: add suppliers, record deliveries, track payments made.
  - Balance owed calculation, delivery history, bank detail storage.
- [x] **Phase 4: Net Position Dashboard (v1.8 Completed)**
  - "Customers Owe Me" (green) + "I Owe Suppliers" (red) + "Net Position" (amber if negative) cards.
  - Dashboard Mode switch in Profile: Seller / Distributor / Both — controls visible cards.
- [x] **Phase 5: Engagement (v2.0–v2.4 Completed)**
  - [x] 3-step onboarding flow (phone, business setup, ready screen). v2.0
  - [x] Sentry crash reporting integration. v2.1
  - [x] Hindi UI language toggle (EN/HI, AsyncStorage persistence). v2.2
  - [x] CSV / Excel data export (4 report types, date range filter, share sheet). v2.3
  - [x] Import customers from phone contacts (multi-select, bulk add). v2.4
- [x] **Phase 6: Design System & UI Overhaul (v3.0 Completed)**
  - [x] New fintech color system — green brand (`#22C55E`), red/amber semantic tokens.
  - [x] `theme.ts` unified as single source of truth — `colors`, `dashboardPalette`, spacing, typography.
  - [x] `dashboardUi.ts` simplified to re-export; all consumers stay import-compatible.
  - [x] Role selection screen redesigned — Wholesaler / Retailer / Small Business with image banner cards.
  - [x] Dashboard premium redesign — gradient hero card, stat cards, recent activity feed.
  - [x] 7 reusable dashboard components extracted into `src/components/dashboard/`.
  - [x] Premium tab bar — white bg, green active tint, shadow, 64 dp height.
  - [x] DB trigger fix — `handle_new_user` now inserts `name = ''` to satisfy NOT NULL.
- [x] **Phase 6.1: Customer UI Overhaul (v3.1 Completed)**
  - [x] Customer List redesigned — initials avatars with deterministic 8-color palette (52×52), color-coded balance amounts, status badge (OVERDUE / PENDING / PAID / ADVANCE), filter tabs (All / Overdue / Paid / Pending).
  - [x] SearchBar pill shape (`rounded-full`), lighter `#F6F7FB` background.
  - [x] Layout fix — removed `ScreenWrapper` double-padding; direct `SafeAreaView` in CustomersScreen.
  - [x] Customer Detail screen fully redesigned — red gradient hero card, 3 action cards, unified transaction feed, running balance per row, date-group separators, Download Statement footer.
  - [x] `Transaction` type added to `customer.ts` — `id`, `type`, `amount`, `runningBalance`, `billNumber`, `status`, `paymentMode`.
  - [x] `fetchCustomerDetail` rewritten — batches orders + payments, forward-pass running balance, newest-first display, `pendingOrderId` for payment recording.
  - [x] `RecordCustomerPaymentModal` — bottom-sheet with amount input, 5 payment mode chips, Partial / Mark Full Paid actions.
  - [x] Tab bar height corrected for edge-to-edge Android — `useSafeAreaInsets()`, `height = 64 + insets.bottom`.
  - [x] Customer Detail status bar overlap fixed — `SafeAreaView` `edges` now includes `"top"`.
- [x] **Phase 6.2: UI Audit — Icons, Colors & Components (v3.2–v3.3 Completed)**
  - [x] **Primary brand color** changed from purple `#5B3FFF` to green `#22C55E` across `theme.ts` (`primary.DEFAULT`, `primary.light`, `primary.dark`, `icon.bg`).
  - [x] **`CustomerCard` avatar palette** updated to 8-color spec (EF4444, F97316, EAB308, 22C55E, 14B8A6, 3B82F6, 8B5CF6, EC4899). Advance chip → info blue.
  - [x] **`@expo/vector-icons` fully removed** — complete Ionicons/Feather → `lucide-react-native` migration across all ~35 files. Zero vector-icons imports remain.
  - [x] **`RecordCustomerPaymentModal`** converted from RN `Modal` to `@gorhom/bottom-sheet` (`snapPoints: ["65%"]`).
  - [x] **`RecordPaymentMadeModal`** converted from RN `Modal` to `@gorhom/bottom-sheet` (`snapPoints: ["62%"]`, `BottomSheetScrollView`).
  - [x] **`EmptyState` component** upgraded with `title`, `description`, `cta`, `onCta` props + `CircleOff` icon. `CustomerList`, `SupplierList`, `OrderList` updated with rich empty states and CTA callbacks.
  - [x] **`Toast` component** added — `ToastProvider`/`useToast` context, animated slide-down, success (green) & error (red) types. Wired into root `_layout.tsx`.
  - [x] **Financial Position screen** added at `app/(main)/reports/index.tsx` — hero net-position card, Customers Owe Me vs I Owe Suppliers progress bars, breakdown rows.
  - [x] **Dashboard "both" mode** fixed — split hero card with green YOU RECEIVE panel + red YOU OWE panel + net position row.
  - [x] `ActivityIndicator` spinner color updated to green `#22C55E` in `RecordCustomerPaymentModal`.
- [x] **Phase 6.5: Auth Hardening Sprint (v3.4–v3.5 Completed)**
  - [x] Full auth architecture audit: 5 critical issues (C1–C5), 2 improvements (I1–I2), 2 best practices (B1, B6) identified and fixed.
  - [x] State machine compliance audit: 3 violations (V1–V3) + 2 race conditions (R1–R2) identified and fixed.
  - [x] QA audit: 9 issues (1 FAIL, 8 WARN) from real user scenario simulation. All fixed.
  - [x] `isRecoveryMode` store flag: pins root layout to set-new-password screen so no guard evicts it during PASSWORD_RECOVERY flow.
  - [x] `expo-secure-store` chunked adapter: JWT tokens moved from AsyncStorage to device Keychain/Keystore.
  - [x] Sentry breadcrumbs added at all major auth transitions (login, signup, google OAuth, onboarding complete, logout).
  - [x] `AuthProfileErrorScreen` with Retry + Logout; `profile-error` as dedicated Expo Router route.
  - [x] `set-new-password.tsx` full password recovery form with Formik + Yup + eye-toggles.
  - [x] `createMinimalProfile()` fallback for Google OAuth when DB trigger races the insert.
  - [x] `_fetchInProgress` closure gate in `authStore` prevents double HTTP profile fetches.
  - [x] `resetPasswordForEmail` now passes `redirectTo: Linking.createURL("/")` for correct deep-link.
  - [x] Confirm password field in signup and set-new-password screens both have eye-toggles.
  - [x] Onboarding `role.tsx` uses `router.push` (not `replace`) to business, preserving back-stack.
  - [x] `Loader.tsx` shows delayed "Loading your profile…" hint after 2 s for slow-profile UX.
- [x] **Phase 6.6: Screen Redesigns UI Sprint (v3.6 Completed)**
  - [x] `CreateOrderScreen` — custom header, sticky footer, `OrderBillSummary` inline sub-component; removed ScreenWrapper.
  - [x] `NewProductModal` — variants-only (no Base Price); `RupeeInput` sub-component (₹ prefix + TextInput); `FieldArray` for dynamic variant rows; sticky "Save Product" CTA.
  - [x] `ConfirmModal.tsx` — new reusable destructive-action confirmation component (`src/components/ui/`); `AlertTriangle` icon, Delete + Cancel buttons, `loading` prop.
  - [x] `ProductCard` — redesigned as compact single-row: icon box + bold name + "N variants" subtitle + `₹price` + ChevronRight; no image or expand rows.
  - [x] `ProductsScreen` — SafeAreaView + StyleSheet; custom header with green count badge; Search/X toggle; horizontal `CATEGORIES` chip bar; `ConfirmModal` wired for delete.
  - [x] Financial Position screen (`app/(main)/reports/index.tsx`) — full inline redesign: `StatCard`, `NetCard`, `InsightPill` sub-components; green customers card, `#E0336E` suppliers card, dark `#1C2333` net card; Monthly Report download card.
  - [x] `ExportScreen` — full rewrite: `ExportRow` + `DateInput` sub-components; date presets (All time / This month); `loadingKey` prevents concurrent exports; removed ScreenWrapper / NativeWind / i18n.
  - [x] `ProfileScreen` — full rewrite: `SectionCard` + `DetailRow` + `SegmentControl<T>` sub-components; read-only display; `maskAccount()` helper; Sign Out with `Alert.alert` confirmation; removed SubscriptionCard / ImagePickerField / i18n / inline TextInput editing.
- [x] **Phase 6.7: Orders, Order Detail & Modal Migration (v3.7 Completed)**
  - [x] `OrdersScreen` — full rewrite: collapsible Search toggle, inline filter chips (All/Paid/Partial/Pending/Overdue), client-side Overdue sub-filter (`daysSince > 30`), Sort BottomSheet; removed `FilterBar` + `useOrderFilters`.
  - [x] `OrderList.tsx` — full redesign: 44 dp initials avatar, exact-spec STATUS_STYLES hex, `ORDER_ITEM_H=108`, inline empty state + "Create Bill" CTA.
  - [x] Order Detail screen (`app/(main)/orders/[orderId].tsx`) — Customer card, flush Items + Bill Summary cards, Payment History with mode chips, fixed Action Bar (Send Bill + Record Payment).
  - [x] `NewCustomerModal` + `NewSupplierModal` — migrated from `react-native-modal` to `@gorhom/bottom-sheet` (`snapPoints:["90%"]`, `BottomSheetScrollView`, `BottomSheetBackdrop`).
  - [x] `Order` interface extended: `customer?: { id, name, phone }` field.
  - [x] Orders `_layout.tsx` — dynamic `options.title` support for `Order #INV-001` per-bill headers.
- [x] **Phase 6.8: UX Audit & Navigation Polish Sprint (v3.8 Completed)**
  - [x] App renamed **CreditBook → KredBook**; `app.json` updated: name, slug (`kredbook`), bundle ID (`com.kredbook.app`).
  - [x] `StackHeader` — new shared navigation header (`src/components/navigation/StackHeader.tsx`); `useSafeAreaInsets()` dynamic height (`44 + insets.top`); replaces 3 duplicate inline `CustomHeader` definitions.
  - [x] `(main)/_layout.tsx` — dead `CustomHeader` import + wrapper `<View>` removed; `headerShown: false` in screenOptions; tab bar height: `64 + insets.bottom`.
  - [x] `(auth)/_layout.tsx` — View wrapper and dead `CustomHeader` import removed; bare `<Stack>` layout.
  - [x] Onboarding `index.tsx` — phone OTP screen replaced with `<Redirect href="/(auth)/onboarding/role" />`; phone collection deferred to Phase 7.
  - [x] `ready.tsx` — stacked `ready-image.png` removed; single `large-check.png` illustration; smart business label: `businessName + prefix` pill (green) or `"Setup pending"` (neutral).
  - [x] Root `_layout.tsx` — entry point corrected: `/(auth)/onboarding` → `/(auth)/onboarding/role`.
  - [x] `DashboardScreen.tsx` — FAB route fixed (`/orders/createOrderScreen` → `/(main)/orders/create`); Distributor hero card `onPrimaryAction` corrected to `/(main)/reports` (M-06 audit).
  - [x] Financial Position screen — `InsightPill` component + "Quick Insights" section + "Monthly Financial Report" download card removed (UX Audit M-05; Phase 7 content outside spec); dead imports (`Download`, `CircleAlert`, `CheckCircle2`, `AlertTriangle`) and 11 dead StyleSheet keys purged.
- [~] **Phase 7: Growth — In Progress**
  - [ ] WhatsApp Business API (auto-send bill on creation).
  - [ ] Push notifications for overdue payments.
  - [ ] Inventory stock tracking + low stock alerts.
  - [ ] Phone OTP login (replace email/password).
  - [ ] Staff accounts (Role-based access).
  - [ ] Online Storefront for customers.
  - [ ] Cloud Backup & Restore UI.
  - [ ] Optional paid features evaluation (only if significant user growth warrants it).

---

## 9. Recent Updates & Changelog

### v3.8 — UX Audit & Navigation Polish Sprint (Current)

- **REBRAND**: App display name and configuration updated: `"CreditBook"` → `"KredBook"` (`slug: "kredbook"`, `bundleIdentifier: "com.kredbook.app"`, `scheme: "kredbook"`). All documentation aligned.
- **NEW**: **`StackHeader`** (`src/components/navigation/StackHeader.tsx`) — shared navigation header component. Props: `{ title: string, showBack?: boolean }`. Computes `height: 44 + insets.top` and `paddingTop: insets.top` via `useSafeAreaInsets()`. Back button: `className="absolute left-4 bottom-2"` with `hitSlop`. Replaces 3 duplicate inline `CustomHeader` definitions across `(main)/`, `(auth)/`, and screen files.
- **FIX**: **`app/(main)/_layout.tsx`** — removed dead `CustomHeader` component definition and `View` import; `headerShown: false` in root `screenOptions`; tab bar height corrected to `64 + insets.bottom` for edge-to-edge Android.
- **FIX**: **`app/(auth)/_layout.tsx`** — removed `View` wrapper around `<Stack>` and dead `CustomHeader` import; bare `<Stack screenOptions={{ headerShown: false }}>` layout.
- **FIX**: **`app/(auth)/onboarding/index.tsx`** — phone OTP collection screen removed; replaced with 7-line `<Redirect href="/(auth)/onboarding/role" />`. Phone login deferred to Phase 7.
- **FIX**: **`app/(auth)/onboarding/ready.tsx`** — removed stacked `ready-image.png` duplicate; single `large-check.png` illustration remains. Business label now smart: shows `businessName · INV` in green pill if onboarding complete, `"Setup pending"` in neutral pill otherwise.
- **FIX**: **`app/_layout.tsx`** — root entry point corrected: `/(auth)/onboarding` → `/(auth)/onboarding/role` (eliminates intermediate redirect hop).
- **FIX (M-06)**: **`src/screens/DashboardScreen.tsx`** — FAB route fixed: `/orders/createOrderScreen` → `/(main)/orders/create`. Distributor-mode hero card `onPrimaryAction` corrected: was `/(main)/suppliers`, now `/(main)/reports`.
- **FIX (M-05)**: **`app/(main)/reports/index.tsx`** — removed `InsightPill` component, `{/* Quick Insights */}` JSX section, and `{/* Monthly Financial Report */}` download card (Phase 7 content outside current-phase spec). Removed unused imports: `Download`, `CircleAlert`, `CheckCircle2`, `AlertTriangle`. Removed unused `collectionRate` variable + 3-line computation. Removed 11 dead StyleSheet keys: `sectionHeader`, `sectionLabel`, `pillGroup`, `pill`, `pillText`, `reportCard`, `reportIconBox`, `reportMeta`, `reportTitle`, `reportSub`, `downloadBtn`.
- **TS**: `npx tsc --noEmit` — EXIT 0.
- **FILES CREATED**: `src/components/navigation/StackHeader.tsx`.
- **FILES MODIFIED**: `app/_layout.tsx`, `app/(main)/_layout.tsx`, `app/(auth)/_layout.tsx`, `app/(auth)/onboarding/index.tsx`, `app/(auth)/onboarding/ready.tsx`, `src/screens/DashboardScreen.tsx`, `app/(main)/reports/index.tsx`, `app.json`.

---

### v3.7 — Orders Screens, Order Detail & Free-Tier Commitment

- **REWRITE**: **`OrdersScreen`** (`src/screens/OrdersScreen.tsx`) — full rewrite. `SafeAreaView edges={['top']}` + `#F6F7F9` bg. "Orders" header (22 sp bold) with Search icon toggle — tap to expand collapsible `SearchBar`, tap again to collapse and clear. Inline horizontal filter chip row (All / Paid / Partial / Pending / Overdue, h:32, active `#22C55E`). **Overdue** handled client-side via `daysSince > 30` sub-filter — not an API param. **Sort chip** at end of chip row → local `sortSheetRef` BottomSheet (Newest / Oldest / High / Low). Removed `FilterBar` component, `useOrderFilters` hook, and separate Filter BottomSheet.
- **REWRITE**: **`OrderList.tsx`** (`src/components/orders/OrderList.tsx`) — full card redesign. 44 dp initials avatar (deterministic AVATAR_COLORS hash) + customer name (15 sp bold, `#1C1C1E`) + bill number (13 sp `#6B7280`) + date bottom row (13 sp) + `₹amount` (17 sp bold) + status chip. `STATUS_STYLES` updated to exact spec hex: Paid `#DCFCE7`/`#16A34A` · Partial `#DBEAFE`/`#1D4ED8` · Pending `#FEF3C7`/`#D97706` · Overdue `#FEE2E2`/`#DC2626`. `ORDER_ITEM_H=108`; `windowSize:10`; `onCreateBill` prop. Inline empty state with "No orders yet" + "Create Bill" green CTA.
- **NEW**: **Order Detail screen** (`app/(main)/orders/[orderId].tsx`) — full new screen. Stack header title: `Order #<bill_number>` (dynamic). `SafeAreaView edges={['bottom']}`. 5-section `ScrollView`: (1) **Customer Card** — 48 dp avatar + name + phone + Previous Balance (red if > 0, `#22C55E` if 0); (2) **Items Card** — top-rounded, flush-joined below to (3) **Bill Summary** — subtotal / GST (if > 0) / loading (if > 0) / prev balance (if > 0) / divider / Grand Total 22 sp + status chip; (4) **Payment History** — sorted oldest→newest, running "Remaining: ₹X", mode chips (Cash=green, UPI=blue, NEFT=purple, Draft=amber, Cheque=sky), amounts in `#22C55E`, empty state; (5) **Fixed Action Bar** — "Send Bill" outline green (`generateBillPdf` → `expo-sharing`; WhatsApp fallback) + "Record Payment" filled green (`RecordCustomerPaymentModal`, hidden when `status === "Paid"`). On payment success: invalidates `orderDetail` + `orders list` + `payments` + `dashboard` caches + shows `Alert.alert`.
- **FIX**: **`app/(main)/orders/_layout.tsx`** — header renderer now accepts dynamic title from child `<Stack.Screen options={{ title: '...' }}/>`; enables `Order #INV-001` dynamic header per bill.
- **FIX**: **`src/api/orders.ts`** — `Order` interface extended with `customer?: { id: string; name: string; phone: string } | null`.
- **FIX M-01**: **`NewCustomerModal`** + **`NewSupplierModal`** — migrated from `react-native-modal` (AppModal) to `@gorhom/bottom-sheet` (`snapPoints:["90%"]`, `BottomSheetScrollView`, `BottomSheetBackdrop`). Deferred M-01 item fully resolved.
- **PRODUCT**: **KredBook** is and will remain **free for all users**. No paywalls, no feature gating. Optional paid features may be considered only if the app grows significantly — and only as additive upgrades, never restricting core ledger functionality.
- **FILES MODIFIED**: `src/screens/OrdersScreen.tsx`, `src/components/orders/OrderList.tsx`, `app/(main)/orders/[orderId].tsx`, `app/(main)/orders/_layout.tsx`, `src/api/orders.ts`, `src/components/customers/NewCustomerModal.tsx`, `src/components/suppliers/NewSupplierModal.tsx`.

---

### v3.6 — Screen Redesigns UI Sprint

- **REWRITE**: **`CreateOrderScreen`** — SafeAreaView + StyleSheet; custom back-arrow header; sticky footer with bill summary; `OrderBillSummary` as inline sub-component. Removed ScreenWrapper dependency.
- **NEW**: **`ConfirmModal.tsx`** (`src/components/ui/`) — reusable destructive confirmation bottom sheet. `AlertTriangle` icon in `danger.bg` 64 px circle; solid Delete button + outlined Cancel; `loading` prop disables both buttons while request is in flight.
- **REWRITE**: **`NewProductModal`** — variants-only (no separate Base Price row); `RupeeInput` inline sub-component (₹ prefix box + divider + TextInput); `FieldArray` for unlimited variant rows; sticky "Save Product" CTA button.
- **REWRITE**: **`ProductCard`** — compact single-row design: green icon box + bold product name + "N variants" subtitle + `₹price` right + ChevronRight. No image display, no expanding rows, no EllipsisVertical menu.
- **REWRITE**: **`ProductsScreen`** — SafeAreaView + StyleSheet; custom header with green product count badge; Search/X toggle collapses to icon when inactive; horizontal scrollable `CATEGORIES` chip bar; `ConfirmModal` wired via `showDeleteConfirm` state.
- **REWRITE**: **Financial Position screen** (`app/(main)/reports/index.tsx`) — full inline redesign: `StatCard` (green customers, `#E0336E` suppliers), `NetCard` (dark `#1C2333` bg); `todayLabel()` helper. _Note: `InsightPill` (Quick Insights) + Monthly Report download card added here were removed in v3.8 (UX Audit M-05)._
- **REWRITE**: **`ExportScreen`** — full rewrite: `ExportRow` + `DateInput` sub-components; "All time" / "This month" presets via `applyPreset()`; `loadingKey` state prevents concurrent exports; info banner; removed ScreenWrapper / NativeWind class-based styling / i18n.
- **REWRITE**: **`ProfileScreen`** — full rewrite: `SectionCard` + `DetailRow` + `SegmentControl<T>` sub-components; green-bordered avatar ring + initials; read-only business/bank sections; `maskAccount()` for ACC NO; Sign Out triggers `Alert.alert` confirmation; removed SubscriptionCard / ImagePickerField / uploadImage / i18n / inline TextInput editing.
- **FILES MODIFIED**: `src/screens/ExportScreen.tsx`, `src/screens/ProfileScreen.tsx`, `src/screens/ProductsScreen.tsx`, `src/screens/CreateOrderScreen.tsx`, `app/(main)/reports/index.tsx`, `src/components/products/NewProductModal.tsx`, `src/components/products/ProductCard.tsx`.
- **FILES CREATED**: `src/components/ui/ConfirmModal.tsx`.

---

### v3.5 — QA Auth Hardening: 9 Fixes

- **FIX (FAIL-01 / WARN-07)**: **`isRecoveryMode` guard** — `authStore` now holds `isRecoveryMode: boolean` + `setRecoveryMode(v)`. Root `_layout.tsx` adds a top-priority `{isRecoveryMode && <Stack.Screen name="(auth)/set-new-password" />}` guard; all other 5 guards wrapped with `!isRecoveryMode`. Ensures password-recovery screen is never evicted by dashboard/onboarding guard even when a full session + profile are present. `PASSWORD_RECOVERY` handler in `useAuth` calls `setRecoveryMode(true)`.
- **FIX (WARN-06)**: `set-new-password.tsx` now calls `setRecoveryMode(false)` + `supabase.auth.signOut()` before routing to login. Prevents `USER_UPDATED → fetchProfile → dashboard` race.
- **FIX (WARN-08)**: `resetPasswordForEmail` now passes `{ redirectTo: Linking.createURL("/") }` so the recovery email link deep-links into the app on iOS and Android (was opening a browser page).
- **FIX (WARN-01)**: `useSignUp.onSuccess` now checks `profile === null` after all retries and routes to `/profile-error` instead of silently navigating to broken onboarding. Consistent with `useLogin` behavior.
- **FIX (WARN-02)**: `google_oauth_start` Sentry breadcrumb moved into `mutationFn` (fires before `openAuthSessionAsync`), not `onSuccess`. Renamed correctly.
- **FIX (WARN-04)**: Confirm password field in `signup.tsx` now has an eye-toggle (was hardcoded `secureTextEntry`); consistent with all other password fields.
- **FIX (WARN-09)**: `role.tsx` now uses `router.push` (not `router.replace`) to navigate to Business step; Role screen is preserved in the back-stack so back-navigation during onboarding works correctly.
- **FIX (WARN-05)**: `Loader.tsx` upgraded — after 2 s with no explicit `message` prop, shows `"Loading your profile…"` hint automatically; prevents indefinite blank spinner during slow profile fetches.
- **DOCS (WARN-03)**: `useLogout.onSuccess` now includes an explicit comment explaining the intentional `AsyncStorage.removeItem("hasSeenWelcome")` deletion for re-engagement on next launch.
- **FILES**: `app/_layout.tsx`, `src/store/authStore.ts`, `src/hooks/useAuth.ts`, `app/(auth)/set-new-password.tsx`, `src/api/auth.ts`, `app/(auth)/signup.tsx`, `app/(auth)/onboarding/role.tsx`, `src/components/feedback/Loader.tsx`.

---

### v3.4 — Auth Architecture Audit & Hardening

- **NEW**: **`AuthProfileErrorScreen`** (`src/screens/AuthProfileErrorScreen.tsx`) + `app/profile-error.tsx` route — shown when `user && !profile && !profileLoading` (dead state, previously blank screen). Provides AlertTriangle icon, Retry button calling `fetchProfile()`, and Logout button. Registered as a `Stack.Screen` in root `_layout.tsx` (C1 fix).
- **NEW**: **`app/(auth)/set-new-password.tsx`** — full password recovery form with Formik + Yup; both fields eye-toggle; calls `supabase.auth.updateUser({ password })`; routes to login on success (C4 fix).
- **NEW**: **`src/lib/secureStorage.ts`** — Supabase-compatible `AsyncStorageLike` adapter using `expo-secure-store` with 1800-byte chunking (under iOS 2048-byte Keychain limit). Backwards-compatible: non-numeric stored values treated as legacy plaintext (B1 fix).
- **MOD**: **`src/services/supabase.ts`** — JWT storage changed from `AsyncStorage` to `secureStorage` (B1 fix).
- **MOD**: **`src/store/authStore.ts`** — converted to factory pattern `create<AuthState>((set, get) => { let _fetchInProgress = false; ... })`. `setUser` writes `{ user, loading: true }` in a single atomic `set()` call (R1 fix). `_fetchInProgress` closure gate prevents double HTTP calls (I2 fix). `logout` sets `{ user: null, profile: null }` only; does not duplicate `onAuthStateChange(SIGNED_OUT)`.
- **MOD**: **`src/hooks/useAuth.ts`** (multiple sub-fixes):
  - `PASSWORD_RECOVERY` handler: no longer calls `setUser()` — only routes to `set-new-password` (V2 fix). `setRecoveryMode(true)` added in v3.5.
  - `useLogin.onSuccess`: calls `await fetchProfile()` before navigation; if `profile === null` routes to `/profile-error`; else branches on `onboarding_complete` (V3 + I1 fix).
  - `useGoogleSignIn`: retry loop (3 × 600 ms) + `createMinimalProfile()` fallback + `await fetchProfile()` re-read; routes to onboarding if no profile (C5 fix).
  - `useLogout.onSuccess`: `setUser(null)` removed (R2 fix); `onAuthStateChange(SIGNED_OUT)` is sole state writer.
  - Sentry `addBreadcrumb` added for `auth_login_success`, `google_oauth_start`, `google_oauth_success`, `signup_success`, `onboarding_complete`, `logout` (B6 fix).
- **MOD**: **`app/_layout.tsx`** — removed auto-retry `useEffect` that was re-calling `fetchProfile` on every render (V1 fix). Splash screen condition corrected to `(!user || !profileLoading)`. Added `profile-error` Stack.Screen.
- **MOD**: **`app/(auth)/signup.tsx`** — confirm password field and password field both have `secureTextEntry={!showPassword}`, functional `onPress`, and `accessibilityLabel` (C2 fix).
- **MOD**: **`app/(auth)/onboarding/ready.tsx`** — `catch` block now calls `show({ message, type: "error" })` via `useToast` (C3 fix); Sentry breadcrumb `onboarding_complete` added after `setProfile`.
- **MOD**: **`app/(auth)/_layout.tsx`** — added `set-new-password` Stack.Screen (C4 fix).
- **FILES CREATED**: `src/screens/AuthProfileErrorScreen.tsx`, `app/profile-error.tsx`, `app/(auth)/set-new-password.tsx`, `src/lib/secureStorage.ts`.
- **FILES MODIFIED**: `app/_layout.tsx`, `app/(auth)/_layout.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/onboarding/ready.tsx`, `src/hooks/useAuth.ts`, `src/store/authStore.ts`, `src/services/supabase.ts`.

---

### v3.3 — Icon Migration & Component Polish

- **COMPLETE**: **`@expo/vector-icons` fully removed** from entire codebase. All ~35 files migrated to `lucide-react-native`. Zero Ionicons/Feather imports remain.
- **Affected files**: `signup.tsx`, `onboarding/index.tsx`, `ExportScreen.tsx`, `ImagePickerField.tsx`, `NewProductModal.tsx`, `PaymentHistory.tsx`, `OrderItemCard.tsx`, `OrderBillSummary.tsx`, `DashboardStatCards.tsx`, `DashboardRecentActivity.tsx`, `DashboardHeader.tsx`, `ContactsPickerModal.tsx`, `BottomSheetForm.tsx`, and 20+ more from the previous session.
- **FIX**: `signup.tsx` — replaced `Ionicons` `mail-outline`, `lock-closed-outline`, `shield-checkmark-outline`, `alert-circle-outline` with Lucide `Mail`, `Lock`, `ShieldCheck`, `AlertCircle`.
- **FIX**: `onboarding/index.tsx` — `call-outline` → Lucide `Phone`.
- **FIX**: `ExportScreen.tsx` — buttons array `icon: keyof typeof Ionicons.glyphMap` converted to `Icon: ComponentType<{size, color, strokeWidth?}>` using `Receipt`, `Banknote`, `Users`, `Store`. Download arrow → `Download` icon.

### v3.2 — UI Audit: Theme, Components & Screens (Latest)

- **BREAKING**: **Primary brand color changed** — `theme.ts` `primary.DEFAULT` updated from purple `#5B3FFF` to green `#22C55E`. `primary.light` → `#DCFCE7`, `primary.dark` → `#16A34A`, `icon.bg` → `#22C55E22`. All `bg-primary`, `text-primary`, `border-primary` Tailwind classes now render green.
- **NEW**: **`Toast` component** — `src/components/feedback/Toast.tsx`. `ToastProvider` wraps entire app in `_layout.tsx`. `useToast()` hook: `show({ message, type: "success"|"error", duration? })`. Animated slide-down from top using `Animated.Value`. Respects `useSafeAreaInsets()` for notch/island devices.
- **NEW**: **Financial Position screen** — `app/(main)/reports/index.tsx`. Hero net-position card (green if ≥ 0, red if < 0). Two breakdown cards: Customers Owe Me (green progress bar) + I Owe Suppliers (red progress bar). `BreakdownRow` sub-component with overdue/net summary. Uses `useDashboard()` hook. Linked from DashboardActionBar "View Report" button.
- **FIX**: **Dashboard "both" mode** — Previously `isBothMode` was included in `isVendorMode` so it defaulted to customer-only view. Now renders a split hero card: green `#F0FDF4` YOU RECEIVE panel + red `#FEF2F2` YOU OWE panel + net position row (green if ≥ 0, red if < 0).
- **FIX**: **`RecordCustomerPaymentModal`** converted from `Modal` + `KeyboardAvoidingView` to `@gorhom/bottom-sheet`. `snapPoints: ["65%"]`, `useEffect` open/close pattern, `backdropComponent`, `keyboardBehavior="interactive"`. `ActivityIndicator color` set to `#22C55E`.
- **FIX**: **`RecordPaymentMadeModal`** converted to `@gorhom/bottom-sheet`. `snapPoints: ["62%"]`, `BottomSheetScrollView`.
- **FIX**: **`EmptyState` component** upgraded — now supports `title`, `description`, `cta`, `onCta` props alongside legacy `message`. Renders `CircleOff` icon in a gray circle, bold title, description body, and green CTA button. `CustomerList` and `SupplierList` updated to pass `onAddCustomer`/`onAddSupplier` callbacks. `OrderList` uses rich empty state for error and empty states.
- **FIX**: **`CustomerCard` avatar palette** updated to 8-color spec: `["#EF4444","#F97316","#EAB308","#22C55E","#14B8A6","#3B82F6","#8B5CF6","#EC4899"]`. Advance chip color → info blue (`#0369A1` / `#4F9CFF`).
- **FIX**: All purple `#5B3FFF` color hardcodes in `[customerId].tsx`, `DashboardActionBar`, `RecordCustomerPaymentModal` replaced with green equivalents.
- **Ionicons cleanup (partial)**: `DashboardHeroCard`, `DashboardActionBar`, `Modal`, `BottomSheetPicker`, `SearchBar`, `SearchablePickerModal`, `SupplierCard`, `ProductCard`, `ProductActionsModal`, `RecordDeliveryModal`, `ProfileScreen`, `ProductsScreen`, all `_layout.tsx` navigators, `[customerId].tsx`, `[supplierId].tsx`, `onboarding/ready.tsx`, `onboarding/role.tsx`, `login.tsx`, `resetPassword.tsx`.

### v3.1 — Customer UI & Feature Overhaul

- **NEW**: **`Transaction` type** in `src/types/customer.ts` — `{ id, type: "bill"|"payment", created_at, amount, runningBalance, billNumber?, status?, paymentMode? }`. `CustomerDetail` extended with `transactions[]`, `lastActiveAt`, `pendingOrderId`, `pendingOrderBalance`.
- **NEW**: **`fetchCustomerDetail` rewritten** (`src/api/customers.ts`) — fetches all orders with `bill_number` ascending, batch-fetches all payments in one query, merges into unified event list, forward-pass computes running balance (bill `+=amount`, payment `-=amount`, floor 0), reverses to newest-first. Identifies oldest pending order as `pendingOrderId`/`pendingOrderBalance` for payment recording.
- **NEW**: **`RecordCustomerPaymentModal`** (`src/components/customers/RecordCustomerPaymentModal.tsx`) — Modal bottom-sheet with amount TextInput, 5 payment-mode chips (Cash / UPI / NEFT / Draft / Cheque), "Record Partial" + "Mark Full Paid" buttons. Calls `recordPayment()` from `orders.ts`; invalidates `["customerDetail", id]` and `["dashboard", vendorId]` query keys on success.
- **NEW**: **Customer Detail Screen redesign** (`app/(main)/customers/[customerId].tsx`) — Custom header (back, name, last-active subtitle, PDF + call icon buttons); red gradient hero card (`#C0392B → #7B1010`) with TOTAL BALANCE DUE, overdue badge, last-bill info; 3 action cards (New Bill / Received / Remind); transaction feed with All / Bills Given / Payments sub-tabs, date-group pill separators (Today / Yesterday / date), color-keyed `TransactionRow` (green=payment, red=bill) with running balance "Bal: ₹X"; "Download Statement" dark-pill footer (PDF via `expo-print` + `expo-sharing`).
- **NEW**: **Customer List UI redesign** — `CustomerCard` uses 52×52 initials avatar with deterministic 8-color palette; balance right-aligned color-coded (red=overdue, amber=pending, black=paid/advance); OVERDUE / PENDING / PAID / ADVANCE status badge with border.
- **NEW**: **Filter tabs** on CustomersScreen — All / Overdue / Paid / Pending; in-memory filtering in `CustomerList`.
- **NEW**: **SearchBar pill shape** — `rounded-full`, `bg: #F6F7FB`, `placeholder: #8E8E93`.
- **FIX**: **ScreenWrapper double-padding removed** — CustomersScreen uses direct `SafeAreaView` instead of `ScreenWrapper`; `FlatList` gets `style={{ flex: 1 }}`.
- **FIX**: **Android edge-to-edge tab bar overlap** — `app/(main)/_layout.tsx` now uses `useSafeAreaInsets()`; `tabBarStyle.height = 64 + insets.bottom`, `paddingBottom = 8 + insets.bottom`.
- **FIX**: **Customer Detail status-bar overlap** — `SafeAreaView` `edges` updated from `["left","right","bottom"]` to `["top","left","right","bottom"]`.
- **FILES**: `src/types/customer.ts`, `src/api/customers.ts`, `src/components/customers/RecordCustomerPaymentModal.tsx` (new), `src/components/customers/CustomerCard.tsx`, `src/components/customers/CustomerList.tsx`, `src/screens/CustomersScreen.tsx`, `src/components/SearchBar.tsx`, `app/(main)/customers/[customerId].tsx`, `app/(main)/_layout.tsx`.

### v3.0 — Design System & UI Overhaul

- **NEW**: **Unified `theme.ts`** — complete fintech color system: `colors.primary` (green `#22C55E`), `colors.success` / `danger` / `warning` / `info` with `.DEFAULT`, `.light`, `.text`, `.dark` tokens; iOS-style neutral scale; `dashboardPalette` exported from same file.
- **NEW**: **`dashboardUi.ts` simplified** — now a thin re-export of `dashboardPalette` from `theme.ts` + formatter functions. All 8 existing consumer files continue working without change.
- **NEW**: **Role Selection Screen** (`app/(auth)/onboarding/role.tsx`) — 3-role card layout (Wholesaler / Retailer / Small Business) with image banner, icon badge, selection indicator, and green CTA. `dashboardModeFor()` maps new roles to existing `vendor`/`receiver` dashboard_mode.
- **NEW**: **Premium Dashboard** (`src/screens/DashboardScreen.tsx`) — gradient hero card, View Report / Send Reminder action bar, Active Buyers + Overdue stat cards, Recent Activity feed with status chips, brand-gradient FAB.
- **NEW**: **7 Dashboard Components** extracted into `src/components/dashboard/`: `DashboardHeader`, `DashboardHeroCard`, `DashboardActionBar`, `DashboardStatCards`, `DashboardRecentActivity`, `ActivityRow`, `StatusBadge`.
- **NEW**: **Dashboard API extended** (`src/api/dashboard.ts`) — `activeBuyers` (unique customer count), `recentActivity` (last 5 orders with customer name join, status resolution).
- **MOD**: **Tab bar premium styling** — white background, `#22C55E` active tint, shadow, 64 dp height; dashboard tab `headerShown: false`.
- **MOD**: **`app/(main)/_layout.tsx`** — role checks updated for `wholesaler` / `retailer` → vendor tabs; `user` → receiver tabs.
- **MOD**: **`src/types/auth.ts`** — `dashboard_mode` union extended to include `wholesaler`, `retailer`, `user`.
- **FIX**: **DB trigger `handle_new_user`** — `supabase/migrations/fix_signup.sql` now inserts `name = ''` to satisfy NOT NULL constraint on profiles table.
- **FILES**: `src/utils/theme.ts`, `src/utils/dashboardUi.ts`, `src/api/dashboard.ts`, `src/screens/DashboardScreen.tsx`, `src/components/dashboard/` (7 files), `app/(auth)/onboarding/role.tsx`, `app/(main)/_layout.tsx`, `src/types/auth.ts`, `supabase/migrations/fix_signup.sql`.

### v2.4 — Import Customers from Phone Contacts

- **NEW**: **ContactsPickerModal** — `expo-contacts` bottom-sheet; requests `READ_CONTACTS` permission, loads contacts filtered to valid phone numbers, multi-select + search + select-all/deselect-all, bulk import with per-contact error skipping.
- **NEW**: Second FAB (people icon) on Customers screen above the existing add FAB opens the contacts picker.
- **MOD**: `NewCustomerModal` — optional `initialValues` prop + `enableReinitialize` for contact pre-fill.
- **i18n**: 13 new keys in `customers` namespace (EN + HI): `importContacts`, `selectContacts`, `importSelected`, `noContactsFound`, `permissionDenied`, `importSuccess`, `importSummary`, etc.
- **FILES**: `src/components/customers/ContactsPickerModal.tsx` (new), `src/components/customers/NewCustomerModal.tsx`, `src/screens/CustomersScreen.tsx`.

### v2.3 — CSV / Excel Data Export

- **NEW**: **ExportScreen** — optional from/to date filter + 4 export buttons with per-button loading state.
- **NEW**: `src/api/export.ts` — 4 Supabase queries: Orders (customer + item count), Payments Received (bill ref), Customer Balances, Supplier Purchases.
- **NEW**: `src/utils/exportCsv.ts` — `toCsv<T>()` CSV builder + `shareCsv()` using `expo-file-system/legacy` + `expo-sharing`.
- **NEW**: Route at `app/(main)/export/index.tsx` (hidden tab). Entry point: "Export Data" button in Profile screen.
- **i18n**: Full EN + HI translations for `export` namespace.
- **FILES**: `src/api/export.ts`, `src/utils/exportCsv.ts`, `src/screens/ExportScreen.tsx`, `app/(main)/export/index.tsx`, `src/screens/ProfileScreen.tsx`.

### v2.2 — Hindi UI Language Toggle

- **NEW**: Full i18n system — `i18next` + `react-i18next` + `expo-localization` installed.
- **NEW**: `src/i18n/en.ts` + `src/i18n/hi.ts` — 10 namespaces covering all screens.
- **NEW**: `src/store/languageStore.ts` — Zustand store with AsyncStorage persistence.
- **NEW**: 2-chip English / हिन्दी toggle in Profile screen under Dashboard Mode section.
- **MOD**: Root layout bootstraps language before first render; all 6 main screens use `useTranslation()`.
- **FILES**: `src/i18n/`, `src/store/languageStore.ts`, all screen files.

### v2.1 — Sentry Crash Reporting

- **NEW**: `@sentry/react-native` installed and configured.
- **NEW**: `src/services/sentry.ts` — `initSentry()` called before root component mounts.
- **NEW**: `Sentry.wrap(RootLayout)` error boundary in root layout.
- **CONFIG**: Sentry plugin added to `app.json`. DSN from `EXPO_PUBLIC_SENTRY_DSN` env var.
- **FILES**: `src/services/sentry.ts`, `app/_layout.tsx`, `app.json`.

### v2.0 — Onboarding Flow

- **NEW**: 3-step onboarding: phone entry → business setup (name, GSTIN, UPI, prefix) → ready screen with setup summary + bank-details nudge.
- **NEW**: `profiles.onboarding_complete` boolean column — root layout routes new users to `/(auth)/onboarding`, existing users skip it.
- **FILES**: `app/(auth)/onboarding/index.tsx`, `app/(auth)/onboarding/business.tsx`, `app/(auth)/onboarding/ready.tsx`, `app/(auth)/onboarding/_layout.tsx`.

### v1.8 - Net Position Dashboard (Current)

- **NEW**: **Customers Owe Me card** (green) — Sum of all customer `balance_due > 0` across all orders.
- **NEW**: **I Owe Suppliers card** (red) — `SUM(supplier_deliveries.total_amount) − SUM(payments_made.amount)` across all suppliers.
- **NEW**: **Net Position card** (green if ≥ 0, amber if negative) — `customersOweMe − iOweSuppliers`. Shown only when mode is `both`.
- **NEW**: **Dashboard Mode switch** in Profile — 3-chip toggle (Seller / Distributor / Both). Seller hides supplier cards; Distributor hides customer cards; Both shows all three net-position cards.
- **DB**: `dashboard_mode TEXT DEFAULT 'both' CHECK IN ('seller','distributor','both')` added to `profiles`.
- **FILES**: `src/api/dashboard.ts`, `src/screens/DashboardScreen.tsx`, `src/screens/ProfileScreen.tsx`, `src/types/auth.ts`.

### v1.7 - Supplier / Distributor Mode

- **NEW**: **Suppliers Tab** — New bottom-nav tab (storefront icon) for managing distributors/suppliers.
- **NEW**: **Add Supplier** — Name, phone, address, basket mark, bank details (bank name, A/c no., IFSC).
- **NEW**: **Record Delivery** — Date, dynamic item rows (item name × qty × rate), loading charge, advance paid. Live Grand Total summary with balance-after-advance.
- **NEW**: **Record Payment Made** — Amount, mode (Cash/UPI/NEFT/Draft/Cheque), notes. Validates amount ≤ balance owed.
- **NEW**: **Supplier Detail Screen** — Balance card (red), delivery history, bank details section.
- **LOGIC**: `balanceOwed = SUM(deliveries.total_amount) − SUM(payments_made.amount)`. Suppliers sorted by highest balance first.
- **DB**: 4 new tables — `suppliers`, `supplier_deliveries`, `supplier_delivery_items`, `payments_made`. Full RLS.
- **FILES**: `src/types/supplier.ts`, `src/api/suppliers.ts`, `src/store/suppliersStore.ts`, `src/hooks/useSuppliers.ts`, 5 components, `SuppliersScreen.tsx`, `app/(main)/suppliers/*`, `app/(main)/_layout.tsx`.

### v1.6 - Overdue Customer Flagging

- **NEW**: **Overdue Dashboard Card** — Shows count of customers with `balance_due > 0` AND last order older than 30 days.
- **NEW**: **Overdue Badge on Customer List** — Red `Overdue` chip on CustomerCard; card border turns red.
- **NEW**: **Overdue Warning Banner** — Shown at top of Customer Detail: _"Last billed X days ago — payment overdue"_.
- **LOGIC**: `isOverdue = outstandingBalance > 0 AND daysSinceLastOrder > 30`.
- **FILES**: `src/api/dashboard.ts`, `src/api/customers.ts`, `src/types/customer.ts`, `CustomerCard.tsx`, `CustomerList.tsx`, `[customerId].tsx`, `DashboardScreen.tsx`.

### v1.5 - Payment Mode Expansion

- **NEW**: Payment modes expanded: **Cash / UPI / NEFT / Draft / Cheque** (previously only Cash/Online).
- **DB**: `payments_payment_mode_check` constraint updated; v1.5 migration migrates `Online` → `UPI`.

### v1.4 - Billing Precision & Reminders

- **NEW**: **Bank Details Validation** — Prevents bill generation if bank info is missing.
- **NEW**: **Custom Bill Prefix** — Vendors can set 'INV', 'BILL', 'CB' etc. via Profile settings.
- **NEW**: **GST % Input** — Dedicated field for tax percentage on order creation.
- **NEW**: **WhatsApp Reminders** — "🔔 Send Reminder" button appears for customers with dues.
- **DB**: Added `bill_number_prefix` and `tax_percent` columns.

### v1.3 - Profile Enhancements

- **MOD**: Added "Bank Account Details" form to Profile screen with blur-to-save.
- **UX**: Live validation for input fields.

### v1.2 - Live Khata Balance

- **NEW**: Instant "Previous Balance" fetch on customer selection.
- **UI**: Full Grand Total breakdown (Items + Tax + Loading + Previous Debt).

### v1.1 - Indian Billing Core

- **NEW**: Sequential Bill Numbering implementation.
- **NEW**: Loading Charge support.
- **NEW**: Enhanced PDF template with Indian context.

---

**Document History**

| Version | Date         | Author       | Notes                                                                                                                                                                                                                                    |
| :------ | :----------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------- | ----------- | ------------ | -------------------------------------------------------------------------------------------- |
| **3.7** | Mar 11, 2026 | AI Assistant | Orders List + Order Detail screens built (v3.7); NewCustomerModal/NewSupplierModal @gorhom migration (M-01); free-tier product commitment documented across all docs                                                                     |
| **3.6** | Mar 11, 2026 | AI Assistant | Screen Redesigns UI Sprint: 7 screens/components fully rewrote to SafeAreaView+StyleSheet pattern — ExportScreen, ProfileScreen, ProductsScreen, ProductCard, NewProductModal, CreateOrderScreen, Financial Position; ConfirmModal added |
| **3.5** | Mar 10, 2026 | AI Assistant | QA auth hardening: 9 issues fixed (FAIL-01, WARN-01–WARN-09) — isRecoveryMode guard, password recovery race, redirectTo, confirm-password toggle, delayed loader hint, back-stack fix                                                    |
| **3.4** | Mar 10, 2026 | AI Assistant | Full auth hardening: C1–C5 critical fixes, V1–V3 state machine violations, R1–R2 race conditions, I1–I2 improvements, B1 (expo-secure-store), B6 (Sentry breadcrumbs), 8 new/modified files                                              |
| **3.3** | Mar 8, 2026  | AI Assistant | Icon migration complete: @expo/vector-icons fully removed, all ~35 files migrated to lucide-react-native                                                                                                                                 |
| **3.2** | Mar 8, 2026  | AI Assistant | UI audit: green primary color, Toast, Financial Position screen, bottom-sheet modals, EmptyState upgrade, CustomerCard palette, dashboard "both" fix                                                                                     |
| **3.1** | Mar 5, 2026  | AI Assistant | Brand & design system docs rewrite: identity, color system, UX language, UI structure, patterns, typography                                                                                                                              |     | **3.0** | Mar 3, 2026 | AI Assistant | Design system overhaul: green palette, unified theme.ts, dashboard redesign, 7 UI components |
| **2.4** | Mar 2, 2026  | AI Assistant | Import customers from phone contacts (expo-contacts, multi-select picker)                                                                                                                                                                |
| **2.3** | Mar 2, 2026  | AI Assistant | CSV/Excel data export — 4 report types, date range filter, share sheet                                                                                                                                                                   |
| **2.2** | Mar 2, 2026  | AI Assistant | Hindi UI language toggle (i18next, 10 namespaces, AsyncStorage persistence)                                                                                                                                                              |
| **2.1** | Mar 2, 2026  | AI Assistant | Sentry crash reporting integration                                                                                                                                                                                                       |
| **2.0** | Mar 2, 2026  | AI Assistant | 3-step onboarding flow                                                                                                                                                                                                                   |
| **1.8** | Mar 1, 2026  | AI Assistant | Net Position Dashboard + Dashboard Mode switch                                                                                                                                                                                           |
| **1.7** | Mar 1, 2026  | AI Assistant | Supplier/Distributor Mode: full CRUD + balances                                                                                                                                                                                          |
| **1.6** | Mar 1, 2026  | AI Assistant | Overdue Flag: Dashboard, List badge, Detail banner                                                                                                                                                                                       |
| **1.5** | Feb 27, 2026 | AI Assistant | Full Technical Architecture & Schema Docs                                                                                                                                                                                                |
| **1.4** | Feb 27, 2026 | AI Assistant | Added Validation, Prefix, GST, Reminders                                                                                                                                                                                                 |
| **1.3** | Feb 27, 2026 | AI Assistant | Profile Bank UI modification                                                                                                                                                                                                             |
| **1.2** | Feb 27, 2026 | AI Assistant | Live Previous Balance feature                                                                                                                                                                                                            |
| **1.1** | Feb 27, 2026 | AI Assistant | Initial Indian Billing Suite                                                                                                                                                                                                             |
| **1.0** | Feb 27, 2026 | AI Assistant | Initial BRD                                                                                                                                                                                                                              |
