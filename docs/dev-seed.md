## Dev seeding (Customers / Entries / Payments)

This repo includes a **dev-only** seed runner to populate Supabase with realistic demo data:

- ~50 **Customers**
- 2–5 **Entries** per customer (₹200–₹5000)
- a mix of **Payments** (unpaid / partial / fully paid)
- timestamps spread over the last 30 days (best-effort)

Implementation note (legacy internals): the backend tables are currently `parties` (customers) and `orders` (entries). Product language remains **Customer / Entry / Payment**.

### 1) Prerequisites

- A Supabase **DEV** project URL + anon key.
- A seed user that can sign in and has a row in `profiles`.

### 2) Required env vars

The seed runner reads `.env` / `.env.local` automatically (it only fills missing env vars).

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

DEV_SEED_EMAIL=
DEV_SEED_PASSWORD=

# Safety gates (required)
DEV_SEED_CONFIRM=SEED_DEV_DATA
DEV_SEED_ALLOW_REMOTE=true
DEV_SEED_ALLOWED_URL_SUBSTRING=sfmoefgjmgkwvauyaiyz
```

Notes:
- `DEV_SEED_ALLOWED_URL_SUBSTRING` should be a **unique substring** of your DEV project URL (the project ref is ideal).
- If your URL is local (localhost/127.0.0.1), you can omit `DEV_SEED_ALLOW_REMOTE` + `DEV_SEED_ALLOWED_URL_SUBSTRING`.

### 3) Run it

```bash
npm run seed:dev
```

PowerShell example:

```powershell
$env:EXPO_PUBLIC_SUPABASE_URL = "https://sfmoefgjmgkwvauyaiyz.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY = "<anon key>"
$env:DEV_SEED_EMAIL = "tester@kredbook.io"
$env:DEV_SEED_PASSWORD = "<password>"

$env:DEV_SEED_CONFIRM = "SEED_DEV_DATA"
$env:DEV_SEED_ALLOW_REMOTE = "true"
$env:DEV_SEED_ALLOWED_URL_SUBSTRING = "sfmoefgjmgkwvauyaiyz"

npm run seed:dev
```

### 4) Cleanup behavior (safe by default)

The runner only deletes previously seeded data that it can identify:

- Customers are created with `address = DEV_SEED_KREDBOOK`
- Payments include `notes` starting with `DEV_SEED_KREDBOOK`

On each run, it deletes the previously seeded customers (and their related entries/payments) **only for the current signed-in vendor profile**.

### 5) Known limitations

- Entry `created_at` backdating is **best-effort**. Some RLS policies may prevent updating `created_at`; in that case the script logs a warning and continues.
