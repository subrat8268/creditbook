import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addProduct,
  deleteProduct,
  fetchProducts,
  PAGE_SIZE,
  Product,
  updateProduct,
} from "../api/products";
import { useDebounce } from "./useDebounce";

export const productKeys = {
  all: (vendorId: string) => ["products", vendorId] as const,
  list: (vendorId: string, search: string) =>
    [...productKeys.all(vendorId), { search }] as const,
};

export const useProducts = (vendorId?: string, search?: string) => {
  const debouncedSearch = useDebounce(search ?? "", 300);

  const query = useInfiniteQuery<Product[], Error>({
    queryKey: vendorId
      ? productKeys.list(vendorId, debouncedSearch)
      : ["products-disabled"],
    queryFn: ({ pageParam }) =>
      fetchProducts(pageParam as number, vendorId!, debouncedSearch),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  return {
    ...query,
    data: query.data?.pages.flat() ?? [],
    pages: query.data?.pages ?? [],
  };
};

export const useAddProduct = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Omit<Product, "id" | "vendor_id" | "created_at">) =>
      addProduct(vendorId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all(vendorId) });
    },
  });
};

export const useUpdateProduct = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Product> }) =>
      updateProduct(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all(vendorId) });
    },
  });
};

export const useDeleteProduct = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all(vendorId) });
    },
  });
};
