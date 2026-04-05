import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { Alert } from "react-native";
import {
    addCustomer,
    fetchCustomerDetail,
    fetchCustomers,
    PAGE_SIZE,
} from "../api/customers";
import { ApiError } from "../lib/supabaseQuery";
import { useCustomersStore } from "../store/customersStore";
import { Customer, CustomerDetail } from "../types/customer";
import { useDebounce } from "./useDebounce";

export const customerKeys = {
  all: (vendorId: string) => ["customers", vendorId] as const,
  list: (vendorId: string, search: string) =>
    [...customerKeys.all(vendorId), { search }] as const,
};

export const useCustomers = (vendorId?: string, search?: string) => {
  const debouncedSearch = useDebounce(search ?? "", 300);
  const { setCustomers } = useCustomersStore();

  const query = useInfiniteQuery<Customer[], ApiError>({
    queryKey: vendorId
      ? customerKeys.list(vendorId, debouncedSearch)
      : ["customers-disabled"],
    queryFn: ({ pageParam }) =>
      fetchCustomers(pageParam as number, vendorId!, debouncedSearch),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      const allCustomers = query.data.pages.flat();
      setCustomers(allCustomers);
    }
  }, [query.data, setCustomers]);

  return {
    ...query,
    customers: query.data?.pages.flat() ?? [],
  };
};

export const useAddCustomer = (vendorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    Customer,
    ApiError,
    Omit<
      Customer,
      | "id"
      | "vendor_id"
      | "created_at"
      | "isOverdue"
      | "outstandingBalance"
      | "lastActiveAt"
    >,
    { previousQueries: [import("@tanstack/react-query").QueryKey, unknown][] }
  >({
    mutationFn: (values) => addCustomer(vendorId, values),
    onMutate: async (newCustomer) => {
      // 1. Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      const queryKey = customerKeys.all(vendorId);
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the current state of all customer list cache permutations (e.g. ones with active search strings)
      const previousQueries = queryClient.getQueriesData({ queryKey });

      // 3. Construct a temporary Optimistic Customer object
      const optimisticCustomer: Customer = {
        id: `temp-${Date.now()}`, // Temporary ID
        vendor_id: vendorId,
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address,
        created_at: new Date().toISOString(),
        isOverdue: false,
        outstandingBalance: (newCustomer as any).openingBalance ?? 0,
        lastActiveAt: new Date().toISOString(),
      };

      // 4. Optimistically inject into all cached search permutations
      queryClient.setQueriesData<any>({ queryKey }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = [...oldData.pages];
        // Prepend optimistic customer to the first page
        newPages[0] = [optimisticCustomer, ...newPages[0]];
        return {
          ...oldData,
          pages: newPages,
        };
      });

      // 5. Return context containing the snapshot so we can rollback if needed
      return { previousQueries };
    },
    onError: (err: ApiError, _, context) => {
      console.error("Failed to add customer:", err.message);
      // Rollback cache to the snapshot on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([cacheKey, oldData]) => {
          queryClient.setQueryData(cacheKey, oldData);
        });
      }
      Alert.alert("Error", err.message || "Failed to add customer.");
    },
    onSettled: () => {
      // Invalidate query to refetch actual data from Supabase (to swap the temp ID)
      queryClient.invalidateQueries({
        queryKey: customerKeys.all(vendorId),
        exact: false,
      });
    },
    onSuccess: (realCustomer) => {
      Alert.alert("Success", "Customer added successfully");
    },
  });
};

export function useCustomerDetail(customerId?: string) {
  return useQuery<CustomerDetail | null>({
    queryKey: ["customerDetail", customerId],
    queryFn: () =>
      customerId ? fetchCustomerDetail(customerId) : Promise.resolve(null),
    enabled: !!customerId,
    staleTime: 30_000,
  });
}
