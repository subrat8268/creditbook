# Storage Setup (Supabase)

This app uses Supabase Storage for product images and business logos.

## Buckets

Create these buckets in the Supabase Dashboard:

- `product-images`
- `business-logos`

Set both buckets to **Public** to allow `getPublicUrl()` to work.

## RLS Policies

Enable RLS on `storage.objects`, then add policies to allow authenticated users to upload.

Note: We use `upsert: true` for business logos, so allow `SELECT` + `UPDATE` for that bucket.

```sql
-- Enable RLS (run once)
alter table storage.objects enable row level security;

-- Product images: allow authenticated upload
create policy "Product images upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

create policy "Product images read"
on storage.objects
for select
to authenticated
using (bucket_id = 'product-images');

-- Business logos: allow authenticated upload + upsert
create policy "Business logos upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'business-logos');

create policy "Business logos read"
on storage.objects
for select
to authenticated
using (bucket_id = 'business-logos');

create policy "Business logos update"
on storage.objects
for update
to authenticated
using (bucket_id = 'business-logos');
```

If you want public reads without auth, change the `to authenticated` to `to public` for the `select` policies.
