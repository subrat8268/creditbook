import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { Alert } from "react-native";
import {
    addSupplier,
    fetchSupplierDetail,
    fetchSuppliers,
    PAGE_SIZE,
    recordDelivery,
    RecordDeliveryInput,
    recordPaymentMade,
} from "../api/suppliers";
import { ApiError } from "../lib/supabaseQuery";
import { useSuppliersStore } from "../store/suppliersStore";
import { Supplier } from "../types/supplier";
import { useDebounce } from "./useDebounce";

export const supplierKeys = {
  all: (vendorId: string) => ["suppliers", vendorId] as const,
  list: (vendorId: string, search: string) =>
    [...supplierKeys.all(vendorId), { search }] as const,
  detail: (supplierId: string) => ["supplierDetail", supplierId] as const,
};

// ─── List ────────────────────────────────────────────────────────────────────

export const useSuppliers = (vendorId?: string, search?: string) => {
  const debouncedSearch = useDebounce(search ?? "", 300);
  const { setSuppliers } = useSuppliersStore();

  const query = useInfiniteQuery<Supplier[], ApiError>({
    queryKey: vendorId
      ? supplierKeys.list(vendorId, debouncedSearch)
      : ["suppliers-disabled"],
    queryFn: ({ pageParam }) =>
      fetchSuppliers(pageParam as number, vendorId!, debouncedSearch),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setSuppliers(query.data.pages.flat());
    }
  }, [query.data, setSuppliers]);

  return {
    ...query,
    suppliers: query.data?.pages.flat() ?? [],
  };
};

// ─── Add Supplier ─────────────────────────────────────────────────────────────

export const useAddSupplier = (vendorId: string) => {
  const queryClient = useQueryClient();
  const addToStore = useSuppliersStore((s) => s.addSupplier);

  return useMutation<
    Supplier,
    ApiError,
    Omit<Supplier, "id" | "vendor_id" | "created_at" | "balanceOwed">
  >({
    mutationFn: (values) => addSupplier(vendorId, values),
    onSuccess: (newSupplier) => {
      addToStore(newSupplier);
      queryClient.invalidateQueries({
        queryKey: ["suppliers", vendorId],
        exact: false,
      });
      Alert.alert("Success", "Supplier added successfully");
    },
    onError: (err: ApiError) =>
      console.error("Failed to add supplier:", err.code, err.message),
  });
};

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useSupplierDetail(supplierId?: string) {
  return useQuery({
    queryKey: supplierKeys.detail(supplierId ?? ""),
    queryFn: () =>
      supplierId ? fetchSupplierDetail(supplierId) : Promise.resolve(null),
    enabled: !!supplierId,
    staleTime: 30_000,
  });
}

// ─── Record Delivery ──────────────────────────────────────────────────────────

export const useRecordDelivery = (vendorId: string, supplierId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, RecordDeliveryInput>({
    mutationFn: (data) => recordDelivery(vendorId, supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(supplierId),
      });
      queryClient.invalidateQueries({
        queryKey: ["suppliers", vendorId],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
    },
    onError: (err: ApiError) => {
      console.error("Failed to record delivery:", err.code, err.message);
      Alert.alert("Error", err.message || "Failed to record delivery");
    },
  });
};

// ─── Record Payment Made ──────────────────────────────────────────────────────

export const useRecordPaymentMade = (vendorId: string, supplierId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    { amount: number; payment_mode: string; notes?: string }
  >({
    mutationFn: ({ amount, payment_mode, notes }) =>
      recordPaymentMade(vendorId, supplierId, amount, payment_mode, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(supplierId),
      });
      queryClient.invalidateQueries({
        queryKey: ["suppliers", vendorId],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
    },
    onError: (err: ApiError) => {
      console.error("Failed to record payment:", err.code, err.message);
      Alert.alert("Error", err.message || "Failed to record payment");
    },
  });
};
