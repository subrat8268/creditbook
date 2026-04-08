-- =============================================================================
-- KredBook - Auto-Link Ledgers RPC Function
-- Purpose: When a customer provides their phone number, automatically discover
-- and link all existing ledgers across different businesses that share this phone
-- =============================================================================

-- Function: Find all ledgers (vendor-customer relationships) for a phone number
-- Returns: Array of ledger objects with vendor details and access tokens
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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS vendor_id,
    p.business_name AS vendor_business_name,
    p.name AS vendor_name,
    c.id AS customer_id,
    c.name AS customer_name,
    COALESCE(
      (
        -- Calculate total balance for this customer
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
  FROM customers c
  INNER JOIN profiles p ON c.vendor_id = p.id
  LEFT JOIN access_tokens at ON (
    at.vendor_id = p.id 
    AND at.customer_id = c.id
    AND at.is_revoked = FALSE
    AND (at.expires_at IS NULL OR at.expires_at > NOW())
  )
  WHERE c.phone = p_phone
  ORDER BY p.business_name ASC;
END;
$$;

-- =============================================================================
-- Function: Auto-link customer to existing ledger when phone is provided
-- Use case: Customer adds phone to their account → discover existing ledgers
-- =============================================================================

CREATE OR REPLACE FUNCTION auto_link_customer_ledgers(
  p_customer_id UUID,
  p_phone TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_linked_count INTEGER := 0;
  v_vendor_record RECORD;
BEGIN
  -- Update customer phone if not already set
  UPDATE customers
  SET phone = p_phone
  WHERE id = p_customer_id
    AND (phone IS NULL OR phone = '');
  
  -- Find all vendors who have this phone number in their customer list
  -- and create access tokens for them
  FOR v_vendor_record IN (
    SELECT DISTINCT c.vendor_id, c.id AS customer_id
    FROM customers c
    WHERE c.phone = p_phone
      AND c.id != p_customer_id
  )
  LOOP
    -- Create access token for this vendor-customer pair
    PERFORM get_or_create_access_token(
      v_vendor_record.vendor_id,
      v_vendor_record.customer_id
    );
    
    v_linked_count := v_linked_count + 1;
  END LOOP;
  
  RETURN v_linked_count;
END;
$$;

-- =============================================================================
-- Function: Get customer ledger summary (for public web view)
-- Returns: Customer details + list of all transactions + current balance
-- =============================================================================

CREATE OR REPLACE FUNCTION get_ledger_by_token(p_token TEXT)
RETURNS TABLE(
  -- Customer info
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Vendor info
  vendor_business_name TEXT,
  vendor_name TEXT,
  vendor_phone TEXT,
  vendor_address TEXT,
  vendor_gstin TEXT,
  vendor_logo_url TEXT,
  
  -- Ledger metadata
  total_sales NUMERIC,
  total_payments NUMERIC,
  current_balance NUMERIC,
  last_transaction_date TIMESTAMP WITH TIME ZONE,
  
  -- Transaction list (JSON array)
  transactions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vendor_id UUID;
  v_customer_id UUID;
  v_token_valid BOOLEAN;
BEGIN
  -- Validate token and get vendor/customer IDs
  SELECT 
    at.vendor_id,
    at.customer_id,
    (at.is_revoked = FALSE AND (at.expires_at IS NULL OR at.expires_at > NOW()))
  INTO v_vendor_id, v_customer_id, v_token_valid
  FROM access_tokens at
  WHERE at.token = p_token;
  
  -- If token invalid, return empty
  IF NOT v_token_valid THEN
    RETURN;
  END IF;
  
  -- Track token access
  PERFORM track_token_access(p_token);
  
  -- Return ledger data
  RETURN QUERY
  SELECT 
    -- Customer details
    c.name AS customer_name,
    c.phone AS customer_phone,
    c.address AS customer_address,
    
    -- Vendor details
    p.business_name AS vendor_business_name,
    p.name AS vendor_name,
    p.phone AS vendor_phone,
    p.billing_address AS vendor_address,
    p.gstin AS vendor_gstin,
    p.business_logo_url AS vendor_logo_url,
    
    -- Ledger summary
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
    
    -- Transaction list (most recent first)
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
    
  FROM customers c
  INNER JOIN profiles p ON c.vendor_id = p.id
  LEFT JOIN orders o ON (o.customer_id = c.id AND o.vendor_id = p.id)
  WHERE c.id = v_customer_id
    AND p.id = v_vendor_id
  GROUP BY c.id, c.name, c.phone, c.address,
           p.id, p.business_name, p.name, p.phone, p.billing_address, p.gstin, p.business_logo_url;
END;
$$;

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON FUNCTION find_ledgers_by_phone(TEXT) IS 
  'Discovers all ledgers across different vendors for a given phone number';
  
COMMENT ON FUNCTION auto_link_customer_ledgers(UUID, TEXT) IS 
  'Auto-creates access tokens for all existing vendor relationships when customer adds phone';
  
COMMENT ON FUNCTION get_ledger_by_token(TEXT) IS 
  'Returns complete ledger view for public access via shareable token';
