import { Order } from "@/src/api/orders";
import { useOrderStore } from "@/src/store/orderStore";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import EmptyState from "../feedback/EmptyState";
import Loader from "../feedback/Loader";

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
  if (error) return <EmptyState message="Failed to load orders" />;
  if (!orders.length) return <EmptyState message="No orders found" />;

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      renderItem={({ item }) => {
        const isUpdating = updatingOrderIds.includes(item.id);
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
            <View>
              {isUpdating && <Loader />}
              <Text
                className={`px-3 py-1.5 rounded-full text-xs font-inter ${
                  item.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status}
              </Text>
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
