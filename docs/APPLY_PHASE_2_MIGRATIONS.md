# Phase 2: Database Migration Guide

**Phase:** 2 - Clean Architecture  
**Migration Date:** April 8, 2026  
**Database:** Supabase (sfmoefgjmgkwvauyaiyz.supabase.co)

---

## Overview

This guide walks through applying Phase 2 database migrations that create the unified `parties` table and migrate data from the legacy `customers` and `suppliers` tables.

**Total Migrations:** 5 files  
**Estimated Time:** 5-10 minutes  
**Risk Level:** Low (additive migrations, no data deletion)

---

## Pre-Migration Checklist

Before running migrations:

- [ ] **Backup database** (Supabase Dashboard → Settings → Database → Create backup)
- [ ] **Test locally first** (optional but recommended)
- [ ] **Verify current data counts:**
  ```sql
  SELECT COUNT(*) AS customer_count FROM customers;
  SELECT COUNT(*) AS supplier_count FROM suppliers;
  SELECT COUNT(*) AS order_count FROM orders;
  SELECT COUNT(*) AS delivery_count FROM supplier_deliveries;
  ```
- [ ] **Record baseline numbers** for verification after migration

---

## Migration Files (Run in Order)

### 1. Create Parties Table
**File:** `20260408_create_parties_table.sql`

**What it does:**
- Creates new `parties` table with unified schema
- Adds indexes for performance
- Sets up RLS policies
- Creates `updated_at` trigger

**Run in Supabase SQL Editor:**
```bash
# Copy file contents
cat supabase/migrations/20260408_create_parties_table.sql

# Paste into Supabase Dashboard → SQL Editor → Run
```

**Expected output:**
```
CREATE TABLE
CREATE INDEX (5 statements)
ALTER TABLE
CREATE POLICY
CREATE FUNCTION
CREATE TRIGGER
```

**Verification:**
```sql
-- Check table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'parties';

-- Should show 16 columns
```

---

### 2. Migrate Customers → Parties
**File:** `20260408_migrate_customers_to_parties.sql`

**What it does:**
- Copies all customer records to `parties` table
- Preserves original UUIDs (critical for foreign keys!)
- Calculates customer balances from orders
- Sets `is_customer=TRUE`, `is_supplier=FALSE`

**Run in Supabase SQL Editor:**
```bash
cat supabase/migrations/20260408_migrate_customers_to_parties.sql
# Paste and run
```

**Expected output:**
```
NOTICE:  === CUSTOMER MIGRATION COMPLETE ===
NOTICE:  Total customers in source table: 42
NOTICE:  Total customers migrated to parties: 42
NOTICE:  Total customer balance (receivables): ₹125000.00
NOTICE:  All customers successfully migrated! ✓
```

**Verification:**
```sql
-- Count should match customers table
SELECT COUNT(*) FROM parties WHERE is_customer = TRUE;
SELECT COUNT(*) FROM customers;

-- Check sample record
SELECT * FROM parties WHERE is_customer = TRUE LIMIT 1;
```

---

### 3. Migrate Suppliers → Parties
**File:** `20260408_migrate_suppliers_to_parties.sql`

**What it does:**
- Copies all supplier records to `parties` table
- Preserves original UUIDs
- Calculates supplier balances from deliveries/payments
- Sets `is_customer=FALSE`, `is_supplier=TRUE`
- Handles edge case: party that's BOTH customer AND supplier

**Run in Supabase SQL Editor:**
```bash
cat supabase/migrations/20260408_migrate_suppliers_to_parties.sql
# Paste and run
```

**Expected output:**
```
NOTICE:  === SUPPLIER MIGRATION COMPLETE ===
NOTICE:  Total suppliers in source table: 18
NOTICE:  Total suppliers migrated to parties: 18
NOTICE:  Parties with BOTH customer & supplier roles: 2
NOTICE:  Total supplier balance (payables): ₹78000.00
NOTICE:  All suppliers successfully migrated! ✓
NOTICE:  Found 2 parties that are BOTH customers AND suppliers! This is expected and handled correctly.
```

**Verification:**
```sql
-- Count should match suppliers table
SELECT COUNT(*) FROM parties WHERE is_supplier = TRUE;
SELECT COUNT(*) FROM suppliers;

-- Check dual-role parties (interesting!)
SELECT name, is_customer, is_supplier, customer_balance, supplier_balance
FROM parties 
WHERE is_customer = TRUE AND is_supplier = TRUE;
```

---

### 4. Update Foreign Key Comments
**File:** `20260408_update_foreign_key_comments.sql`

**What it does:**
- Adds documentation comments to columns that reference parties
- NO schema changes (FKs still work because UUIDs preserved)

**Run in Supabase SQL Editor:**
```bash
cat supabase/migrations/20260408_update_foreign_key_comments.sql
# Paste and run
```

**Expected output:**
```
NOTICE:  === FOREIGN KEY MIGRATION COMPLETE ===
NOTICE:  No schema changes required! All foreign keys still work because UUIDs were preserved.
NOTICE:  Added documentation comments to clarify new relationships.
```

**Verification:**
```sql
-- Check foreign keys still work
SELECT o.id, o.bill_number, p.name
FROM orders o
JOIN parties p ON p.id = o.customer_id
LIMIT 5;

-- Should return results without errors
```

---

### 5. Create Compatibility Views (Optional)
**File:** `20260408_create_compatibility_views.sql`

**What it does:**
- Creates `customers_view` and `suppliers_view`
- Allows old frontend code to still work during transition
- Read-only views (no INSERT/UPDATE support)

**Run in Supabase SQL Editor:**
```bash
cat supabase/migrations/20260408_create_compatibility_views.sql
# Paste and run
```

**Expected output:**
```
NOTICE:  === COMPATIBILITY VIEWS CREATED ===
NOTICE:  customers_view: 42 records
NOTICE:  suppliers_view: 18 records
```

**Verification:**
```sql
-- Test views work like old tables
SELECT * FROM customers_view LIMIT 5;
SELECT * FROM suppliers_view LIMIT 5;
```

---

### 6. Deprecate Old Tables
**File:** `20260408_deprecate_old_tables.sql`

**What it does:**
- Adds deprecation warnings to `customers` and `suppliers` tables
- Verifies data integrity (counts match)
- **Does NOT drop tables** (kept as backup in Phase 2)

**Run in Supabase SQL Editor:**
```bash
cat supabase/migrations/20260408_deprecate_old_tables.sql
# Paste and run
```

**Expected output:**
```
NOTICE:  === TABLES MARKED AS DEPRECATED ===
NOTICE:  
NOTICE:  Data integrity verification:
NOTICE:    customers table: 42 records
NOTICE:    parties (is_customer=true): 42 records
NOTICE:    ✓ Customer counts match!
NOTICE:  
NOTICE:    suppliers table: 18 records
NOTICE:    parties (is_supplier=true): 18 records
NOTICE:    ✓ Supplier counts match!
NOTICE:  
NOTICE:  Tables customers and suppliers are now DEPRECATED.
NOTICE:  They are kept as backup during Phase 2.
NOTICE:  Will be dropped in Phase 3 after successful migration verification.
```

**Verification:**
```sql
-- Check table comments
SELECT obj_description('customers'::regclass);
SELECT obj_description('suppliers'::regclass);

-- Should show "DEPRECATED" warnings
```

---

## Post-Migration Verification

### Full Data Integrity Check

```sql
-- 1. Verify row counts match
WITH counts AS (
  SELECT 
    (SELECT COUNT(*) FROM customers) AS old_customers,
    (SELECT COUNT(*) FROM suppliers) AS old_suppliers,
    (SELECT COUNT(*) FROM parties WHERE is_customer = TRUE) AS new_customers,
    (SELECT COUNT(*) FROM parties WHERE is_supplier = TRUE) AS new_suppliers
)
SELECT 
  old_customers,
  new_customers,
  CASE WHEN old_customers = new_customers THEN '✓' ELSE '✗ MISMATCH!' END AS customers_ok,
  old_suppliers,
  new_suppliers,
  CASE WHEN old_suppliers = new_suppliers THEN '✓' ELSE '✗ MISMATCH!' END AS suppliers_ok
FROM counts;

-- 2. Verify foreign keys intact
SELECT 
  COUNT(*) AS total_orders,
  COUNT(DISTINCT customer_id) AS distinct_customers
FROM orders;

SELECT 
  COUNT(*) AS total_deliveries,
  COUNT(DISTINCT supplier_id) AS distinct_suppliers
FROM supplier_deliveries;

-- 3. Check for any NULL balances (shouldn't happen)
SELECT COUNT(*) AS null_customer_balances
FROM parties
WHERE is_customer = TRUE AND customer_balance IS NULL;

SELECT COUNT(*) AS null_supplier_balances
FROM parties
WHERE is_supplier = TRUE AND supplier_balance IS NULL;

-- Should be 0 for both

-- 4. Sample join test (critical!)
SELECT 
  o.bill_number,
  p.name AS customer_name,
  o.total_amount
FROM orders o
JOIN parties p ON p.id = o.customer_id
WHERE o.created_at > NOW() - INTERVAL '7 days'
LIMIT 10;

-- Should return recent orders with customer names
```

---

## Rollback Plan (If Needed)

If something goes wrong:

### Option 1: Drop Parties Table (Preserve Old Tables)
```sql
-- This is safe because we didn't drop customers/suppliers yet
DROP TABLE parties CASCADE;

-- Old tables still intact, app still works
```

### Option 2: Restore from Backup
1. Go to Supabase Dashboard → Settings → Database → Backups
2. Select backup created before migration
3. Click "Restore"

---

## Success Criteria

Migration is successful if ALL these pass:

- [x] `parties` table exists with correct schema
- [x] Customer count matches: `customers` = `parties WHERE is_customer=TRUE`
- [x] Supplier count matches: `suppliers` = `parties WHERE is_supplier=TRUE`
- [x] Foreign key joins work: `orders JOIN parties` returns results
- [x] No NULL balances in `parties` table
- [x] Compatibility views return correct data
- [x] No errors in Supabase logs

---

## Next Steps After Migration

Once database migration is complete:

1. **Update TypeScript types:**
   ```bash
   npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/supabase.ts
   ```

2. **Create `useParties` hook** (see PHASE_2_CLEAN_ARCHITECTURE.md Part 3)

3. **Test app still works** with old `useCustomers` hook (should work via compatibility views)

4. **Gradually migrate frontend** to use `useParties` instead of `useCustomers`

5. **Drop old tables in Phase 3** (after 2-4 weeks of stable production use)

---

## Migration Status Tracker

| Migration Step | Status | Date | Verified By |
|----------------|--------|------|-------------|
| 1. Create parties table | ⬜ Pending | - | - |
| 2. Migrate customers | ⬜ Pending | - | - |
| 3. Migrate suppliers | ⬜ Pending | - | - |
| 4. Update FK comments | ⬜ Pending | - | - |
| 5. Create views | ⬜ Pending | - | - |
| 6. Deprecate old tables | ⬜ Pending | - | - |
| Post-migration verification | ⬜ Pending | - | - |

---

## Support

If you encounter issues:

1. **Check Supabase Logs:** Dashboard → Logs → Postgres
2. **Verify migration order:** Run files in exact sequence listed above
3. **Review error messages:** PostgreSQL errors are usually clear about the issue
4. **Rollback if needed:** See Rollback Plan section above

**Ready to begin migration!** 🚀
