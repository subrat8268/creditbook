# Apply Shared Ledger Migrations to Supabase

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **CreditBook** (sfmoefgjmgkwvauyaiyz)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Apply Migration 1 - Access Tokens Table
1. Copy the contents of `supabase/migrations/create_access_tokens_table.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)
4. ✅ You should see "Success. No rows returned"

### Step 3: Apply Migration 2 - Auto-Link RPC Functions
1. Click **New Query** again
2. Copy the contents of `supabase/migrations/create_auto_link_ledgers_rpc.sql`
3. Paste into the SQL Editor
4. Click **Run**
5. ✅ You should see "Success. No rows returned"

### Step 4: Verify Installation
Run this query to verify the tables and functions were created:

```sql
-- Check if access_tokens table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'access_tokens';

-- Check if RPC functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'generate_access_token',
  'get_or_create_access_token',
  'track_token_access',
  'find_ledgers_by_phone',
  'auto_link_customer_ledgers',
  'get_ledger_by_token'
);
```

Expected output:
- `access_tokens` table should exist
- All 6 functions should be listed

## Alternative: Use Supabase CLI (Optional)

If you prefer to use the CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref sfmoefgjmgkwvauyaiyz

# Apply migrations
supabase db push
```

## Troubleshooting

**Error: "relation already exists"**
- The table or function already exists
- This is safe to ignore

**Error: "permission denied"**
- Make sure you're logged in with the correct Supabase account
- Ensure you have admin access to the CreditBook project

**Error: "syntax error"**
- Double-check you copied the entire SQL file
- Make sure there are no extra characters at the beginning/end

## Next Steps

Once migrations are applied, test the token generation:

```sql
-- Test token generation
SELECT generate_access_token();

-- Test creating a token for a customer
-- (Replace UUIDs with actual vendor_id and customer_id from your database)
SELECT get_or_create_access_token(
  'your-vendor-id-here'::uuid,
  'your-customer-id-here'::uuid
);
```

🎉 If both queries work, your shared ledger system is ready!
