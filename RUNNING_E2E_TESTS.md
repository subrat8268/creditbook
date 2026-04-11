# 🚀 Running E2E Tests - Step-by-Step Guide

**Device Status**: ✅ Connected (2 devices detected)
- Device 1: `192.168.0.101:33395` (WiFi)
- Device 2: `adb-RZCY215C5NL-9DE1Dn._adb-tls-connect._tcp` (USB)

---

## ⚠️ Important: Before Running Tests

You **MUST** complete these setup steps FIRST (follow TEST_FLOWS.md):

### Step 1: Create Test Account via App Signup (NOT via Supabase)
1. **Uninstall any previous version** of KredBook on device
2. **Build and install fresh APK**:
   ```bash
   npm run build:e2e:android
   ```
3. **Launch app on device**
4. **Go to Signup screen** (tap "Create Account")
5. **Fill in signup form**:
   - Full Name: `Test User`
   - Email: `tester@kredbook.io`
   - Password: `Test@1234`
   - Confirm Password: `Test@1234`
6. **Click "Create Account"**
7. **Complete onboarding**:
   - Business Name: `Test Store`
   - Bill Prefix: `TEST`
   - Phone: `8268017431`
   - Upload/skip logo
8. ✅ You should be logged in to dashboard

**⚠️ DO NOT:**
- ❌ Create account via Supabase Dashboard
- ❌ Use SQL queries to create account
- ❌ Use any scripts or MCP

### Step 2: Add Test Customers via App (NOT via SQL)
1. **In app, go to "Customers" tab**
2. **Click "Add Customer" or + button**
3. **Add Customer 1**:
   - Name: `Test Customer 1`
   - Phone: `8268017431`
   - Click Save
4. **Add Customer 2**:
   - Name: `Test Customer 2`
   - Phone: `7021344154`
   - Click Save
5. ✅ Both customers should appear in list

### Step 3: Add Test Products via App (NOT via SQL)
1. **In app, go to "Products" tab**
2. **Click "Add Product" or + button**
3. **Add Product 1**:
   - Name: `Test Item 1`
   - Price: `100`
   - Click Save
4. **Add Product 2**:
   - Name: `Test Item 2`
   - Price: `500`
   - Click Save
5. ✅ Both products should appear in list

---

## 🧪 Now Ready to Run Tests

Once setup is complete, you can run the E2E tests:

### Option A: Run All Tests (Recommended First)
```bash
npm run test:e2e:android-device
```

This will:
1. Start Detox test runner
2. Connect to your ADB device
3. Run all 24 E2E tests:
   - 12 auth/signup tests (e2e/auth.e2e.js)
   - 12 main flow tests (e2e/smoke.e2e.js)
4. Generate test report
5. Show pass/fail summary

### Option B: Run Only Auth Tests
```bash
detox test e2e/auth.e2e.js --configuration android.device.debug --cleanup
```

Tests covered:
- Signup with new email
- Signup with invalid email
- Signup with weak password
- Signup with password mismatch
- Login with valid credentials
- Login with invalid credentials
- Logout
- And more...

### Option C: Run Only Main Flow Tests
```bash
detox test e2e/smoke.e2e.js --configuration android.device.debug --cleanup
```

Tests covered:
- Dashboard loads
- View entries list
- Create entry
- Validate offline mode
- Form validation
- And more...

---

## 📋 What to Expect During Test Run

### Console Output
```
✅ Starting Detox test runner...
✅ Connecting to device: 192.168.0.101:33395
✅ Launching KredBook app...
✅ Running test suite: Authentication E2E Tests
  ✓ should complete full signup flow
  ✓ should validate email format
  ✓ should enforce password strength
  ...
✅ Test suite passed: 12/12 tests
✅ Running test suite: Main Flow Tests
  ✓ dashboard loads successfully
  ✓ can create entry
  ...
✅ All tests passed: 24/24
```

### Test Artifacts
Detox will create:
- Screenshots on failure (in `artifacts/` folder)
- Device logs (for debugging)
- Test report JSON

---

## 🐛 Troubleshooting

### Issue: "Device not found"
```bash
# Check connected devices
adb devices

# If no devices, reconnect
adb connect 192.168.0.101:33395
```

### Issue: "App crashes during test"
1. Check device logs:
   ```bash
   adb logcat | grep -i "kredbook\|error"
   ```
2. Look at `artifacts/` folder for screenshots
3. Verify setup was completed correctly (account, customers, products)

### Issue: "Test timeout"
- Device may be slow
- Increase timeout in detox.config.js
- Or run with: `detox test --configuration android.device.debug --cleanup --timeout-with-reconnect 180`

### Issue: "Permission denied on ADB"
```bash
# Restart ADB
adb kill-server
adb start-server
adb connect 192.168.0.101:33395
```

---

## 📊 After Tests Complete

### Step 1: Review Results
Look for output like:
```
PASS e2e/auth.e2e.js
PASS e2e/smoke.e2e.js
Tests: 24 passed, 0 failed
```

### Step 2: Check Artifacts
```bash
# Look for failed test screenshots
ls artifacts/
```

### Step 3: Log Results in TEST_FLOWS.md
Update the "Test Execution Log" section with:
- Device model and OS version
- Date and time of test run
- Number of tests passed/failed
- Any issues encountered
- Sync latency measurements (if applicable)

---

## 🎯 Next: Phase 2 (Two Device Testing)

Once Phase 1 passes on single device, you can proceed to Phase 2:

1. **Get second device** (another Android phone)
2. **Connect both devices**:
   ```bash
   adb connect 192.168.0.101:33395
   adb connect <DEVICE_2_IP>:5555
   adb devices  # Verify both connected
   ```
3. **Manual testing** (Detox doesn't support 2-device sync tests yet):
   - Login to both devices with `tester@kredbook.io`
   - Follow manual test cases in TEST_FLOWS.md Phase 2
   - Verify ledger entries sync in real-time
   - Record sync latency

---

## ✅ Quick Checklist Before Running Tests

- [ ] Device connected via ADB (verify with `adb devices`)
- [ ] Test account created via app signup: `tester@kredbook.io` / `Test@1234`
- [ ] Test customers added: 8268017431, 7021344154
- [ ] Test products added: ₹100, ₹500
- [ ] APK built: `npm run build:e2e:android` (completed)
- [ ] Dependencies installed: `npm install && npm install -g detox-cli`
- [ ] Detox configured: `detox.config.js` exists and is correct

---

## 🚀 Ready to Start?

1. **Complete setup** (signup, add customers, add products via app)
2. **Run tests**:
   ```bash
   npm run test:e2e:android-device
   ```
3. **Wait** for all 24 tests to complete (~5-10 minutes)
4. **Check results** in console output
5. **Record results** in TEST_FLOWS.md

**Let me know when you're ready to run tests or if you need help with any setup step!**
