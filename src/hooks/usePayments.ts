import { Payment, fetchPayments, recordPayment } from "@/src/api/orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrderStore } from "../store/orderStore";
import { orderKeys } from "./useOrders";

interface RecordPaymentProps {
  amount: number;
  mode: "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";
  markFull: boolean;
}

export function usePayments(orderId: string, vendorId?: string) {
  const queryClient = useQueryClient();
  const { addUpdatingOrderId, removeUpdatingOrderId } = useOrderStore();

  // Fetch payment history
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

  // Record a payment (partial or full)
  const recordPaymentMutation = useMutation<void, Error, RecordPaymentProps>({
    mutationFn: async ({ amount, mode, markFull }) => {
      if (!vendorId) throw new Error("Vendor ID is required");
      await recordPayment(orderId, vendorId, amount, mode, markFull);
    },

    onMutate: () => {
      addUpdatingOrderId(orderId);
    },

    onSuccess: (_, variables) => {
      if (!vendorId) return;

      queryClient.invalidateQueries({ queryKey: orderKeys.list(vendorId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["customers", vendorId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
    },

    onSettled: () => {
      removeUpdatingOrderId(orderId);
    },

    onError: (err) => console.error("Failed to record payment:", err),
  });

  return {
    payments,
    isLoading,
    isError,
    refetch,
    recordPayment: recordPaymentMutation.mutateAsync,
    isRecording: recordPaymentMutation.isPending,
  };
}
