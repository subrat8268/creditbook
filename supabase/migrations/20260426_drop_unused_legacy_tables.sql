-- Drop unused legacy tables and supplier-only columns.
--
-- Notes:
-- - KredBook is strict single-mode (Customer/Entry/Payment). Supplier/product catalog surfaces are legacy.
-- - Apply after app code stops querying these tables/columns.

DROP TABLE IF EXISTS public.supplier_delivery_items CASCADE;
DROP TABLE IF EXISTS public.supplier_deliveries CASCADE;
DROP TABLE IF EXISTS public.payments_made CASCADE;

DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;

ALTER TABLE public.parties DROP COLUMN IF EXISTS is_supplier;
ALTER TABLE public.parties DROP COLUMN IF EXISTS supplier_balance;
