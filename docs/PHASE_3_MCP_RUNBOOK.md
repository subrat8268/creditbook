# Phase 3 — MCP Runbook (Gemini)

Supabase CLI is not available in this environment. Use your Gemini MCP connection to apply DB changes.

## Apply migrations (Phase 3)

Run the SQL from this file in Supabase SQL Editor or via MCP `execute_sql`:

- `supabase/migrations/20260409_add_update_order_transaction.sql`
- `supabase/migrations/20260409_schema_hardening.sql`
- `supabase/migrations/20260409_drop_legacy_customers_suppliers.sql`

## Verify

1) Confirm function exists:

```sql
select proname from pg_proc where proname = 'update_order_transaction';
```

2) Verify constraints:

```sql
select conname
from pg_constraint
where conrelid = 'public.orders'::regclass
  and conname in (
    'orders_total_amount_nonnegative',
    'orders_amount_paid_nonnegative',
    'orders_amount_paid_lte_total'
  );
```

3) Confirm order_items.product_id is nullable:

```sql
select is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'order_items'
  and column_name = 'product_id';
```

## Hardening verification

1) Check indexes:

```sql
select indexname from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_order_items_order',
    'idx_payments_order',
    'idx_payments_vendor',
    'idx_orders_vendor_balance_due'
  );
```

2) Verify storage buckets:

```sql
select id, public from storage.buckets
where id in ('product-images', 'business-logos');
```

3) Verify storage policies:

```sql
select policyname
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'Public read for public buckets',
    'Product images upload',
    'Product images read',
    'Business logos upload',
    'Business logos read',
    'Business logos update'
  );
```

## Legacy drop verification

```sql
select relname
from pg_class
where relname in ('customers', 'suppliers', 'customers_view', 'suppliers_view');
```

4) Verify Order Status Hardening:

```sql
SELECT column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'status';

SELECT consrc 
FROM pg_constraint 
WHERE conname = 'orders_status_check';
```

5) Verify Performance Indexes:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE indexname IN (
  'idx_orders_vendor_balance_due',
  'idx_order_items_order',
  'idx_payments_order',
  'idx_payments_vendor'
);
```

6) Verify Public Storage Policy:

```sql
SELECT policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname = 'Public read for public buckets';
```

## Notes

The API now calls `update_order_transaction` when available.
The status 'Unpaid' has been deprecated in favor of 'Pending'.
Storage buckets are public-readable via global policy.
