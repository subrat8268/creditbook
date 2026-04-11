# 🔧 FIXED - Signup Flow & Ledger Discovery

## Issues Resolved

### Issue 1: Missing columns on `profiles` table
**Error**: `Failed to save phone code 42703 column.profile.dashboard_mode does not exist`
**Fix**: Added `phone` and `dashboard_mode` columns to the `profiles` table. `dashboard_mode` now defaults to `'seller'`.

### Issue 2: Broken Ledger Discovery RPCs
**Error**: `Failed to save phone code 42703 column.o.type does not exist`
**Root Cause**: The `find_ledgers_by_phone` and `get_ledger_by_token` RPCs referenced a deprecated `type` column in the `orders` table.
**Fix**: Refactored both functions to use current table structures:
- `balance` is now calculated using `SUM(o.balance_due)`.
- `total_sales` and `total_payments` use `total_amount` and `amount_paid` from the `orders` table.
- Field names in `get_ledger_by_token` (e.g., `price`, `subtotal`) aligned with `order_items` table.

### Issue 3: Stale Onboarding Step
**Goal**: Remove the redundant "Role Selection" step.
**Fix**: 
- Deleted `app/(auth)/onboarding/role.tsx`.
- Updated `app/_layout.tsx`, `app/(auth)/phone-setup.tsx`, and onboarding index to bypass the role step.
- Users now go directly from **Phone Setup** → **Business Info** (Step 1) → **Bank Info** (Step 2).

---

## 🚀 Applied Fixes

### 1. Database Migration (APPLIED)
The migration file at `supabase/migrations/20260412_add_phone_to_profiles.sql` has been updated and applied to the database. It includes:
- Column additions for `profiles`.
- Full repair of the ledger discovery RPC functions.

### 2. Navigation Flow (FIXED)
The app now follows the streamlined 2-step onboarding path:
1. **Phone Setup**: Collects verified phone number for ledger linking.
2. **Business Setup**: Collects business name and prefix (Step 1 of 2).
3. **Bank Setup**: Collects payment identifiers (Step 2 of 2).
4. **Complete**: Redirects to the main dashboard.

---

## ✅ Expected Result
- **New Users**: Can sign up, set up their phone, and proceed through business info without "Column not found" errors.
- **ledger Discovery**: Entering a phone number in `phone-setup.tsx` correctly finds and links existing ledgers via the repaired `find_ledgers_by_phone` RPC.
- **Dashboard**: Loads immediately after onboarding completion with `dashboard_mode = 'seller'` by default.

---

## Verified Files
- [x] `supabase/migrations/20260412_add_phone_to_profiles.sql` (Schema & RPC Fix)
- [x] `app/_layout.tsx` (Bypass logic)
- [x] `app/(auth)/phone-setup.tsx` (Bypass logic)
- [x] `app/(auth)/onboarding/index.tsx` (Bypass logic)
- [x] `app/(auth)/onboarding/business.tsx` (Step 1 of 2)
- [x] `app/(auth)/onboarding/bank.tsx` (Step 2 of 2)
- [x] `app/(auth)/onboarding/role.tsx` (DELETED)
