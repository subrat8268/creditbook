import ScreenWrapper from "@/src/components/ScreenWrapper";
import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import OrderSummary from "@/src/components/orders/OrderSummary";
import PaymentHistory from "@/src/components/orders/PaymentHistory";
import RecordPayment from "@/src/components/orders/RecordPayments";
import { useOrderDetail } from "@/src/hooks/useOrders";
import { usePayments } from "@/src/hooks/usePayments";
import { useOrderStore } from "@/src/store/orderStore";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";

export default function OrderDetailScreen() {
  const { addUpdatingOrderId, removeUpdatingOrderId } = useOrderStore();

  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const {
    data: order,
    isLoading,
    isError,
    refetch: refetchOrder,
  } = useOrderDetail(orderId);

  const {
    payments,
    isLoading: paymentsLoading,
    isError: paymentsError,
    refetch: refetchPayments,
  } = usePayments(orderId || "");

  const handlePaymentSuccess = async () => {
    addUpdatingOrderId(orderId);
    await refetchOrder();
    await refetchPayments();
    removeUpdatingOrderId(orderId);
  };

  if (isLoading) return <Loader />;
  if (isError || !order) return <EmptyState message="Order not found" />;

  const sections = [
    {
      key: "customer",
      render: () => (
        <View className="border border-neutral-300 flex-row justify-between p-4 rounded-lg mb-4">
          <Text className="font-inter-semibold ">{order.customer?.name}</Text>
          <Text className="font-inter">+91 {order.customer?.phone}</Text>
        </View>
      ),
    },
    {
      key: "summary",
      render: () => (
        <OrderSummary
          id={order.id}
          created_at={order.created_at}
          total_amount={order.total_amount}
          amount_paid={order.amount_paid}
          balance_due={order.balance_due}
          status={order.status}
        />
      ),
    },
    {
      key: "recordPayment",
      render: () =>
        order.balance_due > 0 ? (
          <RecordPayment
            orderId={order.id}
            vendorId={order.vendor_id}
            balanceDue={order.balance_due}
            onPaymentSuccess={handlePaymentSuccess}
          />
        ) : null,
    },
    {
      key: "payments",
      render: () => (
        <View className="mb-8">
          {paymentsLoading ? (
            <Loader />
          ) : paymentsError ? (
            <EmptyState message="Failed to load payments" />
          ) : (
            <PaymentHistory payments={payments || []} />
          )}
        </View>
      ),
    },
  ];

  return (
    <ScreenWrapper>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => item.render()}
      />
    </ScreenWrapper>
  );
}
