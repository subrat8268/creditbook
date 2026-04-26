-- =============================================================================
-- Phase 1 — DB Cleanup & Lockup
-- KredBook App
-- Date: April 26, 2026
-- Notion: https://www.notion.so/35d6671b85a74a6497a8f17f67d88949
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Drop dead product_id + variant_id columns from order_items
--    These are null always — legacy from product-based model
-- ----------------------------------------------------------------------------
ALTER TABLE order_items
  DROP COLUMN IF EXISTS product_id,
  DROP COLUMN IF EXISTS variant_id;

-- ----------------------------------------------------------------------------
-- 2. Add due_date to orders
--    Required for overdue logic on dashboard
-- ----------------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_vendor_due
  ON orders (vendor_id, due_date)
  WHERE status != 'Paid';

-- ----------------------------------------------------------------------------
-- 3. Expand payment_mode + add payment_date to payments
--    Supports: Cash | UPI | NEFT | Draft | Cheque | Bank Transfer
-- ----------------------------------------------------------------------------
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_payment_mode_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_payment_mode_check
  CHECK (payment_mode IN ('Cash','UPI','NEFT','Draft','Cheque','Bank Transfer'));

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ DEFAULT now();

-- ----------------------------------------------------------------------------
-- 4. Add notes + avatar_url + email to parties
--    Required for Customer Detail screen redesign
-- ----------------------------------------------------------------------------
ALTER TABLE parties
  ADD COLUMN IF NOT EXISTS notes      TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS email      TEXT;

-- ----------------------------------------------------------------------------
-- 5. DB Lockup — enforce customer-only constraint on parties
--    Suppliers are fully removed; lock contract at DB level
-- ----------------------------------------------------------------------------
ALTER TABLE parties
  DROP CONSTRAINT IF EXISTS parties_customer_only;

ALTER TABLE parties
  ADD CONSTRAINT parties_customer_only
  CHECK (is_customer = TRUE);

-- =============================================================================
-- END Phase 1 Cleanup
-- Next: Regenerate database.types.ts then move to Phase 2 — Hardening
-- =============================================================================
