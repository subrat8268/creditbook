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
  updateOrder,
  Order,
  OrderDetail,
  OrderItemInput,
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

export function useUpdateOrder(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    OrderDetail,
    ApiError,
    {
      orderId: string;
      items: OrderItemInput[];
      loadingCharge: number;
      taxPercent: number;
      quickAmount: number;
      customerId?: string | null;
    }
  >({
    mutationFn: ({ orderId, items, loadingCharge, taxPercent, quickAmount }) =>
      updateOrder(orderId, vendorId, items, loadingCharge, taxPercent, quickAmount),
    onSuccess: (updatedOrder, variables) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: orderKeys.all(vendorId) });
      if (variables.customerId) {
        queryClient.invalidateQueries({
          queryKey: ["customerDetail", variables.customerId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
    },
  });
}

// ✅ Create order mutation with optimistic updates
export function useCreateOrder(vendorId: string) {
  const queryClient = useQueryClient();

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

    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: orderKeys.all(vendorId) });
      await queryClient.cancelQueries({ queryKey: ["customers", vendorId] });
      await queryClient.cancelQueries({ queryKey: ["customerDetail", variables.customerId] });

      // Snapshot previous values for rollback
      const previousOrders = queryClient.getQueryData(orderKeys.list(vendorId));
      const previousCustomers = queryClient.getQueryData(["customers", vendorId]);
      const previousCustomer = queryClient.getQueryData(["customerDetail", variables.customerId]);

      // Calculate order totals
      const itemsSubtotal = variables.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = itemsSubtotal * ((variables.taxPercent || 0) / 100);
      const totalAmount = itemsSubtotal + (variables.loadingCharge || 0) + taxAmount;
      const balanceDue = totalAmount - variables.amountPaid;
      const status: "Paid" | "Partially Paid" | "Pending" = 
        balanceDue === 0 ? "Paid" : variables.amountPaid > 0 ? "Partially Paid" : "Pending";

      // Create optimistic order
      const optimisticOrder: OrderDetail = {
        id: `temp-${Date.now()}`,
        vendor_id: vendorId,
        customer_id: variables.customerId,
        bill_number: `TEMP-${Date.now().toString().slice(-6)}`,
        total_amount: totalAmount,
        amount_paid: variables.amountPaid,
        balance_due: balanceDue,
        previous_balance: 0,
        loading_charge: variables.loadingCharge || 0,
        tax_percent: variables.taxPercent || 0,
        status,
        created_at: new Date().toISOString(),
        customer: null, // Will be populated on server response
        items: variables.items.map((item, idx) => ({
          id: `temp-item-${idx}`,
          order_id: `temp-${Date.now()}`,
          product_id: item.product_id,
          variant_id: item.variant_id ?? null,
          product_name: item.product_name,
          variant_name: item.variant_name || null,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          vendor_id: vendorId,
          created_at: new Date().toISOString(),
        })),
      };

      // Optimistically add order to the beginning of the list
      queryClient.setQueryData(orderKeys.list(vendorId), (old: any) => {
        if (!old) return [[optimisticOrder]];
        const firstPage = old.pages?.[0] || old[0] || [];
        const updatedFirstPage = [optimisticOrder, ...firstPage];
        if (old.pages) {
          return { ...old, pages: [updatedFirstPage, ...old.pages.slice(1)] };
        }
        return [updatedFirstPage, ...old.slice(1)];
      });

      // Optimistically update customer outstanding balance
      queryClient.setQueryData(["customerDetail", variables.customerId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          outstandingBalance: (old.outstandingBalance || 0) + balanceDue,
        };
      });

      // Return context for rollback
      return { previousOrders, previousCustomers, previousCustomer };
    },

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

    onError: (error, _variables, context: any) => {
      // Rollback optimistic updates on error
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.list(vendorId), context.previousOrders);
      }
      if (context?.previousCustomers) {
        queryClient.setQueryData(["customers", vendorId], context.previousCustomers);
      }
      if (context?.previousCustomer) {
        queryClient.setQueryData(["customerDetail", _variables.customerId], context.previousCustomer);
      }

      console.error("Order creation failed at mutation layer:", error.message);
    },
  });
}
