# CreditBook — Supabase Database Architecture Report

> Generated: March 9, 2026  
> Source files scanned: `schema.sql`, `src/api/*.ts`, `src/types/*.ts`  
> Supabase project URL sourced from: `EXPO_PUBLIC_SUPABASE_URL` env var  
> Schema version: **1.8 (app v3.0)**

---

## How to Access This Information in Supabase Dashboard

| Section                    | Where to Find It                                                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tables + columns           | **Table Editor** → select table → Columns tab                                                                                                                           |
| All columns with types     | **SQL Editor** → run: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;` |
| RLS policies               | **Authentication** → Policies tab                                                                                                                                       |
| RPC functions              | **Database** → Functions tab                                                                                                                                            |
| Indexes                    | **Database** → Indexes tab                                                                                                                                              |
| Storage buckets            | **Storage** tab                                                                                                                                                         |
| Active connections / usage | **Reports** tab                                                                                                                                                         |
| Triggers                   | **Database** → Triggers tab                                                                                                                                             |

---

## Tables Used

11 tables total across 2 domains (customer billing + supplier management).

```
profiles                    ← user identity + business settings
customers                   ← vendor's customers
products                    ← product catalogue
product_variants            ← size/weight/type variants per product
orders                      ← sales bills
order_items                 ← line items per bill
payments                    ← payments received from customers
suppliers                   ← vendor's suppliers
supplier_deliveries         ← goods received from suppliers
supplier_delivery_items     ← line items per delivery
payments_made               ← payments made by vendor to suppliers
```

**Storage Bucket used:** `product-images` (via `src/api/upload.ts`)

---

## Table Details

---

### TABLE: `profiles`

**Purpose:** 1-to-1 extension of `auth.users`. Holds all business settings.  
**Primary Key:** `id` (UUID)  
**Foreign Key:** `user_id → auth.users(id)`  
**RLS:** Enabled — user can only view/update their own row via `auth.uid() = user_id`

| Column                | Type        | Nullable | Used by App | Notes                                         |
| --------------------- | ----------- | -------- | ----------- | --------------------------------------------- |
| `id`                  | UUID        | NO       | ✅ Yes      | Referenced as `vendor_id` in all other tables |
| `user_id`             | UUID        | NO       | ✅ Yes      | FK → auth.users                               |
| `name`                | TEXT        | YES      | ✅ Yes      | User display name                             |
| `phone`               | TEXT        | YES      | ✅ Yes      | User phone                                    |
| `role`                | TEXT        | YES      | ✅ Yes      | Free-text role                                |
| `dashboard_mode`      | TEXT        | YES      | ✅ Yes      | ⚠️ See issue #1 below                         |
| `onboarding_complete` | BOOLEAN     | NO       | ✅ Yes      | Gates onboarding flow                         |
| `business_name`       | TEXT        | YES      | ✅ Yes      | Shown on invoices                             |
| `business_address`    | TEXT        | YES      | ✅ Yes      | Shown on invoices                             |
| `gstin`               | TEXT        | YES      | ✅ Yes      | GST number on bills                           |
| `upi_id`              | TEXT        | YES      | ✅ Yes      | Payment QR / bill footer                      |
| `bank_name`           | TEXT        | NO       | ✅ Yes      | Invoice bank details                          |
| `account_number`      | TEXT        | NO       | ✅ Yes      | Invoice bank details                          |
| `ifsc_code`           | TEXT        | NO       | ✅ Yes      | Invoice bank details                          |
| `bill_number_prefix`  | TEXT        | YES      | ✅ Yes      | e.g. `INV`, `BILL`, `CB`                      |
| `avatar_url`          | TEXT        | YES      | ✅ Yes      | Profile photo                                 |
| `business_logo_url`   | TEXT        | YES      | ✅ Yes      | Logo on invoices                              |
| `subscription_plan`   | TEXT        | YES      | ✅ Yes      | `'free'` or paid tier                         |
| `subscription_expiry` | TIMESTAMPTZ | YES      | ✅ Yes      | Gate premium features                         |
| `created_at`          | TIMESTAMPTZ | YES      | ✅ Yes      | —                                             |

**Issues:**

> ✅ **Issue #1 — FIXED (March 8, 2026) — `dashboard_mode` canonical values aligned**  
> TypeScript `Profile.dashboard_mode` narrowed to `"seller" | "distributor" | "both" | null`.  
> `role.tsx` now uses `MODE_MAP` to write `"seller"` or `"distributor"` — values that pass the DB CHECK constraint.  
> `DashboardScreen` mode checks replaced with `isSellerMode` / `isDistributor` / `isBothMode`.  
> Stale-value migration: `UPDATE profiles SET dashboard_mode = 'seller' WHERE dashboard_mode NOT IN ('seller','distributor','both');`

---

### TABLE: `customers`

**Purpose:** All customers belonging to a vendor.  
**Primary Key:** `id` (UUID)  
**Foreign Key:** `vendor_id → profiles(id)`  
**RLS:** Enabled — vendor can only access own rows (joins through profiles to verify auth.uid)

| Column       | Type        | Nullable | Used by App | Notes                  |
| ------------ | ----------- | -------- | ----------- | ---------------------- |
| `id`         | UUID        | NO       | ✅ Yes      | —                      |
| `vendor_id`  | UUID        | NO       | ✅ Yes      | Scopes data per vendor |
| `name`       | TEXT        | NO       | ✅ Yes      | —                      |
| `phone`      | TEXT        | NO       | ✅ Yes      | Search + display       |
| `address`    | TEXT        | YES      | ✅ Yes      | Invoice footer         |
| `created_at` | TIMESTAMPTZ | YES      | ✅ Yes      | —                      |

**Issues:**

> ⚠️ **Issue #2 — `email` column missing from DB**  
> `CustomerDetail` TypeScript type has `email?: string`.  
> No `email` column exists in the `customers` table.  
> Nothing currently populates this field, but if UI ever renders it, it will always be `undefined`.

---

### TABLE: `products`

**Purpose:** Product catalogue per vendor.  
**Primary Key:** `id` (UUID)  
**Foreign Key:** `vendor_id → profiles(id)`  
**RLS:** Enabled — own rows only

| Column       | Type          | Nullable | Used by App | Notes                               |
| ------------ | ------------- | -------- | ----------- | ----------------------------------- |
| `id`         | UUID          | NO       | ✅ Yes      | —                                   |
| `vendor_id`  | UUID          | NO       | ✅ Yes      | —                                   |
| `name`       | TEXT          | NO       | ✅ Yes      | —                                   |
| `base_price` | NUMERIC(10,2) | NO       | ✅ Yes      | Default price                       |
| `image_url`  | TEXT          | YES      | ✅ Yes      | Uploaded to `product-images` bucket |
| `created_at` | TIMESTAMPTZ   | YES      | ✅ Yes      | —                                   |

**Issues:**

> ✅ **Issues #3, #4, #5 — FIXED (March 8, 2026)**  
> `fetchProducts()` now joins `product_variants` explicitly:  
> `.select('id, vendor_id, name, base_price, image_url, created_at, product_variants ( id, variant_name, price, created_at )')`  
> Return value maps `product_variants` → `variants` for backward compat with all consumers.  
> `ProductVariant` interface updated: `name` → `variant_name`.  
> `ProductCard`, `NewProductModal`, and `VariantPicker` updated to use `variant.variant_name`.

---

### TABLE: `product_variants`

**Purpose:** Size/weight/type variants for a product.  
**Primary Key:** `id` (UUID)  
**Foreign Keys:** `product_id → products(id)`, `vendor_id → profiles(id)`  
**RLS:** Enabled — own rows only

| Column         | Type          | Nullable | Used by App   | Notes |
| -------------- | ------------- | -------- | ------------- | ----- |
| `id`           | UUID          | NO       | ✅ Yes        | —     |
| `product_id`   | UUID          | NO       | ✅ Yes (join) | —     |
| `vendor_id`    | UUID          | NO       | ✅ Yes (join) | —     |
| `variant_name` | TEXT          | NO       | ✅ Yes        | —     |
| `price`        | NUMERIC(10,2) | NO       | ✅ Yes        | —     |
| `created_at`   | TIMESTAMPTZ   | YES      | ✅ Yes        | —     |

> ✅ **Issues #4 & #5 — FIXED (March 8, 2026)**  
> Table is now queried via join in `fetchProducts()`. `variant_name` field name mismatch resolved — `ProductVariant` interface updated to match DB column name.

---

### TABLE: `orders`

**Purpose:** Sales bills / invoices.  
**Primary Key:** `id` (UUID)  
**Foreign Keys:** `vendor_id → profiles(id)`, `customer_id → customers(id)`  
**RLS:** Enabled — own rows only (correct join through profiles)  
**Computed column:** `balance_due` = `total_amount - amount_paid` (GENERATED ALWAYS AS STORED)

| Column             | Type          | Nullable       | Used by App | Notes                                                |
| ------------------ | ------------- | -------------- | ----------- | ---------------------------------------------------- |
| `id`               | UUID          | NO             | ✅ Yes      | —                                                    |
| `vendor_id`        | UUID          | NO             | ✅ Yes      | —                                                    |
| `customer_id`      | UUID          | NO             | ✅ Yes      | —                                                    |
| `bill_number`      | TEXT          | NO             | ✅ Yes      | Unique per vendor, format `INV-001`                  |
| `total_amount`     | NUMERIC(10,2) | NO             | ✅ Yes      | items + tax + loading                                |
| `amount_paid`      | NUMERIC(10,2) | NO             | ✅ Yes      | —                                                    |
| `balance_due`      | NUMERIC(10,2) | NO (GENERATED) | ✅ Yes      | Computed by DB                                       |
| `previous_balance` | NUMERIC(10,2) | NO             | ✅ Yes      | Customer's prior balance at order time               |
| `loading_charge`   | NUMERIC(10,2) | NO             | ✅ Yes      | Transport fee (not taxed)                            |
| `tax_percent`      | NUMERIC(5,2)  | NO             | ✅ Yes      | GST % on items only                                  |
| `status`           | TEXT          | NO             | ✅ Yes      | CHECK: `'Paid'` \| `'Pending'` \| `'Partially Paid'` |
| `created_at`       | TIMESTAMPTZ   | YES            | ✅ Yes      | —                                                    |

**Issues:**

> ✅ **Issue #6 — FIXED (March 8, 2026)**  
> JS recalculation removed from `fetchOrders()`. Now reads `Number(o.balance_due)` directly from the DB GENERATED column.

> ✅ **Issue #7 — FIXED (March 8, 2026)**  
> `fetchOrders()` search updated. `!inner` join on `customers` added to `selectClause` when a search term is present. `.or()` filter now uses dot notation: `bill_number.ilike.%s%,customers.name.ilike.%s%,customers.phone.ilike.%s%`. Searching by customer name or phone number now returns correct results.

---

### TABLE: `order_items`

**Purpose:** Individual line items on an order.  
**Primary Key:** `id` (UUID)  
**Foreign Keys:** `order_id → orders(id)`, `vendor_id → profiles(id)`, `product_id → products(id)` (nullable)  
**RLS:** Enabled  
**Computed column:** `subtotal` = `price * quantity` (GENERATED ALWAYS AS STORED)

| Column         | Type          | Nullable       | Used by App | Notes                                   |
| -------------- | ------------- | -------------- | ----------- | --------------------------------------- |
| `id`           | UUID          | NO             | ✅ Yes      | —                                       |
| `order_id`     | UUID          | NO             | ✅ Yes      | —                                       |
| `vendor_id`    | UUID          | NO             | ✅ Yes      | —                                       |
| `product_id`   | UUID          | YES            | ✅ Yes      | Nullable — custom items have no product |
| `product_name` | TEXT          | NO             | ✅ Yes      | Denormalized at insert time             |
| `variant_name` | TEXT          | YES            | ✅ Yes      | Optional                                |
| `price`        | NUMERIC(10,2) | NO             | ✅ Yes      | —                                       |
| `quantity`     | INTEGER       | NO             | ✅ Yes      | —                                       |
| `subtotal`     | NUMERIC(10,2) | NO (GENERATED) | ✅ Yes      | —                                       |
| `created_at`   | TIMESTAMPTZ   | YES            | ✅ Yes      | —                                       |

No issues found.

---

### TABLE: `payments`

**Purpose:** Payments received from customers against orders.  
**Primary Key:** `id` (UUID)  
**Foreign Keys:** `vendor_id → profiles(id)`, `order_id → orders(id)`  
**RLS:** Enabled

| Column         | Type          | Nullable | Used by App | Notes                                         |
| -------------- | ------------- | -------- | ----------- | --------------------------------------------- |
| `id`           | UUID          | NO       | ✅ Yes      | —                                             |
| `vendor_id`    | UUID          | NO       | ✅ Yes      | —                                             |
| `order_id`     | UUID          | NO       | ✅ Yes      | —                                             |
| `amount`       | NUMERIC(10,2) | NO       | ✅ Yes      | —                                             |
| `payment_mode` | TEXT          | NO       | ✅ Yes      | CHECK: Cash \| UPI \| NEFT \| Draft \| Cheque |
| `payment_date` | TIMESTAMPTZ   | NO       | ✅ Yes      | —                                             |
| `created_at`   | TIMESTAMPTZ   | YES      | ✅ Yes      | —                                             |

**Issues:**

> ✅ **Issue #8 — FIXED (March 8, 2026)**  
> `reference` removed from `fetchPaymentsForExport()` select. `total_amount` added to the `orders` join for CSV completeness. `ExportPayment` interface updated: `reference` field removed.

> ✅ **Issue #9 — FIXED (March 8, 2026)**  
> `Payment` TypeScript interface in `src/api/orders.ts` updated: `created_at: string` field added.

---

### TABLE: `suppliers`

**Purpose:** Vendor's suppliers / distributors.  
**Primary Key:** `id` (UUID)  
**Foreign Key:** `vendor_id → profiles(id)`  
**RLS:** Enabled — ⚠️ See RLS issue below

| Column           | Type        | Nullable | Used by App | Notes                      |
| ---------------- | ----------- | -------- | ----------- | -------------------------- |
| `id`             | UUID        | NO       | ✅ Yes      | —                          |
| `vendor_id`      | UUID        | NO       | ✅ Yes      | —                          |
| `name`           | TEXT        | NO       | ✅ Yes      | —                          |
| `phone`          | TEXT        | YES      | ✅ Yes      | —                          |
| `address`        | TEXT        | YES      | ✅ Yes      | —                          |
| `basket_mark`    | TEXT        | YES      | ✅ Yes      | Custom supplier identifier |
| `bank_name`      | TEXT        | YES      | ✅ Yes      | For payment detail display |
| `account_number` | TEXT        | YES      | ✅ Yes      | —                          |
| `ifsc_code`      | TEXT        | YES      | ✅ Yes      | —                          |
| `created_at`     | TIMESTAMPTZ | NO       | ✅ Yes      | —                          |

**Issues:**

> ✅ **Issue #10 — FIXED (March 8, 2026)**  
> All 4 supplier table RLS policies updated to the correct join-through-profiles pattern:  
> `USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))`  
> Policy names updated to `"Vendors can manage own suppliers/deliveries/delivery items/payments made"`.  
> Applied via Supabase SQL Editor. `schema.sql` updated to match.

---

### TABLE: `supplier_deliveries`

**Purpose:** Records of goods received from a supplier.  
**Primary Key:** `id` (UUID)  
**Foreign Keys:** `vendor_id → profiles(id)`, `supplier_id → suppliers(id)`  
**RLS:** Enabled — ✅ Fixed (see Issue #10)

| Column           | Type          | Nullable | Used by App | Notes                             |
| ---------------- | ------------- | -------- | ----------- | --------------------------------- |
| `id`             | UUID          | NO       | ✅ Yes      | —                                 |
| `vendor_id`      | UUID          | NO       | ✅ Yes      | —                                 |
| `supplier_id`    | UUID          | NO       | ✅ Yes      | —                                 |
| `delivery_date`  | DATE          | NO       | ✅ Yes      | —                                 |
| `loading_charge` | NUMERIC(10,2) | NO       | ✅ Yes      | Freight added to total            |
| `advance_paid`   | NUMERIC(10,2) | NO       | ✅ Yes      | Recorded as `payments_made` entry |
| `total_amount`   | NUMERIC(10,2) | NO       | ✅ Yes      | items subtotal + loading_charge   |
| `notes`          | TEXT          | YES      | ✅ Yes      | —                                 |
| `created_at`     | TIMESTAMPTZ   | NO       | ✅ Yes      | —                                 |

---

### TABLE: `supplier_delivery_items`

**Purpose:** Line items within a supplier delivery.  
**Primary Key:** `id` (UUID)  
**Foreign Keys:** `delivery_id → supplier_deliveries(id)`, `vendor_id → profiles(id)`  
**RLS:** Enabled — ✅ Fixed (see Issue #10)  
**Computed column:** `subtotal` = `quantity * rate` (GENERATED ALWAYS AS STORED)

| Column        | Type          | Nullable       | Used by App | Notes                    |
| ------------- | ------------- | -------------- | ----------- | ------------------------ |
| `id`          | UUID          | NO             | ✅ Yes      | —                        |
| `delivery_id` | UUID          | NO             | ✅ Yes      | —                        |
| `vendor_id`   | UUID          | NO             | ✅ Yes      | —                        |
| `item_name`   | TEXT          | NO             | ✅ Yes      | Free-text, no product FK |
| `quantity`    | NUMERIC(10,3) | NO             | ✅ Yes      | Supports fractions       |
| `rate`        | NUMERIC(10,2) | NO             | ✅ Yes      | Per-unit price           |
| `subtotal`    | NUMERIC(10,2) | NO (GENERATED) | ✅ Yes      | —                        |
| `created_at`  | TIMESTAMPTZ   | NO             | ✅ Yes      | —                        |

---

### TABLE: `payments_made`

**Purpose:** Payments made BY the vendor TO suppliers.  
**Primary Key:** `id` (UUID)  
**Foreign Keys:** `vendor_id → profiles(id)`, `supplier_id → suppliers(id)`, `delivery_id → supplier_deliveries(id)` (nullable)  
**RLS:** Enabled — ✅ Fixed (see Issue #10)

| Column         | Type          | Nullable | Used by App         | Notes                                         |
| -------------- | ------------- | -------- | ------------------- | --------------------------------------------- |
| `id`           | UUID          | NO       | ✅ Yes (indirectly) | —                                             |
| `vendor_id`    | UUID          | NO       | ✅ Yes              | —                                             |
| `supplier_id`  | UUID          | NO       | ✅ Yes              | —                                             |
| `delivery_id`  | UUID          | YES      | ✅ Yes              | set when advance paid at delivery             |
| `amount`       | NUMERIC(10,2) | NO       | ✅ Yes              | CHECK: amount > 0                             |
| `payment_mode` | TEXT          | NO       | ✅ Yes              | CHECK: Cash \| UPI \| NEFT \| Draft \| Cheque |
| `notes`        | TEXT          | YES      | ✅ Yes              | —                                             |
| `created_at`   | TIMESTAMPTZ   | NO       | ✅ Yes              | —                                             |

---

## RPC Functions

| Function                        | Called From         | Parameters                               | Returns   | Purpose                                                                         |
| ------------------------------- | ------------------- | ---------------------------------------- | --------- | ------------------------------------------------------------------------------- |
| `get_next_bill_number`          | `src/api/orders.ts` | `vendor_uuid UUID`, `prefix TEXT`        | `TEXT`    | Returns next sequential bill number e.g. `INV-042`. Scoped per vendor + prefix. |
| `get_customer_previous_balance` | `src/api/orders.ts` | `customer_uuid UUID`, `vendor_uuid UUID` | `NUMERIC` | Sum of all unpaid order balances for a customer. Used on order creation.        |

Both functions have fallback logic in the app if the RPC fails (timestamp-based bill number, manual SUM query).

---

## RLS Policies

### Correct Pattern (customers, products, orders, payments, order_items, product_variants)

```sql
USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
```

All CRUD operations. Correctlyl resolves `auth.uid()` → `profiles.id` → `vendor_id`.

### Supplier Tables — Fixed Pattern (suppliers, supplier_deliveries, supplier_delivery_items, payments_made)

```sql
USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
-- FIXED March 8, 2026: now matches the correct customers/orders/products pattern
```

All 4 supplier tables were updated via Supabase SQL Editor. `schema.sql` reflects the new policies.

### Profiles

```sql
USING (auth.uid() = user_id)
-- Correct — user_id is the auth.users FK
```

---

## Storage

| Bucket           | Used For       | Upload Path                          | Access                          |
| ---------------- | -------------- | ------------------------------------ | ------------------------------- |
| `product-images` | Product photos | `products/product_{timestamp}.{ext}` | Public URL (via `getPublicUrl`) |

---

## Triggers

| Trigger                | Table        | Function            | Event        | Purpose                                |
| ---------------------- | ------------ | ------------------- | ------------ | -------------------------------------- |
| `on_auth_user_created` | `auth.users` | `handle_new_user()` | AFTER INSERT | Auto-creates `profiles` row on sign-up |

---

## Indexes

| Index                                 | Table               | Columns         | Type  |
| ------------------------------------- | ------------------- | --------------- | ----- |
| `idx_customers_vendor`                | customers           | vendor_id       | BTREE |
| `idx_customers_phone`                 | customers           | phone           | BTREE |
| `idx_products_vendor`                 | products            | vendor_id       | BTREE |
| `idx_product_variants_product`        | product_variants    | product_id      | BTREE |
| `idx_orders_vendor`                   | orders              | vendor_id       | BTREE |
| `idx_orders_customer`                 | orders              | customer_id     | BTREE |
| `idx_orders_status`                   | orders              | status          | BTREE |
| `idx_orders_created_at`               | orders              | created_at DESC | BTREE |
| `idx_order_items_order`               | order_items         | order_id        | BTREE |
| `idx_payments_order`                  | payments            | order_id        | BTREE |
| `idx_supplier_deliveries_supplier` ✅ | supplier_deliveries | supplier_id     | BTREE |
| `idx_payments_made_supplier` ✅       | payments_made       | supplier_id     | BTREE |
| `idx_payments_vendor` ✅              | payments            | vendor_id       | BTREE |

> ✅ **3 supplier-domain indexes added March 8, 2026** — previously missing, causing full table scans on supplier list, supplier detail, and dashboard load.

---

## Issues Summary

| #   | Severity | Table                                                                          | Issue                                                                                                                                                                |
| --- | -------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ✅ Fixed | `profiles`                                                                     | `dashboard_mode` values aligned: `MODE_MAP` in `role.tsx` writes `'seller'`/`'distributor'`. Stale rows migrated. DB CHECK constraint enforced. Fixed March 8, 2026. |
| 2   | 🟡 Low   | `customers`                                                                    | `email` field in `CustomerDetail` type has no corresponding DB column — always `undefined`. Deferred (non-breaking).                                                 |
| 3   | ✅ Fixed | `products`                                                                     | `fetchProducts` now joins `product_variants` explicitly. `variants` array populated. Fixed March 8, 2026.                                                            |
| 4   | ✅ Fixed | `product_variants`                                                             | Table now fully queried via join in `fetchProducts`. Fixed March 8, 2026.                                                                                            |
| 5   | ✅ Fixed | `product_variants`                                                             | `ProductVariant.name` → `variant_name` to match DB column. Fixed March 8, 2026.                                                                                      |
| 6   | ✅ Fixed | `orders`                                                                       | Removed app-side `balance_due` recalculation — now reads `Number(o.balance_due)` from DB GENERATED column. Fixed March 8, 2026.                                      |
| 7   | ✅ Fixed | `orders`                                                                       | `fetchOrders` search updated: `!inner` join on `customers`, `.or()` uses dot notation for `customers.name` / `customers.phone`. Fixed March 8, 2026.                 |
| 8   | ✅ Fixed | `payments`                                                                     | `fetchPaymentsForExport` no longer selects non-existent `reference` column. `total_amount` added to join. Fixed March 8, 2026.                                       |
| 9   | ✅ Fixed | `payments`                                                                     | `Payment` TypeScript interface updated: `created_at: string` added. Fixed March 8, 2026.                                                                             |
| 10  | ✅ Fixed | `suppliers`, `supplier_deliveries`, `supplier_delivery_items`, `payments_made` | RLS policies updated to `vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`. Fixed March 8, 2026.                                                    |

---

## Column Usage Summary

### Columns defined in schema but NEVER read by any API

| Table              | Column       | Reason Unused                                                 |
| ------------------ | ------------ | ------------------------------------------------------------- |
| `product_variants` | All columns  | Table never queried                                           |
| `profiles`         | `role`       | Selected via `select("*")` but never used in any screen logic |
| `payments`         | `created_at` | Not in Payment TS interface; never displayed                  |

### Columns read by app but MISSING from schema

| Table       | Column      | Where Referenced                                     |
| ----------- | ----------- | ---------------------------------------------------- |
| `payments`  | `reference` | `src/api/export.ts` → `fetchPaymentsForExport`       |
| `customers` | `email`     | `src/types/customer.ts` → `CustomerDetail` interface |
