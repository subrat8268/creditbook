-- =============================================================================
-- KredBook - Shared Ledger System: Access Tokens Table
-- Purpose: Enable customers to view their ledger via WhatsApp-shareable links
-- without requiring login/authentication
-- =============================================================================

-- Create access_tokens table for public ledger sharing
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The unique shareable token (e.g., "a8f3k2m9p1")
  token TEXT UNIQUE NOT NULL,
  
  -- Who created this token (the vendor/business owner)
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Who can view the ledger (the customer)
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  -- Token metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  
  -- Optional: Expiry for security (NULL = never expires)
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Optional: Revocation flag
  is_revoked BOOLEAN DEFAULT FALSE
);

-- Create index for fast token lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_access_tokens_token 
  ON access_tokens(token) 
  WHERE is_revoked = FALSE;

-- Create index for vendor queries (see all tokens for my customers)
CREATE INDEX IF NOT EXISTS idx_access_tokens_vendor 
  ON access_tokens(vendor_id);

-- Create index for customer queries (see all vendors where I'm a customer)
CREATE INDEX IF NOT EXISTS idx_access_tokens_customer 
  ON access_tokens(customer_id);

-- =============================================================================
-- RLS Policies: Public read access via token, vendors manage own tokens
-- =============================================================================

ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (unauthenticated) can read token details if token is valid
-- This enables the public ledger view at /l/[token]
CREATE POLICY "Public read access via valid token" ON access_tokens
  FOR SELECT
  USING (is_revoked = FALSE AND (expires_at IS NULL OR expires_at > NOW()));

-- Policy 2: Vendors can create tokens for their own customers
CREATE POLICY "Vendors create own tokens" ON access_tokens
  FOR INSERT
  WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policy 3: Vendors can update/revoke their own tokens
CREATE POLICY "Vendors manage own tokens" ON access_tokens
  FOR UPDATE
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policy 4: Vendors can delete their own tokens
CREATE POLICY "Vendors delete own tokens" ON access_tokens
  FOR DELETE
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =============================================================================
-- Helper Function: Generate unique short token (10 chars, alphanumeric)
-- =============================================================================

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
    -- Generate random 10-character token
    new_token := '';
    FOR i IN 1..10 LOOP
      new_token := new_token || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM access_tokens WHERE token = new_token) INTO token_exists;
    
    -- If unique, return it
    IF NOT token_exists THEN
      RETURN new_token;
    END IF;
  END LOOP;
END;
$$;

-- =============================================================================
-- Helper Function: Create or retrieve access token for a customer
-- Returns existing active token if available, creates new one if not
-- =============================================================================

CREATE OR REPLACE FUNCTION get_or_create_access_token(
  p_vendor_id UUID,
  p_customer_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Try to find existing active token
  SELECT token INTO v_token
  FROM access_tokens
  WHERE vendor_id = p_vendor_id
    AND customer_id = p_customer_id
    AND is_revoked = FALSE
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;
  
  -- If found, return it
  IF v_token IS NOT NULL THEN
    RETURN v_token;
  END IF;
  
  -- Otherwise, create new token
  v_token := generate_access_token();
  
  INSERT INTO access_tokens (token, vendor_id, customer_id)
  VALUES (v_token, p_vendor_id, p_customer_id);
  
  RETURN v_token;
END;
$$;

-- =============================================================================
-- Helper Function: Update token access stats (called from web view)
-- =============================================================================

CREATE OR REPLACE FUNCTION track_token_access(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE access_tokens
  SET 
    last_accessed_at = NOW(),
    access_count = access_count + 1
  WHERE token = p_token;
END;
$$;

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON TABLE access_tokens IS 
  'Shareable tokens for public ledger access without authentication';
  
COMMENT ON FUNCTION generate_access_token() IS 
  'Generates unique 10-character alphanumeric token';
  
COMMENT ON FUNCTION get_or_create_access_token(UUID, UUID) IS 
  'Returns existing active token or creates new one for vendor-customer pair';
  
COMMENT ON FUNCTION track_token_access(TEXT) IS 
  'Updates last_accessed_at and access_count for analytics';
