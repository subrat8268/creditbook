import { Order } from "@/src/api/orders";
import { useOrderStore } from "@/src/store/orderStore";
import { daysSince } from "@/src/utils/helper";
import { colors } from "@/src/utils/theme";
import { useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import EmptyState from "../feedback/EmptyState";
import Loader from "../feedback/Loader";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Paid: { bg: colors.success.light, text: colors.success.dark, label: "PAID" },
  "Partially Paid": {
    bg: colors.info.light,
    text: colors.info.dark,
    label: "PARTIAL",
  },
  Pending: {
    bg: colors.warning.light,
    text: colors.warning.dark,
    label: "PENDING",
  },
  Overdue: {
    bg: colors.danger.light,
    text: colors.danger.DEFAULT,
    label: "OVERDUE",
  },
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

  const ORDER_ITEM_H = 88;

  const renderItem = useCallback(
    ({ item }: { item: Order }) => {
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
    },
    [updatingOrderIds, onPressOrder],
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      renderItem={renderItem}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={(_, i) => ({
        length: ORDER_ITEM_H,
        offset: ORDER_ITEM_H * i,
        index: i,
      })}
      contentContainerStyle={{ paddingBottom: 80 }}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Text className="text-center p-4">Loading more...</Text>
        ) : null
      }
      ListEmptyComponent={
        !isLoading && !error ? (
          <EmptyState
            title="No bills yet"
            description="Create your first bill to get started."
          />
        ) : null
      }
    />
  );
}
