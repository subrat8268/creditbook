import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    createOrder,
    fetchOrderDetail,
    fetchOrders,
    Order,
    OrderDetail,
    PAGE_SIZE,
    PaymentMode,
} from "../api/orders";
import { ApiError } from "../lib/supabaseQuery";
import { useDebounce } from "./useDebounce";

export const orderKeys = {
  all: (vendorId: string) => ["orders", vendorId] as const,
  list: (vendorId: string) => [...orderKeys.all(vendorId), "list"] as const,
  detail: (orderId: string) => ["orderDetail", orderId] as const,
};

export function useOrders(
  vendorId?: string,
  search?: string,
  statusFilter?: string,
  sortBy?: "newest" | "oldest" | "high" | "low",
) {
  const debounceSearch = useDebounce(search ?? "", 300);

  const query = useInfiniteQuery<Order[], ApiError>({
    queryKey: vendorId
      ? [...orderKeys.list(vendorId), debounceSearch, statusFilter, sortBy]
      : ["orders-disabled"],
    queryFn: ({ pageParam }) =>
      fetchOrders(
        pageParam as number,
        vendorId!,
        debounceSearch,
        statusFilter,
        sortBy,
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  return {
    ...query,
    data: query.data?.pages.flat() ?? [],
  };
}

export function useOrderDetail(orderId?: string) {
  return useQuery<OrderDetail | null>({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: () =>
      orderId ? fetchOrderDetail(orderId) : Promise.resolve(null),
    enabled: !!orderId,
    staleTime: 30_000,
  });
}

// ✅ Create order mutation
export function useCreateOrder(vendorId: string) {
  const queryClient = useQueryClient();

  // Explicit item type — variant_id carried through for future inventory/reporting
  // (not yet persisted to order_items: column requires a DB migration)
  type OrderItemInput = {
    product_id: string | null;
    product_name: string;
    variant_id?: string | null; // future-ready: not written to DB until migration
    variant_name?: string | null;
    price: number;
    quantity: number;
  };

  return useMutation<
    OrderDetail,
    ApiError,
    {
      vendorId: string;
      customerId: string;
      items: OrderItemInput[];
      amountPaid: number;
      paymentMode?: PaymentMode;
      loadingCharge?: number;
      taxPercent?: number;
      billNumberPrefix?: string;
    }
  >({
    mutationFn: ({
      customerId,
      items,
      amountPaid,
      paymentMode,
      loadingCharge,
      taxPercent,
      billNumberPrefix,
    }) =>
      createOrder(
        vendorId,
        customerId,
        items,
        amountPaid,
        paymentMode,
        loadingCharge,
        taxPercent,
        billNumberPrefix,
      ),

    onSuccess: (newOrder, variables) => {
      // 1. Seed the detail cache immediately for instant navigation.
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);

      // 2. Invalidate the entire orders tree for this vendor — covers all
      // searched, filtered, and sorted list variants so no stale view appears.
      queryClient.invalidateQueries({ queryKey: orderKeys.all(vendorId) });

      // 3. Invalidate downstream customer caches.
      queryClient.invalidateQueries({ queryKey: ["customers", vendorId] });
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", variables.customerId],
      });

      // 4. Force dashboard hero card refresh.
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
    },

    onError: (error) => {
      console.error("Order creation failed at mutation layer:", error.message);
    },
  });
}
