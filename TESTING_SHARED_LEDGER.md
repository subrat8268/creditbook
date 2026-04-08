# Testing the Shared Ledger System - End-to-End Guide

## Prerequisites

Before testing, ensure:
1. ✅ Database migrations are applied (see `APPLY_MIGRATIONS.md`)
2. ✅ App is running on a physical device or emulator with WhatsApp installed
3. ✅ You have at least one customer with:
   - A name
   - A phone number (format: with country code, e.g., +919876543210)
   - At least one bill/transaction

## Test Flow Overview

```
[Vendor creates bill] 
    → [Opens customer detail screen]
        → [Taps "Share Ledger" button]
            → [WhatsApp opens with pre-filled message]
                → [Customer receives link]
                    → [Customer opens link]
                        → [Public ledger view displays]
```

## Step-by-Step Testing

### 1. Setup Test Data

**Create a test customer:**
1. Open KredBook app
2. Go to **Customers** tab
3. Tap **+ New Customer**
4. Fill in:
   - Name: "Test Customer"
   - Phone: "+919876543210" (use a real number if you want to test WhatsApp)
   - Address: (optional)
5. Save customer

**Create a test bill:**
1. Tap on the customer you just created
2. Tap **New Bill** button
3. Add an item (or use quick entry once implemented)
4. Save the bill

### 2. Test Token Generation

**Verify token generation works:**

1. Go to Supabase Dashboard → SQL Editor
2. Run this query to test token generation:

```sql
-- Test basic token generation
SELECT generate_access_token();
```

Expected: Returns a 10-character alphanumeric string (e.g., "a8f3k2m9p1")

3. Test creating a token for your customer:

```sql
-- Get your vendor_id (profile id)
SELECT id, name, business_name FROM profiles WHERE user_id = auth.uid();

-- Get your test customer id
SELECT id, name, phone FROM customers WHERE vendor_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
);

-- Create token (replace UUIDs with actual values from above)
SELECT get_or_create_access_token(
  'your-vendor-id-here'::uuid,
  'your-customer-id-here'::uuid
);
```

Expected: Returns a token string

### 3. Test WhatsApp Share Button

**Test the share button in the app:**

1. Open KredBook app
2. Navigate to **Customers** → tap your test customer
3. You should see a 2x2 grid of action buttons:
   - **New Bill** (top left)
   - **Received** (top right)
   - **Share Ledger** (bottom left) ← New!
   - **Reminder** (bottom right)

4. Tap **Share Ledger** button
5. Expected behavior:
   - ✅ Button shows loading state briefly
   - ✅ WhatsApp opens automatically
   - ✅ Message is pre-filled with:
     ```
     नमस्ते! 🙏

     आप [Your Business Name] के साथ अपना खाता यहाँ देख सकते हैं:
     https://kredbook.app/l/[token]

     (Hello! You can view your ledger with [Your Business Name] here)
     ```
   - ✅ Customer phone number is pre-filled
   - ✅ You can send the message

**If WhatsApp is not installed:**
- ✅ Alert appears with the ledger URL
- ✅ "Copy Link" button is available

### 4. Test Public Ledger View

**Option A: Using the shared link (recommended)**
1. Send the WhatsApp message to yourself or copy the link
2. Open the link in a browser or in the app
3. The public ledger view should load

**Option B: Direct URL testing**
1. Get a token from the database (Step 2 above)
2. Open the URL in your app or web browser:
   ```
   https://kredbook.app/l/[your-token-here]
   ```
   
**Expected public ledger view:**

✅ **Header Card** displays:
- Vendor business name / logo
- Vendor GSTIN (if available)
- Vendor phone number
- Vendor address

✅ **Balance Summary Card** shows:
- Total Sales (sum of all bills)
- Total Payments (sum of all payments received)
- Current Balance (sales - payments)
  - Red if customer owes
  - Green if vendor owes customer
  - Gray if settled (₹0)

✅ **Transaction History** shows:
- Each transaction with:
  - Type badge (Sale / Payment)
  - Bill number
  - Date and time
  - Item details (if itemized)
  - Amount (+ for sales, - for payments)
  - Payment method (if applicable)
- Transactions sorted newest first
- Empty state if no transactions

✅ **Footer** shows:
- "Powered by KredBook"
- "Track credit. Get paid faster."

✅ **Interactions work:**
- Pull to refresh updates the data
- Scrolling is smooth
- Safe areas are respected (no content under notch/bottom bar)

### 5. Test Error Handling

**Test invalid token:**
1. Open URL with fake token:
   ```
   https://kredbook.app/l/invalidtoken123
   ```
2. Expected: Error screen with:
   - 🔒 Lock icon
   - "Ledger not found" message
   - "This link may be invalid, expired, or revoked"
   - "Go Back" button

**Test missing phone number:**
1. Create a customer without a phone number
2. Try to share their ledger
3. Expected: Alert shows:
   - Title: "Phone Number Required"
   - Message: "[Customer Name] doesn't have a phone number. Please add their phone number to share the ledger."
   - Button: "OK"

### 6. Test Token Reuse

**Verify tokens are reused (not recreated):**

1. Share a ledger with a customer (Step 3)
2. Note the token in the URL (e.g., "a8f3k2m9p1")
3. Go back and share the same ledger again
4. Expected: Same token is used (not a new one)

**Verify in database:**
```sql
SELECT token, vendor_id, customer_id, created_at, access_count, last_accessed_at
FROM access_tokens
WHERE vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
ORDER BY created_at DESC;
```

Expected:
- Only one token per vendor-customer pair
- `access_count` increments each time ledger is viewed
- `last_accessed_at` updates when viewed

### 7. Test Analytics Tracking

**Verify access tracking:**

1. Open a shared ledger link
2. Check the database:

```sql
SELECT 
  at.token,
  c.name AS customer_name,
  at.access_count,
  at.last_accessed_at,
  at.created_at
FROM access_tokens at
JOIN customers c ON c.id = at.customer_id
WHERE at.vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
ORDER BY at.last_accessed_at DESC;
```

Expected:
- `access_count` increments each time you open the link
- `last_accessed_at` updates to current timestamp

## Success Criteria ✅

The shared ledger system is working correctly if:

1. ✅ Tokens generate successfully (10 chars, unique)
2. ✅ Share button appears in customer detail screen
3. ✅ WhatsApp opens with correct message and link
4. ✅ Public ledger view loads without authentication
5. ✅ All data displays correctly (vendor, customer, transactions, balance)
6. ✅ Invalid tokens show error screen
7. ✅ Tokens are reused (not duplicated)
8. ✅ Access tracking works (count & timestamp)
9. ✅ Pull-to-refresh updates the ledger
10. ✅ UI is mobile-responsive and looks good

## Troubleshooting

### "Failed to generate share link"

**Possible causes:**
- Migrations not applied → Apply both SQL files
- Network error → Check internet connection
- Customer has no phone → Add phone number to customer
- Profile missing → Check `profile` state in auth store

**Debug steps:**
1. Check browser/app console for errors
2. Verify migrations with query from Step 2
3. Test RPC functions directly in SQL Editor

### WhatsApp doesn't open

**Possible causes:**
- WhatsApp not installed → Install WhatsApp
- Phone number format incorrect → Ensure format is +[country code][number] (e.g., +919876543210)
- Deep link blocked → Check device settings

**Debug steps:**
1. Check if URL is generated correctly (should start with `whatsapp://send?phone=`)
2. Try copying the ledger URL and sharing manually
3. Test on a different device

### Public ledger shows "Invalid or expired link"

**Possible causes:**
- Token doesn't exist in database → Check `access_tokens` table
- Token is revoked → Check `is_revoked` column
- RLS policies blocking access → Verify policies allow public SELECT

**Debug steps:**
1. Query database to verify token exists:
   ```sql
   SELECT * FROM access_tokens WHERE token = 'your-token-here';
   ```
2. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'access_tokens';
   ```
3. Test RPC function directly:
   ```sql
   SELECT * FROM get_ledger_by_token('your-token-here');
   ```

### Transactions not showing

**Possible causes:**
- No transactions exist for this customer → Create a test bill
- RPC function error → Check function definition
- Data type mismatch → Verify UUIDs are correct

**Debug steps:**
1. Check if transactions exist:
   ```sql
   SELECT * FROM orders WHERE customer_id = 'your-customer-id';
   ```
2. Test `get_ledger_by_token` RPC directly (see Step 2)

## Next Steps

Once all tests pass:
- ✅ Shared ledger system is fully functional
- 🎯 Ready to move to **Week 2-3: Phone Collection System**
- 🎯 Ready to move to **Week 3-4: Quick Entry Rebuild**

Need help? Check:
- Database migrations: `supabase/migrations/`
- Token utilities: `src/utils/accessToken.ts`
- Public view: `app/l/[token].tsx`
- Share button: Customer detail screen (`app/(main)/customers/[customerId].tsx`)
