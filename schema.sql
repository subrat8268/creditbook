-- KredBook Supabase Schema Snapshot
-- Generated: 2026-04-27
-- Project: kredBook (sfmoefgjmgkwvauyaiyz)
-- Purpose: structural reference only, with no table data
--
-- Included:
-- - Full `public` schema table shape (tables, constraints, indexes)
-- - RLS policy snapshot for `public` and `storage.objects`
-- - Public triggers that affect app behavior
-- - Inventory of Supabase-managed tables in non-public schemas

-- =============================================================================
-- MANAGED SCHEMA INVENTORY (NON-PUBLIC)
-- =============================================================================
-- auth
--   audit_log_entries [rls: on]
--   custom_oauth_providers [rls: off]
--   flow_state [rls: on]
--   identities [rls: on]
--   instances [rls: on]
--   mfa_amr_claims [rls: on]
--   mfa_challenges [rls: on]
--   mfa_factors [rls: on]
--   oauth_authorizations [rls: off]
--   oauth_client_states [rls: off]
--   oauth_clients [rls: off]
--   oauth_consents [rls: off]
--   one_time_tokens [rls: on]
--   refresh_tokens [rls: on]
--   saml_providers [rls: on]
--   saml_relay_states [rls: on]
--   schema_migrations [rls: on]
--   sessions [rls: on]
--   sso_domains [rls: on]
--   sso_providers [rls: on]
--   users [rls: on]
--   webauthn_challenges [rls: off]
--   webauthn_credentials [rls: off]
--
-- realtime
--   messages [rls: on]
--   schema_migrations [rls: off]
--   subscription [rls: off]
--
-- storage
--   buckets [rls: on]
--   buckets_analytics [rls: on]
--   buckets_vectors [rls: on]
--   migrations [rls: on]
--   objects [rls: on]
--   s3_multipart_uploads [rls: on]
--   s3_multipart_uploads_parts [rls: on]
--   vector_indexes [rls: on]
--
-- supabase_migrations
--   schema_migrations [rls: off]
--   seed_files [rls: off]
--
-- vault
--   secrets [rls: off]

-- =============================================================================
-- PUBLIC TABLES
-- =============================================================================

-- public.profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  subscription_plan text DEFAULT 'free'::text,
  subscription_expiry date,
  avatar_url text,
  business_logo_url text,
  business_name text,
  billing_address text,
  gstin text,
  upi_id text,
  bank_name text NOT NULL DEFAULT ''::text,
  account_number text NOT NULL DEFAULT ''::text,
  ifsc_code text NOT NULL DEFAULT ''::text,
  bill_number_prefix text DEFAULT 'INV'::text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  dashboard_mode text DEFAULT 'seller'::text
);

ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);
CREATE UNIQUE INDEX profiles_user_id_unique ON public.profiles USING btree (user_id);
CREATE UNIQUE INDEX profiles_phone_unique ON public.profiles USING btree (phone);

-- public.parties
CREATE TABLE public.parties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  address text,
  is_customer boolean NOT NULL DEFAULT false,
  is_supplier boolean NOT NULL DEFAULT false,
  customer_balance numeric(10,2) NOT NULL DEFAULT 0,
  supplier_balance numeric(10,2) NOT NULL DEFAULT 0,
  basket_mark text,
  bank_name text,
  account_number text,
  ifsc_code text,
  upi_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.parties ADD CONSTRAINT parties_pkey PRIMARY KEY (id);
ALTER TABLE public.parties ADD CONSTRAINT parties_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.parties ADD CONSTRAINT parties_vendor_phone_unique UNIQUE (vendor_id, phone);
ALTER TABLE public.parties ADD CONSTRAINT parties_at_least_one_role CHECK ((is_customer = true OR is_supplier = true));

CREATE UNIQUE INDEX parties_pkey ON public.parties USING btree (id);
CREATE UNIQUE INDEX parties_vendor_phone_unique ON public.parties USING btree (vendor_id, phone);
CREATE INDEX idx_parties_vendor ON public.parties USING btree (vendor_id);
CREATE INDEX idx_parties_customer ON public.parties USING btree (vendor_id) WHERE (is_customer = true);
CREATE INDEX idx_parties_supplier ON public.parties USING btree (vendor_id) WHERE (is_supplier = true);
CREATE INDEX idx_parties_name ON public.parties USING btree (vendor_id, name);
CREATE INDEX idx_parties_phone ON public.parties USING btree (phone);

-- public.orders
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  balance_due numeric GENERATED ALWAYS AS ((total_amount - amount_paid)) STORED,
  status text NOT NULL DEFAULT 'Pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  due_date date DEFAULT (CURRENT_DATE + 30),
  bill_number text,
  previous_balance numeric(10,2) NOT NULL DEFAULT 0,
  loading_charge numeric(10,2) NOT NULL DEFAULT 0,
  tax_percent numeric(5,2) NOT NULL DEFAULT 0,
  edited_at timestamp with time zone,
  edit_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE public.orders ADD CONSTRAINT orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.parties(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_id_vendor_unique UNIQUE (id, vendor_id);
ALTER TABLE public.orders ADD CONSTRAINT orders_vendor_bill_unique UNIQUE (vendor_id, bill_number);
ALTER TABLE public.orders ADD CONSTRAINT orders_total_amount_nonnegative CHECK ((total_amount >= 0::numeric));
ALTER TABLE public.orders ADD CONSTRAINT orders_amount_paid_nonnegative CHECK ((amount_paid >= 0::numeric));
ALTER TABLE public.orders ADD CONSTRAINT orders_amount_paid_lte_total CHECK ((amount_paid <= total_amount));
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['Pending'::text, 'Partially Paid'::text, 'Paid'::text])));

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);
CREATE UNIQUE INDEX orders_id_vendor_unique ON public.orders USING btree (id, vendor_id);
CREATE UNIQUE INDEX orders_vendor_bill_unique ON public.orders USING btree (vendor_id, bill_number);
CREATE INDEX idx_orders_vendor ON public.orders USING btree (vendor_id);
CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);
CREATE INDEX idx_orders_vendor_balance_due ON public.orders USING btree (vendor_id, balance_due) WHERE (balance_due > (0)::numeric);
CREATE INDEX idx_orders_vendor_due_date ON public.orders USING btree (vendor_id, due_date) WHERE (balance_due > 0);
CREATE INDEX orders_vendor_customer_idx ON public.orders USING btree (vendor_id, customer_id);

-- public.order_items
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  variant_name text,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  subtotal numeric(10,2) GENERATED ALWAYS AS ((price * (quantity)::numeric)) STORED,
  vendor_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  variant_id uuid
);

ALTER TABLE public.order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_quantity_check CHECK ((quantity > 0));

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);
CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);
CREATE INDEX idx_order_items_variant ON public.order_items USING btree (variant_id);
CREATE INDEX order_items_order_idx ON public.order_items USING btree (order_id);

-- public.payments
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  order_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  payment_date timestamp with time zone NOT NULL DEFAULT now(),
  payment_mode text NOT NULL DEFAULT 'Cash'::text,
  notes text
);

ALTER TABLE public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE public.payments ADD CONSTRAINT payments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD CONSTRAINT payments_order_vendor_fkey FOREIGN KEY (order_id, vendor_id) REFERENCES public.orders(id, vendor_id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_mode_check CHECK ((payment_mode = ANY (ARRAY['Cash'::text, 'UPI'::text, 'NEFT'::text, 'Draft'::text, 'Cheque'::text])));

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);
CREATE INDEX idx_payments_vendor ON public.payments USING btree (vendor_id);
CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);
CREATE INDEX payments_order_idx ON public.payments USING btree (order_id);

-- public.access_tokens
CREATE TABLE public.access_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  token text NOT NULL,
  vendor_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_accessed_at timestamp with time zone,
  access_count integer DEFAULT 0,
  expires_at timestamp with time zone,
  is_revoked boolean DEFAULT false
);

ALTER TABLE public.access_tokens ADD CONSTRAINT access_tokens_pkey PRIMARY KEY (id);
ALTER TABLE public.access_tokens ADD CONSTRAINT access_tokens_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.parties(id) ON DELETE CASCADE;
ALTER TABLE public.access_tokens ADD CONSTRAINT access_tokens_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.access_tokens ADD CONSTRAINT access_tokens_token_key UNIQUE (token);

CREATE UNIQUE INDEX access_tokens_pkey ON public.access_tokens USING btree (id);
CREATE UNIQUE INDEX access_tokens_token_key ON public.access_tokens USING btree (token);
CREATE INDEX idx_access_tokens_customer ON public.access_tokens USING btree (customer_id);
CREATE INDEX idx_access_tokens_token ON public.access_tokens USING btree (token) WHERE (is_revoked = false);
CREATE INDEX idx_access_tokens_vendor ON public.access_tokens USING btree (vendor_id);

-- =============================================================================
-- RLS SNAPSHOT: PUBLIC
-- =============================================================================

ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- access_tokens
CREATE POLICY "Vendors create own tokens" ON public.access_tokens FOR INSERT TO public
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors delete own tokens" ON public.access_tokens FOR DELETE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors manage own tokens" ON public.access_tokens FOR UPDATE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))))
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));

-- order_items
CREATE POLICY "Vendors can delete own order items" ON public.order_items FOR DELETE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can insert own order items" ON public.order_items FOR INSERT TO public
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can update own order items" ON public.order_items FOR UPDATE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can view own order items" ON public.order_items FOR SELECT TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "delete_own_order_items" ON public.order_items FOR DELETE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "insert_own_order_items" ON public.order_items FOR INSERT TO public
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "select_own_order_items" ON public.order_items FOR SELECT TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "update_own_order_items" ON public.order_items FOR UPDATE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))))
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));

-- orders
CREATE POLICY "Vendors can delete own orders" ON public.orders FOR DELETE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can insert own orders" ON public.orders FOR INSERT TO public
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can update own orders" ON public.orders FOR UPDATE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can view own orders" ON public.orders FOR SELECT TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "delete_own_orders" ON public.orders FOR DELETE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "insert_own_orders" ON public.orders FOR INSERT TO public
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "select_own_orders" ON public.orders FOR SELECT TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "update_own_orders" ON public.orders FOR UPDATE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))))
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));

-- parties
CREATE POLICY "Vendors can manage own parties" ON public.parties FOR ALL TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));

-- payments
CREATE POLICY "Vendors can delete own payments" ON public.payments FOR DELETE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can insert own payments" ON public.payments FOR INSERT TO public
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can update own payments" ON public.payments FOR UPDATE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "Vendors can view own payments" ON public.payments FOR SELECT TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "delete_own_payments" ON public.payments FOR DELETE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "insert_own_payments" ON public.payments FOR INSERT TO public
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "select_own_payments" ON public.payments FOR SELECT TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));
CREATE POLICY "update_own_payments" ON public.payments FOR UPDATE TO public
  USING ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))))
  WITH CHECK ((vendor_id IN ( SELECT profiles.id FROM public.profiles WHERE (profiles.user_id = auth.uid()))));

-- profiles
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO public
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Vendors can update own profile" ON public.profiles FOR UPDATE TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Vendors can view own profile" ON public.profiles FOR SELECT TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO public
  USING ((auth.uid() = user_id));

-- =============================================================================
-- PUBLIC TRIGGERS
-- =============================================================================
CREATE TRIGGER orders_edit_tracking BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_order_edit_tracking();
CREATE TRIGGER parties_updated_at BEFORE UPDATE ON public.parties FOR EACH ROW EXECUTE FUNCTION public.update_parties_updated_at();
CREATE TRIGGER on_payment_upsert AFTER INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_order_status();

-- =============================================================================
-- STORAGE
-- =============================================================================

-- Buckets currently present:
-- - business-logos (public)
-- - avatars (public)


ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business logos delete" ON storage.objects FOR DELETE TO authenticated
  USING ((bucket_id = 'business-logos'::text));
CREATE POLICY "Business logos read" ON storage.objects FOR SELECT TO authenticated
  USING ((bucket_id = 'business-logos'::text));
CREATE POLICY "Business logos update" ON storage.objects FOR UPDATE TO authenticated
  USING ((bucket_id = 'business-logos'::text));
CREATE POLICY "Business logos upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK ((bucket_id = 'business-logos'::text));

CREATE POLICY "Avatars delete" ON storage.objects FOR DELETE TO authenticated
  USING ((bucket_id = 'avatars'::text));
CREATE POLICY "Avatars read" ON storage.objects FOR SELECT TO authenticated
  USING ((bucket_id = 'avatars'::text));
CREATE POLICY "Avatars upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK ((bucket_id = 'avatars'::text));

CREATE POLICY "Public read for public buckets" ON storage.objects FOR SELECT TO public
  USING ((bucket_id = ANY (ARRAY['avatars'::text, 'business-logos'::text])));
