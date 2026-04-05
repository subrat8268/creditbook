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
  /** user-defined product category; defaults to "General" */
  category?: string | null;
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
      `id, vendor_id, name, base_price, category, image_url, created_at,
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
  const { variants, ...productData } = values;

  // 1. Insert the main product
  const { data: product, error: pError } = await supabase
    .from("products")
    .insert([{ ...productData, vendor_id: vendorId }])
    .select()
    .single();

  if (pError) throw toApiError(pError);

  // 2. Insert variants if any
  if (variants && variants.length > 0) {
    const variantsWithIds = variants.map((v) => ({
      product_id: product.id,
      vendor_id: vendorId,
      variant_name: v.variant_name,
      price: v.price,
    }));

    const { error: vError } = await supabase
      .from("product_variants")
      .insert(variantsWithIds);

    if (vError) {
      console.error("Failed to insert variants, but product was created:", vError);
      // We don't throw here to avoid an orphaned product without a UI reference, 
      // but the user will see a product with missing variants.
    }
  }

  // 3. Return the product with variants (refetch to get the joined data)
  return fetchProductById(product.id, vendorId);
}

/** Helper to fetch a single product with its variants */
async function fetchProductById(id: string, vendorId: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, vendor_id, name, base_price, category, image_url, created_at,
      product_variants ( id, variant_name, price, created_at )
    `)
    .eq("id", id)
    .eq("vendor_id", vendorId)
    .single();

  if (error) throw toApiError(error);

  const { product_variants, ...rest } = data as any;
  return {
    ...rest,
    variants: (product_variants ?? []).map((v: any) => ({
      id: v.id,
      variant_name: v.variant_name,
      price: Number(v.price),
      created_at: v.created_at,
    })) as ProductVariant[],
  } as Product;
}

export async function updateProduct(
  productId: string,
  values: Partial<Product>,
) {
  const { variants, ...productData } = values;
  const vendorId = productData.vendor_id; // Usually passed in values for updates

  // 1. Update the main product row
  if (Object.keys(productData).length > 0) {
    const { error: pError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId);
    if (pError) throw toApiError(pError);
  }

  // 2. Synchronize variants (Overly-simple approach: Delete and re-insert if variants were passed)
  if (variants !== undefined && vendorId) {
    const { error: dError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);

    if (!dError && variants.length > 0) {
      const variantsWithIds = variants.map((v) => ({
        product_id: productId,
        vendor_id: vendorId,
        variant_name: v.variant_name,
        price: v.price,
      }));
      await supabase.from("product_variants").insert(variantsWithIds);
    }
  }

  // 3. Return updated product
  // Note: For update, we might not have vendorId in values if it's a minimal update, 
  // but usually it's there in the Product object. 
  // If not, we'd need to fetch it first.
  const { data: check } = await supabase.from("products").select("vendor_id").eq("id", productId).single();
  return fetchProductById(productId, check!.vendor_id);
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw toApiError(error);
  return productId;
}

export async function fetchProductCategories(
  vendorId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("vendor_id", vendorId)
    .not("category", "is", null);
  if (error) throw toApiError(error);
  const unique = Array.from(
    new Set((data ?? []).map((r: any) => r.category as string).filter(Boolean)),
  ).sort();
  return unique;
}
