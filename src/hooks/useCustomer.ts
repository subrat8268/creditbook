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

  const query = useInfiniteQuery<Customer[], Error>({
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
  const addCustomertoStore = useCustomersStore((s) => s.addCustomer);

  return useMutation<
    Customer,
    Error,
    Omit<
      Customer,
      | "id"
      | "vendor_id"
      | "created_at"
      | "isOverdue"
      | "outstandingBalance"
      | "lastActiveAt"
    >
  >({
    mutationFn: (values) => addCustomer(vendorId, values),
    onSuccess: (newCustomer) => {
      addCustomertoStore(newCustomer);
      queryClient.invalidateQueries({
        queryKey: ["customers", vendorId],
        exact: false,
      });
      Alert.alert("Success", "Customer added successfully");
    },
    onError: (err: any) => console.error("Failed to add customer:", err),
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
