-- =============================================================================
-- KredBook - Fix Onboarding & Repair Stale RPCs
-- Date: 2026-04-12
-- =============================================================================

-- 1. Add dashboard_mode to profiles (defaulting to 'seller')
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dashboard_mode TEXT DEFAULT 'seller';

-- 2. Add phone to profiles if missing (UNIQUE constraint)
-- We use a DO block to handle the constraint safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT UNIQUE;
    END IF;
END $$;

-- 3. Repair find_ledgers_by_phone (Removes o.type, uses o.balance_due)
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
        SELECT SUM(o.balance_due)
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
    AND c.is_customer = TRUE;
END;
$$;

-- 4. Repair get_ledger_by_token (Aligns with current table structure)
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
  last_transaction_date TIMESTAMPTZ,
  transactions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_vendor_id UUID;
  v_token_valid BOOLEAN;
BEGIN
  -- Validate token
  SELECT customer_id, vendor_id, (is_revoked = FALSE AND (expires_at IS NULL OR expires_at > NOW()))
  INTO v_customer_id, v_vendor_id, v_token_valid
  FROM access_tokens
  WHERE token = p_token;

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
    COALESCE(SUM(o.total_amount), 0) AS total_sales,
    COALESCE(SUM(o.amount_paid), 0) AS total_payments,
    COALESCE(SUM(o.balance_due), 0) AS current_balance,
    MAX(o.created_at) AS last_transaction_date,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', o2.id,
            'date', o2.created_at,
            'type', 'sale',
            'bill_number', o2.bill_number,
            'amount', o2.total_amount,
            'balance_due', o2.balance_due,
            'status', o2.status,
            'items', (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'product_name', oi.product_name,
                  'variant_name', oi.variant_name,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'subtotal', oi.subtotal
                )
                ORDER BY oi.id
              )
              FROM order_items oi
              WHERE oi.order_id = o2.id
            )
          )
          ORDER BY o2.created_at DESC
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
