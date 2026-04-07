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
    
    onMutate: async ({ amount, payment_mode, notes }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: supplierKeys.detail(supplierId) });
      await queryClient.cancelQueries({ queryKey: ["suppliers", vendorId] });

      // Snapshot previous values for rollback
      const previousSupplier = queryClient.getQueryData(supplierKeys.detail(supplierId));
      const previousSuppliers = queryClient.getQueryData(["suppliers", vendorId]);

      // Optimistically update supplier detail
      queryClient.setQueryData(supplierKeys.detail(supplierId), (old: any) => {
        if (!old) return old;
        
        const newBalanceOwed = Math.max(0, (old.balanceOwed || old.totalOwed || 0) - amount);
        
        // Add optimistic payment to timeline
        const newPayment = {
          id: `temp-${Date.now()}`,
          type: 'payment' as const,
          date: new Date().toISOString(),
          runningBalance: newBalanceOwed,
          paymentAmount: amount,
          paymentMode: payment_mode,
          paymentNotes: notes,
        };

        return {
          ...old,
          balanceOwed: newBalanceOwed,
          totalOwed: newBalanceOwed,
          timeline: [newPayment, ...(old.timeline || [])],
        };
      });

      // Optimistically update supplier in list
      queryClient.setQueryData(["suppliers", vendorId], (old: any) => {
        if (!old) return old;
        
        const updateSupplier = (supplier: any) => {
          if (supplier.id !== supplierId) return supplier;
          return {
            ...supplier,
            balanceOwed: Math.max(0, (supplier.balanceOwed || 0) - amount),
          };
        };

        // Handle infinite query structure
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => 
              Array.isArray(page) ? page.map(updateSupplier) : page
            ),
          };
        }
        
        // Handle flat array structure
        return Array.isArray(old) ? old.map(updateSupplier) : old;
      });

      // Return context for rollback
      return { previousSupplier, previousSuppliers };
    },

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
    
    onError: (err: ApiError, _variables, context: any) => {
      // Rollback optimistic updates on error
      if (context?.previousSupplier) {
        queryClient.setQueryData(supplierKeys.detail(supplierId), context.previousSupplier);
      }
      if (context?.previousSuppliers) {
        queryClient.setQueryData(["suppliers", vendorId], context.previousSuppliers);
      }
      
      console.error("Failed to record payment:", err.code, err.message);
      Alert.alert("Error", err.message || "Failed to record payment");
    },
  });
};
