# KredBook E2E Testing — Setup & Execution Guide

> **Last Updated**: April 11, 2026
> **Scope**: Detox E2E automation + manual QA flow for KredBook (React Native, Expo)

---

## Quick Start

### 1. Prerequisites

- ✅ Node.js 18+ (for running Detox)
- ✅ Android SDK (for Android emulator) OR physical Android device
- ✅ iOS Xcode + Simulator (optional, for iOS testing)
- ✅ Detox CLI: `npm install -g detox-cli`

### 2. Build & Test

```bash
# Install dependencies
npm install

# Build APK for Android (physical device or emulator)
npm run build:e2e:android

# OR build for emulator
npm run build:e2e:emulator

# Run E2E tests on physical Android device (wireless debugging)
npm run test:e2e:android-device

# OR run on emulator
npm run test:e2e:android-emulator

# OR run on iOS simulator
npm run test:e2e:ios
```

---

## Tester Account Setup (One-Time)

### Create `tester@kredbook.io` Account

#### Option A: Via Supabase Dashboard (Manual)

1. **Open Supabase Console**
   - Navigate to your Supabase project
   - Go to **Authentication → Users**
   - Click **Add User**

2. **Enter Credentials**
   - Email: `tester@kredbook.io`
   - Password: `Test@1234`
   - ✅ Auto confirm user (toggle "Auto confirm user")

3. **Create Account**
   - Click **Create User**

#### Option B: Via Antigravity Script (Recommended)

Create a script: `scripts/setup-qa-account.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key

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

  // 2. Create profile record
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: 'tester@kredbook.io',
      business_name: 'Test Store',
      bill_number_prefix: 'TEST',
      phone: '9999999999',
    });

  if (profileError) {
    console.error('Failed to create profile:', profileError);
    return;
  }

  console.log('✅ Profile created');
}

setupQAAccount().catch(console.error);
```

**Run Script**:
```bash
npx ts-node scripts/setup-qa-account.ts
```

---

## Seed Data Setup (One-Time)

### Create Test Customer & Product

After the tester account is created, add these in-app or via Supabase:

#### Customer Record

| Field | Value |
|-------|-------|
| **Name** | Test Customer |
| **Phone** | 9876543210 |
| **Vendor ID** | [tester's user_id] |

**SQL Insert** (if using Supabase directly):
```sql
INSERT INTO customers (name, phone, vendor_id, created_at)
VALUES (
  'Test Customer',
  '9876543210',
  'tester-user-id-here',
  NOW()
);
```

#### Product Record

| Field | Value |
|-------|-------|
| **Name** | Test Item |
| **Price** | 100 |
| **Vendor ID** | [tester's user_id] |

**SQL Insert**:
```sql
INSERT INTO products (name, price, vendor_id, created_at)
VALUES (
  'Test Item',
  100,
  'tester-user-id-here',
  NOW()
);
```

### Via In-App Flow (Manual)

1. Open app
2. Login with `tester@kredbook.io` / `Test@1234`
3. Complete onboarding
4. Go to **Customers tab**
5. Add: "Test Customer" (phone: 9876543210)
6. Go to **Products tab**
7. Add: "Test Item" (price: 100)

---

## Device Setup

### Physical Android Device (Wireless Debugging)

#### Enable Developer Mode

1. Open **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **Developer Options**
5. Enable **USB Debugging**
6. Enable **Wireless Debugging** (if available)

#### Connect via ADB

```bash
# Check connected devices
adb devices

# Connect via WiFi (optional, if enabled on device)
adb connect <device-ip>:5555

# Verify device is listed
adb devices
```

### Android Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator (example: Pixel_5_API_33)
emulator -avd Pixel_5_API_33

# Verify in Detox
detox list-devices
```

---

## Running E2E Tests

### Build APK First

```bash
# Build debug APK (creates app-debug.apk)
npm run build:e2e:android

# OR for emulator
npm run build:e2e:emulator
```

### Execute Tests on Physical Device

```bash
# Run all E2E tests (both auth and main flow)
npm run test:e2e:android-device

# Run only authentication tests (signup, login, auth state)
detox test e2e/auth.e2e.js --configuration android.device.debug

# Run only main flow tests (dashboard, entry creation, etc.)
detox test e2e/smoke.e2e.js --configuration android.device.debug

# Run with verbose logging
detox test --configuration android.device.debug --verbose

# Record video of test execution
detox test --configuration android.device.debug --record-logs all
```

### Execute Tests on Emulator

```bash
npm run test:e2e:android-emulator
```

### Execute Tests on iOS

```bash
npm run test:e2e:ios
```

---

## E2E Test Cases Included

### Authentication Tests (auth.e2e.js)

#### Signup Flow Tests (8 tests)

1. **Complete Signup Flow** (`should complete full signup flow with new account`)
   - Navigate to signup
   - Enter full name, email, password
   - Confirm password
   - Tap create account
   - Verify onboarding or dashboard loads

2. **Invalid Email Validation** (`should show validation error for invalid email`)
   - Enter invalid email format
   - Verify error message displayed

3. **Password Mismatch** (`should show validation error for password mismatch`)
   - Enter mismatched passwords
   - Verify error message

4. **Weak Password** (`should show validation error for weak password`)
   - Enter password < 6 characters
   - Verify strength error

5. **Empty Full Name** (`should show validation error for empty full name`)
   - Skip full name field
   - Verify required field error

6. **Duplicate Email** (`should show error for duplicate email`)
   - Try signup with existing email
   - Verify "already exists" error

#### Login Flow Tests (4 tests)

7. **Valid Login** (`should log in with valid credentials`)
   - Enter valid email and password
   - Verify dashboard loads

8. **Invalid Credentials** (`should show error for invalid credentials`)
   - Enter wrong password
   - Verify error message

9. **Non-existent Email** (`should show error for non-existent email`)
   - Enter non-existent email
   - Verify not found error

10. **Email Format Validation** (`should validate email format on login`)
    - Enter invalid email format
    - Verify disabled button or error

#### Auth State Tests (2 tests)

11. **Persist Login After Restart** (`should persist login state after app restart`)
    - Login
    - Restart app
    - Verify still logged in

12. **Logout Flow** (`should require login after logout`)
    - Login
    - Navigate to settings and logout
    - Verify back on login screen

### Main Flow Tests (smoke.e2e.js)

#### Happy Path (3 tests)

1. **Login** (`logs in and reaches dashboard`)
   - Enter credentials
   - Tap login
   - Verify dashboard loads

2. **Dashboard Display** (`should display dashboard with valid data`)
   - Verify stats card visible
   - Verify entries list visible

3. **Create Entry** (`should create quick amount entry successfully`)
   - Search for customer
   - Select "Test Customer"
   - Enter amount "500"
   - Tap "Save & Share"
   - Verify success toast

### Edge Cases

4. **Offline + Sync** (`should handle offline entry creation gracefully`)
   - Toggle network offline
   - Create entry
   - Verify "Saved locally" message
   - Toggle network online
   - Verify sync completes

5. **Session Recovery** (`should recover from session timeout gracefully`)
   - Login
   - Background app for 5+ min
   - Return to app
   - Verify logged in or clean auth

6. **Phone Validation** (`should validate phone number format correctly`)
   - Try invalid phone: "123"
   - Verify error shown
   - Try invalid phone: "abcd"
   - Verify error shown
   - Enter valid phone: "9876543210"
   - Verify error disappears

### Validation

7. **Empty Customer** (`should prevent empty customer selection`)
   - Try to save without customer
   - Verify validation error

8. **Empty Amount** (`should prevent empty amount input`)
   - Select customer
   - Try to save without amount
   - Verify validation error

---

## Manual Testing Flow

For scenarios not covered by automated tests, use the **QA_LOG.md** template:

1. Open **QA_LOG.md**
2. Fill in device info, build version
3. Follow each test case step-by-step
4. Log actual vs expected results
5. Attach screenshots/videos
6. Sign off with Pass/Fail recommendation

**QA Log Location**: `./QA_LOG.md`

---

## Troubleshooting

### Issue: "Device not found"

**Solution**:
```bash
# Check device list
adb devices

# If empty, restart adb
adb kill-server
adb start-server
adb devices

# For WiFi connection
adb connect <ip>:5555
```

### Issue: "APK installation failed"

**Solution**:
```bash
# Clean build
rm -rf android/app/build
npm run build:e2e:android
```

### Issue: "Test timeout"

**Solution**:
- Increase timeout in test: `waitFor(element).toBeVisible().withTimeout(10000)`
- Check network connection (especially for offline tests)
- Verify device has sufficient storage

### Issue: "Detox CLI not found"

**Solution**:
```bash
npm install -g detox-cli
detox --version
```

---

## CI/CD Integration (GitHub Actions)

Create `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build APK
        run: npm run build:e2e:emulator
      
      - name: Start Android Emulator
        uses: ReactiveCircus/android-emulator-runner@v2
        with:
          api-level: 33
          target: google_apis
      
      - name: Run E2E Tests
        run: npm run test:e2e:android-emulator
      
      - name: Upload artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: detox-artifacts
          path: artifacts/
```

---

## Key Files

| File | Purpose |
|------|---------|
| `detox.config.js` | Detox configuration (devices + apps) |
| `e2e/jest.config.js` | Jest runner config for E2E |
| `e2e/init.js` | Detox lifecycle hooks |
| `e2e/smoke.e2e.js` | Test suite (all test cases) |
| `QA_LOG.md` | Manual QA test execution template |
| `TEST_FLOWS.md` | High-level test plan + flows |
| `package.json` | Scripts for building + testing |

---

## Next Steps

1. ✅ Create `tester@kredbook.io` account
2. ✅ Seed "Test Customer" + "Test Item"
3. ✅ Connect physical Android device (or start emulator)
4. ✅ Run `npm run build:e2e:android`
5. ✅ Run `npm run test:e2e:android-device`
6. ✅ Log results in QA_LOG.md
7. ✅ Address any failing tests

---

## Support & Resources

- **Detox Docs**: https://wix.github.io/Detox/docs/intro/overview
- **Detox Best Practices**: https://wix.github.io/Detox/docs/guides/fighting-the-flakiness
- **React Native Testing**: https://reactnative.dev/docs/testing-overview
- **Supabase Auth**: https://supabase.com/docs/guides/auth
