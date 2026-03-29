import { Payment, fetchPayments, recordPayment } from "@/src/api/orders";
import { ApiError } from "@/src/lib/supabaseQuery";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrderStore } from "../store/orderStore";
import { orderKeys } from "./useOrders";

// markFull is resolved by the caller before invoking the mutation;
// the backend always receives the pre-computed amount so markFull is omitted.
interface RecordPaymentInput {
  amount: number;
  mode: "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";
  notes?: string;
}

/**
 * Standalone mutation-only hook for recording a payment.
 * Used directly by RecordCustomerPaymentModal so the modal
 * does not need its own queryClient or cache invalidation code.
 */
export function useRecordPayment(
  orderId: string,
  vendorId?: string,
  customerId?: string,
) {
  const queryClient = useQueryClient();
  const { addUpdatingOrderId, removeUpdatingOrderId } = useOrderStore();

  const mutation = useMutation<void, ApiError, RecordPaymentInput>({
    mutationFn: async ({ amount, mode, notes }) => {
      if (!vendorId) throw new Error("Vendor ID is required");
      // Always pass false for markFull — the caller resolves the amount upfront.
      await recordPayment(orderId, vendorId, amount, mode, false, notes);
    },

    onMutate: () => {
      addUpdatingOrderId(orderId);
    },

    onSuccess: () => {
      if (!vendorId) return;
      queryClient.invalidateQueries({ queryKey: orderKeys.all(vendorId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["customers", vendorId] });
      if (customerId) {
        queryClient.invalidateQueries({
          queryKey: ["customerDetail", customerId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
    },

    onSettled: () => {
      removeUpdatingOrderId(orderId);
    },

    onError: (err: ApiError) =>
      console.error("Failed to record payment:", err.code, err.message),
  });

  return {
    recordPayment: mutation.mutateAsync,
    isRecording: mutation.isPending,
  };
}

/** Compound hook: payment history query + record-payment mutation. */
export function usePayments(
  orderId: string,
  vendorId?: string,
  customerId?: string,
) {
  const {
    data: payments,
    isLoading,
    isError,
    refetch,
  } = useQuery<Payment[]>({
    queryKey: ["payments", orderId],
    queryFn: () => fetchPayments(orderId),
    enabled: !!orderId,
    staleTime: 30_000,
  });

  const { recordPayment, isRecording } = useRecordPayment(
    orderId,
    vendorId,
    customerId,
  );

  return { payments, isLoading, isError, refetch, recordPayment, isRecording };
}
