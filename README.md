# CreditBook App - Complete Project Documentation

> **Last Updated**: March 1, 2026
> **Version**: 1.6
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
- **Fast Import**: (Planned) Import from phone contacts.

#### 🧾 Order & Billing System

- **Cart Building**: Quick-add interface for high-volume billing.
- **Dynamic Pricing**: Edit rates on the fly for specific deals.
- **Tax & Fees**:
  - **GST %**: Applied to taxable goods (configurable per order).
  - **Loading Charge**: Non-taxable transport/delivery fees.
- **Bill Generation**: PDF invoices with business branding, sequential IDs, and bank details.

#### 💸 Payment Tracking

- **Partial Payments**: Record split payments (Cash/Online/UPI).
- **Live Balance**: Order form shows "Previous Balance" from history instantly.
- **Reminders**: One-tap WhatsApp payment reminders with pre-filled details.

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

| Layer             | Technology            | Rationale                                       |
| :---------------- | :-------------------- | :---------------------------------------------- |
| **App Framework** | **React Native 19.1** | Cross-platform (iOS/Android), high performance. |
| **Routing**       | **Expo Router 6.0**   | File-based routing, deep linking support.       |
| **Styling**       | **NativeWind 4.2**    | Tailwind CSS utility classes for rapid UI dev.  |
| **Backend / DB**  | **Supabase**          | PostgreSQL, Auth, Realtime, Edge Functions.     |
| **State Mgmt**    | **Zustand**           | Lightweight global state (Auth, User Profile).  |
| **Server State**  | **TanStack Query**    | Caching, optimistic updates, infinite scroll.   |
| **PDF Engine**    | **expo-print**        | Robust HTML-to-PDF generation.                  |

### 4.2 Project Structure

```bash
/
├── app/                  # Expo Router Pages
│   ├── (auth)/           # Login, Register, Recover (Unprotected)
│   ├── (main)/           # Main App (Protected)
│   │   ├── customers/    # Customer List & Detail Pages
│   │   ├── orders/       # Order Management & Creation
│   │   ├── products/     # Inventory Management
│   │   ├── profile/      # User Settings & Business Profile
│   │   └── dashboard/    # Analytics & Overview
│   └── _layout.tsx       # Root Layout (Auth Check)
├── src/
│   ├── api/              # Supabase API Clients (Table-specific)
│   ├── components/       # Reusable UI Components
│   ├── database/         # Local DB / Sync Logic (Future)
│   ├── hooks/            # Custom React Hooks (useAuth, useOrders)
│   ├── store/            # Zustand Stores (authStore, orderStore)
│   ├── types/            # TypeScript Interfaces
│   └── utils/            # Helper Functions (PDF, Formatters)
├── supabase/             # Migration Files & Config
├── schema.sql            # Master Database Schema (Source of Truth)
└── app.json              # Expo Configuration
```

### 4.3 Database Schema (SQL)

The database is designed with **Row Level Security (RLS)** to ensure complete data isolation between vendors.

#### **Key Tables & Relationships**

**1. `profiles`** (The Vendor)

- One-to-one link with `auth.users`.
- Stores `business_name`, `gstin`, `bill_number_prefix`.
- **Bank Details**: `bank_name`, `account_number`, `ifsc_code` (for invoice footer).

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

| Feature              | Description                                          | Technical Implementation                                               |
| :------------------- | :--------------------------------------------------- | :--------------------------------------------------------------------- |
| **Sequential Bills** | Auto-incrementing numbers (e.g., INV-001, BILL-042). | PostgreSQL Function `get_next_bill_number` with custom Prefix support. |
| **Khata Balance**    | Show previous debt on current bill.                  | Auto-calculated `previous_balance` field snapshot on every new order.  |
| **Loading Charge**   | Transport/Hamali charges (Non-taxable).              | Separate `loading_charge` column effectively excluded from GST calc.   |
| **GST Support**      | Apply tax percentage to items.                       | `tax_percent` field applied to `itemsTotal` only.                      |
| **Bank Details**     | Print bank info on footer for NEFT/RTGS.             | `profiles` table fields (`account_number`, `ifsc`, `bank_name`).       |
| **UPI QR**           | Scan-to-pay on PDF.                                  | Google Charts API embedded in PDF HTML.                                |

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
- [x] **Phase 2: Indian Billing (v1.4–v1.6 Completed)**
  - Sequential Bill IDs, Previous Balance, Loading Charge, Bank Details, WhatsApp Reminders.
  - Overdue Customer Flagging (Dashboard count + Customer list badge + Detail warning banner).
- [x] **Phase 3: Supplier / Distributor Mode (Current v1.7)**
  - Full supplier management: add suppliers, record deliveries, track payments made.
  - Balance owed calculation, delivery history, bank detail storage.
- [ ] **Phase 4: Engagement (Next)**
  - WhatsApp API integration (automated sending).
  - Inventory stock alerts.
  - Multi-language support (Hindi/Hinglish).
- [ ] **Phase 4: Growth**
  - Staff accounts (Role-based access).
  - Online Storefront for customers.
  - Cloud Backup & Restore UI.

---

## 9. Recent Updates & Changelog

### v1.7 - Supplier / Distributor Mode (Current)

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

| Version | Date         | Author       | Notes                                              |
| :------ | :----------- | :----------- | :------------------------------------------------- |
| **1.7** | Mar 2, 2026  | AI Assistant | Supplier/Distributor Mode: full CRUD + balances    |
| **1.6** | Mar 1, 2026  | AI Assistant | Overdue Flag: Dashboard, List badge, Detail banner |
| **1.5** | Feb 27, 2026 | AI Assistant | Full Technical Architecture & Schema Docs          |
| **1.4** | Feb 27, 2026 | AI Assistant | Added Validation, Prefix, GST, Reminders           |
| **1.3** | Feb 27, 2026 | AI Assistant | Profile Bank UI modification                       |
| **1.2** | Feb 27, 2026 | AI Assistant | Live Previous Balance feature                      |
| **1.1** | Feb 27, 2026 | AI Assistant | Initial Indian Billing Suite                       |
| **1.0** | Feb 27, 2026 | AI Assistant | Initial BRD                                        |
