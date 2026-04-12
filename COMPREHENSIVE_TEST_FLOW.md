# 🎯 COMPREHENSIVE TEST FLOW - KredBook Complete Feature Coverage

**Objective**: Test every aspect of the app from signup → onboarding → login → all in-app features  
**Test Scope**: Complete user journey with mandatory and optional features identified  
**Target**: 100% feature coverage + edge cases + offline scenarios

---

## 📊 App Feature Map

### 🔐 Authentication Flow (Mandatory)
| Feature | Type | Priority |
|---------|------|----------|
| Signup | Mandatory | P0 |
| Email Validation | Mandatory | P0 |
| Password Strength | Mandatory | P0 |
| Phone Setup | Mandatory | P0 |
| Business Onboarding | Mandatory | P0 |
| Bank Info (Optional) | Optional | P1 |
| Login | Mandatory | P0 |
| Logout | Mandatory | P0 |
| Password Reset | Optional | P1 |

### 📱 Core Features (Mandatory)
| Feature | Type | Priority |
|---------|------|----------|
| Dashboard / Home | Mandatory | P0 |
| View Entries List | Mandatory | P0 |
| Create Entry | Mandatory | P0 |
| Select Customer | Mandatory | P0 |
| Add Items to Order | Mandatory | P0 |
| Track Balance | Mandatory | P0 |
| Record Payment | Mandatory | P0 |

### 👥 People Management (Mandatory)
| Feature | Type | Priority |
|---------|------|----------|
| Add Customer | Mandatory | P0 |
| View Customers | Mandatory | P0 |
| Customer Details | Mandatory | P0 |
| Edit Customer | Optional | P1 |
| Delete Customer | Optional | P2 |

### 📦 Product Management (Optional)
| Feature | Type | Priority |
|---------|------|----------|
| Add Product | Optional | P1 |
| View Products | Optional | P1 |
| Edit Product | Optional | P2 |
| Delete Product | Optional | P2 |

### 🏪 Supplier Management (Optional)
| Feature | Type | Priority |
|---------|------|----------|
| Add Supplier | Optional | P1 |
| View Suppliers | Optional | P1 |
| Record Delivery | Optional | P2 |
| Record Payment Made | Optional | P2 |

### 📊 Reporting & Analytics (Optional)
| Feature | Type | Priority |
|---------|------|----------|
| Net Position Report | Optional | P1 |
| Export Data | Optional | P2 |
| View Notifications | Optional | P2 |

### 🔄 System Features (Mandatory)
| Feature | Type | Priority |
|---------|------|----------|
| Offline Mode | Mandatory | P0 |
| Sync Queue | Mandatory | P0 |
| Auto Sync | Mandatory | P0 |
| Error Handling | Mandatory | P0 |
| Form Validation | Mandatory | P0 |

---

## 🧪 COMPLETE TEST FLOW - Phase-By-Phase

### 📍 Phase 1: Authentication (3 test users, 8 scenarios)

#### Test 1.1: Signup - Happy Path
```
Steps:
1. Launch app → See Signup screen
2. Enter:
   - Full Name: "John Seller"
   - Email: "john.seller@kredbook-qa.io"
   - Password: "Secure@Pass123"
   - Confirm Password: "Secure@Pass123"
3. Tap "Create Account"
4. Enter Phone: "8268017431"
5. Verify no ledgers found (new user)
6. Business Setup:
   - Business Name: "John's Grocery Store"
   - Bill Prefix: "JGS"
7. Bank Setup (optional):
   - Skip or fill bank details
8. Verify login to Dashboard
9. Check profile created in DB

Expected: ✅ User created, dashboard accessible
```

#### Test 1.2: Signup - Email Validation
```
Scenarios:
a) Empty email → Error
b) Invalid format (no @) → Error
c) Duplicate email → Error
d) Valid email → Success

Expected: ✅ Form validation working
```

#### Test 1.3: Signup - Password Strength
```
Scenarios:
a) Short password (<8 chars) → Error
b) No uppercase → Error
c) No number → Error
d) No special char → Error
e) Valid password → Success

Expected: ✅ Password rules enforced
```

#### Test 1.4: Signup - Phone Validation
```
Scenarios:
a) Empty phone → Error or allow skip
b) Invalid format (3 digits) → Error
c) Valid Indian (10 digits) → Success
d) Valid international (+91...) → Success

Expected: ✅ Phone format validated
```

#### Test 1.5: Login - Happy Path
```
Steps:
1. Go to Login screen
2. Enter email & password from Test 1.1
3. Verify session created
4. Check dashboard accessible

Expected: ✅ Login successful, session restored
```

#### Test 1.6: Login - Invalid Credentials
```
Scenarios:
a) Wrong email → Error
b) Wrong password → Error
c) Non-existent user → Error

Expected: ✅ Authentication denied
```

#### Test 1.7: Logout
```
Steps:
1. Logged in user
2. Tap Logout (in More menu)
3. Verify redirected to Login/Signup
4. Try to access dashboard → Denied

Expected: ✅ Session cleared, protected
```

#### Test 1.8: Offline Login Attempt
```
Steps:
1. Disable WiFi/Mobile data
2. Try to login
3. Verify offline message or queued attempt

Expected: ✅ Graceful offline handling
```

---

### 🏠 Phase 2: Dashboard & Core Features (12 test scenarios)

#### Test 2.1: Dashboard - Initial Load
```
Steps:
1. Login with test account
2. View Dashboard
3. Check display of:
   - Welcome message
   - Total balance
   - Recent entries
   - Quick stats

Expected: ✅ Dashboard fully loaded
```

#### Test 2.2: Add Entry - Happy Path
```
Steps:
1. Dashboard → Tap "Add Entry" FAB
2. Select Customer: "Test Customer 1" (8268017431)
3. Add Items:
   - Item 1: Product "Test Item 1" × 2 @ ₹100 = ₹200
   - Item 2: Product "Test Item 2" × 1 @ ₹500 = ₹500
4. Total: ₹700
5. Payment Mode: "Credit"
6. Tap "Save & Share"
7. Verify entry created and synced

Expected: ✅ Entry saved, balance updated
```

#### Test 2.3: Add Entry - With Payment
```
Steps:
1. Add Entry (same as 2.2)
2. Amount Paid: ₹300 (partial payment)
3. Payment Mode: "Cash"
4. Verify balance = ₹400 (remaining due)

Expected: ✅ Payment recorded, balance calculated
```

#### Test 2.4: View Entries List
```
Steps:
1. Dashboard → View entries list
2. Verify each entry shows:
   - Customer name
   - Amount
   - Date
   - Balance due
3. Tap entry → View details

Expected: ✅ All entries displayed correctly
```

#### Test 2.5: Record Payment
```
Steps:
1. Dashboard → Select customer with outstanding balance
2. Tap "Record Payment"
3. Enter Amount: ₹200
4. Payment Mode: "UPI" / "Card"
5. Tap Save
6. Verify balance updated

Expected: ✅ Payment recorded, balance reduced
```

#### Test 2.6: Add Customer
```
Steps:
1. Dashboard → "People" tab
2. Tap "Add Customer"
3. Enter:
   - Name: "Test Customer 2"
   - Phone: "7021344154"
4. Tap Save
5. Verify customer appears in list
6. Verify in DB

Expected: ✅ Customer created
```

#### Test 2.7: View Customer Details
```
Steps:
1. People tab → Tap customer
2. View customer profile:
   - Name, phone, address
   - Total balance
   - Recent transactions
   - Payment history
3. Tap back

Expected: ✅ Customer details displayed
```

#### Test 2.8: View Customer Ledger
```
Steps:
1. Customer details → View ledger
2. See all transactions with this customer:
   - Date, amount, payment status
   - Running balance
3. Verify totals match dashboard

Expected: ✅ Ledger accurate
```

#### Test 2.9: Form Validation - Entry Creation
```
Scenarios:
a) No customer selected → Error
b) No items added → Error
c) Negative amount → Error
d) Missing payment mode → Error
e) All valid → Success

Expected: ✅ Validation working
```

#### Test 2.10: Duplicate Entry Prevention
```
Steps:
1. Create entry (Test 2.2)
2. Try to create exact duplicate
3. Verify either:
   - Prevented (best)
   - Or creates but is idempotent

Expected: ✅ No data corruption
```

#### Test 2.11: Balance Calculation
```
Steps:
1. Create entry 1: ₹1000 (credit)
2. Record payment: ₹300
3. Create entry 2: ₹500 (credit, add to existing)
4. Record payment: ₹400
5. Verify final balance = ₹800

Expected: ✅ Calculations accurate
```

#### Test 2.12: Entry Sorting & Filtering
```
Scenarios:
a) Sort by date (newest first)
b) Sort by amount
c) Filter by customer
d) Filter by date range
e) Search entry

Expected: ✅ Sorting/filtering works
```

---

### 🛍️ Phase 3: Optional Features (6 test scenarios)

#### Test 3.1: Add Product
```
Steps:
1. Dashboard → Products tab
2. Tap Add Product
3. Enter:
   - Name: "New Product"
   - Price: ₹450
   - Category: "General"
4. Tap Save
5. Verify in product list

Expected: ✅ Product created
```

#### Test 3.2: Use Product in Entry
```
Steps:
1. Create entry
2. Select products from created products (not custom)
3. Verify pricing pre-filled
4. Verify total calculated correctly

Expected: ✅ Products work in entries
```

#### Test 3.3: Add Supplier
```
Steps:
1. Suppliers tab
2. Add Supplier
3. Enter name, phone, business
4. Save and verify

Expected: ✅ Supplier created
```

#### Test 3.4: Record Delivery
```
Steps:
1. Select supplier
2. Record delivery
3. Add items with quantity
4. Enter cost
5. Save and verify balance

Expected: ✅ Delivery recorded
```

#### Test 3.5: Net Position Report
```
Steps:
1. Reports → Net Position
2. View owe vs owed breakdown
3. Export PDF
4. Verify data accuracy

Expected: ✅ Report generated
```

#### Test 3.6: Export Data
```
Steps:
1. Export → Select format (CSV/PDF)
2. Choose date range
3. Select data (entries, customers, etc.)
4. Verify file downloads
5. Check format correctness

Expected: ✅ Export works, file valid
```

---

### 🔄 Phase 4: Offline & Sync (8 test scenarios)

#### Test 4.1: Offline Entry Creation
```
Steps:
1. Turn off WiFi/Mobile data
2. Create entry (Test 2.2)
3. Verify entry saved locally
4. Check sync queue shows 1 mutation
5. Turn on WiFi
6. Verify sync completes, entry uploaded

Expected: ✅ Offline queue works
```

#### Test 4.2: Offline Payment
```
Steps:
1. Offline mode
2. Record payment
3. Verify queued
4. Go online
5. Verify payment synced

Expected: ✅ Payment queued and synced
```

#### Test 4.3: Offline Customer Add
```
Steps:
1. Offline mode
2. Add customer
3. Queue size = 1
4. Go online
5. Verify customer synced to DB

Expected: ✅ Customer synced
```

#### Test 4.4: Sync Queue Retry
```
Steps:
1. Offline mode
2. Create entry
3. Go online but server is unreachable
4. Verify retry logic (exponential backoff)
5. Server comes back
6. Verify entry synced

Expected: ✅ Retry working
```

#### Test 4.5: Sync Status Display
```
Steps:
1. Create entry
2. While syncing, check UI shows sync status
3. Verify loading indicator
4. After sync, verify "Synced" state

Expected: ✅ Status displayed
```

#### Test 4.6: Concurrent Entries Offline
```
Steps:
1. Offline mode
2. Create 5 entries quickly
3. Verify all queued (queue size = 5)
4. Go online
5. Verify all 5 synced in order
6. No data loss

Expected: ✅ Queue processes FIFO
```

#### Test 4.7: Offline with Ledger Discovery
```
Steps:
1. New signup with phone
2. Turn offline before ledger discovery
3. Turn online
4. Verify ledger discovery still works
5. Or queued for later

Expected: ✅ Graceful degradation
```

#### Test 4.8: Sync Error Handling
```
Steps:
1. Offline mode
2. Create entry (invalid data, e.g., negative amount)
3. Go online
4. Verify sync fails gracefully
5. Error shown to user
6. Option to retry or discard

Expected: ✅ Error handling robust
```

---

### 🔐 Phase 5: Security & Edge Cases (7 test scenarios)

#### Test 5.1: Unauthorized Access Prevention
```
Steps:
1. Logout
2. Try to access protected routes directly (via URL)
3. Verify redirected to login
4. Try to access other user's data
5. Verify denied

Expected: ✅ Auth checked, access denied
```

#### Test 5.2: Session Timeout
```
Steps:
1. Login
2. Close app
3. Wait 1+ hours
4. Reopen app
5. Verify re-authentication required (or session restored)

Expected: ✅ Session handled correctly
```

#### Test 5.3: Negative Values Prevention
```
Scenarios:
a) Negative entry amount → Error
b) Negative payment → Error
c) Negative customer balance display → Shows correctly (owed)

Expected: ✅ Validation prevents negatives
```

#### Test 5.4: Large Data Volume
```
Steps:
1. Create 100+ entries
2. Create 50+ customers
3. Dashboard still responsive
4. Search/filter still works
5. No crashes

Expected: ✅ App handles scale
```

#### Test 5.5: Special Characters in Data
```
Steps:
1. Customer name: "Jóhn & Co., Ltd."
2. Business name: "পরিবার কাজ"
3. Entry notes: "Test™ © ® ❤️"
4. Save and verify display
5. Verify in export

Expected: ✅ Unicode handled correctly
```

#### Test 5.6: Duplicate Prevention
```
Steps:
1. Add customer with phone "9876543210"
2. Try to add another customer with same phone
3. Verify error or merge option

Expected: ✅ Duplicates prevented
```

#### Test 5.7: Data Persistence
```
Steps:
1. Create entry
2. Force stop app
3. Restart app
4. Verify entry still there (not lost)

Expected: ✅ Data persisted
```

---

### 📲 Phase 6: UI/UX Edge Cases (5 test scenarios)

#### Test 6.1: Orientation Changes
```
Steps:
1. Create entry
2. Rotate device (portrait ↔ landscape)
3. Verify UI adapts
4. Verify data not lost
5. Continue entry creation

Expected: ✅ Orientation handled
```

#### Test 6.2: Long Customer Names
```
Steps:
1. Add customer with very long name (100+ chars)
2. View in list
3. View in entry
4. Verify text doesn't break layout

Expected: ✅ Text wrapping works
```

#### Test 6.3: Fast Tapping
```
Steps:
1. Rapidly tap "Save" button multiple times
2. Verify only 1 entry created (debounce/disable works)

Expected: ✅ Prevents duplicate submissions
```

#### Test 6.4: Slow Network
```
Steps:
1. Throttle network (2G simulation)
2. Create entry
3. Verify loading indicator shown
4. Verify completes eventually

Expected: ✅ Handles slow network
```

#### Test 6.5: Network Loss During Submission
```
Steps:
1. Start creating entry
2. Turn off WiFi mid-submission
3. Verify entry queued (not lost)
4. Turn WiFi back on
5. Verify entry synced

Expected: ✅ Graceful failure handling
```

---

## 🎯 TEST EXECUTION STRATEGY

### Run Order (by priority)

**Phase 1: Auth (Must Pass)**
- Tests 1.1 to 1.8
- Blocker: If any fails, app unusable

**Phase 2: Core (Must Pass)**
- Tests 2.1 to 2.12
- Blocker: Core functionality

**Phase 4: Offline/Sync (Must Pass)**
- Tests 4.1 to 4.8
- Critical for app value

**Phase 3: Optional (Nice to Have)**
- Tests 3.1 to 3.6
- Enhancement features

**Phase 5: Security (Should Pass)**
- Tests 5.1 to 5.7
- Data integrity

**Phase 6: UX (Polish)**
- Tests 6.1 to 6.5
- User experience

---

## 📊 TEST COVERAGE SUMMARY

| Category | Mandatory | Optional | Total |
|----------|-----------|----------|-------|
| Auth | 8 | 1 | 9 |
| Core Features | 12 | 0 | 12 |
| Optional Features | 0 | 6 | 6 |
| Offline/Sync | 8 | 0 | 8 |
| Security/Edge Cases | 7 | 0 | 7 |
| UI/UX | 5 | 0 | 5 |
| **TOTAL** | **40** | **7** | **47** |

---

## ✅ SUCCESS CRITERIA

### Minimum Viability (All Mandatory Pass)
- All 40 mandatory tests pass
- App is usable end-to-end
- No data loss
- Offline mode works

### Recommended (Mandatory + Optional)
- All 47 tests pass
- Full feature set working
- Robust error handling
- Production-ready

### Ideal (All + Edge Cases)
- 47/47 tests pass
- All edge cases handled
- Performance optimized
- User experience polished

---

## 🚀 NEXT STEPS

1. **Build & Deploy** APK with all fixes
2. **Run Manual Tests** following this flow (Phase 1-2 first)
3. **Automate High-Value Tests** (auth, core flows)
4. **Document Results** in test execution log
5. **Fix Any Issues** found during testing
6. **Iterate** through optional features

---

**Status**: Test plan complete and comprehensive  
**Ready for**: Manual testing, then automation

Should I create a detailed Detox automation script for the high-priority tests (Phase 1-2)?
