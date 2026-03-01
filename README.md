# CreditBook App - Complete Project Documentation

> **Last Updated**: March 2, 2026
> **Version**: 2.4
> **Status**: Active Development
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
5. [Brand Guidelines & UX Design](#5-brand-guidelines--ux-design)
6. [Indian Billing Features 🇮🇳](#6-indian-billing-features-)
7. [Installation & Setup](#7-installation--setup)
8. [Roadmap](#8-roadmap)
9. [Recent Updates & Changelog](#9-recent-updates--changelog)

---

## 1. Executive Summary

CreditBook is a mobile-first **digital ledger and billing application** designed specifically for small and medium-sized businesses (SMBs) in India. It digitizes the traditional "Khata" (credit book) system, enabling shopkeepers to track customer credit, manage inventory, and generate professional GST-compliant invoices.

**Core Value Proposition**:

- Eliminate paper ledgers and manual calculation errors.
- Accelerate payment recovery via automated reminders and billing transparency.
- Professionalize business operations with sequential, branded digital invoices (PDF).

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

| Layer             | Technology                  | Rationale                                                 |
| :---------------- | :-------------------------- | :-------------------------------------------------------- |
| **App Framework** | **React Native 19.1**       | Cross-platform (iOS/Android), high performance.           |
| **Routing**       | **Expo Router 6.0**         | File-based routing, deep linking support.                 |
| **Styling**       | **NativeWind 4.2**          | Tailwind CSS utility classes for rapid UI dev.            |
| **Backend / DB**  | **Supabase**                | PostgreSQL, Auth, Realtime, Edge Functions.               |
| **State Mgmt**    | **Zustand**                 | Lightweight global state (Auth, User Profile).            |
| **Server State**  | **TanStack Query**          | Caching, optimistic updates, infinite scroll.             |
| **PDF Engine**    | **expo-print**              | Robust HTML-to-PDF generation.                            |
| **i18n**          | **i18next + react-i18next** | EN/HI language toggle with AsyncStorage persistence. v2.2 |
| **Crash Reports** | **@sentry/react-native**    | Error tracking + crash reporting (free tier). v2.1        |
| **Contacts**      | **expo-contacts**           | Import customers from phone contacts. v2.4                |
| **File System**   | **expo-file-system/legacy** | CSV export — write to device cache, share sheet. v2.3     |

### 4.2 Project Structure

```bash
/
├── app/                  # Expo Router Pages
│   ├── (auth)/           # Login, Register, Recover (Unprotected)
│   │   └── onboarding/   # 3-step onboarding flow               ← v2.0
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
│   │   ├── suppliers/    # SupplierCard, SupplierList, NewSupplierModal,
│   │   │                 # RecordDeliveryModal, RecordPaymentMadeModal  ← v1.7
│   │   ├── customers/    # CustomerCard, CustomerList, NewCustomerModal,
│   │   │                 # ContactsPickerModal (expo-contacts)  ← v2.4
│   │   └── ...           # orders/, products/, ui/, feedback/, onboarding/
│   ├── hooks/
│   │   ├── useSuppliers.ts  # TanStack Query hooks for all supplier operations ← v1.7
│   │   └── ...           # useCustomer, useOrders, useDashboard, useProducts …
│   ├── i18n/                                                     ← v2.2
│   │   ├── en.ts         # English translations (10 namespaces)
│   │   ├── hi.ts         # Hindi translations (10 namespaces)
│   │   └── index.ts      # i18next config + language init
│   ├── screens/
│   │   ├── SuppliersScreen.tsx    ← v1.7
│   │   ├── ExportScreen.tsx       # Date-range filter + 4 export buttons ← v2.3
│   │   └── ...           # Dashboard, Customers, Orders, Products, Profile
│   ├── services/
│   │   └── sentry.ts     # initSentry() + Sentry.wrap()          ← v2.1
│   ├── store/
│   │   ├── suppliersStore.ts      ← v1.7
│   │   ├── languageStore.ts       # Language toggle, AsyncStorage persist ← v2.2
│   │   └── ...           # authStore, orderStore, customersStore, dashboardStore
│   ├── types/
│   │   ├── supplier.ts   # Supplier, SupplierDetail, SupplierDelivery  ← v1.7
│   │   └── ...           # auth.ts (dashboard_mode + onboarding_complete), customer.ts
│   └── utils/
│       ├── exportCsv.ts  # toCsv<T>() + shareCsv() via expo-file-system/legacy ← v2.3
│       └── ...           # generateBillPdf, helper, phone, schemas, theme, ThemeProvider
├── supabase/             # Migration Files & Config
├── schema.sql            # Master Database Schema (Source of Truth)
└── app.json              # Expo Configuration (Sentry plugin added v2.1)
```

### 4.3 Database Schema (SQL)

The database is designed with **Row Level Security (RLS)** to ensure complete data isolation between vendors.

#### **Key Tables & Relationships**

**1. `profiles`** (The Vendor)

- One-to-one link with `auth.users`.
- Stores `business_name`, `gstin`, `bill_number_prefix`.
- **Bank Details**: `bank_name`, `account_number`, `ifsc_code` (for invoice footer).
- **`dashboard_mode`** (`seller` | `distributor` | `both`, default `both`) — controls which net-position cards appear on the dashboard. ← v1.8

**2. `customers`**

- `vendor_id` (FK): Links to profile.
- Tracks `name`, `phone`, `address`.

**3. `orders`** (The Invoice)

- `bill_number` (Text): Unique per vendor (e.g., "INV-001").
- `total_amount` (Numeric): Final bill value.
- `previous_balance` (Numeric): Snapshot of customer debt _at that moment_.
- `loading_charge` (Numeric): Transport fees.
- `tax_percent` (Numeric): GST applied to items.

**4. `order_items`**

- Links `orders` to `products`.
- Stores snapshot of `price` and `product_name` (preserving history if product changes).

**5. `suppliers`** ← v1.7

- `vendor_id` (FK), `name`, `phone`, `address`, `basket_mark`.
- Bank details: `bank_name`, `account_number`, `ifsc_code`.

**6. `supplier_deliveries`** ← v1.7

- `vendor_id`, `supplier_id` (FK), `delivery_date`, `loading_charge`, `advance_paid`, `total_amount`, `notes`.
- `total_amount` = itemsTotal + loading_charge (computed and stored at record time).

**7. `supplier_delivery_items`** ← v1.7

- `delivery_id` (FK), `vendor_id`, `item_name`, `quantity`, `rate`.
- **`subtotal`** is a generated column: `quantity * rate` (STORED).

**8. `payments_made`** ← v1.7

- Records payments from vendor → supplier.
- `vendor_id`, `supplier_id` (FK), `delivery_id` (FK nullable), `amount`, `payment_mode` (same 5-mode CHECK as `payments`), `notes`.
- **Balance**: `balanceOwed = SUM(supplier_deliveries.total_amount) − SUM(payments_made.amount)` per supplier.

#### **Critical SQL Functions (RPC)**

- **`get_next_bill_number(vendor_uuid, prefix)`**
  - **Logic**: Finds the max number for the given prefix (regex match) and increments by 1.
  - **Return**: Formatted string `PREFIX-001`.
- **`get_customer_previous_balance(customer_id)`**
  - **Logic**: Sums `(total_amount - amount_paid)` for all orders of a customer.

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

1.  Frontend requests new ID via RPC `get_next_bill_number` just before saving.
2.  Database constraint `UNIQUE(vendor_id, bill_number)` ensures no duplicates.
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

## 5. Brand Guidelines & UX Design

### 5.1 Design Philosophy

**"Trust & Clarity"** — The UI mimics the physical ledger layout familiar to Indian shopkeepers but adds modern clarity.

### 5.2 Color Palette

| Usage            | Color Name     | Hex Code              | Visual Meaning                                |
| :--------------- | :------------- | :-------------------- | :-------------------------------------------- |
| **Primary**      | **Ocean Blue** | `#2563EB` (blue-600)  | Trust, Action buttons, Brand identity         |
| **Secondary**    | **Slate**      | `#475569` (slate-600) | Text, secondary icons                         |
| **Success**      | **Emerald**    | `#16A34A` (green-600) | Paid status, Money received                   |
| **Warning/Debt** | **Amber**      | `#D97706` (amber-600) | **Previous Balance**, Pending payment, Alerts |
| **Error**        | **Rose**       | `#E11D48` (rose-600)  | Delete actions, Validation errors             |
| **Background**   | **Off-White**  | `#F8FAFC` (slate-50)  | Clean canvas, easier on eyes than pure white  |

### 5.3 UX Patterns

- **Live Balance Chip**: Customer cards show a dynamic amber chip `Previous Balance: ₹5,000` to keep debt visible.
- **Blur-to-Save**: Profile forms save instantly on `onEndEditing` to prevent data loss without explicit "Save" buttons.
- **Optimistic Updates**: Using TanStack Query to show "Created" state immediately while syncing background.

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
    git clone https://github.com/your-repo/creditbook-app.git
    cd creditbook-app
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
- [~] **Phase 5: Engagement — In Progress (v2.0–v2.4)**
  - [x] 3-step onboarding flow (phone, business setup, ready screen). v2.0
  - [x] Sentry crash reporting integration. v2.1
  - [x] Hindi UI language toggle (EN/HI, AsyncStorage persistence). v2.2
  - [x] CSV / Excel data export (4 report types, date range filter, share sheet). v2.3
  - [x] Import customers from phone contacts (multi-select, bulk add). v2.4
  - [ ] WhatsApp Business API (auto-send bill on creation).
  - [ ] Push notifications for overdue payments.
  - [ ] Inventory stock tracking + low stock alerts.
  - [ ] Phone OTP login (replace email/password).
- [ ] **Phase 6: Growth**
  - Staff accounts (Role-based access).
  - Online Storefront for customers.
  - Cloud Backup & Restore UI.
  - Premium subscription tier (₹149–₹199/mo).

---

## 9. Recent Updates & Changelog

### v2.4 — Import Customers from Phone Contacts (Current)

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

| Version | Date         | Author       | Notes                                                                       |
| :------ | :----------- | :----------- | :-------------------------------------------------------------------------- |
| **2.4** | Mar 2, 2026  | AI Assistant | Import customers from phone contacts (expo-contacts, multi-select picker)   |
| **2.3** | Mar 2, 2026  | AI Assistant | CSV/Excel data export — 4 report types, date range filter, share sheet      |
| **2.2** | Mar 2, 2026  | AI Assistant | Hindi UI language toggle (i18next, 10 namespaces, AsyncStorage persistence) |
| **2.1** | Mar 2, 2026  | AI Assistant | Sentry crash reporting integration                                          |
| **2.0** | Mar 2, 2026  | AI Assistant | 3-step onboarding flow                                                      |
| **1.8** | Mar 1, 2026  | AI Assistant | Net Position Dashboard + Dashboard Mode switch                              |
| **1.7** | Mar 1, 2026  | AI Assistant | Supplier/Distributor Mode: full CRUD + balances                             |
| **1.6** | Mar 1, 2026  | AI Assistant | Overdue Flag: Dashboard, List badge, Detail banner                          |
| **1.5** | Feb 27, 2026 | AI Assistant | Full Technical Architecture & Schema Docs                                   |
| **1.4** | Feb 27, 2026 | AI Assistant | Added Validation, Prefix, GST, Reminders                                    |
| **1.3** | Feb 27, 2026 | AI Assistant | Profile Bank UI modification                                                |
| **1.2** | Feb 27, 2026 | AI Assistant | Live Previous Balance feature                                               |
| **1.1** | Feb 27, 2026 | AI Assistant | Initial Indian Billing Suite                                                |
| **1.0** | Feb 27, 2026 | AI Assistant | Initial BRD                                                                 |
