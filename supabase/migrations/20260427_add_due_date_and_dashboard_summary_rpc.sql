-- Add due_date to orders and create get_dashboard_summary RPC.
--
-- This aligns the database with the product truth:
-- overdue = unpaid entries past due_date.

-- 1) Orders: add due_date
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS due_date date;

-- Backfill for existing rows: preserve prior "30 days" heuristic.
UPDATE public.orders
SET due_date = (created_at::date + 30)
WHERE due_date IS NULL;

-- Default for new rows (app may still explicitly set due_date later)
ALTER TABLE public.orders
  ALTER COLUMN due_date SET DEFAULT (CURRENT_DATE + 30);

-- Query helper for due-date lookups (predicate is immutable)
CREATE INDEX IF NOT EXISTS idx_orders_vendor_due_date
  ON public.orders (vendor_id, due_date)
  WHERE balance_due > 0;

-- 2) RPC: get_dashboard_summary
-- Returns:
-- - total_outstanding: sum(balance_due) for unpaid entries
-- - total_overdue: sum(balance_due) where due_date < today
-- - overdue_customers_count: distinct customers with overdue balance
-- - top_overdue_customers: top 5 overdue customers by outstanding
-- - total_customers_count: count of customers
-- - total_entries_count: count of entries
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS TABLE(
  total_outstanding numeric,
  total_overdue numeric,
  overdue_customers_count bigint,
  top_overdue_customers jsonb,
  total_customers_count bigint,
  total_entries_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH me AS (
    SELECT p.id AS vendor_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
    LIMIT 1
  ),
  base AS (
    SELECT o.*
    FROM public.orders o
    JOIN me ON me.vendor_id = o.vendor_id
    WHERE o.balance_due > 0
  ),
  overdue AS (
    SELECT b.*
    FROM base b
    WHERE b.due_date IS NOT NULL
      AND b.due_date < CURRENT_DATE
  ),
  overdue_by_customer AS (
    SELECT
      o.customer_id,
      p.name,
      p.phone,
      SUM(o.balance_due) AS balance,
      MIN(o.due_date) AS oldest_due
    FROM overdue o
    JOIN public.parties p ON p.id = o.customer_id
    GROUP BY o.customer_id, p.name, p.phone
  ),
  top5 AS (
    SELECT *
    FROM overdue_by_customer
    ORDER BY balance DESC
    LIMIT 5
  )
  SELECT
    COALESCE((SELECT SUM(b.balance_due) FROM base b), 0) AS total_outstanding,
    COALESCE((SELECT SUM(o.balance_due) FROM overdue o), 0) AS total_overdue,
    COALESCE((SELECT COUNT(DISTINCT o.customer_id) FROM overdue o), 0) AS overdue_customers_count,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', t.customer_id,
            'name', t.name,
            'phone', COALESCE(t.phone, ''),
            'balance', t.balance,
            'daysSince', GREATEST((CURRENT_DATE - t.oldest_due), 0)
          )
        )
        FROM top5 t
      ),
      '[]'::jsonb
    ) AS top_overdue_customers,
    COALESCE(
      (
        SELECT COUNT(*)
        FROM public.parties c
        JOIN me ON me.vendor_id = c.vendor_id
        WHERE c.is_customer = true
      ),
      0
    ) AS total_customers_count,
    COALESCE(
      (
        SELECT COUNT(*)
        FROM public.orders o
        JOIN me ON me.vendor_id = o.vendor_id
      ),
      0
    ) AS total_entries_count;
$$;
