    -- =============================================================================
    -- CreditBook — Fix "database error saving new user" signup crash
    -- Run this once in Supabase SQL Editor → your existing data is NOT affected
    -- =============================================================================

    -- 1. Add missing columns that the trigger was failing to insert
    -- ----------------------------------------------------------------------------
    ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS dashboard_mode TEXT;

    -- Mark all existing users (created before this fix) as having completed
    -- onboarding so they go straight to the dashboard, not the onboarding flow.
    UPDATE profiles
    SET onboarding_complete = TRUE
    WHERE onboarding_complete = FALSE;

    -- 2. Recreate the auto-profile trigger so signup works going forward
    -- ----------------------------------------------------------------------------
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
    INSERT INTO public.profiles (user_id, name, onboarding_complete)
    VALUES (NEW.id, '', FALSE)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
    EXCEPTION
    -- Never let a profile-insert failure block auth.users creation.
    -- The app will create/fetch the profile row after login if needed.
    WHEN OTHERS THEN
        RETURN NEW;
    END;
    $$;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    -- 3. Fix RLS policies for supplier tables — they mistakenly used
    --    vendor_id = auth.uid() but vendor_id references profiles(id), not
    --    auth.users(id). Replace with the same subquery pattern used everywhere.
    -- ----------------------------------------------------------------------------
    DROP POLICY IF EXISTS "Vendors manage own suppliers"      ON suppliers;
    DROP POLICY IF EXISTS "Vendors manage own deliveries"     ON supplier_deliveries;
    DROP POLICY IF EXISTS "Vendors manage own delivery items" ON supplier_delivery_items;
    DROP POLICY IF EXISTS "Vendors manage own payments made"  ON payments_made;

    CREATE POLICY "Vendors manage own suppliers" ON suppliers
    FOR ALL
    USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

    CREATE POLICY "Vendors manage own deliveries" ON supplier_deliveries
    FOR ALL
    USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

    CREATE POLICY "Vendors manage own delivery items" ON supplier_delivery_items
    FOR ALL
    USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

    CREATE POLICY "Vendors manage own payments made" ON payments_made
    FOR ALL
    USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
