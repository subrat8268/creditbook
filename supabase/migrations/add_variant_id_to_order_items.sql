-- =============================================================================
-- KredBook — Add variant_id to order_items
-- Migration: add_variant_id_to_order_items
-- Apply: Run in Supabase SQL Editor.
-- =============================================================================

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.table_constraints
    WHERE  constraint_name = 'order_items_variant_id_fkey'
      AND  table_schema = 'public'
      AND  table_name = 'order_items'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_variant_id_fkey
      FOREIGN KEY (variant_id)
      REFERENCES public.product_variants(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_variant ON public.order_items(variant_id);

-- Update create_order_transaction to persist variant_id
CREATE OR REPLACE FUNCTION create_order_transaction(
  p_vendor_id UUID,
  p_customer_id UUID,
  p_items JSONB,
  p_amount_paid NUMERIC,
  p_payment_mode TEXT,
  p_loading_charge NUMERIC,
  p_tax_percent NUMERIC,
  p_bill_prefix TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_bill_number TEXT;
  v_previous_balance NUMERIC;
  v_items_total NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_order_id UUID;
  v_item JSONB;
BEGIN
  IF p_amount_paid < 0 THEN
      RAISE EXCEPTION 'amount_paid cannot be negative';
  END IF;

  v_bill_number := get_next_bill_number(p_vendor_id, p_bill_prefix);
  v_previous_balance := get_customer_previous_balance(p_customer_id, p_vendor_id);

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_items_total := v_items_total + (COALESCE((v_item->>'price')::NUMERIC, 0) * COALESCE((v_item->>'quantity')::NUMERIC, 0));
  END LOOP;

  v_tax_amount := ROUND((v_items_total * p_tax_percent) / 100.0, 2);
  v_total_amount := v_items_total + v_tax_amount + COALESCE(p_loading_charge, 0);

  INSERT INTO orders (
    vendor_id,
    customer_id,
    bill_number,
    total_amount,
    amount_paid,
    previous_balance,
    loading_charge,
    tax_percent,
    status
  ) VALUES (
    p_vendor_id,
    p_customer_id,
    v_bill_number,
    v_total_amount,
    0,
    v_previous_balance,
    p_loading_charge,
    p_tax_percent,
    'Pending'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      vendor_id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      price,
      quantity
    ) VALUES (
      v_order_id,
      p_vendor_id,
      (NULLIF(v_item->>'product_id', ''))::UUID,
      (NULLIF(v_item->>'variant_id', ''))::UUID,
      v_item->>'product_name',
      NULLIF(v_item->>'variant_name', ''),
      (v_item->>'price')::NUMERIC,
      (v_item->>'quantity')::INTEGER
    );
  END LOOP;

  IF p_amount_paid > 0 THEN
    INSERT INTO payments (
      order_id,
      vendor_id,
      amount,
      payment_mode
    ) VALUES (
      v_order_id,
      p_vendor_id,
      p_amount_paid,
      COALESCE(p_payment_mode, 'Cash')
    );
  END IF;

  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$;
