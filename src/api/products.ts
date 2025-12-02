import { supabase } from "../services/supabase";

export interface ProductVariant {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  base_price: number;
  image_url: string | null;
  variants: ProductVariant[];
  created_at: string;
}

export const PAGE_SIZE = 10;

export async function fetchProducts(
  pageParam: number,
  vendorId: string,
  search?: string
) {
  let query = supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function addProduct(
  vendorId: string,
  values: Omit<Product, "id" | "vendor_id" | "created_at">
) {
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...values, vendor_id: vendorId }])
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  productId: string,
  values: Partial<Product>
) {
  const { data, error } = await supabase
    .from("products")
    .update(values)
    .eq("id", productId)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
  return productId;
}
