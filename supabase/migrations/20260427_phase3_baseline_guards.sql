-- Phase 3 baseline guards and schema cleanup
--
-- Gap 1: Guard orders.due_date from being set before created_at
-- Gap 2: Remove supplier-only fields from parties and enforce customer-only constraint
-- Gap 3: Drop dead profiles.dashboard_mode

-- Gap 1
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_due_date_reasonable;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_due_date_reasonable
  CHECK (due_date IS NULL OR due_date >= created_at::date);

-- Gap 2 (safety check: refuse to proceed if any supplier parties exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.parties WHERE is_supplier = true) THEN
    RAISE EXCEPTION 'Cannot enforce customer-only constraint: parties.is_supplier=true exists.';
  END IF;
END $$;

ALTER TABLE public.parties
  DROP COLUMN IF EXISTS basket_mark;

ALTER TABLE public.parties
  DROP COLUMN IF EXISTS supplier_balance;

ALTER TABLE public.parties
  DROP COLUMN IF EXISTS is_supplier;

ALTER TABLE public.parties
  DROP CONSTRAINT IF EXISTS parties_at_least_one_role;

ALTER TABLE public.parties
  DROP CONSTRAINT IF EXISTS parties_is_customer_only;

ALTER TABLE public.parties
  ADD CONSTRAINT parties_is_customer_only
  CHECK (is_customer = true);

-- Gap 3
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS dashboard_mode;
