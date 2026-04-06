# KredBook UX Context

> **Purpose**: Complete UX reference for designers and AI tools. Documents every screen's exact layout, element positions, feature list, and interaction model.
> **Last Updated**: April 6, 2026
> **App Version**: 4.0
> **Phase**: 7 (Core features complete)
> **References**: `docs/prd.md`, `docs/design-system.md`

---

## 1. Product Overview

**KredBook** is a mobile-first digital credit ledger for Indian retailers, wholesalers, and small business owners.

It replaces the traditional paper **khata book** — the handwritten ledger that millions of Indian shop owners use to track customer credit. The app makes financial management fast, accurate, and visible on a smartphone.

### What users do in the app

| Action                   | Description                                       |
| :----------------------- | :------------------------------------------------ |
| Track customer credit    | Know exactly how much each customer owes          |
| Record payments          | Log money received from customers                 |
| Generate bills           | Create itemized PDF invoices                      |
| Manage supplier balances | Track what the business owes its distributors     |
| View financial position  | See total receivable vs total payable at a glance |

### Core product promise

> "Track Credit. Get Paid Faster."

The UI must always reflect this — put the money front and center, make recording fast, and make outstanding dues impossible to miss.

---

## 2. Target Users

### Retailers

**Who they are**: Shop owners who sell goods directly to local customers and extend credit on purchases.

**Examples**: Kirana stores, medical shops, hardware shops, clothing retailers.

**How they use the app**:

- Open the app when a customer buys on credit → create a bill
- When a customer pays → record the payment
- Check who hasn't paid in a while → send a WhatsApp reminder
- End of day → check total amount owed to them

**Key need**: Speed. They are serving multiple customers at a counter and cannot spend more than 60 seconds recording a transaction.

---

### Wholesalers

**Who they are**: Distributors who supply goods to multiple retailers and manage complex, high-value credit cycles.

**Examples**: FMCG distributors, grain/vegetable wholesalers, textile suppliers.

**How they use the app**:

- Record deliveries to retailers with itemized product lists
- Log loading (transport) charges separately from goods
- Track partial payments received against bulk invoices
- Monitor which retailers have been overdue the longest

**Key need**: Clarity. They need to know the net picture across many buyers — who owes the most, who is overdue, and what their net receivable position is.

---

### Small Businesses

**Who they are**: Service providers and specialty retailers who extend informal credit to regular customers.

**Examples**: Auto repair shops, pharmacies, tiffin services, building material shops.

**How they use the app**:

- Record service charges against a named customer
- Track payments received in cash, UPI, or cheque
- Identify customers who have not paid in 30+ days

**Key need**: Simplicity. This user may not be financially literate. The app must do the interpretation work — show summaries, use color, never show raw tables.

---

## 3. Core User Goals

Every screen should support at least one of these goals:

| Goal                                 | User Statement                                        |
| :----------------------------------- | :---------------------------------------------------- |
| **Record a bill**                    | "I just sold goods to a customer on credit — log it." |
| **Record a payment received**        | "A customer just paid me — update their balance."     |
| **See who owes money**               | "Show me which customers have outstanding dues."      |
| **Track supplier payment**           | "I need to pay my supplier — how much do I owe them?" |
| **Generate an invoice**              | "Create a PDF bill I can share on WhatsApp."          |
| **Check overall financial position** | "How much is owed to me total? How much do I owe?"    |

---

## 4. Main Screens

> **Layout notation used below**:
>
> - **FIXED TOP** = non-scrollable, sticks to top (status bar area)
> - **FIXED BOTTOM** = non-scrollable, sticks to bottom above tab bar
> - **SCROLL BODY** = vertically scrollable content between header and footer
> - **ABSOLUTE** = overlaid on screen regardless of scroll position
> - **BOTTOM SHEET** = slides up from bottom, overlays content

---

### 4.1 Welcome Screen

**Route**: `/` (app/index.tsx)
**SafeArea**: Top + Bottom

#### Layout (fixed, non-scrollable)

| Position     | Element                     | Detail                                                  |
| ------------ | --------------------------- | ------------------------------------------------------- |
| TOP CENTER   | KredBook logo image         | ~120×40dp, centered                                     |
| CENTER       | Illustration / hero image   | Full-width placeholder graphic                          |
| CENTER       | Tagline text                | "Track Credit. Get Paid Faster." — bold, 24px, centered |
| LOWER CENTER | "Get Started" button        | Full-width, green filled, rounded-full                  |
| BELOW BUTTON | "I already have an account" | Text link, centered, primary color                      |

#### Interactions

- Tap "Get Started" → navigate to Signup
- Tap login link → navigate to Login
- On subsequent launches (AsyncStorage `hasSeenWelcome = true`): this screen is skipped, goes directly to Login

---

### 4.2 Login Screen

**Route**: `/(auth)/login`
**SafeArea**: Top only (`edges={["top"]}`)
**Scroll**: Vertical ScrollView (keyboard avoidance)

#### Layout (top-to-bottom)

| Position      | Element                               | Detail                                                                                           |
| ------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| TOP LEFT      | Back arrow `←`                        | Navigates back to Welcome                                                                        |
| SCROLL TOP    | `AuthHeader` component                | Title: "Welcome Back" (28px bold), subtitle: "Sign in to your CreditBook" (13px gray) — centered |
| SCROLL        | White `AuthCard` container            | Rounded-2xl card with shadow                                                                     |
| INSIDE CARD   | "Email Address" label                 | 13px semibold, textDark                                                                          |
| INSIDE CARD   | Email `Input`                         | Full-width, keyboard: email-address                                                              |
| INSIDE CARD   | "Password" label                      | 13px semibold, mt-4                                                                              |
| INSIDE CARD   | Password `Input`                      | With eye-toggle icon (right), secureTextEntry                                                    |
| INSIDE CARD   | "Forgot password?" link               | Right-aligned, primary color, below password input                                               |
| INSIDE CARD   | `Button` "Sign In"                    | Full-width, green filled, loading state                                                          |
| BELOW CARD    | `AuthDivider` "or"                    | Centered horizontal divider line with "or" text                                                  |
| BELOW DIVIDER | `GoogleButton` "Continue with Google" | Full-width, white with Google logo                                                               |
| BOTTOM        | "New to CreditBook? **Sign Up**"      | Centered, tappable "Sign Up" in primary green                                                    |

#### Conditional elements

- Submit button shows loading spinner during login mutation
- Validation errors appear below each field in red (12px)

#### Interactions

- "Sign In" → `useLogin()` mutation → on success: navigate to Dashboard or Onboarding
- "Continue with Google" → OAuth browser flow → same result
- "Forgot password?" → navigate to resetPassword
- "Sign Up" → navigate to Signup

---

### 4.3 Signup Screen

**Route**: `/(auth)/signup`
**SafeArea**: Top only
**Scroll**: Vertical ScrollView (keyboard avoidance)

#### Layout (top-to-bottom)

| Position      | Element                               | Detail                                                                   |
| ------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| TOP LEFT      | Back arrow `←`                        | Navigates back                                                           |
| SCROLL TOP    | `AuthHeader`                          | Title: "Create Account", subtitle: "Set up your CreditBook in 2 minutes" |
| SCROLL        | White `AuthCard`                      | Rounded card                                                             |
| INSIDE CARD   | "Full Name" label + `Input`           |                                                                          |
| INSIDE CARD   | "Email Address" label + `Input`       | keyboard: email-address                                                  |
| INSIDE CARD   | "Password" label + `Input`            | Eye-toggle icon, secureTextEntry                                         |
| INSIDE CARD   | "Confirm Password" label + `Input`    | Eye-toggle icon, secureTextEntry                                         |
| INSIDE CARD   | `Button` "Create Account"             | Full-width green                                                         |
| BELOW CARD    | `AuthDivider` "or"                    |                                                                          |
| BELOW DIVIDER | `GoogleButton`                        |                                                                          |
| BOTTOM        | "Already have an account? **Log In**" | Tappable link                                                            |

#### Conditional elements

- Validation errors inline below each field
- Password must be ≥6 chars; confirm must match

---

### 4.4 Reset Password Screen

**Route**: `/(auth)/resetPassword`
**SafeArea**: Top only

#### Layout

| Position   | Element                                        | Detail                             |
| ---------- | ---------------------------------------------- | ---------------------------------- |
| SCROLL TOP | Logo image                                     | Center-aligned, w-60               |
| SCROLL     | Lock icon in green circle                      | 64×64dp centered                   |
| SCROLL     | Title "Forgot Password?"                       | Bold, large                        |
| SCROLL     | Subtitle text                                  | Gray, explains what happens        |
| SCROLL     | "Email Address" label + `Input` with mail icon | Left icon                          |
| SCROLL     | `Button` "Send Reset Link"                     | Full-width                         |
| SCROLL     | "← Back to Login"                              | Text link, centered, primary color |

#### Success state (replaces entire screen body)

| Position | Element                                 |
| -------- | --------------------------------------- |
| CENTER   | MailOpen icon in green circle (80×80dp) |
| CENTER   | Title "Check Your Inbox!"               |
| CENTER   | Subtitle explaining to check email      |
| CENTER   | "← Back to Login" text link             |

---

### 4.5 Set New Password Screen

**Route**: `/(auth)/set-new-password`
**SafeArea**: Top only

#### Layout

| Position      | Element                            | Detail           |
| ------------- | ---------------------------------- | ---------------- |
| SCROLL TOP    | Title "Set New Password"           | Bold             |
| SCROLL        | "New Password" label + `Input`     | Eye-toggle icon  |
| SCROLL        | "Confirm Password" label + `Input` | Eye-toggle icon  |
| SCROLL        | `Button` "Update Password"         | Full-width green |
| SCROLL BOTTOM | "Back to **Log In**"               | Link             |

---

### 4.6 Onboarding — Role Selection

**Route**: `/(auth)/onboarding/role`
**SafeArea**: Full

#### Layout

| Position     | Element                                         | Detail                                                                                         |
| ------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| TOP LEFT     | Back arrow                                      |                                                                                                |
| TOP          | Title "What describes your business?"           | 22px bold                                                                                      |
| TOP          | Subtitle "Choose the option that fits you best" | Gray                                                                                           |
| BODY         | 3 role cards (vertical stack)                   | Each: icon in green circle (left), title (bold), subtitle (gray), checkmark ring when selected |
| —            | Retailer card                                   | Store icon, "Kirana store, medical shop…"                                                      |
| —            | Wholesaler card                                 | Truck icon, "Distributor, FMCG supplier…"                                                      |
| —            | Small Business card                             | Briefcase icon, "Auto repair, tiffin service…"                                                 |
| FIXED BOTTOM | `Button` "Continue"                             | Disabled until selection made; green when active                                               |

#### Interactions

- Tap card → visual selection (green checkmark ring), stores selection in state
- Tap "Continue" → saves `role` + `dashboard_mode` to Supabase → navigate to Business Setup

---

### 4.7 Onboarding — Business Setup

**Route**: `/(auth)/onboarding/business`
**SafeArea**: Full

#### Layout

| Position     | Element                            | Detail                                 |
| ------------ | ---------------------------------- | -------------------------------------- |
| TOP          | Progress indicator                 | "Step 2 of 3" text or step dots        |
| TOP          | Title "Setup Your Business"        | Bold                                   |
| SCROLL       | "Business Name \*" label + `Input` | Required field                         |
| SCROLL       | "GSTIN" label + `Input`            | Optional badge, placeholder "22XXXXX…" |
| SCROLL       | "Bill Prefix" label + `Input`      | Default "INV", shows preview "INV-001" |
| FIXED BOTTOM | `Button` "Continue"                | Full-width green                       |
| FIXED BOTTOM | "Skip for now"                     | Text link below button                 |

---

### 4.8 Onboarding — Bank Details

**Route**: `/(auth)/onboarding/bank`
**SafeArea**: Full

#### Layout

| Position     | Element                     | Detail                                        |
| ------------ | --------------------------- | --------------------------------------------- |
| TOP          | Progress indicator          | "Step 3 of 3"                                 |
| TOP          | Title "Bank & Payment Info" | Bold                                          |
| TOP          | Subtitle                    | "Your customers will see this on their bills" |
| SCROLL       | "UPI ID" + `Input`          | OPTIONAL badge                                |
| SCROLL       | "Bank Name" + `Input`       | OPTIONAL badge                                |
| SCROLL       | "Account Number" + `Input`  | OPTIONAL badge, numeric keyboard              |
| SCROLL       | "IFSC Code" + `Input`       | OPTIONAL badge                                |
| FIXED BOTTOM | `Button` "Continue"         | Full-width green                              |
| FIXED BOTTOM | "Skip for now"              | Text link                                     |

---

### 4.9 Onboarding — Ready Screen

**Route**: `/(auth)/onboarding/ready`
**SafeArea**: Full

#### Layout

| Position     | Element                            | Detail                                                        |
| ------------ | ---------------------------------- | ------------------------------------------------------------- |
| CENTER TOP   | Large checkmark image              | 120×120dp                                                     |
| CENTER       | Title "You're all set!"            | 24px extrabold                                                |
| CENTER       | Subtitle                           | "CreditBook is ready to replace your khata book."             |
| CENTER       | Summary pills row                  | Business name pill (green border if set), "Ledger ready" pill |
| FIXED BOTTOM | `Button` "Add Your First Customer" | Full-width, primary green                                     |
| FIXED BOTTOM | "Go to Dashboard"                  | Underlined text link below button                             |

---

### 4.10 Home / Dashboard

**Route**: `/(main)/dashboard`
**SafeArea**: Top (via tab layout)
**Scroll**: Vertical ScrollView

#### Layout (top-to-bottom)

| Position              | Element                   | Detail                                                                                                                                                                                                                       |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP             | `DashboardHeader`         | Left: time-based greeting + business name. Right: initials avatar circle with notification dot if overdue                                                                                                                    |
| SCROLL                | `DashboardHeroCard`       | **Seller mode**: full-width red gradient card (`#DC2626→#B91C1C`), "TOTAL BALANCE DUE" label (11px white/75 uppercase), large amount (38px extrabold white), overdue badge pill (bottom-left), last bill date (bottom-right) |
| SCROLL                | —                         | **Distributor mode**: same card style but "I OWE SUPPLIERS"                                                                                                                                                                  |
| SCROLL                | —                         | **Both mode**: 2 side-by-side panels in one card: green YOU RECEIVE panel + red YOU OWE panel, net position row below                                                                                                        |
| SCROLL                | `DashboardActionBar`      | Two buttons side-by-side: "View Report" (outlined) + "Send Reminder" (outlined)                                                                                                                                              |
| SCROLL                | `DashboardStatCards`      | Two white cards side by side: "Active Buyers" count (left) + "Overdue" count (right, red number)                                                                                                                             |
| SCROLL                | "Recent Activity" heading | 16px semibold, with "See All" link right                                                                                                                                                                                     |
| SCROLL                | `DashboardRecentActivity` | Up to 5 transaction rows; each: left colored dot + customer name + amount (right, color coded) + status chip + date                                                                                                          |
| ABSOLUTE BOTTOM-RIGHT | Blue FAB `+`              | 56dp circle, `#2563EB`, 20dp from edge, 24dp above tab bar                                                                                                                                                                   |

#### Conditional elements

- Overdue dot on avatar: shown when any customer is overdue
- Recent Activity empty state: "No transactions yet" when no data

#### Interactions

- Tap FAB → Create Bill (`/(main)/orders/create`)
- Tap "View Report" → Financial Position (`/(main)/reports`)
- Tap "Send Reminder" → WhatsApp deeplink with overdue customers
- Tap any recent activity row → Customer Detail

---

### 4.11 Customers List

**Route**: `/(main)/customers`
**SafeArea**: Top
**Scroll**: FlatList (infinite scroll)

#### Layout (top-to-bottom)

| Position                          | Element                       | Detail                                                                                                                                                                                                     |
| --------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP                         | `CustomersHeader`             | Left: "Customers" title (22px bold) + count badge (green pill). Right: search icon toggle                                                                                                                  |
| FIXED TOP (conditional)           | Search bar                    | Expands below header when search icon tapped; pill shape, `#F6F7FB` bg                                                                                                                                     |
| FIXED TOP                         | Filter tab row                | 4 pill tabs: **All** / **Overdue** / **Pending** / **Paid** — active tab underlined in green                                                                                                               |
| SCROLL                            | `CustomerList` FlatList       | One `CustomerCard` per row                                                                                                                                                                                 |
| —                                 | `CustomerCard`                | Left: 52×52dp initials avatar (color-coded). Center: customer name (bold 15px), last active date (12px gray). Right: balance amount (bold, color coded) + status badge pill (OVERDUE/PENDING/PAID/ADVANCE) |
| SCROLL BOTTOM                     | Empty state                   | When no customers: illustration + "No customers yet" + "Add Customer" CTA                                                                                                                                  |
| ABSOLUTE BOTTOM-RIGHT             | Primary FAB (`Users+` icon)   | Add new customer                                                                                                                                                                                           |
| ABSOLUTE BOTTOM-RIGHT (above FAB) | Secondary FAB (contacts icon) | Import from phone contacts; sits 72dp above primary FAB                                                                                                                                                    |

#### Interactions

- Tap customer card → Customer Detail
- Primary FAB → `NewCustomerModal` bottom sheet (90% height)
- Secondary FAB → `ContactsPickerModal` bottom sheet (90% height)
- Tap filter tab → in-memory filter, no server call
- Search → debounced 300ms, server-side filtered

---

### 4.12 Customer Detail

**Route**: `/(main)/customers/[customerId]`
**SafeArea**: All edges
**Scroll**: ScrollView

#### Layout (top-to-bottom)

| Position     | Element                       | Detail                                                                                                                                                                                               |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP    | Custom header bar             | Left: back arrow `←`. Center: customer name (17px bold, 1 line) + last-active subtitle (12px gray). Right: PDF icon button (shown only when transactions exist) + phone call icon button             |
| SCROLL       | Hero card                     | Red gradient (`#C0392B→#7B1010`), "TOTAL BALANCE DUE" label, large balance (38px extrabold white), decorative circles, overdue badge OR last bill date at bottom                                     |
| SCROLL       | Quick-action row (3 cards)    | Equal-width white cards side by side, each with icon circle + label. **New Bill** (red icon), **Received** (green icon), **Send Reminder** (amber icon)                                              |
| SCROLL       | Transaction tabs              | 3 tabs in underline style: **All** / **Bills Given** / **Payments**. Border-bottom colored line on active tab                                                                                        |
| SCROLL       | Transaction feed              | Date-separator pills ("Today", "Yesterday", "15 Feb 2026") + `TransactionRow` items                                                                                                                  |
| —            | `TransactionRow`              | White rounded card with left colored border (green=payment, red=bill). Left: icon circle + title + subtitle. Right: amount (color-coded, 16px extrabold). Bottom-left: time. Bottom-right: "Bal: ₹X" |
| SCROLL       | Empty state (no transactions) | Dashed icon box (receipt icon) + "No transactions yet" + two CTA buttons: "New Bill" (outlined) + "Record Payment" (filled)                                                                          |
| FIXED BOTTOM | Download Statement footer     | White bar with dark pill button "Download Statement" (+ Download icon). Disabled + grayed when no transactions                                                                                       |

#### Conditional elements

- PDF icon in header: **hidden** when transactions.length === 0
- "Download Statement" button: disabled when transactions.length === 0
- "Received" action card: shows error toast if no outstanding balance
- OVERDUE badge on hero card: only when `isOverdue = true`

#### Modals triggered from this screen

- Tap "Received" → `RecordCustomerPaymentModal` bottom sheet (65%)
- Tap hero card PDF icon / "Download Statement" → PDF generation + system share sheet

---

### 4.13 Record Customer Payment (Bottom Sheet Modal)

**Trigger**: "Received" on Customer Detail
**Height**: 65% snap point

#### Layout (top-to-bottom inside sheet)

| Position     | Element                | Detail                                                                                                                        |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| TOP          | Handle pill            | 40×4dp, centered                                                                                                              |
| BODY         | "Record Payment" title | 18px bold                                                                                                                     |
| BODY         | Customer name subtitle | Gray, showing who you're recording for                                                                                        |
| BODY         | Amount input           | Large numeric input, ₹ prefix, full-width                                                                                     |
| BODY         | Payment mode chips row | 5 horizontal pill chips: **Cash** / **UPI** / **NEFT** / **Draft** / **Cheque** — single-select, tapping toggles active state |
| FIXED BOTTOM | Two CTA buttons        | Left: "Record Partial" (outlined, full flex). Right: "Mark Full Paid" (filled green, full flex)                               |

---

### 4.14 Add Customer (Bottom Sheet Modal)

**Trigger**: Primary FAB on Customers List
**Height**: 90% snap point

#### Layout

| Position     | Element                                | Detail              |
| ------------ | -------------------------------------- | ------------------- |
| TOP          | Handle pill                            |                     |
| BODY         | "Add Customer" header + X close button |                     |
| BODY         | "Name \*" label + `Input`              | Required            |
| BODY         | "Phone" label + `Input`                | numeric keyboard    |
| BODY         | "Address" label + `Input`              | optional, multiline |
| FIXED BOTTOM | `Button` "Save Customer"               | Full-width green    |

---

### 4.15 Orders List

**Route**: `/(main)/orders`
**SafeArea**: Top
**Scroll**: FlatList (infinite scroll)

#### Layout (top-to-bottom)

| Position                | Element              | Detail                                                                                                                                                                                                      |
| ----------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP               | Header row           | Left: "Orders" title (22px bold). Right: search icon toggle                                                                                                                                                 |
| FIXED TOP (conditional) | `SearchBar`          | Expands below header when toggled                                                                                                                                                                           |
| FIXED TOP (conditional) | Summary bar          | Shown when `outstandingAmount > 0` or overdue customers exist. Left pill: "Outstanding" with `formatINR` amount (red bg `#FEF2F2`). Right pill: "N Overdue" (red) — sourced from cached `useDashboard` data |
| FIXED TOP               | Filter row           | Horizontal scroll chips: **All** / **Paid** / **Partial** / **Pending** / **Overdue** + **Sort** chip (right, with SortAsc icon)                                                                            |
| SCROLL                  | `OrderList` FlatList | One order card per row (108dp height, fixed via `getItemLayout`)                                                                                                                                            |
| —                       | Order card           | Left: 44dp initials avatar + customer name (15px bold) + bill number (13px gray). Right: ₹amount (17px bold) + status chip. Bottom-left: formatted date                                                     |
| SCROLL BOTTOM           | Empty state          | "No orders yet" + "Create Bill" green button                                                                                                                                                                |
| ABSOLUTE BOTTOM-RIGHT   | Blue FAB `+`         | Create new bill                                                                                                                                                                                             |

#### Conditional elements

- Summary bar: only visible when outstandingAmount > 0 or overdueCustomers > 0
- "Overdue" filter: client-side compound — Pending + `daysSinceCreated > 30`
- Sort bottom sheet: opens when "Sort" chip tapped — options: Newest / Oldest / High Amount / Low Amount

---

### 4.16 Create Bill (New Order)

**Route**: `/(main)/orders/create`
**SafeArea**: All edges
**Scroll**: ScrollView

#### Layout (top-to-bottom)

| Position     | Element                  | Detail                                                                                                                                                                                                         |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP    | Header bar               | Left: back arrow. Center: "New Bill" title. Right: `INV-NEW` pill (sequential number assigned on save)                                                                                                         |
| SCROLL       | "BILL FOR" section label | 11px uppercase gray label above customer card                                                                                                                                                                  |
| SCROLL       | Customer selector card   | Full-width white card. When empty: "Select Customer" placeholder + Pencil icon. When selected: customer name (bold) + "Previous Balance: ₹X" warning row (red bg, only if balance > 0)                         |
| SCROLL       | Product search bar       | Tappable fake input "🔍 Search products…", opens ProductPicker on tap                                                                                                                                          |
| SCROLL       | Cart items list          | One `OrderItemCard` per unique product+variant. Smart dedup — re-tapping same product increments qty instead of adding new row                                                                                 |
| —            | `OrderItemCard`          | Product name + variant name. Rate: inline editable TextInput (commits on blur). Left: − stepper. Center: qty. Right: + stepper + × remove. Bottom: line total                                                  |
| SCROLL       | "+" dashed card          | Dashed border card "+ Add Product" — same as search bar, opens picker                                                                                                                                          |
| SCROLL       | `OrderBillSummary`       | GST % / Loading Charge ₹ inputs + breakdown rows: Items Total / GST Amount / Loading Charge / Previous Balance (red if >0) / **Grand Total** (22px bold)                                                       |
| FIXED BOTTOM | Footer bar               | **Grand total strip** (shown when grandTotal > 0): gray label "Grand Total" left + large bold amount right. Below: **"Save Bill"** (outlined) + **"Save & Share"** (filled green). Both disabled while pending |

#### Bottom sheets triggered

- Customer search: `CustomerPicker` (`BottomSheetPicker`, 80–95%)
- Product search: **`ProductPicker`** (owns its own `BottomSheet`, 80–95%)
  - Sheet **stays open** after every product add — user explicitly taps **"Done"** to close
  - Products with variants: tapping opens inline variant sub-view; **Back** returns to product list
  - 1.2 s green checkmark flash confirms each add
  - "**+ Add New Product**" dashed button navigates to Products screen

---

### 4.17 Order Detail

**Route**: `/(main)/orders/[orderId]`
**SafeArea**: All edges
**Scroll**: ScrollView

#### Layout (top-to-bottom)

| Position                       | Element                                       | Detail                                                                                                                                                   |
| ------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP                      | Header bar                                    | Left: back arrow. Center: "Order #INV-042" title (dynamic). Right: status chip (PAID/PARTIAL/PENDING/OVERDUE)                                            |
| SCROLL                         | Customer card                                 | White, rounded-2xl. Left: 48dp initials avatar. Center: customer name (bold) + phone (gray). Right: previous balance (red if >0, green if 0)             |
| SCROLL                         | Items card (top-rounded, flush bottom)        | Each line: product name (bold) + variant if any + "qty × ₹rate" (gray) + ₹subtotal (right, bold)                                                         |
| SCROLL                         | Bill Summary card (bottom-rounded, flush top) | Subtotal / GST amount (only if >0) / Loading charge (only if >0) / Previous balance (red, only if >0) / horizontal divider / **Grand Total** (22px bold) |
| SCROLL                         | Payment History card                          | Title "Payment History". Each payment row: mode chip (color-coded) + "₹amount" (green bold, right) + "Remaining: ₹X" below                               |
| SCROLL BOTTOM (empty payments) | "No payments recorded yet"                    | Gray text, centered                                                                                                                                      |
| FIXED BOTTOM                   | Action bar                                    | Left: "Send Bill" (outlined green, with Share icon). Right: "Record Payment" (filled green). "Record Payment" hidden when `status === "Paid"`            |

#### Conditional elements

- "Record Payment" button: hidden if order is fully paid
- GST row in summary: hidden if GST = 0
- Loading charge row: hidden if = 0
- Previous balance row: hidden if = 0

---

### 4.18 Products Screen

**Route**: `/(main)/products` (hidden tab — accessed via Profile → Manage Products)
**SafeArea**: Top + Bottom
**Scroll**: FlatList (infinite scroll)

#### Layout (top-to-bottom)

| Position                | Element                            | Detail                                                                                                 |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| FIXED TOP               | Header row                         | Left: "Products" title (22px bold) + count badge (green pill). Right: search icon (toggles search bar) |
| FIXED TOP (conditional) | `SearchBar`                        | Expands below header when toggled; X button clears + hides                                             |
| FIXED TOP               | Category chips (horizontal scroll) | All / Rice & Grains / Oils / Dairy / Dal / Drinks                                                      |
| SCROLL                  | `ProductCard` FlatList             | Each card: left icon box + product name (bold) + variant count + ₹price (right) + ⋯ options button     |
| SCROLL BOTTOM           | Empty state                        | "No products added yet" + subtitle + direction to use FAB                                              |
| ABSOLUTE BOTTOM-RIGHT   | Green FAB `+`                      | Opens `NewProductModal` bottom sheet                                                                   |

---

### 4.19 Add / Edit Product (Bottom Sheet Modal)

**Trigger**: FAB on Products screen, or Edit from product options
**Height**: 90% snap point

#### Layout

| Position     | Element                                 | Detail                                                                                                          |
| ------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| TOP          | Header                                  | "Add Product" / "Edit Product" title + X close button                                                           |
| BODY SCROLL  | Subtitle                                | "Products appear in search when creating a bill" (gray, 13px)                                                   |
| BODY SCROLL  | "Product Name \*" label + `TextInput`   | Required, validation error shown below                                                                          |
| BODY SCROLL  | "Price \*" label + `RupeeInput`         | **Shown only when no variants are added**. Disappears when first variant is added                               |
| BODY SCROLL  | "Variants" section header               | Left: "Variants" (bold). Right: "+ Add Variant" link (green)                                                    |
| BODY SCROLL  | Variant rows (dynamic)                  | Each: `TextInput` (variant name e.g. "1kg") + `RupeeInput` (₹price) + red trash icon. Added via "+ Add Variant" |
| FIXED BOTTOM | `Button` "Add Product" / "Save Product" | Full-width green                                                                                                |

#### Logic

- If zero variants → Price field is visible and required
- If ≥1 variant → Price field hidden; each variant has its own price
- Saving with variants → `base_price` stored as `null` in DB; variants stored in `product_variants` table
- Saving without variants → `base_price` stored; no variant rows

---

### 4.20 Suppliers List

**Route**: `/(main)/suppliers`
**SafeArea**: Top
**Scroll**: FlatList (infinite scroll)

#### Layout (top-to-bottom)

| Position                | Element                 | Detail                                                                                                                                                                              |
| ----------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP               | Header                  | Left: "Suppliers" title (22px bold) + amber count badge (number of suppliers). Right: "I Owe ₹X" pink pill (shown only when totalOwed > 0) + three-dot menu icon (opens Sort sheet) |
| FIXED TOP (conditional) | Summary bar             | Shown when totalOwed > 0. Single pill: "Total Payable" with `formatINR` amount (pink bg `#FDF2F8`, pink text)                                                                       |
| FIXED TOP               | `SearchBar`             | Always visible below summary / header                                                                                                                                               |
| SCROLL                  | `SupplierCard` FlatList | Left: 52dp initials avatar. Center: supplier name (bold) + phone. Right: balance owed (pink/red, large bold)                                                                        |
| SCROLL BOTTOM           | Empty state             | "No suppliers yet"                                                                                                                                                                  |
| ABSOLUTE BOTTOM-RIGHT   | Green FAB `+`           | Opens `NewSupplierModal` bottom sheet (90%)                                                                                                                                         |

#### Sort bottom sheet (triggered by three-dot menu)

5 sort options: **Recently Active** / **Amount Owed: High → Low** / **Amount Owed: Low → High** / **Name: A → Z** / **Name: Z → A**. Active option has pink checkmark.

---

### 4.21 Add Supplier (Bottom Sheet Modal)

**Trigger**: FAB on Suppliers List
**Height**: 90%

#### Layout

| Position     | Element                          | Detail            |
| ------------ | -------------------------------- | ----------------- |
| TOP          | "Add Supplier" header + X button |                   |
| BODY SCROLL  | "Name \*" label + `Input`        | Required          |
| BODY SCROLL  | "Phone" label + `Input`          | numeric keyboard  |
| BODY SCROLL  | "Address" label + `Input`        | optional          |
| BODY SCROLL  | "Bank Name" label + `Input`      | optional          |
| BODY SCROLL  | "Account Number" label + `Input` | optional, numeric |
| BODY SCROLL  | "IFSC Code" label + `Input`      | optional          |
| FIXED BOTTOM | `Button` "Save Supplier"         | Full-width green  |

---

### 4.22 Supplier Detail

**Route**: `/(main)/suppliers/[supplierId]`
**SafeArea**: All edges
**Scroll**: ScrollView

#### Layout (top-to-bottom)

| Position     | Element                            | Detail                                                                                         |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| FIXED TOP    | Header bar                         | Left: back arrow. Center: supplier name. Right: phone call icon + WhatsApp icon                |
| SCROLL       | Balance card                       | Red gradient card. Large amount (38px bold white). "TOTAL OWED" label                          |
| SCROLL       | Bank Details section               | White card. Bank name / Account number (masked) / IFSC / UPI ID — each as a row with copy icon |
| SCROLL       | "Delivery History" section heading |                                                                                                |
| SCROLL       | Delivery rows                      | Each: date + total amount + advance paid + item count badge. Tap to expand items               |
| SCROLL       | Payment History                    | Payments made rows: date + amount (green) + mode chip                                          |
| FIXED BOTTOM | Two-button bar                     | Left: "Record Delivery" (outlined). Right: "Record Payment Made" (filled green)                |

#### Modals triggered

- "Record Delivery" → `RecordDeliveryModal` bottom sheet (90%)
- "Record Payment Made" → `RecordPaymentMadeModal` bottom sheet (62%)

---

### 4.23 Record Delivery (Bottom Sheet Modal)

**Trigger**: "Record Delivery" on Supplier Detail
**Height**: 90%

#### Layout

| Position     | Element                             | Detail                                                               |
| ------------ | ----------------------------------- | -------------------------------------------------------------------- |
| TOP          | "Record Delivery" header + X button |                                                                      |
| BODY SCROLL  | Dynamic item rows                   | Each row: item name `Input` + qty `Input` + rate `Input` + red trash |
| BODY SCROLL  | "+ Add Item" link                   | Adds new item row                                                    |
| BODY SCROLL  | "Loading Charge ₹" `Input`          | Transport fee                                                        |
| BODY SCROLL  | "Advance Paid ₹" `Input`            | Amount paid at delivery                                              |
| BODY SCROLL  | Delivery total summary              | Calculated total = Σ(items) + loading − advance                      |
| FIXED BOTTOM | `Button` "Save Delivery"            | Full-width green                                                     |

---

### 4.24 Record Payment Made (Bottom Sheet Modal)

**Trigger**: "Record Payment Made" on Supplier Detail
**Height**: 62%

#### Layout

| Position     | Element                                 | Detail                                                        |
| ------------ | --------------------------------------- | ------------------------------------------------------------- |
| TOP          | "Record Payment Made" header + X button |                                                               |
| BODY         | Amount `Input`                          | Numeric, ₹ prefix                                             |
| BODY         | Payment mode chips                      | Cash / UPI / NEFT / Draft / Cheque — same as customer payment |
| BODY         | Notes `Input`                           | Optional text                                                 |
| FIXED BOTTOM | `Button` "Save Payment"                 | Full-width green                                              |

---

### 4.25 Financial Position (Reports)

**Route**: `/(main)/reports`
**SafeArea**: Top + Bottom (via `edges={["top","left","right"]}`)
**Scroll**: ScrollView

#### Layout (top-to-bottom)

| Position  | Element                         | Detail                                                                                                                      |
| --------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP | Custom header                   | Left: back arrow `←`. Center: "Financial Position" title (18px bold). Right: today's date (gray, 12px)                      |
| SCROLL    | `StatCard` — Customers Owe Me   | Green background `#F0FDF4`. Large amount in `#22C55E`. `TrendingUp` icon in green circle (top-right). Label below amount    |
| SCROLL    | `StatCard` — I Owe Suppliers    | Pink-red background `#FEF2F2`. Large amount in `#E0336E`. `TrendingDown` icon in red circle                                 |
| SCROLL    | `NetCard`                       | Dark background `#1C2333`. Large white amount (32px bold). `TrendingUp`/`Down` icon in colored circle. "NET POSITION" label |
| SCROLL    | `InsightPill`                   | Centered pill below NetCard. Text: "Healthy" (green) / "Monitor" (amber) / "At Risk" (red) based on net value               |
| SCROLL    | Monthly Report placeholder card | Grayed card with "Monthly Report (Coming Soon)" — non-interactive                                                           |

#### Logic for InsightPill

- Net > 0 → "Healthy" (green `#22C55E`)
- Net = 0 → "Monitor" (amber `#F59E0B`)
- Net < 0 → "At Risk" (red `#E74C3C`)

---

### 4.26 Export Data

**Route**: `/(main)/export`
**SafeArea**: Top + Bottom
**Scroll**: ScrollView

#### Layout (top-to-bottom)

| Position  | Element                | Detail                                                                                                                                                           |
| --------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP | Custom header          | Left: back arrow. Center: "Export Data" (bold). Subtitle: "Download your business records" (gray)                                                                |
| SCROLL    | Date Filter card       | Heading "FILTER BY DATE — OPTIONAL". Two `DateInput` rows (From / To) each with CalendarDays icon. Below: "All time" chip + "This month" chip (preset selectors) |
| SCROLL    | Export Type card       | Heading "CHOOSE EXPORT TYPE". 4 `ExportRow` items:                                                                                                               |
| —         | Orders & Bills row     | FileText icon + label + description + green "Export CSV" pill button                                                                                             |
| —         | Payments Received row  | Receipt icon + label + description + green "Export CSV"                                                                                                          |
| —         | Customer Balances row  | Users icon + label + description + blue "Export CSV"                                                                                                             |
| —         | Supplier Purchases row | Truck icon + label + description + amber "Export CSV"                                                                                                            |
| SCROLL    | Blue info banner       | Info icon + "Exports are in CSV format compatible with Excel/Sheets"                                                                                             |
| SCROLL    | Footer                 | "KredBook Export" centered gray text                                                                                                                             |

#### Conditional elements

- Each Export CSV button has its own loading state (spinner replaces pill during fetch)
- Only one export can run at a time (concurrency blocked by `loadingKey` state)
- Date inputs: typing overrides preset chip selection

---

### 4.27 Profile & Settings

**Route**: `/(main)/profile`
**SafeArea**: Top + Bottom
**Scroll**: ScrollView

#### Layout (top-to-bottom)

| Position  | Element                          | Detail                                                                                                                                                   |
| --------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP | Custom header                    | Left: back arrow. Center: "Profile & Settings" title                                                                                                     |
| SCROLL    | Avatar section                   | Green-bordered circle (60dp) with initials from business name. Business name (bold, 18px) below. Email (gray, 13px). "Edit Profile" outlined pill button |
| SCROLL    | `SectionCard` — BUSINESS DETAILS | 4 rows: Store→Business Name / Receipt→Bill Prefix / Hash→GSTIN / Smartphone→Phone                                                                        |
| SCROLL    | `SectionCard` — BANK ACCOUNT     | 3 rows: Building2→Bank Name / CreditCard→Account No (masked `**** **** XXXX`) / Info→IFSC Code                                                           |
| SCROLL    | `SectionCard` — APP PREFERENCES  |                                                                                                                                                          |
| —         | Dashboard Mode row               | LayoutGrid icon + "Dashboard Mode" label. Right: 3-segment pill control: **Seller** \| **Both** \| **Distributor**                                       |
| —         | Language row                     | Languages icon + "Language" label. Right: two solid pill chips: **EN** (active=green filled) / **🇮🇳**                                                    |
| SCROLL    | `SectionCard` — DATA             |                                                                                                                                                          |
| —         | Manage Products row              | Package icon + "Manage Products" label + ChevronRight. Navigates to `/(main)/products`                                                                   |
| —         | Export Data row                  | Download icon + "Export Business Data" label + ChevronRight. Navigates to `/(main)/export`                                                               |
| SCROLL    | Sign Out row                     | LogOut icon (red) + "Sign Out" text (red). Tap → confirmation dialog → `logout()`                                                                        |
| SCROLL    | Footer                           | "KredBook v1.0.0" centered gray caption                                                                                                                  |

#### Conditional elements

- "Edit Profile" pill: currently non-functional (placeholder for future feature)
- Dashboard Mode segment: saves to DB immediately on tap (no save button)
- Language: saves to AsyncStorage immediately on tap

---

### 4.28 Notifications

**Route**: `/(main)/notifications`
**SafeArea**: Top
**Scroll**: ScrollView

#### Entry point

Bell icon in `DashboardHeader` — tapping it navigates here. The bell has a red dot overlay when `overdueCustomers > 0`.

#### Layout (top-to-bottom)

| Position  | Element                        | Detail                                                                                                                     |
| --------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| FIXED TOP | Header bar                     | Left: back arrow `←`. Center: "Notifications" title (18px bold). Right: total count badge (red pill, shown only when > 0)  |
| SCROLL    | Empty state                    | Bell icon in green circle + "All caught up!" title + "No pending follow-ups or alerts" subtitle — shown only when no data  |
| SCROLL    | **Overdue Follow-ups** section | Section header: AlertCircle icon (red) + "Overdue Follow-ups" title + count badge. Card list below                         |
| —         | Overdue customer row           | Avatar (red initials circle) + customer name + "N days overdue" (red). Right: overdue balance + green "Remind" pill button |
| SCROLL    | **Recent Activity** section    | Section header: CheckCircle icon (green) + "Recent Activity" title. Card list uses `ActivityRow` component                 |
| —         | `ActivityRow`                  | Same component as Dashboard activity feed — type icon + label + amount + status                                            |

#### Interactions

- Tap "Remind" on any overdue customer → opens WhatsApp with pre-filled reminder message (name + balance)
- Tap back arrow → returns to Dashboard
- Data sourced from `useDashboard` cache — no additional API calls

---

## 5. Key Features

### Customer Credit Ledger

Tracks the complete credit history for each customer — every bill given and every payment received — in a single chronological feed. Automatically calculates and displays the running balance per transaction row. Customers are color-coded by financial state so the user can assess their ledger at a glance.

---

### Payment Recording

Records payments received from customers against open balances. Supports 5 payment modes: Cash, UPI, NEFT, Demand Draft, Cheque. Allows partial payments (enter any amount) or full settlement (mark entire balance cleared). Accessible via a bottom-sheet modal from the Customer Detail screen.

---

### Bill Creation

Creates itemized bills with product catalog search (stay-open bulk-add picker), smart cart deduplication (re-adding same product increments quantity), editable per-item rates, GST %, and loading charge. Previous customer balance is automatically pulled in at creation time. Bill number is **only assigned after a successful DB save** — the PDF always carries the real sequential invoice number. Output is a branded PDF shared via the native share sheet (`expo-sharing`).

---

### Supplier Management

Tracks what the business owes to its own suppliers. Supports recording deliveries (itemized rows with item × qty × rate), loading charges, and advance paid. Records payments made to suppliers with mode and notes. Balance owed = total deliveries − total payments made, displayed prominently per supplier.

---

### Net Position Dashboard

Single-screen financial summary showing: total owed by customers (green), total owed to suppliers (red), and net position (green or amber). Cards shown depend on the user's dashboard mode (Seller/Distributor/Both). Requires no interaction — the financial position is visible the moment the screen opens.

---

### Transaction History

Unified chronological feed of bills and payments per customer. Newest entries first. Date-group separators (Today / Yesterday / full date). Each row shows: type icon, label, amount (color-coded), and running balance. Filterable by type: All / Bills Given / Payments.

---

### Payment Reminders

One-tap WhatsApp reminder from the Customer Detail screen. Pre-fills a message with the customer's name, outstanding balance, and the business name. No typing required — the user taps "Send Reminder" and the WhatsApp compose screen opens with the message ready.

---

## 6. UX Patterns

### Color-Coded Financial States

Color is the primary communication channel for financial state — never rely on text labels alone.

| State             | Color | Hex       | Used On                                                               |
| :---------------- | :---- | :-------- | :-------------------------------------------------------------------- |
| Paid / Received   | Green | `#22C55E` | Payment rows, PAID badge, positive balance amounts                    |
| Owed / Overdue    | Red   | `#E74C3C` | Bill rows, OVERDUE badge, red balance amounts, supplier balance cards |
| Pending / Partial | Amber | `#F59E0B` | PENDING badge, amber balance amounts, partial payment states          |
| Primary Action    | Green | `#22C55E` | FAB, active nav, primary buttons, confirmations                       |

Users should be able to scan a list of 20 customers and understand the health of their ledger in under 3 seconds without reading any text.

---

### Quick Entry Pattern (≤3 Taps)

Every primary recording action must be completable in 3 taps or fewer:

```
Record a payment:
1. Tap customer from list
2. Tap "Received" on Customer Detail
3. Enter amount + tap "Record Partial" or "Mark Full Paid"

Create a bill:
1. Tap FAB on any screen
2. Select customer, add items
3. Tap "Create Bill"
```

Never require more steps than this for the primary action on any screen.

---

### Status Chips

Plain text labels are replaced with pill-shaped chips:

- Height: 24–28dp
- Horizontal padding: 8dp
- Font weight: SemiBold (600)
- Text size: 13px
- Border radius: 999dp (full pill)
- Background and text color are paired per state (see table below)

| State   | Background | Text Color |
| :------ | :--------- | :--------- |
| Paid    | `#DCFCE7`  | `#16A34A`  |
| Pending | `#FEF3C7`  | `#D97706`  |
| Overdue | `#FEE2E2`  | `#DC2626`  |

Used on: transaction rows, customer cards, activity feed items.

---

### Floating Action Button (FAB)

- Diameter: 56–58dp, circle
- Background: `#2563EB` (Blue)
- Icon: white, 24dp
- Position: bottom-right, 20dp from edge, 24dp above tab bar
- Shadow: prominent (`elevation: 6`)
- Purpose: always-reachable entry point for the most important action on the screen

---

### Transaction Feed Pattern

Used on Customer Detail and any timeline view:

- Unified list: bills and payments on a single timeline, newest first
- Date-group pill separators: "Today", "Yesterday", or "15 Feb 2026"
- Each row:
  - Left colored border (green = payment, red = bill)
  - Type icon + label
  - Amount (right-aligned, color-coded)
  - Running balance below amount ("Bal: ₹2,400")
- Sub-tab filters: All / Bills Given / Payments

---

### Bottom Sheet Modals

Used for in-context actions that do not require navigating away (record payment, add customer, record delivery):

- Slides up from bottom
- Handle pill at top (40×4dp, `#E5E5EA`)
- Background: white, `border-radius-top: 24dp`
- Backdrop: `rgba(0,0,0,0.4)` — tapping closes the sheet
- Bottom padding: 32dp (accounts for Android gesture nav)

---

### Toast Notifications

Success and error feedback is delivered via the shared `Toast` component — never block the user with a modal for a status message.

| Property  | Value                                                        |
| :-------- | :----------------------------------------------------------- |
| Position  | Slides in from top of screen, below status bar               |
| Animation | Slide-down 200ms, auto-dismiss after 3s                      |
| Success   | Green `#22C55E` background — payment recorded, save success  |
| Error     | Red `#E74C3C` background — network failure, validation error |

**Usage**: `useToast()` hook from `src/components/feedback/Toast.tsx`. `ToastProvider` wraps the root layout.

---

## 7. Visual Design Rules

### Design Philosophy

**"Digital Khata Book"** — The UI mimics the simplicity of traditional Indian ledger books while adding modern fintech-style visual clarity. Financial balances are instantly visible, transaction entry is fast, and color signals do the interpretation work for the user.

### Color Tokens

| Token            | Hex       | Use                                      |
| :--------------- | :-------- | :--------------------------------------- |
| `primary`        | `#22C55E` | Brand, CTAs, active nav, primary buttons |
| `primary-dark`   | `#16A34A` | Hover / pressed state for primary green  |
| `fab`            | `#2563EB` | Floating Action Button                   |
| `success`        | `#22C55E` | Received money, paid state               |
| `danger`         | `#E74C3C` | Owed money, overdue state                |
| `warning`        | `#F59E0B` | Pending payments, partial state          |
| `background`     | `#F6F7F9` | App background, search inputs            |
| `surface`        | `#FFFFFF` | Cards, modals, panels                    |
| `text-primary`   | `#1C1C1E` | All headings and primary body text       |
| `text-secondary` | `#6B7280` | Labels, captions, metadata               |
| `border`         | `#E5E7EB` | Row separators, input borders            |

### Dashboard Gradient Cards

| Card                  | Gradient            | Used For                         |
| :-------------------- | :------------------ | :------------------------------- |
| Customer Balance Card | `#DC2626 → #B91C1C` | Outstanding customer balance due |
| Supplier Payable Card | `#DB2777 → #BE185D` | Supplier payments owed           |
| Net Position Card     | `#0F172A → #334155` | Overall net financial summary    |

---

### Cards

- Background: white `#FFFFFF`
- Border radius: 12–20dp (use 16dp as default)
- Shadow: subtle — `elevation: 2` (Android), `shadowOpacity: 0.06` (iOS)
- Padding: 16–22dp internal
- Margin: 16dp from screen edges — cards must never touch screen edges

---

### Typography

- **Font family**: Inter (system default fallback: SF Pro on iOS, Roboto on Android)
- **Financial amounts**: Always bold (700), large (28px minimum for primary values), never truncated
- **Headings**: Bold (700), 22–28dp
- **Subheadings**: SemiBold (600), 16–18dp
- **Body**: Regular (400), 14–15dp
- **Captions / meta**: Medium (500), 11–13dp, `#8E8E93`

---

### Layout

- **Mobile-first**: Single-column layout. Design for 375–420dp width.
- **Horizontal padding**: 16dp on all screens — consistent across every screen
- **Tab bar height**: 64dp + device bottom inset (edge-to-edge Android support)
- **Safe areas**: Respect top and bottom safe area insets on all screens

---

## 8. Important UX Constraints

| Constraint                                      | Reason                                                                                       |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Simple enough for non-technical shop owners** | Many users have limited smartphone literacy; no financial jargon                             |
| **Any transaction in under 60 seconds**         | Users are often serving customers at a counter — no time for complex flows                   |
| **Financial balance always visible**            | The user must never have to navigate to find their net position                              |
| **No complex forms**                            | Reduce required fields to the minimum needed to save the record                              |
| **Large financial numbers**                     | Amounts must be the largest text on financial screens — never smaller than body text         |
| **Color = financial state**                     | Never communicate paid/owed/pending status through text labels alone                         |
| **Optimistic UI**                               | Transactions must appear instantly — never show a loading spinner where a result is expected |
| **Offline tolerance**                           | Core recording (bills, payments) must work without an internet connection and sync later     |

---

## 9. Future Features (Context Only)

These features are planned but should **not** be included in initial UI designs:

| Feature                       | Phase   | Notes                                                  |
| :---------------------------- | :------ | :----------------------------------------------------- |
| **Phone OTP login**           | Phase 7 | MVP uses email + password to avoid SMS costs           |
| **UPI in-app payments**       | Phase 7 | Collect payments via UPI deep link or Razorpay SDK     |
| **Push notifications**        | Phase 7 | Overdue alerts, payment confirmations                  |
| **Analytics dashboard**       | Phase 7 | Revenue trends, collection rate, monthly comparison    |
| **Multi-user staff accounts** | Phase 7 | Owner / Billing Staff / View-Only roles                |
| **Credit scoring**            | Phase 8 | Customer reliability score from payment history        |
| **Business financing**        | Phase 8 | Working capital loans underwritten by transaction data |
| **Automated bookkeeping**     | Phase 8 | Auto-categorise transactions, GST filing export        |

Design the MVP screens without placeholders for these features.

---

## 10. UX Goal

> "A digital khata book designed for modern shop owners — combining the familiarity of a traditional ledger with modern fintech dashboards."

KredBook blends the simplicity of a physical khata book with fintech-quality visual clarity. Color-coded balances and gradient summary cards make financial status instantly readable. The interface stays minimal so shopkeepers can focus on what matters: knowing who owes what and getting paid faster.

### The four non-negotiable qualities

| Quality             | What it means in the UI                                                    |
| :------------------ | :------------------------------------------------------------------------- |
| **Simple**          | No screen should require more than one primary decision from the user      |
| **Fast**            | The app must feel instant — optimistic UI, no unnecessary loading states   |
| **Trustworthy**     | Consistent color signals, clear audit trail, reliable balance calculations |
| **Finance-focused** | Financial amounts are always the largest, most prominent element on screen |

Every design decision should be evaluated against these four qualities before shipping.

---

_This document is intended for use with AI design generation tools and human designers. For technical implementation details, see [`docs/prd.md`](./prd.md). For the full design token reference, see [`docs/design-system.md`](./design-system.md)._
