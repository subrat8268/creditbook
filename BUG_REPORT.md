# CreditBook Audit & Bug Report

**Date**: April 5, 2026
**Scope**: Configuration, Core Entry Points, API Routes, Data Models, SQL Schema.

This report contains a structured list of bugs, performance bottlenecks, and architectural issues discovered during the code audit.

---

## 🛑 1. Critical Concurrency & Transaction Bugs
**Location**: `src/api/orders.ts`

### 1.1 Non-Transactional Order Creation (Race Condition / Data Corruption)
**Issue**: `createOrder()` sequentially executes inserts across three tables (`orders`, `order_items`, `payments`) using separate network requests.
**Risk**: If `order_items` or `payments` fail to insert (due to network failure or validation error), the parent `order` remains in the database without items, causing a corrupted state.
**Fix**: Move the entire logic of `createOrder` into a Supabase Postgres RPC (Remote Procedure Call) so it runs entirely within a single database transaction.

### 1.2 Redundant & Dangerous Payment Processing
**Issue**: When recording a payment, `recordPayment()` reads the current order, calculates `newPaid = currentPaid + paymentAmount` via JavaScript, and updates the `orders` table. 
**Risk**: If multiple payments arrive simultaneously, the client calculates the new total based on stale data, overwriting legitimate payments.
**Fix**: `schema.sql` (Line 545) already has a database trigger `on_payment_upsert` that automatically recalculates the parent order's `amount_paid` and `status` natively! The frontend should *only* insert into the `payments` table and drop the manual parent `orders` table update entirely.

---

## 🔒 2. Database Constraints & Security (RLS)
**Location**: `schema.sql`, DB Configuration

### 2.1 Multi-Tenant Data Violation via Global Index
**Issue**: The `customers_phone_idx` applies a global `UNIQUE` constraint on the phone number across all records. 
**Risk**: If Vendor A registers a customer with phone "9999999999", Vendor B cannot register a customer with that same phone number, breaking multi-tenancy rules.
**Fix**: Drop the global `customers_phone_idx` and ensure the composite unique constraint `customers_vendor_phone_idx` (Vendor ID + Phone) is used instead.

---

## 🐌 3. Messy Code & Client-Side N+1 Performance Issues
**Location**: `src/api/customers.ts`

### 3.1 Heavy Client-Side Aggregations
**Issue**: `fetchCustomerDetail()` manually fetches `orders`, `payments`, and `order_items` across three sequential parallel requests. It then manually joins them and iterates through them to calculate `runningBalance` and `outstandingBalance` in JavaScript.
**Risk**: As a customer accumulates hundreds of transactions over time, the app will download substantial unnecessary data arrays and freeze the UI doing expensive calculations.
**Fix**: Create a Postgres View or RPC (e.g. `customer_statement_view`) that automatically yields the pre-computed running balance.

### 3.2 Unhandled Empty Arrays in Supabase `.in()` Filter
**Issue**: `fetchCustomers` passes `customers.map(c => c.id)` directly into a Supabase `.in()` query (Line 49).
**Risk**: If `customers` is an empty array (page has no data or vendor is new), `.in()` will inherently fail or return a native database syntax error.
**Fix**: Add an early return if `customers.length === 0` to skip the subsequent balance and overdue queries.

---

## 🧹 4. Poor Practices & State Management
**Location**: `src/hooks/useAuth.ts`, `src/api/orders.ts`

### 4.1 Busy-Wait Loop in Auth Hooks
**Issue**: `useGoogleSignIn` and `useSignUp` utilize an artificial `while(retries > 0) { await setTimeout(600) }` loop specifically to wait for the Supabase Postgres trigger (`handle_new_user`) to create the `profiles` database row.
**Fix**: Rely natively on `onAuthStateChange`. Supabase Auth guarantees the user session. If the profile row takes seconds to commit, use an active subscription stream (`.on('postgres_changes')`) or handle the fallback upsert immediately on login.

### 4.2 Recomputation of Generated Database Columns
**Issue**: In `fetchOrders` and `fetchOrderDetail`, the `balance_due` column is explicitly recalculated via JavaScript `Number(total_amount) - Number(amount_paid)`.
**Fix**: The database schema generates this automatically: `balance_due NUMERIC(10,2) GENERATED ALWAYS AS (...) STORED`. The JS code does not need to recompute it. Remove redundant Javascript calculations.

### 4.3 Broad Error Swallowing
**Issue**: `signUpApi` catches all errors and obscures them into broad strings ("A server error occurred. Please try again in a moment.").
**Fix**: Standardize an API error parser (`toApiError`) to extract structured messages instead of blindly masking the true database error payload.
