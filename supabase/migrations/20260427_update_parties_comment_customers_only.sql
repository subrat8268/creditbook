-- Align parties table comment with strict single-mode khata truth.
-- parties is customers-only (enforced by parties_is_customer_only CHECK).

COMMENT ON TABLE public.parties IS
  'Customers table (single-mode khata). Suppliers/products are out of scope; all rows are customers.';

COMMENT ON COLUMN public.parties.is_customer IS
  'Deprecated: always TRUE. Kept for legacy compatibility; enforced by parties_is_customer_only CHECK.';
