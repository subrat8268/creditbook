# CreditBook App - Business Requirements Document (BRD)

> **Last Updated**: February 27, 2026  
> **Version**: 1.4  
> **Status**: Active Development

## 📋 Recent Updates (v1.4 - February 2026)

### ✨ Four Billing Enhancements (NEW + MODIFICATION)

**Features**:

1. **Bank Details Validation before bill generation** — `handleSendBill` in `CreateOrderScreen` now checks that `bank_name`, `account_number`, and `ifsc_code` are all filled. If any are missing, an `Alert` tells the user exactly where to fix it (Profile → Bank Account Details) instead of generating an incomplete bill.

2. **Customizable Bill Number Prefix** (NEW) — Vendors can now set their preferred prefix (INV, BILL, CB, etc.) in Profile → Bill Settings. Prefix is stored in `profiles.bill_number_prefix`. The SQL `get_next_bill_number` function now accepts a `prefix TEXT DEFAULT 'INV'` parameter and matches/increments only bills with that prefix. Bills from different prefixes are counted independently.

3. **Tax/GST % on items** (NEW) — A **GST %** input appears alongside the Loading Charge input in the Order Summary panel. Tax is calculated on `itemsTotal` only (loading charge is excluded, matching Indian billing norms). The breakdown shows: `Today's Items → GST (X%) → Loading → Today's Total → Prev Balance → Grand Total`. Both the PDF and the saved order record the correct `total_amount` including tax.

4. **Customer payment reminders via WhatsApp** (NEW) — When a customer with outstanding balance is selected in the order form, an amber reminder button appears: _"🔔 Send payment reminder to [Name] — ₹X due"_. Tapping it opens WhatsApp with a pre-filled message including the due amount and business name.

**Files Changed**:

- `src/types/auth.ts` — Added `bill_number_prefix?: string | null` to `Profile`
- `schema.sql` — Added `bill_number_prefix` to profiles, `tax_percent` to orders, updated `get_next_bill_number(prefix)` function
- `src/api/orders.ts` — Added `tax_percent` to `Order` interface; updated `getNextBillNumber(prefix)`, `createOrder(taxPercent, billNumberPrefix)` with tax in total amount
- `src/hooks/useOrders.ts` — Added `taxPercent` and `billNumberPrefix` to `useCreateOrder` mutation variables
- `src/components/orders/OrderBillSummary.tsx` — Loading charge + GST % inputs side-by-side; GST row in breakdown
- `src/screens/CreateOrderScreen.tsx` — `taxPercent`/`taxAmount` state; bank validation in `handleSendBill`; `handleSendReminder`; reminder button UI; passes `taxPercent`+`billNumberPrefix` to mutation
- `src/screens/ProfileScreen.tsx` — Added Bill Settings section with prefix input

**DB Migration required** — Run in Supabase SQL Editor:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bill_number_prefix TEXT DEFAULT 'INV';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0;
-- Then run the updated get_next_bill_number function from schema.sql
```

---

## 📋 Recent Updates (v1.3 - February 2026)

### ✨ Bank Details Collection UI on Profile Screen (MODIFICATION)

**Feature type**: MODIFICATION — `bank_name`, `account_number`, and `ifsc_code` fields already existed in the database schema and `Profile` TypeScript interface, but there was no UI to collect them. The Profile screen now has a dedicated **Bank Account Details** section.

**What changed**:

- **New section in Profile screen** — "Bank Account Details" with subtitle: _"Displayed on invoices. All fields are mandatory."_
- **Bank Name** field — free text input, saved on blur (`onEndEditing`)
- **Account Number** field — numeric keyboard, saved on blur
- **IFSC Code** field — auto-uppercased on input, saved on blur
- **Live local update** — `onChangeText` updates Zustand store instantly for responsive UI; Supabase write only fires on `onEndEditing` (avoids saving partial account numbers)

**Files Changed**:

- `src/screens/ProfileScreen.tsx` — added `View` import, new Bank Account Details section with 3 fields

---

## 📋 Recent Updates (v1.2 - February 2026)

### ✨ Live Previous Balance in Order Creation Form (NEW)

**Feature type**: NEW — Previous balance was only fetched at PDF generation time. It is now shown live inside the order form the moment a customer is selected.

**Why this matters**: Indian sellers always need to see a customer's outstanding dues before handing over more goods. Example:

- Customer owes **₹49,800** from last week
- New delivery today worth **₹16,450** with ₹200 loading charge
- Form now instantly shows: `₹49,800 + ₹16,450 + ₹200 = Grand Total ₹66,450`

**What changed**:

- **Previous balance fetched on customer select** — as soon as a customer is chosen, `getCustomerPreviousBalance()` is called and the result is displayed with a live spinner
- **Previous balance shown on customer chip** — amber-coloured text below the customer name in the order form
- **Full breakdown in Order Summary panel**:
  - Today's Items: ₹X
  - Loading Charge: ₹Y _(only shown if > 0)_
  - Today's Total: ₹(X+Y) _(only shown if previous balance > 0)_
  - Previous Balance: ₹Z _(amber, always shown)_
  - **Grand Total = ₹(X+Y+Z)** _(bold)_
  - Sub-caption: `Today ₹X+Y + Prev ₹Z`
- **No double API call** — `handleSendBill` reuses the already-fetched state instead of calling the API again
- **`isFetchingBalance` spinner** — shows `ActivityIndicator` while fetching, preventing stale values

**Files Changed**:

- `src/screens/CreateOrderScreen.tsx` — `previousBalance` state, `handleSelectCustomer` callback, `grandTotal`/`todayTotal` computed values, customer chip badge, updated Summary props
- `src/components/orders/OrderBillSummary.tsx` — replaced single total row with full itemised breakdown; new props: `itemsTotal`, `previousBalance`, `grandTotal`, `isFetchingBalance`

---

## 📋 Recent Updates (v1.1 - February 2026)

### ✨ Indian-Style Billing Features (Completed)

Major enhancement to make CreditBook authentically Indian and mirror traditional "Khata" bookkeeping:

- **✅ Sequential Bill Numbering**: Auto-generated invoice numbers (INV-001, INV-002...) instead of random UUIDs
- **✅ Previous Balance Tracking**: Shows customer's outstanding amount on every new bill (highlighted in orange)
- **✅ Loading Charge**: Optional field for transport/delivery costs (not included in tax)
- **✅ Bank Details on Invoices**: Displays vendor's bank account, account number, and IFSC code
- **✅ "Made with CreditBook" Branding**: Subtle footer text for viral marketing
- **✅ Database Functions**: PostgreSQL functions for atomic bill number generation and balance calculation
- **✅ Enhanced PDF Template**: Professional Indian-style invoice layout with conditional sections

**Files Modified**:

- `schema.sql` - New fields and database functions
- `src/types/auth.ts` - Added bank details to Profile interface
- `src/api/orders.ts` - Updated Order interface, added helper functions
- `src/utils/generateBillPdf.ts` - Enhanced PDF with Indian billing features
- `src/screens/CreateOrderScreen.tsx` - Added loading charge input
- `src/components/orders/OrderBillSummary.tsx` - UI for loading charge
- `src/hooks/useOrders.ts` - Updated mutation to handle new fields

**Database Changes Required**:
Run `schema.sql` in Supabase SQL Editor to add:

- `bill_number`, `previous_balance`, `loading_charge` to orders table
- `bank_name`, `account_number`, `ifsc_code` to profiles table
- SQL functions: `get_next_bill_number()` and `get_customer_previous_balance()`

---

## 1. Executive Summary

### 1.1 Project Overview

CreditBook is a mobile-first digital ledger application designed for small and medium-sized businesses (SMBs) to manage customer credit transactions, track inventory, and monitor business finances. The application digitalizes the traditional "Khata" (credit book) system commonly used by retailers, wholesalers, and service providers in India.

### 1.2 Business Objective

Enable small business owners to:

- Eliminate paper-based credit tracking
- Reduce errors in manual bookkeeping
- Track outstanding payments in real-time
- Generate professional invoices/bills instantly
- Gain insights into business performance through analytics

### 1.3 Target Users

- **Primary**: Small business owners, shopkeepers, distributors, and wholesalers who extend credit to customers
- **Secondary**: Service providers (repair shops, salons, clinics) managing customer payments
- **Geographic Focus**: India (supports Indian currency ₹, GST compliance)

---

## 2. Product Vision & Strategy

### 2.1 Problem Statement

Small businesses face challenges in:

- Managing credit transactions manually using paper ledgers
- Tracking multiple customers' outstanding balances
- Sending payment reminders to customers
- Generating professional bills/invoices
- Getting business insights (revenue, pending amounts)
- Risk of data loss due to damaged/lost physical ledgers

### 2.2 Solution Approach

A mobile application that provides:

- Digital customer ledger management
- Order and inventory tracking
- Automated payment calculations
- PDF bill generation and sharing
- Real-time dashboard with business metrics
- Cloud-based data backup via Supabase

### 2.3 Key Differentiators

- **Offline-first architecture** with cloud sync
- **Multi-language support** (planned)
- **GST-compliant billing**
- **WhatsApp/SMS bill sharing** capabilities
- **Subscription-based premium features**

---

## 3. Functional Requirements

### 3.1 User Authentication & Profile Management

#### 3.1.1 Authentication

- **Email/Password Login**: Secure authentication using Supabase Auth
- **Password Reset**: Email-based password recovery
- **Session Management**: Persistent login sessions
- **Logout**: Clear session and redirect to login

#### 3.1.2 User Profile

- **Business Information**:
  - Business Name
  - Business Address
  - GSTIN (GST Identification Number)
  - UPI ID for receiving payments
  - Business Logo Upload
  - **Bank Details** (Mandatory for Indian billing):
    - Bank Name
    - Account Number
    - IFSC Code
- **Personal Information**:
  - Name
  - Phone Number
  - Email
  - Avatar/Profile Picture
- **Subscription Details**:
  - Current Plan (Free/Premium)
  - Subscription Expiry Date
  - Days Remaining Indicator

### 3.2 Dashboard & Analytics

#### 3.2.1 Financial Overview Cards

- **Total Revenue**: Sum of all completed orders (Paid + Partially Paid)
- **Outstanding Amount**: Total balance due across all customers
- **Unpaid Orders**: Count of orders with status "Pending"
- **Partial Orders**: Count of orders with status "Partially Paid"

#### 3.2.2 Quick Actions

- Create New Order
- Add New Customer
- Add New Product
- View All Orders
- View All Customers

### 3.3 Customer Management

#### 3.3.1 Customer Operations

- **Add Customer**:
  - Name (required)
  - Phone Number (required, 10-digit validation)
  - Address (optional)
- **View Customer List**:
  - Search by name or phone
  - Infinite scroll pagination
  - Display: Name, Phone, Outstanding Balance
- **Customer Detail View**:
  - Customer Information
  - Outstanding Balance (highlighted)
  - Order History with status badges
  - Quick action to create new order for customer
- **Edit Customer**: Update customer details
- **Delete Customer**: Remove customer (with validation for existing orders)

#### 3.3.2 Customer Filtering & Search

- Real-time search by name or phone number
- Sort by: Name, Outstanding Amount, Recent Activity
- Filter by: Customers with pending payments

### 3.4 Product/Inventory Management

#### 3.4.1 Product Operations

- **Add Product**:
  - Product Name (required)
  - Base Price (required)
  - Product Image Upload (optional)
  - Product Variants (size, color, etc.)
- **View Product List**:
  - Search by product name
  - Grid/List view toggle
  - Display: Image, Name, Price, Variants count
- **Product Variants**:
  - Variant Name (e.g., "Small", "Red", "500g")
  - Variant Price
  - Multiple variants per product
- **Edit Product**: Update product details and variants
- **Delete Product**: Remove product (validation for orders)

#### 3.4.2 Product Search & Filter

- Real-time search
- Filter by: With/Without variants, Price range
- Sort by: Name, Price (low to high, high to low)

### 3.5 Order Management

#### 3.5.1 Create Order Flow

1. **Customer Selection**:
   - Pick existing customer or create new
   - Quick customer search
2. **Add Items to Cart**:
   - Select product from catalog
   - Choose variant (if applicable)
   - Set quantity
   - View real-time subtotal
3. **Order Summary**:
   - List all items with quantities
   - **Loading Charge** (Optional): Add transport/delivery charges
   - Display total amount (items + loading charge)
   - Edit quantities or remove items
   - **Previous Balance**: Auto-displays customer's outstanding amount
4. **Payment Collection** (Optional):
   - Payment Mode: Cash / Online
   - Amount paid (partial or full)
   - Automatically calculate balance due
5. **Bill Generation** (Indian-style billing):
   - Generate PDF bill with:
     - **Sequential Bill Number** (INV-001, INV-002...)
     - Business logo and details (including Bank Details)
     - Bill date
     - Customer information
     - **Previous Outstanding Balance** (highlighted in orange if > 0)
     - Itemized list with quantities and prices
     - Subtotal
     - Tax (if applicable)
     - **Loading Charge** (separate line item, not taxed)
     - Order Total
     - Previous Balance (if any)
     - **Grand Total** (Order Total + Previous Balance)
     - Bank Account Details in footer
     - **"Made with CreditBook" branding** in footer
     - UPI QR code for payments
   - Share via: WhatsApp, Email, Other apps
   - Download PDF to device

#### 3.5.2 Order Listing & Management

- **View All Orders**:
  - Display: Order ID, Customer Name, Amount, Status, Date
  - Status badges: Paid (Green), Pending (Red), Partially Paid (Orange)
  - Infinite scroll pagination
- **Filter & Sort**:
  - Filter by Status: All, Paid, Pending, Partially Paid
  - Sort by: Newest, Oldest, Amount (High to Low, Low to High)
  - Search by: Order ID, Customer Name, Phone

- **Order Detail View**:
  - Customer information
  - Order items with prices
  - Payment history
  - Total, Paid, and Balance amounts
  - Status indicator

#### 3.5.3 Payment Management

- **Add Payment**:
  - Amount (must not exceed balance due)
  - Payment Mode (Cash/Online)
  - Payment Date (default: current date)
  - Auto-update order status:
    - Balance = 0 → Status: "Paid"
    - Balance < Total → Status: "Partially Paid"
- **View Payment History**: List of all payments for an order
- **Edit Payment**: Modify payment details
- **Delete Payment**: Remove payment (recalculate balance and status)

#### 3.5.4 Order Status Management

- **Paid**: Total amount fully received
- **Pending**: No payment received (balance = total)
- **Partially Paid**: Some payment received (0 < balance < total)
- Auto-calculation based on payments

### 3.6 Bill/Invoice Generation

#### 3.6.1 PDF Bill Features (Indian-Style Billing)

- **Business Branding**:
  - Business logo (if uploaded)
  - Business name and address
  - GSTIN (if available)
  - Contact information
  - **Sequential Bill Number** (INV-001, INV-002, etc.)
- **Order Details**:
  - Bill Number (sequential, not random ID)
  - Bill Date and Time
  - Customer Name, Phone, Address
  - **Previous Outstanding Balance** (displayed prominently in orange)
- **Itemization**:
  - Product/Variant name
  - Quantity
  - Unit Price
  - Subtotal per item
- **Financial Summary**:
  - Subtotal (items only)
  - Discount (if applicable)
  - Tax breakdown (if applicable, excludes loading charge)
  - **Loading Charge** (transport costs, not taxed)
  - **Order Total** (subtotal - discount + tax + loading charge)
  - **Previous Balance** (if customer has outstanding dues)
  - **Grand Total** (Order Total + Previous Balance)
  - Amount Paid (if payment made)
  - Balance Due (highlighted if pending)
  - Payment Mode (if payment made)
- **Footer**:
  - **Bank Account Details**:
    - Bank Name
    - Account Number
    - IFSC Code
  - UPI ID with QR code for online payments
  - **"Made with ❤️ by CreditBook"** branding
  - Thank you message

#### 3.6.2 Bill Sharing

- **Share Channels**:
  - WhatsApp direct share
  - Email attachment
  - SMS with download link
  - Other apps (via system share sheet)
- **Download**: Save PDF to device storage
- **Preview**: View bill before sharing

### 3.7 Indian Billing Features 🇮🇳

CreditBook implements authentic Indian-style billing that mirrors traditional "Khata" bookkeeping practices, making it instantly familiar to Indian SMB owners.

#### 3.7.1 Sequential Bill Numbering

- **Auto-generated Bill Numbers**: Each vendor gets sequential invoice numbers (INV-001, INV-002, INV-003...)
- **Vendor-Specific Sequence**: Each business maintains its own independent sequence
- **Database Function**: Uses PostgreSQL function `get_next_bill_number()` for atomic, collision-free number generation
- **Professional Appearance**: Sequential numbers look more professional than random UUIDs
- **Accounting Compliance**: Easier for businesses to track and file taxes with sequential numbering

**Implementation**:

```sql
-- Auto-generates next bill number for a vendor
SELECT get_next_bill_number('vendor-uuid');
-- Returns: 'INV-001', 'INV-002', etc.
```

#### 3.7.2 Previous Balance (Khata-Style)

The #1 feature that makes CreditBook feel authentic - **previous outstanding balance is always displayed on new bills**.

- **Automatic Calculation**: When creating a new order, the system automatically:
  1. Fetches all previous orders for the customer
  2. Sums up unpaid amounts: `SUM(total_amount - amount_paid)`
  3. Displays this as "Previous Balance" on the new bill
- **Visual Prominence**: Highlighted in orange color on PDF bills
- **Grand Total Logic**: `Grand Total = Current Order Total + Previous Balance`
- **Database Function**: Uses `get_customer_previous_balance(customer_id, vendor_id)`

**Example Scenario**:

```
Customer "Rajesh" had:
- Order 1: ₹5,000 (paid ₹3,000, balance ₹2,000)
- Order 2: ₹3,000 (paid ₹0, balance ₹3,000)

New Order 3: ₹4,000
Previous Balance shown: ₹5,000 (sum of previous unpaid)
Grand Total: ₹9,000 (₹4,000 + ₹5,000)
```

This encourages customers to clear dues and helps vendors track credit extended.

#### 3.7.3 Loading Charge (Transport Costs)

Essential for wholesale, distribution, and delivery businesses.

- **Optional Field**: Can be ₹0 if not applicable
- **Separate Line Item**: Displayed distinctly on bill
- **Tax Treatment**: **Not included in taxable amount** (as per common practice)
- **UI Integration**: Simple input field in order creation screen
- **Total Calculation**: `Order Total = Items Subtotal + Loading Charge + Tax`

**Use Cases**:

- Wholesale businesses delivering goods
- Distributors charging transport fees
- Any business with delivery charges

#### 3.7.4 Bank Details on Bills

Mandatory for Indian businesses to facilitate direct bank transfers.

- **Required Fields in Profile**:
  - Bank Name
  - Account Number
  - IFSC Code
- **Display Location**: Prominent in PDF footer alongside UPI details
- **Payment Options**: Customers can pay via:
  - UPI (scan QR code)
  - Direct bank transfer (use account details)
  - Cash/Online (marked during payment collection)

**Benefits**:

- Reduces dependency on cash
- Professional business image
- Multiple payment options for customers
- Easier reconciliation with bank statements

#### 3.7.5 "Made with CreditBook" Branding

Free marketing and brand building.

- **Subtle Footer Text**: "Made with ❤️ by CreditBook"
- **Non-intrusive**: Small text, doesn't distract from bill content
- **Viral Effect**: Every shared bill promotes the app
- **Premium Option**: Can be removed in premium plans (future enhancement)

#### 3.7.6 Why These Features Matter

Traditional paper-based "Khata" books always showed:

1. ✅ Page numbers (now: sequential bill numbers)
2. ✅ Previous outstanding balance
3. ✅ Transport charges
4. ✅ Shopkeeper's contact details

CreditBook digitizes this exact workflow, making the transition from paper to digital seamless for Indian SMBs who are accustomed to this format.

### 3.8 Subscription Management

#### 3.8.1 Subscription Tiers

- **Free Plan**:
  - Limited features (e.g., max 50 customers)
  - Basic reporting
  - Watermark on bills
- **Premium Plan**:
  - Unlimited customers and orders
  - Advanced analytics
  - No watermark
  - Priority support
  - Multi-user access (future)

#### 3.8.2 Subscription UI

- Display current plan on profile
- Show expiry date and days remaining
- Subscription renewal/upgrade prompts
- In-app purchase integration (planned)

---

## 4. Non-Functional Requirements

### 4.1 Performance

- **App Launch**: < 2 seconds on mid-range devices
- **Search Results**: Real-time with < 300ms response
- **Bill Generation**: < 3 seconds for standard orders
- **Data Sync**: Background sync with conflict resolution
- **Pagination**: Load 10 items per page for smooth scrolling

### 4.2 Scalability

- Support up to 10,000 customers per vendor
- Handle 1,000 orders per month per vendor
- Efficient infinite scroll with virtualization

### 4.3 Security

- **Authentication**: Secure token-based auth (Supabase)
- **Data Encryption**: End-to-end encryption for sensitive data
- **Access Control**: Row-level security (RLS) in Supabase
- **Multi-tenant Isolation**: Vendor-specific data access only
- **Secure Storage**: AsyncStorage for cached credentials

### 4.4 Reliability

- **Offline Support**: Core features work without internet
- **Data Sync**: Queue-based sync when connection restored
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Backup**: Automatic cloud backup via Supabase
- **Uptime**: 99.9% availability target

### 4.5 Usability

- **Intuitive UI**: Simple navigation with bottom tabs
- **Responsive Design**: Adaptive layouts for various screen sizes
- **Accessibility**: Support for screen readers (future)
- **Feedback**: Loading states, success/error toasts
- **Haptic Feedback**: Touch feedback for actions

### 4.6 Compatibility

- **Platform**: Android 8.0+, iOS 13+
- **Orientation**: Portrait mode (primary)
- **Languages**: English (Hindi support planned)

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### 5.1.1 Frontend

- **Framework**: React Native 19.1.0
- **Navigation**: Expo Router 6.0 (File-based routing)
- **UI Framework**: NativeWind 4.2 (Tailwind CSS for React Native)
- **State Management**:
  - Zustand (Global state)
  - TanStack Query (Server state)
- **Forms**: Formik with validation
- **Icons**: Lucide React Native, Expo Vector Icons

#### 5.1.2 Backend

- **BaaS**: Supabase 2.57
  - PostgreSQL database
  - Authentication
  - Row-level security
  - Real-time subscriptions
  - File storage (for images)
- **API**: RESTful API via Supabase client

#### 5.1.3 Storage

- **Local**: AsyncStorage (session, cache)
- **Cloud**: Supabase Storage (images, PDFs)
- **Database**: Supabase PostgreSQL

#### 5.1.4 Additional Libraries

- **PDF Generation**: expo-print
- **Image Handling**: expo-image-picker, expo-image
- **Sharing**: expo-sharing
- **Haptics**: expo-haptics
- **File System**: expo-file-system

### 5.2 Data Models

#### 5.2.1 Database Schema

**profiles**

```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- name (text)
- phone (text)
- role (text)
- business_name (text)
- business_address (text)
- gstin (text)
- upi_id (text)
- bank_name (text, required)         # For Indian billing
- account_number (text, required)    # Bank account details
- ifsc_code (text, required)         # IFSC code
- avatar_url (text)
- business_logo_url (text)
- subscription_plan (text)
- subscription_expiry (timestamp)
- created_at (timestamp)
```

**customers**

```sql
- id (uuid, PK)
- vendor_id (uuid, FK to profiles)
- name (text, required)
- phone (text, required)
- address (text)
- created_at (timestamp)
```

**products**

```sql
- id (uuid, PK)
- vendor_id (uuid, FK to profiles)
- name (text, required)
- base_price (numeric, required)
- image_url (text)
- created_at (timestamp)
```

**product_variants**

```sql
- id (uuid, PK)
- product_id (uuid, FK to products)
- vendor_id (uuid, FK to profiles)
- variant_name (text, required)
- price (numeric, required)
- created_at (timestamp)
```

**orders**

```sql
- id (uuid, PK)
- vendor_id (uuid, FK to profiles)
- customer_id (uuid, FK to customers)
- bill_number (text, unique per vendor)      # Sequential: INV-001, INV-002...
- total_amount (numeric)                     # Items total + loading charge
- amount_paid (numeric)
- balance_due (numeric, computed)            # total_amount - amount_paid
- previous_balance (numeric)                 # Customer's outstanding before this order
- loading_charge (numeric, default 0)        # Transport/delivery charge
- status (enum: Paid, Pending, Partially Paid)
- created_at (timestamp)
```

**order_items**

```sql
- id (uuid, PK)
- order_id (uuid, FK to orders)
- product_id (uuid, FK to products, nullable)
- vendor_id (uuid, FK to profiles)
- product_name (text)
- variant_name (text)
- price (numeric)
- quantity (integer)
- subtotal (numeric)
- created_at (timestamp)
```

**payments**

```sql
- id (uuid, PK)
- vendor_id (uuid, FK to profiles)
- order_id (uuid, FK to orders)
- amount (numeric)
- payment_mode (enum: Cash, Online)
- payment_date (timestamp)
- created_at (timestamp)
```

### 5.3 Application Structure

```
creditbook-app/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Entry point
│   ├── (auth)/                  # Auth group
│   │   ├── login.tsx
│   │   └── resetPassword.tsx
│   └── (main)/                  # Main app group
│       ├── dashboard/
│       ├── customers/
│       ├── orders/
│       ├── products/
│       └── profile/
├── src/
│   ├── api/                     # API layer (Supabase calls)
│   ├── components/              # Reusable components
│   ├── hooks/                   # Custom React hooks
│   ├── screens/                 # Screen components
│   ├── services/                # External services (Supabase client)
│   ├── store/                   # State management (Zustand)
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── assets/                      # Images, fonts, icons
└── supabase/                    # Database migrations, config
```

### 5.4 Key Features Implementation

#### 5.4.1 Infinite Scroll Pagination

- Uses TanStack Query's `useInfiniteQuery`
- Loads 10 items per page
- Triggers next page load at 80% scroll
- Optimistic UI updates for better UX

#### 5.4.2 Real-time Search

- Debounced input (300ms delay)
- Client-side filtering for cached data
- Server-side search for comprehensive results

#### 5.4.3 PDF Bill Generation

- Uses `expo-print` for HTML to PDF conversion
- Template-based rendering with dynamic data
- Includes business branding and itemized details

#### 5.4.4 Image Upload

- `expo-image-picker` for capturing/selecting images
- Resize and compress before upload
- Upload to Supabase Storage
- Generate public URLs for display

#### 5.4.5 Indian Billing Implementation

**Sequential Bill Numbering**:

- PostgreSQL function `get_next_bill_number(vendor_uuid)` ensures atomic, collision-free number generation
- Uses regex pattern matching to find highest existing number
- Returns formatted string: `INV-001`, `INV-002`, etc.
- Unique constraint on `(vendor_id, bill_number)` prevents duplicates

**Previous Balance Calculation**:

- PostgreSQL function `get_customer_previous_balance(customer_uuid, vendor_uuid)`
- Sums all unpaid amounts: `SUM(total_amount - amount_paid)`
- Called automatically during order creation
- Stored as `previous_balance` field in orders table for historical record

**Loading Charge Handling**:

- Optional numeric field, defaults to 0
- Added to order total: `total = items_subtotal + loading_charge`
- Excluded from tax calculation (common practice in India)
- Displayed as separate line item on PDF bills

**API Functions** (`src/api/orders.ts`):

```typescript
// Get next sequential bill number
getNextBillNumber(vendorId: string): Promise<string>

// Calculate customer's outstanding balance
getCustomerPreviousBalance(customerId: string, vendorId: string): Promise<number>

// Create order with Indian billing fields
createOrder(..., loadingCharge: number): Promise<OrderDetail>
```

**PDF Generation Enhancements** (`src/utils/generateBillPdf.ts`):

- Accepts `previousBalance` and `loadingCharge` in options
- Conditional rendering: shows previous balance only if > 0
- Color coding: previous balance in orange (#d97706) for visibility
- Footer includes bank details and "Made with CreditBook" branding
- Grand Total calculation: `orderTotal + previousBalance`

---

## 6. User Interface Design

### 6.1 Navigation Structure

```
Bottom Tab Navigation:
├── Dashboard (Home icon)
├── Customers (Users icon)
├── Orders (Receipt icon)
├── Products (Package icon)
└── Profile (User icon)
```

### 6.2 Screen Flows

#### 6.2.1 Order Creation Flow

```
Dashboard → Create Order → Select Customer → Add Products →
Review Cart → Add Payment (optional) → Generate Bill → Share/Download
```

#### 6.2.2 Customer Management Flow

```
Customers List → Search/Filter → Customer Detail →
View Orders → Create New Order for Customer
```

#### 6.2.3 Payment Flow

```
Order Detail → Add Payment → Enter Amount → Select Mode →
Confirm → Auto-update Order Status → Regenerate Bill (optional)
```

### 6.3 UI Components

#### 6.3.1 Reusable Components

- **ScreenWrapper**: Common screen container with safe area
- **Card**: Information display with title, value, icon
- **SearchBar**: Debounced search input
- **FloatingActionButton**: Quick action button
- **BottomSheetForm**: Modal form for data entry
- **LoadingState**: Skeleton loaders and spinners
- **EmptyState**: Placeholder for no data
- **ErrorState**: User-friendly error displays

#### 6.3.2 Form Components

- **CustomerPicker**: Searchable customer selection modal
- **ProductPicker**: Product catalog with search
- **VariantPicker**: Variant selection for products
- **ImagePickerField**: Camera/gallery image upload
- **SearchablePickerModal**: Generic searchable dropdown

#### 6.3.3 Feedback Components

- **Toast**: Success/error notifications
- **Haptic Feedback**: Touch response for actions
- **Pull-to-Refresh**: Data refresh gesture
- **Loading Spinners**: Inline and full-page loaders

---

## 7. Business Rules & Validations

### 7.1 Customer Rules

- Phone number must be 10 digits (Indian format)
- Customer name is mandatory
- Duplicate phone numbers allowed (different customers with same contact)
- Cannot delete customer with existing orders (soft delete or archive)

### 7.2 Product Rules

- Product name is mandatory
- Base price must be positive number
- Variant price must be positive
- At least base product exists even without variants
- Product deletion checks for usage in orders

### 7.3 Order Rules

- Order must have at least one item
- **Bill Number**: Auto-generated sequentially per vendor (INV-001, INV-002...)
- **Previous Balance**: Auto-calculated from customer's unpaid orders
- **Loading Charge**: Optional, defaults to ₹0, must be non-negative
- Order total = sum of (item price × quantity) + loading_charge
- Balance due = total amount - amount paid
- Status auto-updates based on balance:
  - Balance = 0 → Paid
  - Balance = Total → Pending
  - 0 < Balance < Total → Partially Paid
- **Grand Total on Bill** = Order Total + Previous Balance (for display only)

### 7.4 Payment Rules

- Payment amount cannot exceed balance due
- Payment amount must be positive
- Payment date cannot be in future
- Multiple payments allowed per order
- Payment deletion recalculates order status
- Payment mode is mandatory (Cash/Online)

### 7.5 Subscription Rules

- Free plan restrictions enforced at API level
- Premium features gated with subscription check
- Grace period after expiry (e.g., 7 days read-only)
- Subscription expiry warnings shown in advance

### 7.6 Indian Billing Rules

- **Bill Number**:
  - Must be unique per vendor
  - Sequential numbering enforced by database constraint
  - Format: INV-XXX (3-digit zero-padded)
- **Previous Balance**:
  - Read-only field, auto-calculated on order creation
  - Sums all unpaid amounts from customer's historical orders
  - Updated independently of current order modifications
- **Loading Charge**:
  - Must be non-negative
  - Not included in tax calculation
  - Shown as separate line item on bills
- **Bank Details**:
  - Mandatory fields in vendor profile
  - Must be filled before generating bills for best practice
  - Displayed on all PDF invoices

---

## 8. Success Metrics & KPIs

### 8.1 User Adoption Metrics

- **Daily Active Users (DAU)**: Target 1,000 users within 6 months
- **Monthly Active Users (MAU)**: Target 5,000 users within 6 months
- **User Retention**: 60% after 30 days, 40% after 90 days
- **Average Session Duration**: 5-10 minutes
- **Sessions per User per Day**: 3-5 sessions

### 8.2 Engagement Metrics

- **Orders Created per User**: Average 50 per month
- **Customers Added per User**: Average 20 per month
- **Bills Shared**: 80% of orders generate shared bills
- **Payment Collection Rate**: 60% of pending payments collected within 30 days

### 8.3 Business Metrics

- **Freemium Conversion Rate**: 10% of free users upgrade to premium
- **Monthly Recurring Revenue (MRR)**: Target ₹5,00,000 within 1 year
- **Customer Lifetime Value (LTV)**: ₹3,000 per user
- **Churn Rate**: < 5% monthly

### 8.4 Performance Metrics

- **App Crash Rate**: < 1%
- **API Success Rate**: > 99%
- **Average API Response Time**: < 500ms
- **App Load Time**: < 2 seconds

---

## 9. Roadmap & Future Enhancements

### 9.1 Phase 1: MVP (Completed ✅)

- ✅ User authentication
- ✅ Customer management
- ✅ Product & variant management
- ✅ Order creation and tracking
- ✅ Payment management
- ✅ PDF bill generation
- ✅ Basic dashboard analytics
- ✅ Subscription framework
- ✅ **Indian-style billing features**:
  - ✅ Sequential bill numbering (INV-001, INV-002...)
  - ✅ Previous balance tracking and display
  - ✅ Loading charge support
  - ✅ Bank details on invoices
  - ✅ "Made with CreditBook" branding

### 9.2 Phase 2: Enhanced Features (Q2 2026)

- 📱 WhatsApp API integration for bill sharing
- 📊 Advanced analytics and reports
- 📅 Payment reminder system (automated SMS/WhatsApp)
- 💾 Export data (Excel/CSV)
- 🌐 Multi-language support (Hindi, regional languages)
- 🔔 Push notifications for payment due dates
- 📸 Quick bill scanning (OCR) for adding items

### 9.3 Phase 3: Business Growth (Q3 2026)

- 👥 Multi-user access (staff accounts)
- 🏦 Bank integration for payment tracking
- 📈 Inventory management with stock alerts
- 🧾 Expense tracking
- 💼 Tax filing assistance (GST return generation)
- 🎯 Customer segmentation and insights
- 🔗 Integration with accounting software (Tally, Zoho)

### 9.4 Phase 4: Enterprise Features (Q4 2026)

- 🏪 Multi-location support
- 📦 Supply chain management
- 🤝 B2B vendor collaboration
- 🔐 Advanced role-based access control
- 📊 Custom reporting and dashboards
- 🌍 Web dashboard for desktop users
- 🔌 Public API for third-party integrations

---

## 10. Risk Assessment & Mitigation

### 10.1 Technical Risks

| Risk                                        | Impact | Probability | Mitigation                                                          |
| ------------------------------------------- | ------ | ----------- | ------------------------------------------------------------------- |
| Data loss/corruption                        | High   | Low         | Regular backups, database transactions, version control             |
| Performance degradation with large datasets | Medium | Medium      | Pagination, indexing, query optimization, caching                   |
| Third-party service downtime (Supabase)     | High   | Low         | Offline-first architecture, queue-based sync, fallback mechanisms   |
| Security vulnerabilities                    | High   | Medium      | Regular security audits, RLS policies, input validation, encryption |

### 10.2 Business Risks

| Risk                                   | Impact | Probability | Mitigation                                                       |
| -------------------------------------- | ------ | ----------- | ---------------------------------------------------------------- |
| Low user adoption                      | High   | Medium      | User research, beta testing, referral programs, marketing        |
| High churn rate                        | High   | Medium      | Onboarding tutorials, customer support, feature requests         |
| Competition from established players   | Medium | High        | Unique features, better UX, local market focus, pricing strategy |
| Regulatory changes (GST, data privacy) | Medium | Low         | Legal consultation, compliance monitoring, flexible architecture |

### 10.3 Operational Risks

| Risk                         | Impact | Probability | Mitigation                                           |
| ---------------------------- | ------ | ----------- | ---------------------------------------------------- |
| Customer support overload    | Medium | Medium      | In-app help, FAQs, community forum, chatbot support  |
| Scaling infrastructure costs | Medium | Low         | Optimized queries, efficient storage, tiered pricing |
| Developer dependency         | Low    | Low         | Documentation, code reviews, knowledge sharing       |

---

## 11. Compliance & Legal

### 11.1 Data Privacy

- **GDPR Compliance** (if serving EU users):
  - User consent for data collection
  - Right to data export/deletion
  - Privacy policy disclosure
- **India Data Protection Laws**:
  - Secure storage of personal data
  - Consent for marketing communications
  - Data breach notification procedures

### 11.2 Tax Compliance

- **GST Compliance**:
  - GSTIN validation and storage
  - Tax calculation on invoices (if applicable)
  - GST-compliant bill format
- **Invoice Requirements**:
  - Sequential numbering
  - Mandatory fields (business name, date, items, amounts)

### 11.3 Terms of Service

- User responsibilities
- Data ownership and licensing
- Service limitations and disclaimers
- Subscription terms and refund policy
- Acceptable use policy

---

## 12. Development Setup & Deployment

### 12.1 Getting Started

#### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Supabase account

#### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd creditbook-app
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Create `.env` file with Supabase credentials
   - Add API keys for third-party services

4. **Setup Database** (Important!):

   ```bash
   # Go to your Supabase Dashboard → SQL Editor
   # Copy the contents of schema.sql and run it
   # This will create all tables, indexes, RLS policies, and functions
   ```

   The `schema.sql` includes:
   - All table definitions with Indian billing fields
   - Database functions for bill numbering and balance calculation
   - Row-level security policies
   - Indexes for optimal query performance

5. Start the development server:

```bash
npx expo start
```

6. Run on platforms:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code for Expo Go

### 12.2 Build & Deployment

#### Android

```bash
npm run android           # Development build
eas build --platform android  # Production build (EAS)
```

#### iOS

```bash
npm run ios              # Development build (macOS only)
eas build --platform ios # Production build (EAS)
```

### 12.3 Environment Configuration

**Development**: Local Supabase instance or staging environment  
**Staging**: Pre-production testing environment  
**Production**: Live app with production Supabase project

### 12.4 Testing Indian Billing Features

After setting up the database, test the new features:

1. **Setup Vendor Profile**:
   - Add business name, address, GSTIN
   - **Important**: Fill in bank details (Bank Name, Account Number, IFSC)
   - Add UPI ID and business logo (optional)

2. **Create Test Customer**:
   - Add a customer with name and phone
   - Create first order (note the bill number: INV-001)

3. **Test Previous Balance**:
   - Create first order for ₹1,000, leave unpaid
   - Create second order for ₹500
   - Generate bill for second order → should show "Previous Balance: ₹1,000"
   - Grand total should show ₹1,500

4. **Test Loading Charge**:
   - Create new order
   - Add products (e.g., ₹500 total)
   - Enter loading charge: ₹50
   - Total should show ₹550
   - PDF should show loading charge as separate line item

5. **Verify PDF Bill**:
   - Sequential bill number (INV-001, INV-002, INV-003...)
   - Previous balance highlighted in orange (if exists)
   - Loading charge shown separately
   - Bank details in footer
   - "Made with ❤️ by CreditBook" in footer
   - UPI QR code (if UPI ID provided)

6. **Test Bill Number Sequence**:
   - Create multiple orders
   - Verify bills are numbered sequentially
   - Check database: `SELECT bill_number FROM orders ORDER BY created_at;`

---

## 13. Support & Maintenance

### 13.1 Customer Support Channels

- **In-App Chat**: Direct messaging for premium users
- **Email Support**: support@creditbookapp.com
- **FAQ Section**: Self-service help articles
- **Video Tutorials**: YouTube channel for feature walkthroughs
- **Community Forum**: User discussions and tips

### 13.2 Maintenance Schedule

- **Bug Fixes**: Weekly releases for critical issues
- **Feature Updates**: Bi-weekly releases with new features
- **Security Patches**: Immediate deployment as needed
- **Database Maintenance**: Monthly optimization during low-traffic hours

### 13.3 Monitoring & Analytics

- **Crash Reporting**: Sentry/Firebase Crashlytics
- **Usage Analytics**: Mixpanel/Amplitude for user behavior
- **Performance Monitoring**: Real-time app performance tracking
- **Server Monitoring**: Supabase dashboard for API health

---

## 14. Appendices

### 14.1 Glossary

- **Khata**: Traditional Indian credit ledger book
- **Vendor**: Business owner using the app
- **Outstanding Balance**: Total unpaid amount across all orders
- **Balance Due**: Remaining amount to be paid for a specific order
- **RLS**: Row-Level Security (database access control)
- **BaaS**: Backend as a Service

### 14.2 References

- Expo Documentation: https://docs.expo.dev/
- Supabase Documentation: https://supabase.com/docs
- React Native Documentation: https://reactnative.dev/
- NativeWind Documentation: https://www.nativewind.dev/

### 14.3 Contact Information

- **Project Lead**: [Name]
- **Technical Lead**: [Name]
- **Product Manager**: [Name]
- **Design Lead**: [Name]

---

## 15. Document History

| Version | Date         | Author       | Changes                                                                                                                                                                             |
| ------- | ------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | Feb 27, 2026 | AI Assistant | Initial BRD creation based on codebase analysis                                                                                                                                     |
| 1.1     | Feb 27, 2026 | AI Assistant | Added comprehensive Indian billing features: sequential bill numbering, previous balance tracking, loading charge, bank details on invoices, enhanced PDF generation, SQL functions |
| 1.2     | Feb 27, 2026 | AI Assistant | NEW: Live previous balance in order form — fetched on customer select, full Grand Total breakdown (Items + Loading + Prev Balance), no duplicate API calls                          |
| 1.3     | Feb 27, 2026 | AI Assistant | MOD: Bank details collection UI on Profile screen (Bank Name, Account Number, IFSC Code) — fields existed in schema/types, now have form inputs with blur-save UX                   |
| 1.4     | Feb 27, 2026 | AI Assistant | NEW: Bank detail validation before bill send; customizable bill prefix (Profile setting + SQL); Tax/GST % on items in order form; WhatsApp payment reminder button                  |

---

**Document Status**: Active Development  
**Last Major Update**: Billing Enhancements — Validation, Prefix, Tax, Reminders (v1.4)  
**Next Review Date**: March 15, 2026  
**Approval Required**: Product Owner, Tech Lead, Stakeholders
