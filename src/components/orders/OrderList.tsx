import { Order } from "@/src/api/orders";
import { useOrderStore } from "@/src/store/orderStore";
import { daysSince } from "@/src/utils/helper";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import EmptyState from "../feedback/EmptyState";
import Loader from "../feedback/Loader";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Paid: { bg: "#DCFCE7", text: "#16A34A", label: "PAID" },
  "Partially Paid": { bg: "#EFF6FF", text: "#1D4ED8", label: "PARTIAL" },
  Pending: { bg: "#FEF3C7", text: "#D97706", label: "PENDING" },
  Overdue: { bg: "#FEE2E2", text: "#DC2626", label: "OVERDUE" },
};

interface Props {
  orders: Order[];
  isLoading: boolean;
  error: any;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  onPressOrder: (orderId: string) => void;
}

export default function OrderList({
  orders,
  isLoading,
  error,
  refreshing,
  onRefresh,
  onEndReached,
  isFetchingNextPage,
  onPressOrder,
}: Props) {
  const { updatingOrderIds } = useOrderStore();

  if (isLoading) return <Loader />;
  if (error)
    return (
      <EmptyState
        title="Could not load bills"
        description="Pull down to refresh and try again."
      />
    );
  if (!orders.length)
    return (
      <EmptyState
        title="No bills yet"
        description="Create your first bill to get started."
      />
    );

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      renderItem={({ item }) => {
        const isUpdating = updatingOrderIds.includes(item.id);
        const isOverdue =
          item.status === "Pending" && daysSince(item.created_at) > 30;
        const statusKey = isOverdue ? "Overdue" : item.status;
        const chipStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["Pending"];
        return (
          <TouchableOpacity
            onPress={() => onPressOrder(item.id)}
            className="border border-neutral-300 rounded-lg p-4 mb-3 flex-row justify-between items-center"
          >
            <View>
              <Text className="font-inter-semibold text-neutral-900">
                ₹ {item.total_amount.toLocaleString()}
              </Text>
              <Text className="text-sm text-neutral-600">
                {new Date(item.created_at).toDateString()}
              </Text>
            </View>
            <View className="items-end">
              {isUpdating && <Loader />}
              <View
                style={{
                  backgroundColor: chipStyle.bg,
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    color: chipStyle.text,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {chipStyle.label}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Text className="text-center p-4">Loading more...</Text>
        ) : null
      }
    />
  );
}
