-- =============================================================================
-- KredBook - Add phone column to profiles table
-- Date: 2026-04-12
-- Issue: Phone column referenced in migrations but never created on profiles
-- =============================================================================

-- 1. Add phone column to profiles if it doesn't exist
-- (needed for phone-based ledger discovery)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;

-- 2. Add dashboard_mode if it doesn't exist (for onboarding flow)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dashboard_mode TEXT;

-- 3. Create index on phone for faster ledger lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

-- =============================================================================
-- COMMENT: 
-- This migration adds missing columns referenced by newer migrations.
-- The phone column is critical for the phone-based ledger discovery flow
-- during signup/onboarding.
-- =============================================================================
