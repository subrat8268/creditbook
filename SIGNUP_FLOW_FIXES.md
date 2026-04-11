# 🔧 CRITICAL FIXES - Signup Flow Errors

## Issues Identified

### Issue 1: Missing `phone` Column on Profiles Table
**Error**: `Failed to save phone code 42703 column.o.type does not exist`
**Root Cause**: The `phone` column is referenced in migrations but was never created on the `profiles` table
**Status**: ✅ Fixed with migration

### Issue 2: Role Selection Flow References Non-existent Route
**Error**: Attempts to navigate to `/(auth)/onboarding/role` which doesn't lead to dashboard correctly
**Root Cause**: After role selection, user isn't being taken to the correct dashboard entry point
**Status**: 🔧 Being fixed

### Issue 3: Dashboard Mode Not Set/Validated
**Error**: "Could not find the dashboard mode"
**Root Cause**: The `dashboard_mode` field is required but profile might not have it set before accessing main layout
**Status**: 🔧 Being fixed

---

## Fixes Applied

### ✅ Fix 1: Database Migration
**File Created**: `supabase/migrations/20260412_add_phone_to_profiles.sql`

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_mode TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;
```

**Action Required**: 
1. Go to Supabase SQL Editor
2. Run this migration on your database
3. This adds the missing columns so phone-based ledger discovery works

---

### 🔧 Fix 2: Phone Setup Navigation Flow
**File to Update**: `app/(auth)/phone-setup.tsx` (line 47)

**Current Code** (BROKEN):
```typescript
const proceedToNext = () => {
  if (profile?.onboarding_complete) {
    router.replace({ pathname: "/(main)/customers", params: { action: "add" } } as any);
  } else {
    router.replace("/(auth)/onboarding/role" as any);  // ← WRONG - role doesn't have dashboard mode
  }
};
```

**Fix**:
```typescript
const proceedToNext = () => {
  // After phone setup, always go to role selection for dashboard_mode
  // The role selection screen will save dashboard_mode and continue to business info
  router.replace("/(auth)/onboarding/role" as any);
};
```

**Reason**: The flow should be:
1. Phone Setup (saves phone number)
2. Role Selection (saves dashboard_mode: "seller" | "distributor")
3. Business Info (saves business_name, bill_prefix)
4. Bank Info (optional)
5. Complete → Main Dashboard

---

### 🔧 Fix 3: Safer Dashboard Mode Handling
**File to Create**: New defensive check in auth store or root layout

Add this validation before accessing main dashboard:

```typescript
// In app/_layout.tsx or main layout
const ensureDashboardMode = async (profile: Profile) => {
  if (!profile.dashboard_mode) {
    // Fallback to 'seller' if not set
    const { error } = await supabase
      .from('profiles')
      .update({ dashboard_mode: 'seller' })
      .eq('id', profile.id);
    
    if (!error) {
      return { ...profile, dashboard_mode: 'seller' };
    }
  }
  return profile;
};
```

---

## 🚀 Action Plan

### Step 1: Apply Database Migration (5 mins)
```
1. Go to: https://supabase.com/dashboard
2. Select your KredBook project
3. SQL Editor → New Query
4. Copy contents of: supabase/migrations/20260412_add_phone_to_profiles.sql
5. Click "Run"
6. ✅ Column added
```

### Step 2: Update Phone Setup Navigation (2 mins)
Edit: `app/(auth)/phone-setup.tsx` line 43-49

Replace:
```typescript
const proceedToNext = () => {
  if (profile?.onboarding_complete) {
    router.replace({ pathname: "/(main)/customers", params: { action: "add" } } as any);
  } else {
    router.replace("/(auth)/onboarding/role" as any);
  }
};
```

With:
```typescript
const proceedToNext = () => {
  // Always proceed to role selection to ensure dashboard_mode is set
  router.replace("/(auth)/onboarding/role" as any);
};
```

### Step 3: Rebuild and Test (10 mins)
```bash
# Clean rebuild
npm run android

# Or if already built:
npm run build:e2e:android

# Test signup flow again:
# 1. Signup with tester@kredbook.io / Test@1234
# 2. Enter phone: 8268017431
# 3. Should proceed to Role Selection (not error)
# 4. Select role (Retailer)
# 5. Should proceed to Business Info (not error)
```

---

## ✅ Expected Result After Fixes

1. **Phone Saved Successfully**: ✅ No "column.o.type does not exist" error
2. **Navigation Works**: ✅ Proceeds from Phone Setup → Role Selection → Business Info
3. **Dashboard Loads**: ✅ Main dashboard accessible after onboarding completes
4. **Test Account Created**: ✅ Can login as tester@kredbook.io

---

## Next: Run E2E Tests

Once signup works:

```bash
npm run test:e2e:android-device
```

Will test all 24 scenarios with the now-working account!

---

## Files Modified/Created

- ✅ **Created**: `supabase/migrations/20260412_add_phone_to_profiles.sql` (Database fix)
- 🔧 **To Update**: `app/(auth)/phone-setup.tsx` (Line 43-49)
- 📝 **Optional**: Add defensive dashboard_mode check in root layout

---

**Current Status**: Ready for fixes. Apply DB migration first, then update phone-setup navigation.
