-- Rename storage bucket: product-images -> avatars
--
-- This migration is written defensively to work whether:
-- - `product-images` still exists (older environments), or
-- - only `avatars` exists (fresh installs after updating earlier migrations).

-- 1. Ensure avatars bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Move existing objects if any
UPDATE storage.objects
SET bucket_id = 'avatars'
WHERE bucket_id = 'product-images';

-- 3. Replace bucket-scoped policies
DROP POLICY IF EXISTS "Product images upload" ON storage.objects;
DROP POLICY IF EXISTS "Product images read" ON storage.objects;
DROP POLICY IF EXISTS "Product images delete" ON storage.objects;

DROP POLICY IF EXISTS "Avatars upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatars read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars delete" ON storage.objects;

CREATE POLICY "Avatars upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Avatars read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Avatars delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- 4. Update public-read allowlist policy
DROP POLICY IF EXISTS "Public read for public buckets" ON storage.objects;
CREATE POLICY "Public read for public buckets"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('avatars', 'business-logos'));

-- 5. Remove old bucket
-- Direct deletion from `storage.buckets` is blocked by Supabase protection triggers.
-- Delete the `product-images` bucket via the Storage API / Supabase Dashboard after
-- confirming no objects remain in it.
