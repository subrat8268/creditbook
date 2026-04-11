# KredBook QA Test Execution Log

> **Test Session**: [DATE - TESTER NAME]
> **Build Version**: [e.g., v1.0.0-20260411]
> **Device(s)**: [e.g., Samsung Galaxy A51, Pixel 5]
> **OS Version**: [e.g., Android 12, Android 13]
> **Test Scope**: Core + Edge Cases
> **Tester Account**: tester@kredbook.io

---

## Test Data Verification (Pre-Requisite)

- [ ] Account `tester@kredbook.io` exists and is accessible
- [ ] Test Customer "Test Customer" (phone: 9876543210) created
- [ ] Test Product "Test Item" (price: 100) created
- [ ] All test data synced to device

---

## Test Results Summary

| Test Case | Status | Device | Notes |
|-----------|--------|--------|-------|
| **Happy Path: Login** | PASS / FAIL | | |
| **Happy Path: Dashboard Load** | PASS / FAIL | | |
| **Happy Path: Create Entry** | PASS / FAIL | | |
| **Edge Case: Offline + Sync** | PASS / FAIL | | |
| **Edge Case: Token Expiry** | PASS / FAIL | | |
| **Edge Case: Phone Validation** | PASS / FAIL | | |
| **Optional: Entries List** | PASS / FAIL | | |
| **Optional: Customer Detail** | PASS / FAIL | | |

---

## Detailed Test Cases

### 1️⃣ Happy Path: Login

**Expected Flow**: Open app → Enter credentials → Land on Dashboard

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Open app | Auth screen appears | | PASS / FAIL |
| 2 | Enter email: `tester@kredbook.io` | Email accepted | | PASS / FAIL |
| 3 | Enter password: `Test@1234` | Password entered (masked) | | PASS / FAIL |
| 4 | Tap Login button | Loader appears | | PASS / FAIL |
| 5 | Wait for auth | Dashboard loads with stats | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: 

---

### 2️⃣ Happy Path: Dashboard Load

**Expected Flow**: Verify all dashboard stats/cards render with data

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Dashboard visible | Page fully loaded | | PASS / FAIL |
| 2 | Check Total Due card | Shows number (even if 0) | | PASS / FAIL |
| 3 | Check Total Paid card | Shows number (even if 0) | | PASS / FAIL |
| 4 | Check Entries List | At least 1 entry or "No entries" message | | PASS / FAIL |
| 5 | Scroll down | No blank sections, layout stable | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: 

---

### 3️⃣ Happy Path: Create Quick Entry

**Expected Flow**: Add Entry tab → Select customer → Enter amount → Save

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Tap "Add Entry" tab | Entry form opens | | PASS / FAIL |
| 2 | Tap person search field | Search keyboard opens | | PASS / FAIL |
| 3 | Type "Test Customer" | Autocomplete shows match | | PASS / FAIL |
| 4 | Tap "Test Customer" in list | Customer selected, search clears | | PASS / FAIL |
| 5 | Enter amount "500" | Amount displays | | PASS / FAIL |
| 6 | Tap "Save & Share" | Success toast appears | | PASS / FAIL |
| 7 | Verify in entries list | Entry visible with correct amount | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: 

---

### 4️⃣ Edge Case: Offline Creation + Sync

**Expected Flow**: Create entry offline → App saves locally → Reconnect → Syncs

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Turn on airplane mode | Offline banner appears (or no network indicator) | | PASS / FAIL |
| 2 | Tap "Add Entry" tab | Form still accessible | | PASS / FAIL |
| 3 | Search for "Test Customer" | Finds customer (from local cache) | | PASS / FAIL |
| 4 | Enter amount "250" | Amount accepted | | PASS / FAIL |
| 5 | Tap "Save & Share" | "Saved locally" toast appears | | PASS / FAIL |
| 6 | Turn off airplane mode | Network restored | | PASS / FAIL |
| 7 | Wait 2-3 sec | Sync banner shows "syncing..." → "synced" | | PASS / FAIL |
| 8 | Refresh/Navigate | Entry persists in list | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: 

---

### 5️⃣ Edge Case: Token Expiry / Session Recovery

**Expected Flow**: Background app 5+ min → Return → No crash, user stays logged in or sees re-auth

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Dashboard visible | Logged in state confirmed | | PASS / FAIL |
| 2 | Background app (swipe up, let sit 5+ min) | App backgrounded | | PASS / FAIL |
| 3 | Foreground app | App resumes (no crash) | | PASS / FAIL |
| 4 | Attempt any action (e.g., tap entry) | Either: Dashboard loads OR clean auth screen | | PASS / FAIL |
| 5 | Check for errors/crashes | No error toasts or exceptions | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: 

---

### 6️⃣ Edge Case: Phone Validation

**Expected Flow**: Input invalid phone → Error; Input valid phone → No error

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Navigate to Settings (if available) | Settings screen opens | | PASS / FAIL |
| 2 | Find phone input field | Phone field visible | | PASS / FAIL |
| 3 | Enter "123" | Validation error appears below field | | PASS / FAIL |
| 4 | Clear and enter "abcd" | Error still shown | | PASS / FAIL |
| 5 | Clear and enter "9876543210" | Error disappears, valid state | | PASS / FAIL |
| 6 | Tap Save | No crash, confirmation | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: *(If Settings unavailable, mark as N/A)*

---

### 7️⃣ Optional: Entries List

**Expected Flow**: Navigate to Entries tab → Verify newly created entry appears

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | From Dashboard, tap "Entries" tab | Entries list loads | | PASS / FAIL |
| 2 | Scroll top | Most recent entry visible first | | PASS / FAIL |
| 3 | Verify entry amount matches | "500" or "250" visible | | PASS / FAIL |
| 4 | Verify customer name visible | "Test Customer" in entry row | | PASS / FAIL |
| 5 | Tap entry row | Entry detail view opens | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: 

---

### 8️⃣ Optional: Customer Detail + Ledger

**Expected Flow**: Open "Test Customer" → View ledger balance updates

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | From Dashboard, tap customer search or customers tab | Customer list visible | | PASS / FAIL |
| 2 | Tap "Test Customer" | Customer detail page opens | | PASS / FAIL |
| 3 | View ledger/balance section | Shows running balance (updated with recent entries) | | PASS / FAIL |
| 4 | Scroll transactions | Recent entries (500, 250) visible in reverse chronological | | PASS / FAIL |
| 5 | Verify math | Balance calculation correct | | PASS / FAIL |

**Screenshots/Errors**:
```
[Attach screenshots or error logs]
```

**Notes**: 

---

## Overall Assessment

**Total Tests Passed**: ___ / ___  
**Total Tests Failed**: ___ / ___  
**Pass Rate**: ____%

### Critical Issues Found

1. **Issue**: [Description]
   - **Steps to Reproduce**: 
   - **Expected**: 
   - **Actual**: 
   - **Severity**: CRITICAL / HIGH / MEDIUM / LOW
   - **Error Log**: [Paste any console/logcat output]

2. **Issue**: [Description]
   - **Steps to Reproduce**: 
   - **Expected**: 
   - **Actual**: 
   - **Severity**: CRITICAL / HIGH / MEDIUM / LOW
   - **Error Log**: 

### Minor Issues / Observations

- 
- 
- 

---

## Sign-Off

**Tester Name**: ___________________  
**Date & Time**: ___________________  
**Device Used**: ___________________  
**Build Tested**: ___________________  

**Recommendation**: 
- [ ] **READY FOR RELEASE** — All critical tests passed, no blockers
- [ ] **NEEDS FIXES** — Blockers present, do not release (list in Critical Issues above)
- [ ] **CONDITIONAL RELEASE** — Minor issues found, acceptable with known limitations

**Additional Notes**: 

---

## Attachments

- Screenshots: [Folder/Link]
- Logcat/Console Logs: [Folder/Link]
- Video Recording: [Link if available]
