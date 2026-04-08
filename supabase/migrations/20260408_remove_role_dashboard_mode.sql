-- =============================================================================
-- Migration: Remove Role and Dashboard Mode Complexity
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Simplify profiles table by removing unused fields
-- 
-- Analysis:
--   - role: Always 'vendor', never used in app logic
--   - dashboard_mode: Intended for seller/distributor modes, but PRD v5 doesn't use this
--   - Both add unnecessary complexity
-- 
-- Safety: Check usage before dropping (audit included)
-- =============================================================================

-- Step 1: Audit current usage
DO $$
DECLARE
  total_profiles INTEGER;
  non_vendor_roles INTEGER;
  non_both_modes INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_profiles FROM profiles;
  SELECT COUNT(*) INTO non_vendor_roles FROM profiles WHERE role IS DISTINCT FROM 'vendor';
  SELECT COUNT(*) INTO non_both_modes FROM profiles WHERE dashboard_mode IS DISTINCT FROM 'both';
  
  RAISE NOTICE '=== PRE-MIGRATION AUDIT ===';
  RAISE NOTICE 'Total profiles: %', total_profiles;
  RAISE NOTICE 'Profiles with role != ''vendor'': %', non_vendor_roles;
  RAISE NOTICE 'Profiles with dashboard_mode != ''both'': %', non_both_modes;
  
  IF non_vendor_roles > 0 THEN
    RAISE WARNING 'Found % profiles with non-vendor roles! Review before dropping column.', non_vendor_roles;
  END IF;
  
  IF non_both_modes > 0 THEN
    RAISE WARNING 'Found % profiles with dashboard_mode != ''both''! Review before dropping column.', non_both_modes;
  END IF;
  
  IF non_vendor_roles = 0 AND non_both_modes = 0 THEN
    RAISE NOTICE 'All profiles use default values. Safe to drop columns.';
  END IF;
END $$;

-- Step 2: Drop CHECK constraint first (dashboard_mode has CHECK constraint)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_dashboard_mode_check;

-- Step 3: Drop columns
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS dashboard_mode;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SIMPLIFICATION COMPLETE ===';
  RAISE NOTICE 'Dropped columns: role, dashboard_mode';
  RAISE NOTICE 'Profiles table simplified';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: Update TypeScript types by running:';
  RAISE NOTICE '  npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/database.types.ts';
END $$;
