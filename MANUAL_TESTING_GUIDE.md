# Web Testing Guide - Manual Testing Instructions

## ✅ Web Server Status

**Server URL**: http://localhost:19006  
**Server Status**: ✅ Running and Ready

---

## How to Use This Guide

This guide provides **step-by-step instructions** for manually testing CreditBook on the web.

1. **Open the web app** at http://localhost:19006
2. **Follow each test scenario** sequentially
3. **Document results** in TEST_REPORT.md
4. **Check DevTools console** for any errors

---

## Browser Setup

### Open Developer Tools

**Chrome/Edge**:
- Press `F12` or `Ctrl+Shift+I`
- Go to "Console" tab to see logs and errors
- Go to "Network" tab to check API calls
- Go to "Application" tab to see stored data

### Monitor Console

Keep the Console tab open during testing to catch any errors:
- Red errors = Critical issues
- Yellow warnings = Minor issues
- Blue logs = Normal operation

---

## Test Credentials

```
Email: tester@kredbook.io
Password: TestPass123!

Test Customer 1: 7021344154 (Rajesh)
Test Customer 2: 9876543210 (Priya)
```

---

## Quick Smoke Test (5 min)

Start with this basic flow to verify app works:

1. **Open**: http://localhost:19006
2. **Signup**: 
   - Use new email like `test.2024@example.com`
   - Password: `TestPass123!`
   - Click "Sign Up"
3. **Phone Setup**:
   - Enter phone: `8268017432` (slightly different number)
   - Click "Next"
4. **Onboarding**:
   - Enter business name: "Test Shop"
   - Click "Next"
   - Click "Skip" or "Next" for bank info
5. **Dashboard**:
   - Should see dashboard with stats
6. **Add Customer**:
   - Click "Customers" tab
   - Click "Add Customer"
   - Name: "Test Customer"
   - Phone: `9999999999`
   - Save
7. **Logout**:
   - Click "Profile" tab
   - Click "Sign Out"
   - Should return to login

If all these work with no errors → ✅ **Smoke test passed**

---

## Detailed Test Flows

### Phase 1: Authentication

#### 1.1 Signup Validation
**Expected**: Form validates input before submission

Steps:
1. Go to http://localhost:19006
2. Leave email empty, click Sign Up → Should show error
3. Enter invalid email `notanemail` → Should show error
4. Enter valid email but weak password `123` → Should show error
5. Enter valid email and strong password → Should proceed
6. Enter different confirm password → Should show error

✓ **Result**: (Pass/Fail) ________________

---

#### 1.2 Phone Setup
**Expected**: Phone number is collected and validated

Steps:
1. After signup, enter phone number
2. Click "Next"
3. Should show onboarding screen

✓ **Result**: (Pass/Fail) ________________

---

#### 1.3 Onboarding Completion
**Expected**: Business info step completed, redirects to dashboard

Steps:
1. Enter "Test Business"
2. Select business type
3. Click "Next"
4. Skip or enter bank info
5. Click "Complete"
6. Should see dashboard

✓ **Result**: (Pass/Fail) ________________

---

#### 1.4 Login
**Expected**: User can login with correct credentials

Steps:
1. Logout (profile → Sign Out)
2. Enter email: `tester@kredbook.io`
3. Enter password: `TestPass123!`
4. Click "Login"
5. Should see dashboard

✓ **Result**: (Pass/Fail) ________________

---

#### 1.5 Login Error Handling
**Expected**: Wrong credentials show error message

Steps:
1. Try email: `tester@kredbook.io`
2. Password: `WrongPassword123!`
3. Click "Login"
4. Should show error message
5. Check DevTools console (F12) for errors

✓ **Result**: (Pass/Fail) ________________

---

### Phase 2: Core Features

#### 2.1 Dashboard
**Expected**: Dashboard displays stats and recent entries

Steps:
1. Login to app
2. Should see dashboard automatically
3. Check if shows:
   - Total ledger balance
   - Recent transactions
   - Customer count
4. Refresh page (F5)
5. Data should persist

✓ **Result**: (Pass/Fail) ________________

---

#### 2.2 Add Customer
**Expected**: Customer successfully added and visible

Steps:
1. Click "Customers" tab
2. Click "Add Customer" button
3. Enter:
   - Name: "Rajesh Kumar"
   - Phone: `7021344154`
4. Click "Save"
5. Should see customer in list

✓ **Result**: (Pass/Fail) ________________

---

#### 2.3 Search Customer
**Expected**: Can find customer by phone number

Steps:
1. On Customers tab
2. Use search box
3. Enter phone: `7021344154`
4. Should show "Rajesh Kumar"
5. Click to view details

✓ **Result**: (Pass/Fail) ________________

---

#### 2.4 Create Entry
**Expected**: Entry created and balance updated

Steps:
1. Click "Entries" tab
2. Click "New Entry"
3. Select customer: "Rajesh Kumar"
4. Enter amount: `500`
5. Enter note: "Payment received"
6. Click "Save"
7. Should see entry in list
8. Dashboard balance should update

✓ **Result**: (Pass/Fail) ________________

---

#### 2.5 View Ledger
**Expected**: Can see customer's transaction history

Steps:
1. Click "Customers" tab
2. Click on "Rajesh Kumar"
3. Should see ledger with entries
4. Check if shows all transactions

✓ **Result**: (Pass/Fail) ________________

---

#### 2.6 Mark Payment
**Expected**: Can mark payment received from customer

Steps:
1. On customer ledger
2. Find "Payments Received" section
3. Click "Add Payment"
4. Enter amount: `500`
5. Click "Confirm"
6. Balance should update

✓ **Result**: (Pass/Fail) ________________

---

### Phase 3: Validation & Edge Cases

#### 3.1 Required Field Validation
**Expected**: Cannot save without required fields

Steps:
1. Try to create entry without selecting customer
2. Should show error
3. Try to create entry without amount
4. Should show error

✓ **Result**: (Pass/Fail) ________________

---

#### 3.2 Duplicate Prevention
**Expected**: Cannot add duplicate customer phone

Steps:
1. Try to add customer with phone `7021344154` again
2. Should show error "Customer already exists" or similar
3. Check DevTools console for any errors

✓ **Result**: (Pass/Fail) ________________

---

#### 3.3 Amount Validation
**Expected**: Only positive amounts accepted

Steps:
1. Try to create entry with amount `-100`
2. Should show error or prevent submission
3. Try amount `0`
4. Should not allow
5. Try amount `1000.50`
6. Should accept

✓ **Result**: (Pass/Fail) ________________

---

#### 3.4 Long Text Handling
**Expected**: Long names don't break layout

Steps:
1. Add customer with very long name:
   - "This is a very very very very very long customer name that might break the layout"
2. Phone: `9876543210`
3. Save
4. Check if name displays correctly without overflow
5. Check DevTools console for errors

✓ **Result**: (Pass/Fail) ________________

---

#### 3.5 Special Characters
**Expected**: Special characters handled correctly

Steps:
1. Add entry with special description:
   - "@#$% test & é ñ 中文 emoji😀"
2. Save
3. Check if displays and saves correctly
4. Check DevTools console

✓ **Result**: (Pass/Fail) ________________

---

### Phase 4: Navigation

#### 4.1 Tab Navigation
**Expected**: All tabs switch correctly

Steps:
1. Click "Dashboard" tab → Should show dashboard
2. Click "Entries" tab → Should show entries
3. Click "Customers" tab → Should show customers
4. Click "Profile" tab → Should show profile
5. Back to Dashboard → Should show dashboard again

✓ **Result**: (Pass/Fail) ________________

---

#### 4.2 Back Button
**Expected**: Back navigation works throughout app

Steps:
1. Click on customer detail
2. Click browser back button ← or back button in app
3. Should return to customers list
4. Try on other pages

✓ **Result**: (Pass/Fail) ________________

---

#### 4.3 Responsive Design
**Expected**: App works on different screen sizes

Steps:
1. Press `F12` to open DevTools
2. Click device toolbar icon (top-left)
3. Test different sizes:
   - Mobile (375px width)
   - Tablet (768px width)
   - Desktop (1920px width)
4. Check if layout adapts
5. Buttons still clickable

✓ **Result**: (Pass/Fail) ________________

---

#### 4.4 Slow Network (Optional)
**Expected**: App handles slow connections gracefully

Steps:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Click speed throttle dropdown → Select "Slow 3G"
4. Try to perform actions
5. Should see loading indicators
6. Should eventually complete

✓ **Result**: (Pass/Fail) ________________

---

### Phase 5: Data Persistence

#### 5.1 Refresh Persistence
**Expected**: Data persists after page refresh

Steps:
1. Create a customer
2. Create an entry
3. Check dashboard balance
4. Press F5 to refresh
5. All data should still be there
6. Balance should be same

✓ **Result**: (Pass/Fail) ________________

---

#### 5.2 Storage Check (Advanced)
**Expected**: Appropriate data stored locally

Steps:
1. Open DevTools (F12)
2. Go to "Application" tab → "Local Storage"
3. Should see kredbook.io entry
4. Check what data is stored
5. No passwords should be visible
6. Auth token should be present (httpOnly)

✓ **Result**: (Pass/Fail) ________________

---

## Error Logging

### What to Check in Console

**Press F12 → Console tab**

**Good Signs**:
- ✅ No red error messages
- ✅ Normal blue LOG messages
- ✅ Maybe yellow warnings (usually okay)

**Bad Signs**:
- ❌ Red error messages = Problem
- ❌ Multiple errors = Critical
- ❌ Network errors (404, 500) = API issue

### Document Errors

If you see errors:
1. **Screenshot** the error message
2. **Copy** the error text
3. **Note** what action caused it
4. **Add to TEST_REPORT.md**

---

## Testing Checklist

Before finishing, verify:

- [ ] Signup works
- [ ] Login works
- [ ] Can add customers
- [ ] Can create entries
- [ ] Dashboard updates
- [ ] No red errors in console
- [ ] Data persists on refresh
- [ ] All tabs navigate correctly
- [ ] App works on mobile size

---

## Reporting Issues

**If you find a bug**:

1. **Title**: Short description (e.g., "Customer phone validation broken")
2. **Steps**: How to reproduce the issue
3. **Expected**: What should happen
4. **Actual**: What actually happens
5. **Console**: Any error messages from F12 console
6. **Screenshot**: Image showing the problem

---

## When Done

1. Complete TEST_REPORT.md with results
2. Note any bugs found
3. Check console for errors
4. Share results

---

**Total Testing Time**: ~30-45 minutes  
**Estimated Smoke Test**: ~5 minutes

Good luck! 🚀
