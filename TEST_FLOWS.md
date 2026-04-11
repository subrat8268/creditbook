# KredBook — Comprehensive E2E & Manual Test Guide

> **Last Updated**: April 11, 2026  
> **Scope**: Complete testing guide for KredBook (App)  
> **Platform**: Android (primary), iOS (optional)  
> **Testing Strategy**: Single Device → Two Device (Ledger Connection)  
> **Contact**: QA Lead / Testing Team

---

## 🎯 Quick Navigation

- [Testing Strategy](#testing-strategy)
- [Quick Start](#quick-start)
- [Test Account Setup](#test-account-setup)
- [Test Data](#test-data)
- [Phase 1: Single Device Testing](#phase-1-single-device-testing)
- [Phase 2: Two Device Testing](#phase-2-two-device-testing)
- [Automated E2E Tests](#automated-e2e-tests)
- [Manual QA Testing](#manual-qa-testing)
- [Troubleshooting](#troubleshooting)

---

## Testing Strategy

### Phase 1: Single Device Testing ✅ First
Test core functionality on **one device** to verify basic flows work correctly.

### Phase 2: Two Device Testing ✅ Then
Test **real-time ledger synchronization** using **two physical devices** simultaneously:
- Device A: Shopkeeper (creates entry)
- Device B: Customer (receives notification, views their ledger)

Both devices logged in to same account to verify ledger updates sync in real-time.

---

## Quick Start

### For Automated E2E Testing (Single Device):

```bash
# 1. Install dependencies
npm install && npm install -g detox-cli

# 2. Build APK
npm run build:e2e:android

# 3. Run all tests (24 total)
npm run test:e2e:android-device

# OR run specific test suites
detox test e2e/auth.e2e.js --configuration android.device.debug      # Signup/login
detox test e2e/smoke.e2e.js --configuration android.device.debug     # Dashboard/entries
```

### For Manual QA Testing:

**Phase 1 (Single Device):**
1. Create test account: `tester@kredbook.io` / `Test@1234`
2. Add test customers with phone numbers
3. Follow Phase 1 manual tests
4. Log results

**Phase 2 (Two Devices):**
1. Connect 2 physical devices via WiFi
2. Login to both with same account
3. Follow Phase 2 manual tests (ledger sync)
4. Verify real-time updates

---

## Test Account Setup

### Primary Test Account: `tester@kredbook.io`

Used for **both single device and two device testing**.

| Field | Value |
|-------|-------|
| Email | tester@kredbook.io |
| Password | Test@1234 |
| Full Name | Test User |
| Business Name | Test Store |
| Bill Prefix | TEST |
| Phone | 8268017431 |

**How to Create:**

#### Option A: Supabase Dashboard (Manual)
1. Go to Supabase → Authentication → Users
2. Click "Add User"
3. Enter email & password (above)
4. ✅ Check "Auto confirm user"
5. Click "Create User"

#### Option B: Via Script (Recommended)

Create `scripts/setup-qa-account.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function setupQAAccount() {
  // 1. Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'tester@kredbook.io',
    password: 'Test@1234',
    email_confirm: true,
  });

  if (authError) {
    console.error('Failed to create auth user:', authError);
    return;
  }

  console.log('✅ Auth user created:', authUser.user.id);

  // 2. Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: 'tester@kredbook.io',
      business_name: 'Test Store',
      bill_number_prefix: 'TEST',
      phone: '8268017431',
    });

  if (profileError) {
    console.error('Failed to create profile:', profileError);
    return;
  }

  console.log('✅ Profile created');
}

setupQAAccount().catch(console.error);
```

Run: `npx ts-node scripts/setup-qa-account.ts`

---

## Test Data

### Real Phone Numbers for Testing

| Name | Phone | Type | Purpose |
|------|-------|------|---------|
| Test Customer 1 | **8268017431** | Shopkeeper/Person | Primary test customer |
| Test Customer 2 | **7021344154** | Shopkeeper/Person | Secondary test customer |

### How to Add Test Customers

#### Via App (In-App Flow):

1. Login to app with `tester@kredbook.io` / `Test@1234`
2. Complete onboarding
3. Go to **Customers** tab
4. Click **Add Customer**
5. Enter:
   - Name: "Test Customer 1"
   - Phone: "8268017431"
6. Save
7. Repeat for "Test Customer 2" with phone "7021344154"

#### Via Supabase SQL:

```sql
INSERT INTO customers (name, phone, vendor_id, created_at)
VALUES 
  ('Test Customer 1', '8268017431', '[TESTER_USER_ID]', NOW()),
  ('Test Customer 2', '7021344154', '[TESTER_USER_ID]', NOW());
```

### Test Products

| Product Name | Price | Type |
|---|---|---|
| Test Item 1 | ₹100 | Consumable |
| Test Item 2 | ₹500 | Service |

**Add via App:**
1. Go to **Products** tab
2. Click **Add Product**
3. Enter name & price
4. Save

---

## Phase 1: Single Device Testing

### Prerequisites

- ✅ 1 Physical Android device (preferred) OR Emulator
- ✅ Test account created: `tester@kredbook.io` / `Test@1234`
- ✅ Test customers added (8268017431, 7021344154)
- ✅ APK built: `npm run build:e2e:android`

### Device Setup

#### Physical Android Device (Wireless Debugging)

```bash
# Enable Developer Mode
# Settings → About Phone → Tap "Build Number" 7 times

# Enable USB Debugging
# Settings → Developer Options → USB Debugging: ON

# Check connection
adb devices

# For WiFi (optional)
adb connect <device-ip>:5555
```

#### Android Emulator

```bash
# Start emulator
emulator -avd Pixel_5_API_33

# Verify in Detox
detox list-devices
```

### Automated Tests for Phase 1

**Run all 24 E2E tests:**

```bash
npm run build:e2e:android
npm run test:e2e:android-device
```

**Or run individually:**

```bash
# Auth tests only (signup/login)
detox test e2e/auth.e2e.js --configuration android.device.debug

# Main flow tests only (dashboard/entries/offline)
detox test e2e/smoke.e2e.js --configuration android.device.debug
```

**Expected Output:**
```
KredBook Authentication E2E Tests
  ✓ should complete full signup flow with new account
  ✓ should show validation error for invalid email
  ✓ should show validation error for password mismatch
  ✓ should show validation error for weak password
  ✓ should show validation error for empty full name
  ✓ should show error for duplicate email
  ✓ should log in with valid credentials
  ✓ should show error for invalid credentials
  ✓ should show error for non-existent email
  ✓ should validate email format on login
  ✓ should persist login state after app restart
  ✓ should require login after logout

KredBook E2E Tests - Main Flow
  ✓ logs in and reaches dashboard
  ✓ should display dashboard with valid data
  ✓ should create quick amount entry successfully
  ✓ should handle offline entry creation gracefully
  ✓ should recover from session timeout gracefully
  ✓ should validate phone number format correctly
  ✓ should display entries after creation
  ✓ should prevent empty customer selection
  ✓ should prevent empty amount input
  ✓ [Optional] customer detail and ledger

Passed: 24/24 tests ✅
```

### Manual Tests for Phase 1

See [Manual QA Testing](#manual-qa-testing) section for complete manual test cases.

**Phase 1 Focus:**
- Test Cases 1-9: Core functionality
- Skip Test Case 10 (Two-Device Ledger Sync) until Phase 2

---

## Phase 2: Two Device Testing

### When to Start Phase 2

✅ **AFTER Phase 1 is complete and all tests pass**

### Prerequisites

- ✅ Phase 1 tests passed on single device
- ✅ **2 Physical Android devices** (same app version)
- ✅ Both devices connected to same WiFi network
- ✅ Both devices have minimum 50% battery
- ✅ Both devices have good network signal
- ✅ Test account + data already seeded: `tester@kredbook.io`

### Two Device Setup

#### Device Labeling

| Device | Role | Login | Purpose |
|--------|------|-------|---------|
| **Device A** | Shopkeeper | tester@kredbook.io | Creates entries, performs transactions |
| **Device B** | Ledger Viewer | tester@kredbook.io | Receives updates, verifies ledger sync |

#### Connect Both Devices

```bash
# Terminal 1 - Device A
adb -s <DEVICE_A_SERIAL> devices

# Terminal 2 - Device B
adb -s <DEVICE_B_SERIAL> devices

# Verify both connected
adb devices
# Output:
# DEVICE_A_SERIAL    device
# DEVICE_B_SERIAL    device
```

#### Install App on Both

```bash
# Device A
adb -s <DEVICE_A_SERIAL> install android/app/build/outputs/apk/debug/app-debug.apk

# Device B
adb -s <DEVICE_B_SERIAL> install android/app/build/outputs/apk/debug/app-debug.apk
```

#### Login on Both

1. **Device A**: Open app → Login: `tester@kredbook.io` / `Test@1234`
2. **Device B**: Open app → Login: `tester@kredbook.io` / `Test@1234`
3. Both should reach Dashboard

### Phase 2 Manual Tests

**Test Case 2.1: Real-Time Entry Sync**

| Device A (Shopkeeper) | Device B (Ledger Viewer) | Expected |
|---|---|---|
| 1. Go to "Add Entry" tab | Watch Customer ledger | |
| 2. Select "Test Customer 1" (8268017431) | | |
| 3. Enter amount: "₹500" | | |
| 4. Tap "Save & Share" | Watch for notification | Entry appears instantly |
| 5. Entry saved successfully | Ledger updates in real-time | Balance: +₹500 |

**Result:**
- [ ] Entry created on Device A
- [ ] Entry appears on Device B ledger (within 2 seconds)
- [ ] Balance updated correctly
- [ ] No manual refresh needed

---

**Test Case 2.2: Multiple Entries Sync**

| Device A | Device B | Expected |
|---|---|---|
| 1. Create entry: "Test Customer 1" → ₹250 | Watch ledger | |
| 2. Create entry: "Test Customer 2" (7021344154) → ₹1000 | Watch updates | |
| 3. Create entry: "Test Customer 1" → ₹100 | Watch total | |
| 4. Navigate to "Test Customer 1" detail | Verify balance | Total: ₹350 |

**Result:**
- [ ] All 3 entries sync to Device B
- [ ] Balances correct for each customer
- [ ] No entries missing or duplicated

---

**Test Case 2.3: Payment Recording Sync**

| Device A | Device B | Expected |
|---|---|---|
| 1. Go to "Add Entry" | Watch ledger | |
| 2. Toggle to "Payment" | | |
| 3. Select "Test Customer 1" (8268017431) | | |
| 4. Enter payment: "₹200" | | |
| 5. Tap "Record Payment" | Watch balance update | Balance decreases by ₹200 |
| 6. Verify on Device A customer detail | Compare with Device B | Same balance both devices |

**Result:**
- [ ] Payment recorded on Device A
- [ ] Device B shows updated balance instantly
- [ ] Balance matches on both devices

---

**Test Case 2.4: Offline Entry → Sync (Both Devices)**

| Device A | Device B | Expected |
|---|---|---|
| 1. Enable Airplane Mode on Device A | Device B stays online | |
| 2. Create entry: "Test Customer 2" → ₹750 | Device B shows "offline" for A | Entry saved locally |
| 3. Message shows "Saved locally" | Device B ledger unchanged yet | No premature sync |
| 4. Disable Airplane Mode on Device A | Device B watches | |
| 5. Wait 3-5 seconds | Ledger updates appear | Entry syncs to Device B |
| 6. Check balance on both | Should match | Ledger consistent |

**Result:**
- [ ] Entry saved locally on offline device
- [ ] No sync until network restored
- [ ] Sync happens automatically after reconnect
- [ ] Both devices show same final balance

---

**Test Case 2.5: Network Flakiness**

| Device A | Device B | Expected |
|---|---|---|
| 1. Both logged in on WiFi | | |
| 2. Create entry: "Test Customer 1" → ₹300 | Watch for sync | |
| 3. Toggle WiFi off/on quickly (3 times) | Device B shows inconsistent updates? | Should eventually sync |
| 4. Wait 5 seconds for stabilization | | |
| 5. Check final balance on both | | Should match after stability |

**Result:**
- [ ] App handles WiFi toggle without crashing
- [ ] Final state consistent on both devices
- [ ] No data loss despite network issues

---

**Test Case 2.6: Session Timeout Sync**

| Device A | Device B | Expected |
|---|---|---|
| 1. Create entry on A: "Test Customer 1" → ₹100 | Syncs to B | ✓ |
| 2. Background Device A (5+ minutes) | B shows entry | ✓ |
| 3. Foreground Device A (return) | | |
| 4. Try to create new entry | Check B for new entry | Entry syncs or fails gracefully |
| 5. If auth failed, re-login | | |
| 6. Verify both devices in sync | | Final state matches |

**Result:**
- [ ] Session handled gracefully after timeout
- [ ] Re-login works without data loss
- [ ] Entries sync correctly after session recovery

---

**Test Case 2.7: Ledger Accuracy Check**

| Verification | Device A | Device B | Status |
|---|---|---|---|
| Customer 1 balance | | | MATCH |
| Customer 2 balance | | | MATCH |
| Total outstanding | | | MATCH |
| Entry count | | | MATCH |
| Last entry date | | | MATCH |

**Steps:**
1. Device A: Go to Customers → Test Customer 1 → View ledger
2. Note: Balance, Last entry, Total
3. Device B: Go to Customers → Test Customer 1 → View ledger
4. Compare all fields
5. Repeat for Test Customer 2

**Result:**
- [ ] All balances match between devices
- [ ] Entry counts identical
- [ ] Timestamps consistent
- [ ] No data corruption

---

## Automated E2E Tests

### Total Coverage: 24 Test Cases

**Files:**
- `e2e/auth.e2e.js` — 12 authentication tests (signup, login, auth state)
- `e2e/smoke.e2e.js` — 12 main flow tests (dashboard, entries, offline, validation)

### Automated Tests Structure

**Authentication Tests (e2e/auth.e2e.js) - 12 tests**

| # | Test Name | Scenario | Expected Result |
|---|---|---|---|
| 1 | Complete Signup Flow | New user signup → onboarding | Account created, dashboard loads |
| 2 | Invalid Email Format | Signup with invalid email | Error shown |
| 3 | Password Mismatch | Passwords don't match | Error shown |
| 4 | Weak Password | Password < 6 chars | Error shown |
| 5 | Empty Full Name | Skip full name field | Error shown |
| 6 | Duplicate Email | Signup with existing email | Error shown |
| 7 | Valid Login | Correct credentials | Dashboard loads |
| 8 | Invalid Password | Wrong password | Error shown |
| 9 | Non-existent Email | Email not in system | Error shown |
| 10 | Email Validation Login | Invalid email format | Error or button disabled |
| 11 | Login Persistence | Login → Restart app | Still logged in |
| 12 | Logout Flow | Logout → Try action | Back on login screen |

**Main Flow Tests (e2e/smoke.e2e.js) - 12 tests**

| # | Test Name | Scenario | Expected Result |
|---|---|---|---|
| 13 | Login Successfully | tester@kredbook.io / Test@1234 | Dashboard loads |
| 14 | Dashboard Display | Dashboard loads | Stats & entries visible |
| 15 | Create Quick Entry | Select customer → Amount 500 → Save | Success toast |
| 16 | Offline Creation + Sync | Airplane mode → Create → Restore | "Saved locally" → "synced" |
| 17 | Session Recovery | Background 5+ min → Return | Still logged in or clean auth |
| 18 | Phone Validation | Try invalid/valid phones | Error for invalid, accept valid |
| 19 | Entries List Display | Create entry → View list | New entry appears |
| 20 | Customer Detail Ledger | Open customer → View detail | Balance updated |
| 21 | Empty Customer Selection | Try save without customer | Error shown |
| 22 | Empty Amount Input | Skip amount → Save | Error shown |
| 23 | Network Toggle | Offline/online simulation | Sync works correctly |
| 24 | Async Operation Handling | Wait for API responses | Tests handle timeouts |

---

## Manual QA Testing

### Manual Test Template

For each test case below, fill in:
- **Date/Time**: When test was run
- **Device**: Device name/model
- **Build**: App version
- **Actual Result**: What actually happened
- **Status**: PASS / FAIL
- **Notes**: Any issues or observations

---

### Phase 1: Single Device Tests

#### Test Case 1: Signup + Onboarding

**Steps:**
1. Open app on fresh device (no cached login)
2. Tap "Sign Up"
3. Enter: Full Name "Test User", Email "qa-[timestamp]@test.com", Password "Test@1234"
4. Complete all onboarding screens
5. Verify dashboard loads with empty state

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| Screenshots | |
| Notes | |

---

#### Test Case 2: Dashboard Load

**Steps:**
1. Login with `tester@kredbook.io` / `Test@1234`
2. Verify all stats cards load
3. Check totals are accurate

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| Notes | |

---

#### Test Case 3: Add Entry (Quick Amount)

**Steps:**
1. Tap "Add Entry" tab
2. Search & select "Test Customer 1" (8268017431)
3. Enter amount: "500"
4. Tap "Save & Share"
5. Verify success toast

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| Notes | |

---

#### Test Case 4: Add Entry (With Items)

**Steps:**
1. Tap "Add Entry" tab
2. Select "Test Customer 2" (7021344154)
3. Click "Add Items"
4. Add "Test Item 1" (₹100) × 2 = ₹200
5. Add "Test Item 2" (₹500) × 1 = ₹500
6. Total should be ₹700
7. Save & Share

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| Notes | |

---

#### Test Case 5: Offline Entry Creation

**Steps:**
1. Enable Airplane Mode
2. Create entry with "Test Customer 1"
3. Amount: "250"
4. Verify "Saved locally" message
5. Disable Airplane Mode
6. Wait 3-5 seconds
7. Verify "synced" message

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| Offline Banner | Visible / Not Visible |
| Sync Status | Synced / Failed |
| Notes | |

---

#### Test Case 6: View Customer Ledger

**Steps:**
1. Go to Customers tab
2. Tap "Test Customer 1" (8268017431)
3. Verify ledger shows all entries
4. Check balance calculation
5. Verify transaction history

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| Balance Correct | Yes / No |
| Notes | |

---

#### Test Case 7: Record Payment

**Steps:**
1. Go to "Add Entry"
2. Select "Test Customer 1"
3. Toggle to "Payment" type
4. Enter amount: "500"
5. Tap "Record Payment"
6. Verify success
7. Check balance updated

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| New Balance | |
| Notes | |

---

#### Test Case 8: Session Timeout

**Steps:**
1. Login
2. Leave app for 10+ minutes
3. Return to app
4. Try any action
5. Verify user stays logged in or sees clean auth

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Actual Result | |
| Status | PASS / FAIL |
| Session Persisted | Yes / No |
| Notes | |

---

#### Test Case 9: Input Validation

**Steps:**

**For Phone Input:**
- Try: "123" → Should show error
- Try: "abcd" → Should show error
- Try: "8268017431" → Should accept

**For Amount Input:**
- Try: "-500" → Should show error or not accept
- Try: "abc" → Should not accept
- Try: "500" → Should accept

**For Email Input:**
- Try: "not-email" → Should show error
- Try: "test@example.com" → Should accept

| Field | Value |
|-------|-------|
| Date/Time | |
| Device | |
| Build | |
| Phone Validation | PASS / FAIL |
| Amount Validation | PASS / FAIL |
| Email Validation | PASS / FAIL |
| Notes | |

---

### Phase 2: Two Device Tests

#### Test Case 10: Real-Time Ledger Sync (Two Devices)

**Setup:**
- Device A: Shopkeeper (tester@kredbook.io)
- Device B: Ledger Viewer (tester@kredbook.io)
- Both logged in, both on dashboard

**Steps:**
1. Device A: Go to "Add Entry"
2. Device A: Select "Test Customer 1" (8268017431)
3. Device A: Enter "500"
4. Device A: Tap "Save & Share"
5. Device B: Watch ledger in real-time
6. Device B: Go to Customers → Test Customer 1
7. Device B: Verify balance shows +500

| Field | Device A | Device B | Status |
|---|---|---|---|
| Date/Time | | | |
| Build | | | |
| Entry Created | ✓ | | |
| Sync Time | | < 2s | |
| Balance Updated | | ✓ | |
| **Overall** | | | PASS / FAIL |
| Notes | | | |

---

#### Test Case 11: Offline Sync (Two Devices)

**Setup:**
- Device A: Shopkeeper (offline via Airplane Mode)
- Device B: Ledger Viewer (online)
- Both logged in

**Steps:**
1. Device A: Enable Airplane Mode
2. Device A: Create entry: "Test Customer 2" → "750"
3. Device A: Verify "Saved locally"
4. Device B: Watch ledger (should NOT update yet)
5. Device A: Disable Airplane Mode
6. Device B: Watch ledger update
7. Device B: Verify final balance correct

| Field | Device A | Device B | Status |
|---|---|---|---|
| Offline Entry Saved | ✓ | | |
| B Doesn't Update (offline) | | ✓ | |
| A Restores Network | ✓ | | |
| B Receives Sync | | ✓ | |
| Final Balance Match | ✓ | ✓ | |
| **Overall** | | | PASS / FAIL |

---

#### Test Case 12: Network Flakiness (Two Devices)

**Setup:**
- Both devices on WiFi
- Both logged in, both online

**Steps:**
1. Device A: Create entry → Test Customer 1 → "300"
2. Device B: Verify sync (should appear quickly)
3. Device A: Toggle WiFi off/on (3 times rapidly)
4. Device B: Watch for sync consistency
5. Wait 5 seconds for network stability
6. Device A: View Test Customer 1 ledger
7. Device B: View Test Customer 1 ledger
8. Compare balances

| Field | Value |
|-------|-------|
| Entry Created | PASS / FAIL |
| WiFi Toggle | A: Works / Crashes |
| B: Consistent / Flaky |
| Final Balance Match | Yes / No |
| Data Loss | None / Yes |
| **Overall** | PASS / FAIL |
| Notes | |

---

## Test Execution Log

### Phase 1: Single Device Testing

| Test # | Test Name | Date | Device | Status | Notes |
|--------|-----------|------|--------|--------|-------|
| 1 | Signup + Onboarding | | | | |
| 2 | Dashboard Load | | | | |
| 3 | Quick Entry | | | | |
| 4 | Items Entry | | | | |
| 5 | Offline Sync | | | | |
| 6 | Customer Ledger | | | | |
| 7 | Payment Record | | | | |
| 8 | Session Timeout | | | | |
| 9 | Input Validation | | | | |
| Auto | E2E Tests (24 total) | | | | |

**Phase 1 Summary:** ___ / 10 PASS  
**Overall Phase 1:** ✅ READY FOR PHASE 2 / ⚠️ ISSUES FOUND  
**Tester:** __________ | **Date:** __________  
**Approval:** ✅ YES / ❌ NO — Proceed to Phase 2

---

### Phase 2: Two Device Testing

| Test # | Test Name | Device A | Device B | Status | Notes |
|--------|-----------|----------|----------|--------|-------|
| 10 | Real-Time Sync | | | | |
| 11 | Offline Sync | | | | |
| 12 | Network Flakiness | | | | |

**Phase 2 Summary:** ___ / 3 PASS  
**Overall Phase 2:** ✅ PRODUCTION READY / ⚠️ NEEDS FIXES  
**Tester:** __________ | **Date:** __________  
**Approval:** ✅ YES / ❌ NO — Ready for Release

---

## Troubleshooting

### Detox Issues

**Problem:** "Device not found"
```bash
adb kill-server
adb start-server
adb devices
adb connect <device-ip>:5555
```

**Problem:** "APK installation failed"
```bash
rm -rf android/app/build
npm run build:e2e:android
```

**Problem:** "Test timeout"
- Increase timeout in test file
- Check network connection
- Verify device has storage space
- For offline tests, use `device.simulateNetworkState()`

**Problem:** "Detox CLI not found"
```bash
npm install -g detox-cli
detox --version
```

---

### Two Device Sync Issues

**Problem:** "Entry not appearing on Device B"
- [ ] Both devices on same WiFi
- [ ] Both devices have internet access
- [ ] Firewall not blocking traffic
- [ ] Check Supabase real-time is enabled
- [ ] Wait 3-5 seconds before checking

**Problem:** "Devices show different balances"
- [ ] Force refresh on both devices (swipe down)
- [ ] Check if sync is in progress
- [ ] Verify no offline queue pending
- [ ] Check network connection status

**Problem:** "WiFi toggle causes crash"
- [ ] App might be missing network error handling
- [ ] Check logcat for errors
- [ ] File bug with crash details

---

### Test Data Issues

**Problem:** "Can't find customer in picker"
- Verify customer was created with exact name
- Check network sync completed
- Restart app

**Problem:** "Amount won't accept decimal"
- Use integer values for testing (e.g., 500 not 500.50)
- Or check if decimal support is needed

---

## Success Criteria

### Phase 1: Single Device ✅

- [ ] All 24 automated E2E tests pass
- [ ] All 9 manual QA tests pass
- [ ] No app crashes or unhandled errors
- [ ] Account creation works end-to-end
- [ ] Offline sync functions correctly
- [ ] Session management works as expected

### Phase 2: Two Devices ✅

- [ ] Real-time ledger sync works (< 2 seconds)
- [ ] Offline entry eventually syncs after reconnect
- [ ] Network flakiness handled gracefully
- [ ] Both devices show consistent balances
- [ ] No data loss or corruption
- [ ] App handles simultaneous operations

---

## Key Files

| File | Purpose |
|------|---------|
| `detox.config.js` | Detox configuration |
| `e2e/auth.e2e.js` | Signup/login tests |
| `e2e/smoke.e2e.js` | Dashboard/entry tests |
| `e2e/jest.config.js` | Jest configuration |
| `e2e/init.js` | Detox lifecycle |
| `package.json` | npm scripts |
| `TEST_FLOWS.md` | This file (all-in-one guide) |

---

## Contact & Support

- **Questions?** Check [Troubleshooting](#troubleshooting) section
- **Need help?** Review test files: `e2e/auth.e2e.js`, `e2e/smoke.e2e.js`
- **Report bug?** Log in [Test Execution Log](#test-execution-log)

---

**Last Updated:** April 11, 2026  
**Version:** 2.0 (Single Device + Two Device Testing)  
**Status:** ✅ Ready for Testing
