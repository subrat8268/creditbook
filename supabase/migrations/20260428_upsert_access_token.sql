-- 3.6 Public ledger share link: create/update customer access token

CREATE OR REPLACE FUNCTION public.upsert_access_token(p_party_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_vendor_id uuid;
  v_existing_token text;
  v_new_token text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT p.vendor_id
  INTO v_vendor_id
  FROM public.parties p
  JOIN public.profiles pr ON pr.id = p.vendor_id
  WHERE p.id = p_party_id
    AND pr.user_id = v_user_id;

  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Party is not owned by caller';
  END IF;

  SELECT at.token
  INTO v_existing_token
  FROM public.access_tokens at
  WHERE at.customer_id = p_party_id
    AND at.vendor_id = v_vendor_id
    AND COALESCE(at.is_revoked, false) = false
    AND (at.expires_at IS NULL OR at.expires_at > now())
  ORDER BY at.created_at DESC
  LIMIT 1;

  IF v_existing_token IS NOT NULL THEN
    RETURN v_existing_token;
  END IF;

  v_new_token := gen_random_uuid()::text;

  UPDATE public.access_tokens
  SET
    token = v_new_token,
    vendor_id = v_vendor_id,
    is_revoked = false,
    created_at = now()
  WHERE customer_id = p_party_id;

  IF NOT FOUND THEN
    INSERT INTO public.access_tokens (vendor_id, customer_id, token, is_revoked, created_at)
    VALUES (v_vendor_id, p_party_id, v_new_token, false, now());
  END IF;

  RETURN v_new_token;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_access_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_access_token(uuid) TO authenticated;
