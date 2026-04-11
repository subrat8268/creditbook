-- =============================================================================
-- KredBook - Security Hardening (P0)
-- Date: 2026-04-10
-- Purpose:
--   1) Lock down public access to access_tokens
--   2) Add auth checks to ledger RPCs
--   3) Prevent cross-vendor payment tampering
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) ACCESS TOKENS: REMOVE PUBLIC SELECT POLICY
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public read via valid token" ON access_tokens;
DROP POLICY IF EXISTS "Public read access via valid token" ON access_tokens;

-- Ensure vendors can still read/manage their tokens (policy may already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_tokens'
      AND policyname = 'Vendors manage own tokens'
  ) THEN
    CREATE POLICY "Vendors manage own tokens" ON access_tokens FOR ALL
      USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2) HARDEN ACCESS TOKEN FUNCTIONS
-- -----------------------------------------------------------------------------

-- Make tokens longer to reduce brute-force risk (20 chars)
CREATE OR REPLACE FUNCTION generate_access_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    new_token := '';
    FOR i IN 1..20 LOOP
      new_token := new_token || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    SELECT EXISTS(SELECT 1 FROM access_tokens WHERE token = new_token) INTO token_exists;
    IF NOT token_exists THEN
      RETURN new_token;
    END IF;
  END LOOP;
END;
$$;

-- Only allow the authenticated vendor to create/access their own tokens
CREATE OR REPLACE FUNCTION get_or_create_access_token(
  p_vendor_id UUID,
  p_customer_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
  v_profile_id UUID;
BEGIN
  -- Require authenticated user
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_profile_id IS NULL OR v_profile_id <> p_vendor_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Ensure customer belongs to this vendor (prevents cross-vendor token creation)
  IF NOT EXISTS (
    SELECT 1 FROM parties
    WHERE id = p_customer_id
      AND vendor_id = p_vendor_id
      AND is_customer = TRUE
  ) THEN
    RAISE EXCEPTION 'invalid_customer';
  END IF;

  SELECT token INTO v_token
  FROM access_tokens
  WHERE vendor_id = p_vendor_id
    AND customer_id = p_customer_id
    AND is_revoked = FALSE
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF v_token IS NOT NULL THEN
    RETURN v_token;
  END IF;

  v_token := generate_access_token();

  INSERT INTO access_tokens (token, vendor_id, customer_id)
  VALUES (v_token, p_vendor_id, p_customer_id);

  RETURN v_token;
END;
$$;

-- Track access safely (invoked only from get_ledger_by_token)
CREATE OR REPLACE FUNCTION track_token_access(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE access_tokens
  SET
    last_accessed_at = NOW(),
    access_count = access_count + 1
  WHERE token = p_token;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3) HARDEN PUBLIC LEDGER RPCs
-- -----------------------------------------------------------------------------

-- Restrict EXECUTE privileges first
REVOKE EXECUTE ON FUNCTION public.find_ledgers_by_phone(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_link_customer_ledgers(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_ledger_by_token(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_or_create_access_token(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.track_token_access(TEXT) FROM PUBLIC;

-- Authenticated-only: find ledgers by phone (must match profile phone)
CREATE OR REPLACE FUNCTION find_ledgers_by_phone(p_phone TEXT)
RETURNS TABLE(
  vendor_id UUID,
  vendor_business_name TEXT,
  vendor_name TEXT,
  customer_id UUID,
  customer_name TEXT,
  balance NUMERIC,
  access_token TEXT,
  ledger_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_phone TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT phone INTO v_profile_phone
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_profile_phone IS NULL OR v_profile_phone <> p_phone THEN
    RAISE EXCEPTION 'phone_not_verified';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS vendor_id,
    p.business_name AS vendor_business_name,
    p.name AS vendor_name,
    c.id AS customer_id,
    c.name AS customer_name,
    COALESCE(
      (
        SELECT SUM(
          CASE
            WHEN o.type = 'sale' THEN o.grand_total
            WHEN o.type = 'payment_received' THEN -o.grand_total
            ELSE 0
          END
        )
        FROM orders o
        WHERE o.customer_id = c.id
          AND o.vendor_id = p.id
      ), 0
    ) AS balance,
    at.token AS access_token,
    CONCAT('https://kredbook.app/l/', at.token) AS ledger_url
  FROM parties c
  INNER JOIN profiles p ON c.vendor_id = p.id
  LEFT JOIN access_tokens at ON (
    at.vendor_id = p.id
    AND at.customer_id = c.id
    AND at.is_revoked = FALSE
    AND (at.expires_at IS NULL OR at.expires_at > NOW())
  )
  WHERE c.phone = p_phone
    AND c.is_customer = TRUE
  ORDER BY p.business_name ASC;
END;
$$;

-- Authenticated-only: auto-link ledgers (must match profile phone)
CREATE OR REPLACE FUNCTION auto_link_customer_ledgers(
  p_customer_id UUID,
  p_phone TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_linked_count INTEGER := 0;
  v_vendor_record RECORD;
  v_profile_phone TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT phone INTO v_profile_phone
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_profile_phone IS NULL OR v_profile_phone <> p_phone THEN
    RAISE EXCEPTION 'phone_not_verified';
  END IF;

  -- Ensure the provided customer exists for this phone
  IF NOT EXISTS (
    SELECT 1 FROM parties WHERE id = p_customer_id AND phone = p_phone AND is_customer = TRUE
  ) THEN
    RAISE EXCEPTION 'invalid_customer';
  END IF;

  UPDATE parties
  SET phone = p_phone
  WHERE id = p_customer_id
    AND (phone IS NULL OR phone = '');

  FOR v_vendor_record IN (
    SELECT DISTINCT c.vendor_id, c.id AS customer_id
    FROM parties c
    WHERE c.phone = p_phone
      AND c.is_customer = TRUE
      AND c.id != p_customer_id
  )
  LOOP
    PERFORM get_or_create_access_token(
      v_vendor_record.vendor_id,
      v_vendor_record.customer_id
    );

    v_linked_count := v_linked_count + 1;
  END LOOP;

  RETURN v_linked_count;
END;
$$;

-- Public: ledger view by token (safe access, no table SELECT exposure)
CREATE OR REPLACE FUNCTION get_ledger_by_token(p_token TEXT)
RETURNS TABLE(
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  vendor_business_name TEXT,
  vendor_name TEXT,
  vendor_phone TEXT,
  vendor_address TEXT,
  vendor_gstin TEXT,
  vendor_logo_url TEXT,
  total_sales NUMERIC,
  total_payments NUMERIC,
  current_balance NUMERIC,
  last_transaction_date TIMESTAMP WITH TIME ZONE,
  transactions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id UUID;
  v_customer_id UUID;
  v_token_valid BOOLEAN;
BEGIN
  SELECT
    at.vendor_id,
    at.customer_id,
    (at.is_revoked = FALSE AND (at.expires_at IS NULL OR at.expires_at > NOW()))
  INTO v_vendor_id, v_customer_id, v_token_valid
  FROM access_tokens at
  WHERE at.token = p_token;

  IF NOT v_token_valid THEN
    RETURN;
  END IF;

  PERFORM track_token_access(p_token);

  RETURN QUERY
  SELECT
    c.name AS customer_name,
    c.phone AS customer_phone,
    c.address AS customer_address,
    p.business_name AS vendor_business_name,
    p.name AS vendor_name,
    p.phone AS vendor_phone,
    p.billing_address AS vendor_address,
    p.gstin AS vendor_gstin,
    p.business_logo_url AS vendor_logo_url,
    COALESCE(SUM(
      CASE WHEN o.type = 'sale' THEN o.grand_total ELSE 0 END
    ), 0) AS total_sales,
    COALESCE(SUM(
      CASE WHEN o.type = 'payment_received' THEN o.grand_total ELSE 0 END
    ), 0) AS total_payments,
    COALESCE(SUM(
      CASE
        WHEN o.type = 'sale' THEN o.grand_total
        WHEN o.type = 'payment_received' THEN -o.grand_total
        ELSE 0
      END
    ), 0) AS current_balance,
    MAX(o.order_date) AS last_transaction_date,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', o2.id,
            'date', o2.order_date,
            'type', o2.type,
            'bill_number', o2.bill_number,
            'amount', o2.grand_total,
            'payment_method', o2.payment_method,
            'items', (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'product_name', oi.product_name,
                  'variant_name', oi.variant_name,
                  'quantity', oi.quantity,
                  'rate', oi.rate,
                  'total', oi.total_price
                )
                ORDER BY oi.id
              )
              FROM order_items oi
              WHERE oi.order_id = o2.id
            )
          )
          ORDER BY o2.order_date DESC, o2.created_at DESC
        )
        FROM orders o2
        WHERE o2.vendor_id = v_vendor_id
          AND o2.customer_id = v_customer_id
      ),
      '[]'::jsonb
    ) AS transactions
  FROM parties c
  INNER JOIN profiles p ON c.vendor_id = p.id
  LEFT JOIN orders o ON (o.customer_id = c.id AND o.vendor_id = p.id)
  WHERE c.id = v_customer_id
    AND c.is_customer = TRUE
    AND p.id = v_vendor_id
  GROUP BY c.id, c.name, c.phone, c.address,
           p.id, p.business_name, p.name, p.phone, p.billing_address, p.gstin, p.business_logo_url;
END;
$$;

-- Grant execute permissions explicitly
GRANT EXECUTE ON FUNCTION public.get_ledger_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_access_token(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_ledgers_by_phone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_link_customer_ledgers(UUID, TEXT) TO authenticated;

-- -----------------------------------------------------------------------------
-- 4) PREVENT CROSS-VENDOR PAYMENT TAMPERING
-- -----------------------------------------------------------------------------

-- Ensure (id, vendor_id) is unique for FK targeting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_id_vendor_unique'
      AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_id_vendor_unique UNIQUE (id, vendor_id);
  END IF;
END $$;

-- Replace single-column FK with composite FK (order_id + vendor_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_order_id_fkey'
      AND table_name = 'payments'
  ) THEN
    ALTER TABLE payments DROP CONSTRAINT payments_order_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_order_vendor_fkey'
      AND table_name = 'payments'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_order_vendor_fkey
      FOREIGN KEY (order_id, vendor_id)
      REFERENCES orders (id, vendor_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure order status updates only when vendor_id matches
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET amount_paid = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments p
        WHERE p.order_id = NEW.order_id
          AND p.vendor_id = orders.vendor_id
      ),
      status = CASE
        WHEN (
          SELECT COALESCE(SUM(amount), 0)
          FROM payments p
          WHERE p.order_id = NEW.order_id
            AND p.vendor_id = orders.vendor_id
        ) >= orders.total_amount THEN 'Paid'
        WHEN (
          SELECT COALESCE(SUM(amount), 0)
          FROM payments p
          WHERE p.order_id = NEW.order_id
            AND p.vendor_id = orders.vendor_id
        ) > 0 THEN 'Partially Paid'
        ELSE 'Pending'
      END
  WHERE id = NEW.order_id
    AND vendor_id = NEW.vendor_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
