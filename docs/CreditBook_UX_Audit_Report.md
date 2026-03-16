# CreditBook — UX Design Audit Report

> **Auditor**: Senior Product Designer / UX Architect
> **Date**: March 9, 2026
> **Scope**: All 36 uploaded Figma screens (Batch 1 + Batch 2)
> **References**: design-system.md v1.3, prd.md v1.2, PRODUCTION_SIGNOFF.md, ARCHITECTURE.md
> **Purpose**: Screen identification, flow mapping, role context, inconsistencies, and Copilot-ready fix instructions

---

## STEP 1 — SCREEN IDENTIFICATION

### AUTH SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-01 | `Welcome_-_Soft_Minimal.png` | Welcome / Splash | First impression, value prop, entry to auth | All | ✅ High |
| B2-13 | `Refined_Log_In_Screen.png` | Login | Email + password authentication | All | ✅ High |
| B2-15 | `Refined_Sign_Up_Screen.png` | Sign Up | Account creation | All | ✅ High |

### ONBOARDING SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-14 | `Refined_Role_Selection_Screen.png` | Role Selection | Maps user to dashboard_mode | All | ✅ High |
| B1-06 | `Business_Setup_-_Step_1.png` | Business Setup Step 1 | Business Name, GSTIN, Bill Prefix | All | ✅ High |
| B1-07 | `Business_Setup_-_Step_2.png` | Business Setup Step 2 / Bank Details | UPI, Bank Name, Account, IFSC | All | ✅ High |
| B2-09 | `Onboarding_Completion_Refined.png` | Onboarding Complete / Ready Screen | Confirms setup, nudge to first action | All | ✅ High |

### DASHBOARD SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B1-04 | `Seller_Dashboard_-_Spec_V1.png` | Seller Dashboard | Customer receivables hero card | Seller only | ✅ High |
| B2-03 | `Distributor_Dashboard.png` | Distributor Dashboard | Supplier payables hero card | Distributor only | ✅ High |
| B1-15 | `Dashboard__Both_View_.png` | Combined Dashboard | 3 stacked gradient cards | Both | ✅ High |
| B1-03 | `Retailer_Dashboard.png` | **OBSOLETE MOCK** | PKR currency, Pakistani data | — | ✅ Discard |

### CUSTOMER SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-02 | `Customers_List.png` | Customers List | Browse customers, filter by status | Seller / Both | ✅ High |
| B1-08 | `Customer_Detail_-_Mohit_Sharma.png` | Customer Detail (active balance) | Transaction feed, overdue state | Seller / Both | ✅ High |
| B1-14 | `Customer_Detail_-_Empty_State.png` | Customer Detail (₹0 balance) | Zero balance / new customer state | Seller / Both | ✅ High |
| B1-05 | `Add_New_Customer_Modal.png` | Add Customer Modal | Create new customer | Seller / Both | ✅ High |
| B2-04 | `Empty_State__Customers_List.png` | Customers Empty State | No customers added yet | Seller / Both | ✅ High |
| B1-13 | `Contact_Picker_Modal.png` | Import Contacts Modal | Bulk import from phone contacts | All | ✅ High |
| B1-01 | `Generated_Screen.png` | Contacts Permission Denied | Permission fallback state | All | ✅ High |
| B2-12 | `Record_Payment_Modal.png` | Record Customer Payment Modal | Receive payment from customer | Seller / Both | ✅ High |

### SUPPLIER SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-18 | `Suppliers_List.png` | Suppliers List | Browse suppliers, balance owed | Distributor / Both | ✅ High |
| B2-17 | `Supplier_Detail_-_Metro_Distributors.png` | Supplier Detail | Balance, bank details, delivery history | Distributor / Both | ✅ High |
| B1-11 | `Add_Supplier_-_Vibrant.png` | Add Supplier Modal (PRIMARY) | Create new supplier | Distributor / Both | ✅ High |
| B1-10 | `Add_Supplier_-_Minimalist.png` | Add Supplier Modal (ALT) | Simpler variant — use Vibrant instead | — | ⚠️ Redundant |
| B2-05 | `Empty_State__Suppliers_List.png` | Suppliers Empty State | No suppliers added yet | Distributor / Both | ✅ High |
| B2-11 | `Record_Delivery_Modal.png` | Record Delivery Modal | Log goods received from supplier | Distributor / Both | ✅ High |
| B1-02 | `Pay_Supplier_Modal.png` | Pay Supplier Modal | Record payment made to supplier | Distributor / Both | ✅ High |

### BILLING SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-08 | `New_Bill_-_Refined_Item_Cards.png` | New Bill / Create Order | Create itemized bill for customer | Seller / Both | ✅ High |
| B1-09 | `Add_Product_Modal_-_Balanced.png` | Add Product Modal | Add new product with variants | All | ✅ High |
| B1-16 | `Edit_Product_Modal_-_Standard.png` | Edit Product Modal | Edit existing product | All | ✅ High |
| B1-17 | `Edit_Product_Modal_-_Standard-1.png` | Delete Product Confirmation | Confirm product deletion | All | ✅ High |
| B1-12 | `Body___Main_Wrapper.png` | Products List | Browse product catalog | All | ✅ High |

### REPORTING SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-07 | `Financial_Position_with_Reports.png` | Financial Position | Aggregate receivables vs payables | Both | ✅ High |
| B1-18 | `Export_data_screen.png` | Export Data | CSV export with date filter | All | ✅ High |

### SETTINGS SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-10 | `Profile___Settings_-_Detailed_Icons.png` | Profile & Settings | Business details, mode toggle, language | All | ✅ High |

### SHARED COMPONENT SCREENS

| # | File | Screen Name | Purpose | Role Context | Confidence |
|---|---|---|---|---|---|
| B2-16 | `Success_Toast.png` | Success Toast | Positive feedback notification | All | ✅ High |
| B2-06 | `Empty_State__Transaction_Feed.png` | Transaction Feed Empty State | No transactions in customer/order context | All | ✅ High |

---

## STEP 2 — USER FLOW MAP

```
APP LAUNCH
    │
    ▼
[B2-01] Welcome Screen
    │
    ├──► "Get Started" ──────────────────────────────────────────────────────────────┐
    │                                                                                 │
    └──► "Log In" ─────────────────────────────────────────────────────────────────┐ │
                                                                                   │ │
AUTH FLOW                                                                          │ │
[B2-13] Login ──► (success) ──────────────────────────────────────────────────────┘ │
[B2-15] Sign Up ──► ──────────────────────────────────────────────────────────────┘ │
                                                                                     │
ONBOARDING FLOW (new users only — profiles.onboarding_complete = false)             ▼
[B2-14] Role Selection (Retailer / Wholesaler / Small Business)
    │   → writes dashboard_mode: seller | distributor | both
    ▼
[B1-06] Business Setup Step 1 (Name, GSTIN, Bill Prefix)
    ▼
[B1-07] Business Setup Step 2 (UPI, Bank Name, Account, IFSC)
    ▼
[B2-09] Onboarding Complete → "Add Your First Customer" or "Go to Dashboard"

MAIN APP — ROLE: SELLER
    ▼
[B1-04] Seller Dashboard (red hero: Customers Owe Me, View Report + Send Reminder)
    │
    ├──► Customers Tab ──► [B2-02] Customers List
    │                           ├──► [B2-12] Record Payment Modal (bottom sheet)
    │                           ├──► [B1-05] Add Customer Modal
    │                           ├──► [B1-13] Import Contacts
    │                           │         └──► [B1-01] Permission Denied state
    │                           └──► tap customer ──► [B1-08] Customer Detail (active)
    │                                               └──► [B1-14] Customer Detail (₹0)
    │
    ├──► Orders Tab ──► Orders List (not in batch — missing screen)
    │                       └──► [B2-08] New Bill ──► [B1-12] Products List
    │                                                      ├──► [B1-09] Add Product
    │                                                      ├──► [B1-16] Edit Product
    │                                                      └──► [B1-17] Delete Confirm
    │
    ├──► Suppliers Tab ──► [B2-18] Suppliers List
    │                           ├──► [B2-05] Empty State
    │                           ├──► [B1-11] Add Supplier Modal
    │                           └──► tap supplier ──► [B2-17] Supplier Detail
    │                                                     ├──► [B2-11] Record Delivery
    │                                                     └──► [B1-02] Pay Supplier
    │
    └──► Profile Tab ──► [B2-10] Profile & Settings ──► [B1-18] Export Data

MAIN APP — ROLE: DISTRIBUTOR
    ▼
[B2-03] Distributor Dashboard (pink hero: I Owe Suppliers, View Suppliers + Record Delivery)

MAIN APP — ROLE: BOTH
    ▼
[B1-15] Combined Dashboard (3 stacked gradient cards)

REPORTS FLOW (from Dashboard action bar)
    ▼
[B2-07] Financial Position ──► linked from "View Report" button on all dashboards

SHARED COMPONENTS (appear across flows)
    [B2-16] Success Toast
    [B2-06] Empty State — Transaction Feed
    [B2-04] Empty State — Customers List
```

---

## STEP 3 — ROLE-BASED SCREEN ANALYSIS

### Seller (dashboard_mode = 'seller')

| Screen | What changes |
|---|---|
| Dashboard | Red gradient hero card. Label: "CUSTOMERS OWE YOU". Action bar: "View Report" + "Send Reminder". Stat cards: Active Buyers + Overdue count |
| Tab bar | Home / Customers / Orders / Suppliers / Profile |
| Customers List | Primary list — high frequency use |
| Suppliers List | Available but secondary — user mostly looks outward at receivables |

### Distributor (dashboard_mode = 'distributor')

| Screen | What changes |
|---|---|
| Dashboard | Pink gradient hero card. Label: "I OWE SUPPLIERS". Action bar: "View Suppliers →" + "Record Delivery". Stat cards: Active Suppliers + Overdue Payments |
| Tab bar | Same 5 tabs — no tab-level changes |
| Customers List | Available but secondary — user mostly looks inward at payables |
| Suppliers List | Primary list — high frequency use |

### Both (dashboard_mode = 'both')

| Screen | What changes |
|---|---|
| Dashboard | 3 stacked gradient cards: red (Customers Owe Me) + pink (I Owe Suppliers) + dark (Net Position). No action bar — replaced by View Report + Send Reminder below cards |
| Financial Position | Shows all 3 cards: Customers Owe Me + I Owe Suppliers + Net Position calculation |

### Role-Specific Logic Summary

```
dashboard_mode = 'seller'      → isSellerMode = true  → red hero, customer focus
dashboard_mode = 'distributor' → isSellerMode = false  → pink hero, supplier focus
dashboard_mode = 'both'        → isBothMode = true     → split view, all cards
```

---

## STEP 4 — UX INCONSISTENCIES

These are grouped by severity. Each item includes the affected screen(s) and the exact fix needed.

---

### 🔴 CRITICAL — Breaks functionality or violates product spec

---

**C-01 · Tab bar is different on almost every screen — 7 different configurations found**

This is the single largest design system failure across the entire file set.

| Screen | Shows | Should Show |
|---|---|---|
| Seller Dashboard (B1-04) | Home / Customers / Bills / Suppliers / Profile | Home / Customers / **Orders** / Suppliers / Profile |
| Distributor Dashboard (B2-03) | Home / Customers / Bills / Suppliers / Profile | Home / Customers / **Orders** / Suppliers / Profile |
| Customers List (B2-02) | Home / Customers / Bills / Suppliers / Profile | Home / Customers / **Orders** / Suppliers / Profile |
| Products Screen (B1-12) | Home / Customers / Bills / Suppliers / Profile | Home / Customers / **Orders** / Suppliers / Profile |
| Customers Empty State (B2-04) | Home / Customers / **Cashbook** / **Settings** | Home / Customers / Orders / Suppliers / Profile |
| Suppliers Empty State (B2-05) | Home / **Suppliers** / **Orders** / **Inventory** / Profile | Home / Customers / Orders / Suppliers / Profile |
| Transaction Empty State (B2-06) | Home / **Transactions** / Customers / Suppliers / **More** | This is inside Customer Detail — no tab bar needed |
| Financial Position (B2-07) | Home / Customers / **[center FAB]** / Suppliers / **Reports** | No tab bar — this is a pushed stack screen |
| Profile (B2-10) | Home / **Transactions** / **Reports** / Profile | Home / Customers / Orders / Suppliers / Profile |
| Supplier Detail (B2-17) | Home / Suppliers / Customers / **Reports** / **Menu** | Home / Customers / Orders / Suppliers / Profile |
| Suppliers List (B2-18) | Home / Customers / **[center FAB]** / Suppliers / Profile | Home / Customers / Orders / Suppliers / Profile |

**Fix**: Define one master tab bar component and apply it to every screen. Spec: 5 tabs, equal width, labels: **Home · Customers · Orders · Suppliers · Profile**. Active: `#22C55E`. Inactive: `#9CA3AF`. Height: 64dp + insets.bottom.

**Note on stack screens**: Financial Position (`reports/`) and Supplier Detail (`[supplierId].tsx`) are stack-pushed screens — they should show a **back arrow + screen title header**, NOT the tab bar.

---

**C-02 · "Continue with Google" on Login and Sign Up — not in product spec**

Affected: `Refined_Log_In_Screen.png` (B2-13), `Refined_Sign_Up_Screen.png` (B2-15)

Google OAuth is not in the tech stack. The PRD explicitly states: *"MVP authentication uses email + password to avoid SMS costs. Phone OTP is Phase 7."* There is no Google auth in Supabase config.

**Fix**: Remove the "Continue with Google" button entirely from both screens. The divider line and "or" text above it also disappear.

---

**C-03 · Grand Total color is GREEN on New Bill screen — spec says DARK**

Affected: `New_Bill_-_Refined_Item_Cards.png` (B2-08)

Grand Total shows `₹10,143` in green text. P-20 fix in `PRODUCTION_SIGNOFF.md` explicitly states: *"Grand Total is dark text (#1C1C1E)."* Green on Grand Total creates a false signal — it suggests the total is a positive/received amount, not what the customer owes.

**Fix**: Grand Total label and amount → `color: #1C1C1E`, `fontSize: 28`, `fontWeight: 700`. Only Previous Balance stays red (`#E74C3C`).

---

**C-04 · Customer subtitle "Wholesale Customer" on New Bill — spec says remove**

Affected: `New_Bill_-_Refined_Item_Cards.png` (B2-08)

Customer selector shows "Wholesale Customer" as a subtitle under "Mohit Sharma". P-20 spec: *"No customer subtitle."* The subtitle also uses a non-existent customer attribute — there is no "customer type" field in the customers table.

**Fix**: Remove the subtitle row. Show only customer name + previous balance warning.

---

**C-05 · Customer photo avatar on New Bill — should be initials**

Affected: `New_Bill_-_Refined_Item_Cards.png` (B2-08)

The customer selector card shows a real photo. The app uses initials-based avatars generated from name (deterministic 8-color palette). No photo upload flow exists for customers.

**Fix**: Replace photo with initials circle using the same `AVATAR_COLORS` hash logic as CustomerCard.

---

**C-06 · Profile avatar is an OUTLINE circle — spec requires FILLED green circle**

Affected: `Profile___Settings_-_Detailed_Icons.png` (B2-10)

P-21 fix: *"Profile avatar: FILLED green circle."* The screen shows `RK` inside a green-bordered hollow circle. Should be a solid green circle `#22C55E` with white initials.

**Fix**: `backgroundColor: #22C55E`, `borderRadius: 9999`, `width: 72, height: 72`. White bold initials centered inside.

---

**C-07 · Dashboard Mode toggle order is WRONG on Profile**

Affected: `Profile___Settings_-_Detailed_Icons.png` (B2-10)

Shows: **Seller | Both | Distributor**
Required by P-21: **Seller | Distributor | Both**

This matters because "Both" is the most comprehensive mode and should be at the end as an additive option. Putting it in the middle breaks the logical progression.

**Fix**: Reorder to Seller → Distributor → Both (left to right).

---

**C-08 · "Reminder" label on Customer Detail quick action — spec requires "Send Reminder"**

Affected: `Customer_Detail_-_Mohit_Sharma.png` (B1-08), `Customer_Detail_-_Empty_State.png` (B1-14)

P-19 fix: *"Quick action labels exactly: New Bill | Received | Send Reminder."* The third card shows "Reminder" only.

**Fix**: Label → "Send Reminder" (exact string, no truncation).

---

**C-09 · "Pay Supplier" warning fires when amount = exact balance — P-09 bug visible in design**

Affected: `Pay_Supplier_Modal.png` (B1-02)

The modal shows "Amount exceeds balance (₹24,000)" warning when amount entered is exactly ₹24,000 — which is the full balance. This is the P-09 validation bug. The code fix is `>` not `>=`. This design still shows the wrong state as the "correct" UI.

**Fix in design**: Remove the warning banner from this reference image. Warning should only appear when `amount > balanceOwed`. Paying the exact balance is always valid.

---

**C-10 · Contact Picker shows Pakistani phone numbers and names — must be Indian**

Affected: `Contact_Picker_Modal.png` (B1-13)

Shows: `+92 300 1234567`, `+92 333 5554433`, names "Zain Khan", "Fatima Ahmed", "Ali Salman", "Sara Malik". P-26 audit confirmed zero Pakistani data must exist anywhere in the codebase. These mock screens, if used as reference for placeholder data in code, would reintroduce the violation.

**Fix**: Replace all numbers with `+91` Indian format. Replace names with Indian names: Rahul Sharma, Priya Singh, Anil Kumar, Meena Devi.

---

### 🟠 MAJOR — Visible inconsistency, wrong component usage, or missing spec element

---

**M-01 · Supplier and Customer avatars use orange/amber across multiple screens — not in AVATAR_COLORS**

Affected: `Suppliers_List.png` (B2-18), `Pay_Supplier_Modal.png` (B1-02), `Supplier_Detail.png` (B2-17)

All supplier avatar circles are orange/amber. The design system specifies a deterministic 8-color palette for initials avatars. Orange exists in the palette (`#F97316`) but should not be the default for all suppliers. Each supplier should get a color based on a hash of their name.

Also: the design system rule is *"Never use red or amber as decorative colors. Reserve them strictly for financial states."* Using amber/orange for avatars (a purely decorative context) violates this principle.

**Fix**: Apply the deterministic `AVATAR_COLORS` hash. Metro Distributors "MD" → hashed to a specific palette color. No supplier should have the same avatar color by default.

---

**M-02 · "Retailer Dashboard" mock (B1-03) must be deleted from design file**

Shows PKR currency, "CreditBooo" typo, Pakistani names, wrong layout. This must be removed from the Figma file entirely to avoid anyone using it as a reference.

---

**M-03 · FAB color is GREEN on Products screen — spec requires BLUE**

Affected: `Body___Main_Wrapper.png` (B1-12)

FAB shows green `+`. The design system: *"FAB: `#2563EB` (Blue). This is the highest-elevation element on every list screen."*

**Fix**: FAB background → `#2563EB`.

---

**M-04 · Export CSV buttons have 3 different colors — all must be green**

Affected: `Export_data_screen.png` (B1-18)

- Orders & Bills → green ✅
- Payments Received → green ✅  
- Customer Balances → **blue**
- Supplier Purchases → **orange**

All four buttons perform the same action (export CSV). They must all be the same visual weight and color: `#22C55E` background, white text.

---

**M-05 · Financial Position screen has Phase 7 content not yet built**

Affected: `Financial_Position_with_Reports.png` (B2-07)

The screen shows two sections that do not exist in the current codebase:
1. **"Quick Insights"** — with overdue count, largest debt, collection rate
2. **"Monthly Financial Report"** — PDF download card

These are Phase 7 analytics features. The current `app/(main)/reports/index.tsx` only shows the 3 gradient cards (Customers Owe Me, I Owe Suppliers, Net Position).

**Fix**: Use this screen as a Phase 7 reference only. Remove "Quick Insights" and "Monthly Financial Report" sections from the current production design. The tab bar also shows "Reports" as a dedicated tab — that is also a Phase 7 change. Current: reports screen is stack-pushed from dashboard "View Report" button.

---

**M-06 · Distributor Dashboard action bar is different from spec**

Affected: `Distributor_Dashboard.png` (B2-03)

Shows: "View Suppliers →" and "Record Delivery" inside the hero card.
Spec (from `DashboardActionBar.tsx`): Action bar has "View Report" and "Send Reminder" — these are the same for all dashboard modes. The supplier-specific shortcuts should not replace the standard action bar.

**Fix**: Replace with standard "View Report" + "Send Reminder" action bar below the hero card. If distributor-specific actions are needed, add them as a secondary row — never replace the primary action bar.

---

**M-07 · Empty state screens (B2-04, B2-05, B2-06) show back arrows — tab screens don't have back nav**

Affected: `Empty_State__Customers_List.png` (B2-04), `Empty_State__Suppliers_List.png` (B2-05), `Empty_State__Transaction_Feed.png` (B2-06)

Customers and Suppliers are tab-level screens. Tab screens never have a back arrow — they are root-level destinations. The back arrow implies these are stack-pushed screens.

Exception: `Empty_State__Transaction_Feed.png` (B2-06) is shown with title "Transactions" and a tab bar showing "Transactions" as active — this empty state is actually rendered inside the Customer Detail screen's transaction feed. It should have no standalone header or back arrow; it renders within `[customerId].tsx` below the tab filter row.

**Fix for B2-04 and B2-05**: Remove back arrow from header. Add the standard page title (`Customers` or `Suppliers`) as a large heading at top-left. These render inside the tab bar layout.

---

**M-08 · Success Toast design is a standalone pill — missing slide-down animation context**

Affected: `Success_Toast.png` (B2-16)

The toast is shown as a floating pill: "✅ Customer added successfully" on a green pill. This matches the design system spec. However, the design doesn't show the positioning context — it should appear at the top of the screen, below the status bar, sliding down. Ensure it's never shown as a centered overlay or bottom snackbar.

**Fix**: Annotate in Figma: position = top of screen, `top: statusBarHeight + 8dp`. Slides in from top (200ms easeOut), auto-dismisses at 2800ms.

---

**M-09 · Hamburger menu icon on "Both" Dashboard — not in spec**

Affected: `Dashboard__Both_View_.png` (B1-15)

Top-left shows a hamburger menu (☰). The spec header has only: business name + avatar on the left, notification bell on the right. There is no drawer navigation in this app.

**Fix**: Remove hamburger. Replace with initials avatar + business name (same as Seller Dashboard B1-04).

---

**M-10 · Supplier Detail tab bar and navigation are wrong**

Affected: `Supplier_Detail_-_Metro_Distributors.png` (B2-17)

Tab bar shows: Home / Suppliers / Customers / Reports / Menu. This is a stack-pushed screen (`[supplierId].tsx`) — it should show only the standard navigation header (back arrow + "Metro Distributors" title + phone/edit icons). No tab bar should be visible on detail screens.

**Fix**: This screen renders inside the stack navigator. It inherits the tab bar from the parent layout — but visually the detail content should fill the space above the tab bar with a proper navigation header, not a modified tab bar.

---

### 🟡 MINOR — Polish, label accuracy, or cosmetic token mismatches

---

**N-01 · Onboarding completion pill shows "Business Name INV-" — truncated**

Affected: `Onboarding_Completion_Refined.png` (B2-09)

The confirmation pill shows "Business Name INV-" which is missing the business name. Should dynamically show the actual entered business name: e.g., "Raj Kirana Store · INV".

---

**N-02 · "Online · UPI" in Customer Detail transaction rows — should be "UPI" only**

Affected: `Customer_Detail_-_Mohit_Sharma.png` (B1-08)

Payment row shows "Online · UPI". The P-19 MODE_LABEL map normalises `"online"` → `"UPI"`. The display should show just "UPI", not "Online · UPI".

---

**N-03 · Add Supplier (Vibrant) uses Pakistani bank examples**

Affected: `Add_Supplier_-_Vibrant.png` (B1-11)

Bank name placeholder: "e.g. HBL, Alfalah Bank" (Pakistani). IBAN label used instead of "Account Number". IFSC example "0012 or HBLP001" (Pakistani format).

**Fix**: Bank name placeholder → "e.g. HDFC Bank, SBI". Label → "Account Number". IFSC example → "e.g. HDFC0001234".

---

**N-04 · Record Customer Payment avatar "MS" is blue — should use deterministic color**

Affected: `Record_Payment_Modal.png` (B2-12)

"MS" initials circle is blue. Should use the deterministic `AVATAR_COLORS` hash of the name "Mohit Sharma". This matches how CustomerCard renders the same customer's avatar.

---

**N-05 · Role Selection card icons use off-brand colors**

Affected: `Refined_Role_Selection_Screen.png` (B2-14)

- Retailer: green store icon ✅
- Wholesaler: orange truck icon ❌ (orange not in theme)
- Small Business: blue briefcase icon ❌ (info blue used as decorative)

Per design system: *"Never use red or amber as decorative colors."* Same applies to orange. Icon colors should be from the semantic token set.

**Fix options**: Either use neutral gray for unselected role icons, or use `#22C55E` consistently for all 3. Selected role gets the green ring/checkmark.

---

**N-06 · Supplier Detail delivery row icon is orange/amber — wrong color**

Affected: `Supplier_Detail_-_Metro_Distributors.png` (B2-17)

The "Delivery #D-021" row icon is orange. Delivery rows should use the same color as their financial state: neutral for pending deliveries, green for paid-off.

---

**N-07 · Supplier card "I Owe" summary badge at top of Suppliers List**

Affected: `Suppliers_List.png` (B2-18)

Top-right shows a pink badge "I Owe: ₹54,200". This is useful context but should use the supplier gradient color token (`#DB2777`) not a flat pink to stay consistent with the gradient card system.

---

## STEP 5 — DESIGN SYSTEM CONSISTENCY AUDIT

### Typography

| Check | Status | Detail |
|---|---|---|
| Financial amounts bold + large | ✅ Mostly correct | Dashboard heroes all use large bold amounts |
| Grand Total dark not green | 🔴 Broken | B2-08 New Bill — green Grand Total |
| Captions use `#6B7280` | ⚠️ Inconsistent | Some screens use lighter gray, some use darker |
| Inter font family | ✅ Consistent | All screens appear to use Inter |

### Color Tokens

| Check | Status | Detail |
|---|---|---|
| Primary green `#22C55E` | ✅ Consistent | CTAs, active tabs, chips all correctly green |
| FAB blue `#2563EB` | 🟠 Broken on 1 screen | Products List uses green FAB |
| Danger red `#E74C3C` | ⚠️ Check needed | Some screens show `#EF4444` (Tailwind red-500) — verify in export screen |
| Warning amber `#F59E0B` | ⚠️ Inconsistent | Supplier avatars use orange not amber |
| Background `#F6F7F9` | ✅ Consistent | All screen backgrounds correct |
| Success chip `#DCFCE7` bg / `#166534` text | ✅ Correct | Customers list PAID chip looks correct |

### Button Patterns

| Check | Status | Detail |
|---|---|---|
| Primary: full-width green, 52dp, radius 14dp | ✅ Consistent | All primary CTAs follow this pattern |
| Outline: green border, green text | ✅ Consistent | "Record Partial", "New Bill" outline buttons correct |
| Dual CTA layout (outline + filled) | ✅ Consistent | Payment modals, New Bill use correct split |
| Loading state: green spinner | Can't verify from static screens | Ensure spinner `color="#22C55E"` |

### Card Patterns

| Check | Status | Detail |
|---|---|---|
| White surface, radius 12–20dp, soft shadow | ✅ Consistent | All cards follow this |
| 16dp horizontal margin from screen edge | ✅ Consistent | Cards don't touch edges |
| Financial amounts right-aligned in lists | ✅ Consistent | All list screens correct |

### Navigation Headers

| Check | Status | Detail |
|---|---|---|
| Stack screens: back arrow + title | ✅ Correct on auth screens | Business setup, login, signup all correct |
| Tab screens: large title top-left | ⚠️ Inconsistent | Some tab screens show back arrows (B2-04, B2-05) |
| Detail screens: back + name + action icons | ✅ Mostly correct | Customer Detail, Supplier Detail correct |

### Bottom Sheets

| Check | Status | Detail |
|---|---|---|
| Handle pill at top (40×4dp, `#E5E5EA`) | ✅ All modals have it | |
| White background, radius-top 24dp | ✅ Consistent | |
| Backdrop `rgba(0,0,0,0.4)` | Cannot verify in static | |

---

## STEP 6 — MISSING SCREENS

These screens are implied by the product flow but are absent from the uploaded set.

| Missing Screen | Where It Appears | Priority |
|---|---|---|
| **Orders List** | `app/(main)/orders/index.tsx` — the main orders/bills tab | 🔴 High — entire tab missing |
| **Order Detail** | `app/(main)/orders/[orderId].tsx` — tap any order row | 🔴 High |
| **Reset Password** | `app/(auth)/resetPassword.tsx` — "Forgot password?" link on Login | 🟠 Medium |
| **Onboarding Step 1** (phone/intro) | `app/(auth)/onboarding/index.tsx` | 🟡 Low — may be simple |
| **Distributor Dashboard hero — "Both" split card close-up** | When isBothMode and user zooms | 🟡 Low |
| **Record Payment — partial state** | After entering amount < full balance | 🟡 Low |
| **Record Payment — success state** | After confirming payment | 🟡 Low — covered by toast |
| **Supplier Delivery — empty history** | When no deliveries yet | 🟡 Low |
| **Product Detail / View** | Tap on product row in Products screen | 🟡 Low |
| **Error State screens** | Network failure, API error in any list | 🟡 Low |
| **Loading Skeleton screens** | While data is fetching on first load | 🟡 Low |

---

## STEP 7 — UX IMPROVEMENTS BY SCREEN

### Welcome Screen (B2-01) — No changes needed
The screen is clean, on-brand, and communicates value clearly. The three feature pills (Fast Entry / Always Visible / Works Offline) are effective trust builders for non-technical users. The "SECURE & ENCRYPTED" badge at the bottom is good for a financial app.

### Login / Signup (B2-13, B2-15) — Remove Google auth
Removing Google removes cognitive split. The user has one clear path. Error state on login ("Invalid email or password") is well-placed — just below the form, above the sign-up link.

### Role Selection (B2-14) — Good structure, fix icon colors
The 3-card layout is the right UX. One selection at a time, full descriptions, clear visual feedback on selection. Descriptions are excellent ("Kirana store, medical shop, clothing — sell to local customers on credit"). Icon colors need to be neutral/consistent (see N-05).

**Improvement**: Add a subtle "Most Popular" chip on Retailer card. Data shows most CreditBook users are kirana store owners.

### Business Setup (B1-06, B1-07) — Good, add field count
The 2-step layout with progress bar is correct. Step 1 is lightweight (Name, GSTIN, Prefix). Step 2 handles bank details (UPI, Bank, Account, IFSC).

**Improvement**: On Step 2, add a note: "These details print on every bill you send." This gives users a reason to fill it out rather than skip.

### Onboarding Complete (B2-09) — Fix truncated pill
The screen is warm and motivating. "Add Your First Customer" is the right primary CTA — it gets the user into the core loop immediately.

### Seller Dashboard (B1-04) — Strong, fix tab label
The red gradient hero, time-based greeting, overdue bell dot, and action bar are all correct per spec. This is the strongest dashboard design.

**Improvement**: The "See All" link for Recent Activity should be replaced with "View Report" to connect it to the Financial Position screen. Keeps navigation predictable.

### Distributor Dashboard (B2-03) — Fix action bar, fix tab label
The pink gradient correctly communicates "money I owe" as distinct from the red "money owed to me". Good differentiation.

**Improvement**: The action bar inside the hero card ("View Suppliers →" + "Record Delivery") should be moved below the hero card and standardised to match the Seller Dashboard's action bar pattern. In-card actions make the card feel cluttered.

### Customers List (B2-02) — Strong, fix tab label only
Initials avatars with deterministic colors, filter tabs, balance right-aligned, status chips, dual FAB — all excellent. This is the strongest list screen design.

### Customer Detail — Active (B1-08) — Fix 2 labels
The transaction feed with date groups and running balance per row is the right pattern for a khata book replacement. Users understand chronological debt history.

### Customer Detail — Zero Balance (B1-14) — Strong
The green hero for ₹0 is the correct P-19 implementation. "ALL SETTLED" messaging is motivating. Dual CTA (New Bill + Record Payment) gives the right options for a new customer with no history.

### New Bill (B2-08) — Fix 3 items
Good item card structure (item name, rate, quantity stepper, subtotal). The formula breakdown at the bottom (Items Total → GST → Loading → Previous Balance → Grand Total) is exactly right for Indian billing context.

**Improvement**: The bill number "INV-043" badge is well-placed top-right. Make it tappable with a tooltip explaining it's auto-assigned.

### Products List (B1-12) — Fix FAB color
Category filter chips are a Phase 7 addition (not in current schema) — remove from v3.x production design. The base list with variant count per product is correct.

### Add/Edit Product (B1-09, B1-16) — Both clean
The variant rows (Unit/Size + Price) side by side is the right density for a modal. "+ Add Variant" in green is correctly placed.

### Delete Confirmation (B1-17) — Clean
The warning icon in a light red circle communicates severity without alarming. "This action cannot be undone" is the right copy. Correct use of danger color for the destructive action.

### Suppliers List (B2-18) — Fix avatar colors, fix FAB position
The "I Owe: ₹54,200" total at top is a useful context — it mirrors what the Dashboard hero shows. Good design decision.

**Improvement**: Add an "Add Supplier" option accessible without scrolling — currently only via FAB. Consider a secondary FAB (import-style) for bulk add.

### Supplier Detail (B2-17) — Fix tab bar, fix delivery icon
Bank Details with "Copy UPI" is excellent UX — one tap to copy UPI ID for bank transfers. The delivery history with date groups mirrors the customer transaction feed pattern correctly.

### Record Delivery (B2-11) — Strong
The summary row at the bottom (Items: ₹5,400 · Loading: ₹200 · Advance: -₹500) with red "Net Added to Balance: ₹5,100" is perfect financial clarity. Users understand what's being added to what they owe.

### Record Customer Payment (B2-12) — Fix avatar color
The two-button layout "Record Partial" + "Mark Full Paid" is the right split. Full balance pre-filled is a good shortcut for common case (user paying exact amount).

### Pay Supplier (B1-02) — Fix warning logic
Good layout, correct field order. See C-09 for the warning issue.

### Financial Position (B2-07) — Remove Phase 7 content
The 3 gradient cards are the correct v3.x design. Quick Insights and Monthly Report are Phase 7 — design them separately.

### Export Data (B1-18) — Fix button colors
Date range with "All time"/"This month" quick chips is a good shortcut. The 4 export types with icons and descriptions are clear.

### Profile (B2-10) — Fix avatar, fix mode order
The grouped sections (Business Details / Bank Account / App Preferences / Data) are the right information architecture. Data section (Export) is correctly at the bottom.

### Success Toast (B2-16) — Correct, annotate positioning

---

## STEP 8 — FINAL UX ARCHITECTURE

This is the complete screen map for the production app (v3.x) with Phase 7 additions clearly separated.

```
╔══════════════════════════════════════════════════════════════════╗
║  CREDITBOOK — SCREEN ARCHITECTURE v3.4                          ║
╚══════════════════════════════════════════════════════════════════╝

AUTH  (app/(auth)/)
├── Welcome                     app/index.tsx
├── Login                       (auth)/login.tsx
├── Signup                      (auth)/signup.tsx
└── Reset Password              (auth)/resetPassword.tsx

ONBOARDING  (app/(auth)/onboarding/)
├── Step 1 — Phone/Intro        onboarding/index.tsx
├── Role Selection              onboarding/role.tsx
├── Step 2 — Business Setup     onboarding/business.tsx  [Step 1 of 2]
├── Step 3 — Bank Details       onboarding/business.tsx  [Step 2 of 2]
└── Complete / Ready            onboarding/ready.tsx

DASHBOARD  (role-aware, same file)
├── Seller Mode                 screens/DashboardScreen.tsx  [isSellerMode]
├── Distributor Mode            screens/DashboardScreen.tsx  [!isSellerMode && !isBothMode]
└── Both Mode                   screens/DashboardScreen.tsx  [isBothMode]

CUSTOMERS  (app/(main)/customers/)
├── Customers List              screens/CustomersScreen.tsx
├── Customer Detail — Active    customers/[customerId].tsx
├── Customer Detail — Zero Bal  customers/[customerId].tsx  [₹0 state]
├── Customer Detail — Empty     customers/[customerId].tsx  [no transactions]
├── Add Customer                components/customers/NewCustomerModal.tsx
├── Import Contacts             components/customers/ContactsPickerModal.tsx
├── Contacts Permission Denied  ContactsPickerModal.tsx  [permission denied state]
└── Record Payment              components/customers/RecordCustomerPaymentModal.tsx

ORDERS / BILLING  (app/(main)/orders/)
├── Orders List                 screens/OrdersScreen.tsx            ← MISSING SCREEN
├── Order Detail                orders/[orderId].tsx                ← MISSING SCREEN
├── New Bill                    screens/CreateOrderScreen.tsx
└── Products List               screens/ProductsScreen.tsx
    ├── Add Product             components/products/NewProductModal.tsx  [add mode]
    ├── Edit Product            components/products/NewProductModal.tsx  [edit mode]
    └── Delete Confirm          components/products/ProductActionsModal.tsx

SUPPLIERS  (app/(main)/suppliers/)
├── Suppliers List              screens/SuppliersScreen.tsx
├── Suppliers Empty State       components/feedback/EmptyState.tsx
├── Supplier Detail             suppliers/[supplierId].tsx
├── Add Supplier                components/suppliers/NewSupplierModal.tsx
├── Record Delivery             components/suppliers/RecordDeliveryModal.tsx
└── Pay Supplier                components/suppliers/RecordPaymentMadeModal.tsx

REPORTS  (app/(main)/reports/)
└── Financial Position          reports/index.tsx  [stack-pushed from dashboard]

EXPORT  (app/(main)/export/)
└── Export Data                 screens/ExportScreen.tsx  [stack-pushed from profile]

PROFILE  (app/(main)/profile/)
└── Profile & Settings          screens/ProfileScreen.tsx

SHARED COMPONENTS  (always available)
├── Success Toast               components/feedback/Toast.tsx  [slide from top]
├── Error Toast                 components/feedback/Toast.tsx  [slide from top]
└── Empty State                 components/feedback/EmptyState.tsx

── ── ── ── ── PHASE 7 (NOT YET BUILT) ── ── ── ── ──

AUTH EXTENSION
└── Phone OTP Login             [replace email/password]

FINANCIAL POSITION EXTENSION
├── Quick Insights section      [7 overdue, largest debt, collection rate]
└── Monthly Financial Report    [PDF download]

PROFILE EXTENSION
└── Reports tab in tab bar      [if Reports promoted to tab]
```

---

## QUICK REFERENCE — COPILOT FIX PRIORITY TABLE

Use this table to instruct Copilot in priority order. Each row = one Copilot prompt session.

| Priority | Screens | Fix | Code File |
|---|---|---|---|
| 1 | All screens | Standardise tab bar to: Home / Customers / **Orders** / Suppliers / Profile | `app/(main)/_layout.tsx` |
| 2 | Login, Signup | Remove "Continue with Google" button | `login.tsx`, `signup.tsx` |
| 3 | New Bill | Grand Total → `color: #1C1C1E`. Remove customer subtitle. Replace photo with initials avatar | `CreateOrderScreen.tsx` |
| 4 | Profile | Avatar → filled green circle. Mode order → Seller/Distributor/Both | `ProfileScreen.tsx` |
| 5 | Customer Detail | Quick action 3rd label → "Send Reminder" | `[customerId].tsx` |
| 6 | Pay Supplier | Warning only shows when `amount > balance` (not `>=`) | `RecordPaymentMadeModal.tsx` |
| 7 | Contact Picker | Replace +92 numbers and Pakistani names with Indian data | `ContactsPickerModal.tsx` |
| 8 | Export Screen | All 4 Export CSV buttons → `#22C55E` | `ExportScreen.tsx` |
| 9 | Products Screen | FAB → `#2563EB` | `ProductsScreen.tsx` |
| 10 | Both Dashboard | Remove hamburger menu. Add initials avatar header | `DashboardHeader.tsx` |
| 11 | Empty States B2-04, B2-05 | Remove back arrow from tab-level screens | `CustomersScreen.tsx`, `SuppliersScreen.tsx` |
| 12 | Distributor Dashboard | Standardise action bar to "View Report" + "Send Reminder" | `DashboardActionBar.tsx` |
| 13 | Add Supplier (Vibrant) | Fix bank placeholder text → Indian banks. IBAN → Account Number | `NewSupplierModal.tsx` |
| 14 | Financial Position | Remove Quick Insights + Monthly Report (Phase 7) | `reports/index.tsx` |
| 15 | All avatars | Apply deterministic AVATAR_COLORS hash to supplier avatars | `SupplierCard.tsx` |

---

*This audit covers all 36 screens uploaded across Batch 1 and Batch 2. Ready to proceed to Copilot-assisted implementation in priority order.*
