-- =============================================================================
-- KredBook — Atomic order edit with validation
-- Migration: 20260409_add_update_order_transaction
-- =============================================================================

-- Add guardrails: prevent negative totals and paid > total
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_total_amount_nonnegative,
  DROP CONSTRAINT IF EXISTS orders_amount_paid_nonnegative,
  DROP CONSTRAINT IF EXISTS orders_amount_paid_lte_total;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_total_amount_nonnegative CHECK (total_amount >= 0),
  ADD CONSTRAINT orders_amount_paid_nonnegative CHECK (amount_paid >= 0),
  ADD CONSTRAINT orders_amount_paid_lte_total CHECK (amount_paid <= total_amount);

-- Ensure order_items can handle quick amount (no product_id)
ALTER TABLE public.order_items
  ALTER COLUMN product_id DROP NOT NULL;

-- Atomic update: order + items with validations
CREATE OR REPLACE FUNCTION public.update_order_transaction(
  p_order_id UUID,
  p_vendor_id UUID,
  p_items JSONB,
  p_loading_charge NUMERIC,
  p_tax_percent NUMERIC,
  p_quick_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_amount_paid NUMERIC;
  v_items_total NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_has_items BOOLEAN := FALSE;
BEGIN
  IF p_loading_charge IS NULL THEN
    p_loading_charge := 0;
  END IF;
  IF p_tax_percent IS NULL THEN
    p_tax_percent := 0;
  END IF;
  IF p_quick_amount IS NULL THEN
    p_quick_amount := 0;
  END IF;

  IF p_loading_charge < 0 THEN
    RAISE EXCEPTION 'loading_charge cannot be negative';
  END IF;

  IF p_tax_percent < 0 OR p_tax_percent > 100 THEN
    RAISE EXCEPTION 'tax_percent must be between 0 and 100';
  END IF;

  SELECT amount_paid INTO v_amount_paid
  FROM public.orders
  WHERE id = p_order_id AND vendor_id = p_vendor_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order not found';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_has_items := TRUE;
    v_items_total := v_items_total + (COALESCE((v_item->>'price')::NUMERIC, 0) * COALESCE((v_item->>'quantity')::NUMERIC, 0));
  END LOOP;

  IF v_has_items THEN
    v_tax_amount := ROUND((v_items_total * p_tax_percent) / 100.0, 2);
    v_total_amount := v_items_total + v_tax_amount + p_loading_charge;
  ELSE
    v_total_amount := p_quick_amount;
  END IF;

  IF v_total_amount <= 0 THEN
    RAISE EXCEPTION 'total_amount must be greater than zero';
  END IF;

  IF v_total_amount < v_amount_paid THEN
    RAISE EXCEPTION 'total_amount cannot be less than amount already paid';
  END IF;

  -- Replace items (transactional)
  DELETE FROM public.order_items
  WHERE order_id = p_order_id AND vendor_id = p_vendor_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      vendor_id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      price,
      quantity
    ) VALUES (
      p_order_id,
      p_vendor_id,
      NULLIF(v_item->>'product_id', '')::UUID,
      NULLIF(v_item->>'variant_id', '')::UUID,
      v_item->>'product_name',
      NULLIF(v_item->>'variant_name', ''),
      (v_item->>'price')::NUMERIC,
      (v_item->>'quantity')::INTEGER
    );
  END LOOP;

  UPDATE public.orders
  SET total_amount = v_total_amount,
      loading_charge = CASE WHEN v_has_items THEN p_loading_charge ELSE 0 END,
      tax_percent = CASE WHEN v_has_items THEN p_tax_percent ELSE 0 END,
      status = CASE
        WHEN v_amount_paid >= v_total_amount THEN 'Paid'
        WHEN v_amount_paid > 0 THEN 'Partially Paid'
        ELSE 'Pending'
      END
  WHERE id = p_order_id AND vendor_id = p_vendor_id;

  RETURN jsonb_build_object('order_id', p_order_id, 'total_amount', v_total_amount);
END;
$$;
