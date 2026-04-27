-- =============================================================================
-- Migration: Setup Supabase Storage Buckets and Policies
-- Date: April 8, 2026
-- 
-- Purpose: 
--   1. Create 'avatars' and 'business-logos' buckets.
--   2. Configure buckets as PUBLIC for getPublicUrl() support.
--   3. Apply RLS policies for authenticated uploads and public reads.
-- =============================================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Avatars Policies
DROP POLICY IF EXISTS "Avatars upload" ON storage.objects;
CREATE POLICY "Avatars upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars read" ON storage.objects;
CREATE POLICY "Avatars read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars delete" ON storage.objects;
CREATE POLICY "Avatars delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- 4. Business Logos Policies
DROP POLICY IF EXISTS "Business logos upload" ON storage.objects;
CREATE POLICY "Business logos upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-logos');

DROP POLICY IF EXISTS "Business logos read" ON storage.objects;
CREATE POLICY "Business logos read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'business-logos');

DROP POLICY IF EXISTS "Business logos update" ON storage.objects;
CREATE POLICY "Business logos update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'business-logos');

DROP POLICY IF EXISTS "Business logos delete" ON storage.objects;
CREATE POLICY "Business logos delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-logos');

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=== STORAGE SETUP COMPLETE ===';
  RAISE NOTICE 'Created buckets: avatars, business-logos';
  RAISE NOTICE 'RLS enabled and policies applied (Public SELECT, Authenticated INSERT/UPDATE/DELETE)';
END $$;
