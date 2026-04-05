import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    addProduct,
    deleteProduct,
    fetchProductCategories,
    fetchProducts,
    PAGE_SIZE,
    Product,
    updateProduct,
} from "../api/products";
import { ApiError } from "../lib/supabaseQuery";
import { useDebounce } from "./useDebounce";

export const productKeys = {
  all: (vendorId: string) => ["products", vendorId] as const,
  list: (vendorId: string, search: string) =>
    [...productKeys.all(vendorId), { search }] as const,
  categories: (vendorId: string) =>
    [...productKeys.all(vendorId), "categories"] as const,
};

export const useProducts = (vendorId?: string, search?: string) => {
  const debouncedSearch = useDebounce(search ?? "", 300);

  const query = useInfiniteQuery<Product[], ApiError>({
    queryKey: vendorId
      ? productKeys.list(vendorId, debouncedSearch)
      : ["products-disabled"],
    queryFn: ({ pageParam }) =>
      fetchProducts(pageParam as number, vendorId!, debouncedSearch),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!vendorId,
    staleTime: 300_000,
  });

  return {
    ...query,
    data: query.data?.pages.flat() ?? [],
    pages: query.data?.pages ?? [],
  };
};

export const useProductCategories = (vendorId?: string) => {
  return useQuery<string[], ApiError>({
    queryKey: vendorId
      ? productKeys.categories(vendorId)
      : ["categories-disabled"],
    queryFn: () => fetchProductCategories(vendorId!),
    enabled: !!vendorId,
    staleTime: 60_000,
  });
};

export const useAddProduct = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Omit<Product, "id" | "vendor_id" | "created_at">) =>
      addProduct(vendorId, values),

    onMutate: async (newProductInput) => {
      // 1. Cancel outgoing queries to prevent overwriting our optimistic data
      await queryClient.cancelQueries({ queryKey: productKeys.all(vendorId) });

      // 2. Snapshot the current state of all product list variations (search filters, etc.)
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: productKeys.all(vendorId),
      });

      // 3. Construct a temporary optimistic mock of the Product
      const optimisticProduct: Product = {
        ...newProductInput,
        id: `optimistic-${Math.random().toString(36).substr(2, 9)}`,
        vendor_id: vendorId,
        created_at: new Date().toISOString(),
        variants: newProductInput.variants || [],
      };

      // 4. Inject the mock into the TanStack InfiniteQuery cache pages
      queryClient.setQueriesData<any>(
        { queryKey: productKeys.all(vendorId) },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: [
              [optimisticProduct, ...oldData.pages[0]],
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // Return context for potential rollback
      return { previousQueries };
    },

    // If API fails, rollback to exactly what we snapshotted
    onError: (err, newProduct, context) => {
      console.error("Optimistic Update Failed, rolling back...", err);
      context?.previousQueries.forEach(([queryKey, oldData]: [unknown, any]) => {
        queryClient.setQueryData(queryKey as any, oldData);
      });
    },

    // Always refetch to guarantee the client's cache is identical to the database State
    onSettled: () => {
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
