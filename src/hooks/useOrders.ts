import {
    InfiniteData,
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

  return useMutation<
    OrderDetail,
    ApiError,
    {
      vendorId: string;
      customerId: string;
      items: {
        product_id: string | null;
        product_name: string;
        variant_name?: string | null;
        price: number;
        quantity: number;
      }[];
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
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
      queryClient.setQueryData<InfiniteData<Order[]>>(
        orderKeys.list(vendorId),
        (oldData) => {
          if (!oldData) {
            return { pages: [[newOrder]], pageParams: [0] };
          }
          return {
            ...oldData,
            pages: [[newOrder, ...oldData.pages[0]], ...oldData.pages.slice(1)],
            pageParams: oldData.pageParams,
          };
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["customers", vendorId],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", variables.customerId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
    },
  });
}
