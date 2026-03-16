import { toApiError } from "../lib/supabaseQuery";
import { supabase } from "../services/supabase";

export interface ProductVariant {
  id: string;
  variant_name: string; // DB column name — was incorrectly "name"
  price: number;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  /** null for variant-only products — price is defined at the variant level */
  base_price: number | null;
  image_url: string | null;
  variants: ProductVariant[];
  created_at: string;
}

export const PAGE_SIZE = 10;

export async function fetchProducts(
  pageParam: number,
  vendorId: string,
  search?: string,
) {
  let query = supabase
    .from("products")
    .select(
      `id, vendor_id, name, base_price, image_url, created_at,
      product_variants ( id, variant_name, price, created_at )`,
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw toApiError(error);

  // Reshape: Supabase returns joined rows as `product_variants`;
  // map to `variants` to keep the Product interface stable across the app.
  return (data ?? []).map((p) => {
    const { product_variants, ...rest } = p as any;
    return {
      ...rest,
      variants: (product_variants ?? []).map((v: any) => ({
        id: v.id,
        variant_name: v.variant_name,
        price: Number(v.price),
        created_at: v.created_at,
      })) as ProductVariant[],
    } as Product;
  });
}

export async function addProduct(
  vendorId: string,
  values: Omit<Product, "id" | "vendor_id" | "created_at">,
) {
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...values, vendor_id: vendorId }])
    .select()
    .single();
  if (error) throw toApiError(error);
  return data as Product;
}

export async function updateProduct(
  productId: string,
  values: Partial<Product>,
) {
  const { data, error } = await supabase
    .from("products")
    .update(values)
    .eq("id", productId)
    .select()
    .single();
  if (error) throw toApiError(error);
  return data as Product;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw toApiError(error);
  return productId;
}
