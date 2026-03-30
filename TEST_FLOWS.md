# KredBook — Manual Test Flows

> Use this document to verify every feature end-to-end after a build.  
> Each flow lists the exact steps, expected result, and what to check.

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Authentication Flows](#2-authentication-flows)
3. [Onboarding Flow](#3-onboarding-flow)
4. [Dashboard](#4-dashboard)
5. [Customer Management](#5-customer-management)
6. [Bill / Order Creation](#6-bill--order-creation)
7. [Order Detail & Payment Collection](#7-order-detail--payment-collection)
8. [Product Management](#8-product-management)
9. [Supplier Management](#9-supplier-management)
10. [Reports (Financial Position)](#10-reports-financial-position)
11. [Export Data](#11-export-data)
12. [Profile & Settings](#12-profile--settings)
13. [Notifications](#13-notifications)
14. [Edge Cases & Error States](#14-edge-cases--error-states)

---

## 1. Environment Setup

Before testing, verify:

- [ ] App is freshly installed (or cache cleared)
- [ ] Device/emulator has internet access
- [ ] Device contacts permission can be granted (for import test)
- [ ] WhatsApp is installed (for reminder/bill sharing tests) — or accept that share sheet opens

---

## 2. Authentication Flows

### 2-A. Welcome Screen (First Launch)

| #   | Step                             | Expected Result                                                                             |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Open app for the very first time | Welcome screen shows: KredBook logo, "Get Started" button, "I already have an account" link |
| 2   | Tap "I already have an account"  | Navigates to Login screen                                                                   |
| 3   | Tap back                         | Returns to Welcome screen                                                                   |
| 4   | Tap "Get Started"                | Navigates to Signup screen                                                                  |

---

### 2-B. Sign Up (Email / Password)

| #   | Step                                                               | Expected Result                                                                                      |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | Open Signup screen                                                 | Shows: Full Name, Email, Password, Confirm Password fields + "Create Account" button + Google button |
| 2   | Tap "Create Account" with empty fields                             | Validation errors shown under each required field                                                    |
| 3   | Enter mismatched passwords                                         | "Passwords do not match" error under Confirm Password                                                |
| 4   | Enter valid full name, email, password ≥ 6 chars, matching confirm | "Create Account" enables                                                                             |
| 5   | Tap "Create Account"                                               | Loading state on button → navigates to Onboarding (Role screen)                                      |
| 6   | Repeat with same email                                             | Friendly error: "An account with this email already exists. Try signing in instead."                 |

---

### 2-C. Login (Email / Password)

| #   | Step                      | Expected Result                                                                                           |
| --- | ------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Open Login screen         | Shows: Email, Password (with eye icon), "Sign In" button, Google button, "Forgot password?", Sign Up link |
| 2   | Submit with empty fields  | Validation errors shown                                                                                   |
| 3   | Enter wrong password      | Error toast or inline message                                                                             |
| 4   | Enter correct credentials | Loading → navigates to Dashboard (if onboarding done) or Onboarding                                       |
| 5   | Tap eye icon on password  | Password text toggles visible/hidden                                                                      |

---

### 2-D. Google Sign-In

| #   | Step                                          | Expected Result                                               |
| --- | --------------------------------------------- | ------------------------------------------------------------- |
| 1   | Tap "Continue with Google" on Login or Signup | In-app browser opens Google OAuth page                        |
| 2   | Complete Google login                         | Browser closes, app navigates to Dashboard or Onboarding      |
| 3   | Cancel Google login mid-flow                  | Browser closes, app stays on Login (no crash, no error toast) |

---

### 2-E. Forgot Password / Reset

| #   | Step                                    | Expected Result                                                            |
| --- | --------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Tap "Forgot password?" on Login         | Navigates to Reset Password screen                                         |
| 2   | Submit with empty email                 | Validation error                                                           |
| 3   | Submit with valid registered email      | "Check Your Inbox" success screen shows                                    |
| 4   | Tap "← Back to Login" on success screen | Returns to Login                                                           |
| 5   | Open reset link from email              | App opens Set New Password screen (deep link triggers `PASSWORD_RECOVERY`) |
| 6   | Enter new password + confirm            | Saves, signs out, back to Login                                            |

---

### 2-F. Sign Out

| #   | Step                                     | Expected Result                                                                  |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Go to Profile → tap "Sign Out" at bottom | Confirmation prompt appears                                                      |
| 2   | Confirm sign out                         | App navigates to Welcome screen (first launch) since `hasSeenWelcome` is cleared |
| 3   | Re-launch app after sign out             | Welcome screen shows again (not dashboard)                                       |
| 4   | Log in again                             | Goes directly to dashboard (skips onboarding)                                    |

---

## 3. Onboarding Flow

> Only shown once, on first login after signup. Skipped on subsequent logins.

### 3-A. Role Selection (Step 1)

| #   | Step                              | Expected Result                                   |
| --- | --------------------------------- | ------------------------------------------------- |
| 1   | After signup, land on Role screen | Three cards: Retailer, Wholesaler, Small Business |
| 2   | Tap "Continue" without selecting  | Button remains disabled / shows warning           |
| 3   | Tap "Retailer" card               | Card gets green checkmark ring                    |
| 4   | Change selection to "Wholesaler"  | Checkmark moves; only one selected at a time      |
| 5   | Tap "Continue" with selection     | Navigates to Business Setup (Step 2)              |

---

### 3-B. Business Setup (Step 2)

| #   | Step                                        | Expected Result                                                        |
| --- | ------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Land on Business Setup screen               | Progress shows "Step 2 of 3"; Business Name, GSTIN, Bill Prefix fields |
| 2   | Tap "Continue" with Business Name empty     | Validation error                                                       |
| 3   | Fill in Business Name (e.g. "Test Traders") | Required field satisfied                                               |
| 4   | Set Bill Prefix to "TT"                     | Custom prefix will appear on bills                                     |
| 5   | Tap "Continue"                              | Navigates to Bank step                                                 |
| 6   | Tap "Skip for now"                          | Jumps to Ready screen                                                  |

---

### 3-C. Bank Details (Step 3)

| #   | Step                                     | Expected Result                                                         |
| --- | ---------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Land on Bank Details screen              | Progress shows "Step 3 of 3"; all fields optional with "OPTIONAL" badge |
| 2   | Tap "Continue" with all fields empty     | Navigates to Ready screen                                               |
| 3   | Fill UPI ID, Bank Name, Account No, IFSC | Fields accept input                                                     |
| 4   | Tap "Continue"                           | Saved; navigates to Ready screen                                        |

---

### 3-D. Ready Screen (Step 4)

| #   | Step                                        | Expected Result                                                        |
| --- | ------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Land on Ready screen                        | Checkmark image, business name + bill prefix pill (green), two buttons |
| 2   | Tap "Go to Dashboard"                       | Navigates to Dashboard; `onboarding_complete = true` in DB             |
| 3   | Log out and log back in                     | Goes directly to Dashboard (no onboarding repeat)                      |
| 4   | Alternatively tap "Add Your First Customer" | Navigates to Customers list                                            |

---

## 4. Dashboard

### 4-A. Seller Mode

| #   | Step                          | Expected Result                                            |
| --- | ----------------------------- | ---------------------------------------------------------- |
| 1   | Navigate to Dashboard         | Time-based greeting + business initials avatar in header   |
| 2   | Check Hero Card               | Single gradient card: "Customers Owe Me" with total amount |
| 3   | Check Stat Cards              | "Active Buyers" count + "Overdue" count                    |
| 4   | Check Recent Activity         | Last 5 transactions (customer name, amount, status)        |
| 5   | Tap a transaction row         | Navigates to Customer Detail                               |
| 6   | Tap "View Report"             | Navigates to Financial Position (Reports screen)           |
| 7   | Tap blue FAB (bottom-right)   | Navigates to Create Bill screen                            |
| 8   | Bell icon — overdue count > 0 | Red dot visible on bell icon                               |
| 9   | Tap bell icon                 | Navigates to Notifications screen                          |

---

### 4-B. Dashboard Mode Switching

| #   | Step                                             | Expected Result                                                 |
| --- | ------------------------------------------------ | --------------------------------------------------------------- |
| 1   | Go to Profile → App Preferences → Dashboard Mode | Segment control shows Seller / Both / Distributor               |
| 2   | Switch to "Both"                                 | Dashboard shows split green/red panels (receivables + payables) |
| 3   | Switch to "Distributor"                          | Hero Card shows "I Owe Suppliers"                               |
| 4   | Switch back to "Seller"                          | Single "Customers Owe Me" card                                  |

---

## 5. Customer Management

### 5-A. Add Customer Manually

| #   | Step                                             | Expected Result                                   |
| --- | ------------------------------------------------ | ------------------------------------------------- |
| 1   | Go to Customers tab                              | Customer list (or empty state "No customers yet") |
| 2   | Tap + FAB                                        | "Add Customer" bottom sheet opens                 |
| 3   | Submit with empty name                           | Validation error                                  |
| 4   | Fill Name = "Ramesh Kumar", Phone = "9876543210" | Fields accept input                               |
| 5   | Tap "Save"                                       | Bottom sheet closes, new customer appears in list |
| 6   | New customer has no balance                      | Shows "₹0" with PAID badge                        |

---

### 5-B. Import from Contacts

| #   | Step                                         | Expected Result                                                                             |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Tap contacts-import secondary FAB            | Permission prompt for contacts                                                              |
| 2   | Grant permission                             | Contacts list loads in bottom sheet                                                         |
| 3   | Search contacts by name or phone             | List filters                                                                                |
| 4   | Tap "Select All"                             | All unimported contacts selected (already-imported shown greyed with "In CreditBook" badge) |
| 5   | Tap "Deselect All"                           | All deselected                                                                              |
| 6   | Select 2-3 contacts, tap "Import X Contacts" | Imported; bottom sheet closes; customers appear in list                                     |
| 7   | Deny contacts permission                     | "Contacts access denied" screen with "Open Settings" button                                 |

---

### 5-C. Customer Search, Filter & Sort

| #   | Step                                      | Expected Result                                                    |
| --- | ----------------------------------------- | ------------------------------------------------------------------ |
| 1   | Type in search bar                        | List filters in real-time (debounced 300ms)                        |
| 2   | Tap "Overdue" filter tab                  | Shows only customers with overdue balance                          |
| 3   | Tap "Pending" filter tab                  | Shows customers with pending (non-overdue) balance                 |
| 4   | Tap "Paid" filter tab                     | Shows customers with zero or credit balance                        |
| 5   | Tap "All"                                 | All customers shown                                                |
| 6   | Tap three-dot menu icon in header         | Sort bottom sheet opens with 5 options                             |
| 7   | Select "Balance: High → Low"              | Customers reorder — highest balance first                          |
| 8   | Select "Name: A → Z"                      | Customers reorder alphabetically                                   |
| 9   | Select "Recently Active"                  | Customers ordered by last activity date                            |
| 10  | With overdue customers: check summary bar | "Total Outstanding ₹X" (green pill) + "N Overdue" (red pill) shown |

---

### 5-D. Customer Detail

| #   | Step                              | Expected Result                                              |
| --- | --------------------------------- | ------------------------------------------------------------ |
| 1   | Tap any customer card             | Customer Detail screen opens                                 |
| 2   | Check hero card                   | Balance shown, color matches status (red=owed, green=zero)   |
| 3   | Tap phone icon in header          | Device dialer opens with customer number                     |
| 4   | Tap "Send Reminder" action button | WhatsApp deeplink with pre-filled message                    |
| 5   | Sub-tabs: tap "Bills Given"       | Shows only bill transactions                                 |
| 6   | Sub-tabs: tap "Payments"          | Shows only payment transactions                              |
| 7   | Each transaction row              | Shows type icon, amount (color-coded), time, running balance |

---

### 5-E. Download Customer Statement

| #   | Step                                 | Expected Result                                                                        |
| --- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| 1   | Customer with zero transactions      | PDF icon hidden in header; "Download Statement" footer button grayed out + disabled    |
| 2   | Tap disabled "Download Statement"    | Error toast: "No transactions yet — add a bill or payment first."                      |
| 3   | Customer with at least 1 transaction | PDF icon visible in header; footer button dark/active                                  |
| 4   | Tap "Download Statement"             | Loading state → PDF generated → native share sheet opens                               |
| 5   | PDF content                          | Shows business name, customer name, phone, outstanding balance, full transaction table |

---

### 5-F. Record Customer Payment (from Customer Detail)

| #   | Step                                                 | Expected Result                                                  |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | Customer with zero balance → tap "Received"          | Error toast: "No outstanding balance for this customer."         |
| 2   | Customer with open balance → tap "Received"          | "Record Payment" bottom sheet opens                              |
| 3   | Enter partial amount, select payment mode (e.g. UPI) | Inputs accept values                                             |
| 4   | Tap "Record Partial"                                 | Payment recorded; balance decreases; transaction appears in feed |
| 5   | Reopen payment modal, tap "Mark Full Paid"           | Full remaining amount filled; payment recorded; balance = ₹0     |

---

## 6. Bill / Order Creation

### 6-A. Full Bill Flow

| #   | Step                                                        | Expected Result                                                     |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Tap FAB on Dashboard or Customers list                      | Create Bill screen opens                                            |
| 2   | Check customer selector section                             | "BILL FOR" label above customer card                                |
| 3   | Customer card shows "Select Customer" placeholder           | Pencil icon on right                                                |
| 4   | Tap customer selector                                       | Customer picker bottom sheet opens with search                      |
| 5   | Search and select a customer                                | Customer name shown; previous balance fetched and displayed         |
| 6   | Tap "Search products…" bar or "+ Add Product" dashed button | Product picker bottom sheet opens                                   |
| 7   | Search for a product (e.g. "Rice")                          | Filtered product list                                               |
| 8   | Tap a product WITH variants                                 | Inline variant sub-view opens in the same sheet                     |
| 9   | Select a variant                                            | Item added to cart with variant name + price; sheet stays open      |
| 10  | Tap a product WITHOUT variants (has a base price)           | Added directly to cart; sheet stays open                            |
| 11  | Cart shows the item                                         | Product name, quantity stepper, price, line total                   |
| 12  | Tap + on stepper                                            | Quantity increases; line total updates                              |
| 13  | Tap − on stepper until 0                                    | Item removed from cart                                              |
| 14  | Add multiple products, tap "Done" on picker                 | Picker closes; all items in cart                                    |
| 15  | Edit tax % field (e.g. 5%)                                  | GST amount calculated and shown in summary                          |
| 16  | Edit loading charge (e.g. ₹50)                              | Added to summary total                                              |
| 17  | Check "Bill Summary" section                                | Items total + GST + Loading Charge + Previous Balance = Grand Total |
| 18  | Check footer bar                                            | "Grand Total ₹X" strip visible above action buttons                 |
| 19  | Tap "Save Bill"                                             | Bill created; navigates back; toast or success indicator            |
| 20  | Verify in customer detail                                   | New bill transaction appears in feed                                |

---

### 6-B. Create Bill from Customer Detail

| #   | Step                                  | Expected Result                                     |
| --- | ------------------------------------- | --------------------------------------------------- |
| 1   | Open Customer Detail for any customer | See "New Bill" action card                          |
| 2   | Tap "New Bill"                        | Create Bill screen opens with customer pre-selected |
| 3   | Verify customer field                 | Shows the customer name (not "Select Customer")     |
| 4   | Add product + tap "Create Bill"       | Bill created; navigates back to customer detail     |

---

### 6-C. Bill Preview / Send via WhatsApp

| #   | Step                                                  | Expected Result                                                                 |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | On Create Bill screen with items added, tap "Preview" | PDF generated → share sheet opens (or WhatsApp if installed)                    |
| 2   | PDF content                                           | Business name, bill number, customer name, items table, totals, QR/bank details |

---

## 7. Order Detail & Payment Collection

### 7-A. Orders List

| #   | Step                                   | Expected Result                                                    |
| --- | -------------------------------------- | ------------------------------------------------------------------ |
| 1   | Navigate to Orders tab                 | List of all orders newest first                                    |
| 2   | With outstanding orders: check summary | "Outstanding ₹X" (red pill) and overdue count shown in summary bar |
| 3   | Tap filter chip "Paid"                 | Only paid orders shown                                             |
| 4   | Tap filter chip "Overdue"              | Orders older than 30 days with pending balance                     |
| 5   | Tap "Sort" chip                        | Bottom sheet with: Newest / Oldest / High Amount / Low Amount      |
| 6   | Search by customer name                | List filters                                                       |

---

### 7-B. Order Detail

| #   | Step                                            | Expected Result                                                            |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Tap any order card                              | Order Detail screen with title "Order #INV-XXX"                            |
| 2   | Check Customer Card                             | Customer name, phone, previous balance                                     |
| 3   | Check Items Card                                | All line items with qty × rate = subtotal                                  |
| 4   | Check Bill Summary Card                         | Subtotal, GST, Loading Charge, Previous Balance, Grand Total, status chip  |
| 5   | Check Payment History                           | Any recorded payments with mode chip, amount, remaining balance            |
| 6   | Tap "Send Bill"                                 | Share sheet opens with bill PDF                                            |
| 7   | Tap "Record Payment" (visible only if not Paid) | Payment modal opens                                                        |
| 8   | Record a payment                                | Payment appears in history; remaining balance updates; status chip changes |
| 9   | Pay off entire balance                          | Status chip changes to PAID; "Record Payment" button disappears            |

---

## 8. Product Management

### 8-A. Add Product Without Variants (Direct Price)

| #   | Step                                    | Expected Result                                    |
| --- | --------------------------------------- | -------------------------------------------------- |
| 1   | Go to Products tab                      | Product list or empty state                        |
| 2   | Tap + FAB                               | "Add Product" bottom sheet opens                   |
| 3   | Enter Product Name (e.g. "Toor Dal")    | Name field accepts input                           |
| 4   | No variants added → Price field visible | Enter price "120"                                  |
| 5   | Tap "Add Product"                       | Product saved; appears in list with ₹120           |
| 6   | Create a bill, search "Toor Dal"        | Product appears; tap adds directly to cart at ₹120 |

---

### 8-B. Add Product With Variants

| #   | Step                                  | Expected Result                                                           |
| --- | ------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Tap + FAB → enter name "Basmati Rice" | Name field filled                                                         |
| 2   | Tap "+ Add Variant"                   | New variant row appears: name + price fields                              |
| 3   | Enter variant name "1kg", price "85"  | Row filled                                                                |
| 4   | Add another: "5kg", price "390"       | Two variant rows                                                          |
| 5   | Price field hidden (variants present) | Correct — price comes from variants                                       |
| 6   | Tap "Add Product"                     | Saved; shows "2 variants" in product card                                 |
| 7   | Create a bill, search "Basmati Rice"  | Product appears; tap → Variant picker opens with 1kg (₹85) and 5kg (₹390) |
| 8   | Select "5kg"                          | Added to cart at ₹390                                                     |

---

### 8-C. Edit & Delete Product

| #   | Step                              | Expected Result                                             |
| --- | --------------------------------- | ----------------------------------------------------------- |
| 1   | Tap ⋯ (options) on a product card | Actions modal: "Edit" and "Delete"                          |
| 2   | Tap "Edit"                        | "Edit Product" bottom sheet pre-filled with existing values |
| 3   | Change name or price, save        | Updated in list                                             |
| 4   | Tap "Delete"                      | Confirm modal with "This action cannot be undone"           |
| 5   | Confirm delete                    | Product removed from list                                   |
| 6   | Cancel delete                     | Product remains                                             |

---

## 9. Supplier Management

### 9-A. Add Supplier

| #   | Step                                                | Expected Result                                        |
| --- | --------------------------------------------------- | ------------------------------------------------------ |
| 1   | Go to Suppliers tab                                 | Supplier list or empty state; header shows count badge |
| 2   | Tap + FAB                                           | "Add Supplier" bottom sheet opens                      |
| 3   | Submit with empty name                              | Validation error                                       |
| 4   | Fill Name, Phone, Address, Bank Name, Account, IFSC | All fields accept input                                |
| 5   | Tap "Save"                                          | Supplier created; appears in list with ₹0 balance      |
| 6   | With existing suppliers: check summary bar          | "Total Payable ₹X" pink pill shown if totalOwed > 0    |
| 7   | Tap three-dot menu icon                             | Sort bottom sheet opens with 5 options                 |
| 8   | Select "Amount Owed: High → Low"                    | Suppliers reorder — highest owed first                 |

---

### 9-B. Record Delivery (Goods Received from Supplier)

| #   | Step                                             | Expected Result                                                                                 |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 1   | Tap a supplier → Supplier Detail                 | Balance card, bank details, delivery history                                                    |
| 2   | Tap "Record Delivery"                            | Bottom sheet opens                                                                              |
| 3   | Add item row: Name "Rice Bags", Qty 10, Rate 500 | Row total = ₹5,000                                                                              |
| 4   | Add Loading Charge ₹200                          | Added to delivery total                                                                         |
| 5   | Enter Advance Paid ₹1,000                        | Deducted as advance                                                                             |
| 6   | Tap "Save"                                       | Delivery recorded; supplier balance increases by (₹5,200 − ₹1,000 = ₹4,200); appears in history |

---

### 9-C. Record Payment to Supplier

| #   | Step                                             | Expected Result                                                          |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| 1   | Tap "Record Payment Made" on supplier detail     | Bottom sheet opens                                                       |
| 2   | Enter amount, select mode (e.g. NEFT), add notes | Fields accept input                                                      |
| 3   | Tap "Save"                                       | Payment recorded; supplier balance decreases; appears in payment history |
| 4   | Pay off all balance                              | Balance shows ₹0                                                         |

---

## 10. Reports (Financial Position)

| #   | Step                          | Expected Result                                                      |
| --- | ----------------------------- | -------------------------------------------------------------------- |
| 1   | Dashboard → tap "View Report" | Financial Position screen opens with back arrow                      |
| 2   | "Customers Owe Me" stat card  | Green card with total receivables amount                             |
| 3   | "I Owe Suppliers" stat card   | Pink/red card with total payables amount                             |
| 4   | Net card                      | Dark card with net position; positive = healthy                      |
| 5   | Insight pill                  | "Healthy" (green) / "Monitor" (amber) / "At Risk" (red) based on net |
| 6   | Tap back                      | Returns to Dashboard                                                 |

---

## 11. Export Data

| #   | Step                                   | Expected Result                                           |
| --- | -------------------------------------- | --------------------------------------------------------- |
| 1   | Profile → DATA section → "Export Data" | Export screen opens                                       |
| 2   | Tap "All time" preset chip             | Date range cleared (no filter)                            |
| 3   | Tap "This month" preset chip           | From/To dates auto-set to current month                   |
| 4   | Manually enter custom date range       | Dates set; invalid format shows "Invalid date" toast      |
| 5   | Tap "Orders & Bills"                   | Loading state → CSV generated → share sheet opens         |
| 6   | Tap "Payments Received"                | Same flow; CSV of payments                                |
| 7   | Tap "Customer Balances"                | CSV with customer name + balance                          |
| 8   | Tap "Supplier Purchases"               | CSV of supplier deliveries                                |
| 9   | Tap two exports quickly                | Second blocked until first completes (single loading key) |

---

## 12. Profile & Settings

### 12-A. Business Details

| #   | Step                                     | Expected Result                                    |
| --- | ---------------------------------------- | -------------------------------------------------- |
| 1   | Navigate to Profile tab                  | Business name, bill prefix, GSTIN, phone all shown |
| 2   | Verify bill prefix matches bills created | e.g. "TT-001" if prefix is "TT"                    |

---

### 12-B. Bank Account

| #   | Step                       | Expected Result                                                |
| --- | -------------------------- | -------------------------------------------------------------- |
| 1   | Check Bank Account section | Bank name, masked account number (e.g. `**** **** 4590`), IFSC |

---

### 12-C. Language Switch

| #   | Step                          | Expected Result                                                 |
| --- | ----------------------------- | --------------------------------------------------------------- |
| 1   | App Preferences → tap "🇮🇳 HI" | UI language switches to Hindi (where i18n keys are implemented) |
| 2   | Tap "EN"                      | Back to English                                                 |
| 3   | Close and reopen app          | Language persists (stored in AsyncStorage)                      |

---

### 12-D. Dashboard Mode (already covered in Section 4-B)

---

## 13. Notifications

| #   | Step                                            | Expected Result                                                                       |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Dashboard with overdue customers                | Red dot visible on bell icon in header                                                |
| 2   | Tap bell icon                                   | Navigates to Notifications screen                                                     |
| 3   | Notifications screen: overdue customers exist   | "Overdue Follow-ups" section shown; each row has customer name, days overdue, balance |
| 4   | Notifications screen: recent activity exists    | "Recent Activity" section shown; rows match dashboard activity feed                   |
| 5   | Tap "Remind" on overdue customer                | WhatsApp opens with pre-filled message: name + balance                                |
| 6   | Dashboard with no overdue customers or activity | Bell icon has no dot; Notifications screen shows "All caught up!" empty state         |
| 7   | Tap back arrow on Notifications                 | Returns to Dashboard                                                                  |
| 8   | Count badge in Notifications header             | Shows total of overdue customers + recent activity items (hidden when 0)              |

---

## 14. Edge Cases & Error States

| Scenario                                              | Expected Result                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| No internet connection on startup                     | App loads from cache; mutations show error toast                                                                    |
| Customer with no transactions → Download Statement    | Footer button disabled; toast: "No transactions yet — add a bill or payment first."                                 |
| Customer with zero balance → "Received" button tapped | Error toast: "No outstanding balance for this customer."                                                            |
| Create bill with no customer selected                 | Validation error; "Create Bill" blocked                                                                             |
| Create bill with no products added                    | Validation error; "Create Bill" blocked                                                                             |
| Product with no variants AND no price                 | Cannot be added to cart (product picker tap is no-op); ensure these don't exist by always filling price when saving |
| Contacts permission denied → import flow              | "Contacts access denied" full screen with "Open Settings" button                                                    |
| Reset password email sent → tap "← Back to Login"     | Returns to Login cleanly, no crash                                                                                  |
| PDF generation failure                                | Error toast: "Could not generate statement."                                                                        |
| Supplier with ₹0 balance → record payment             | Proceed (no guard; record ₹0 payment is valid)                                                                      |
| Very long customer/product name                       | Text truncates with `numberOfLines={1}` — no overflow                                                               |
| Fast scroll on large customer list                    | Infinite scroll loads next page at bottom; no blank cards                                                           |

---

## Quick Smoke Test Checklist (5 minutes)

Run this after every build to confirm nothing is broken:

- [ ] App opens without crash
- [ ] Login with existing account works
- [ ] Dashboard loads with correct balance
- [ ] Add a customer
- [ ] Create a bill for that customer with 1 product
- [ ] View the bill in Orders list
- [ ] Record a payment against the bill
- [ ] Verify customer balance decreases
- [ ] Download customer statement (PDF share sheet opens)
- [ ] Add a product with a price
- [ ] Check export (Orders CSV downloads)
- [ ] Sign out and sign back in
