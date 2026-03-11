import { Order } from "@/src/api/orders";
import { useOrderStore } from "@/src/store/orderStore";
import { daysSince } from "@/src/utils/helper";
import { colors } from "@/src/utils/theme";
import { useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import EmptyState from "../feedback/EmptyState";
import Loader from "../feedback/Loader";

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  colors.danger.DEFAULT,
  colors.warning.DEFAULT,
  colors.primary.DEFAULT,
  colors.info.DEFAULT,
  "#9B59B6",
  "#E91E8C",
  "#00BCD4",
  "#FF5722",
] as const;

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

  const ORDER_ITEM_H = 76;

  const renderItem = useCallback(
    ({ item }: { item: Order }) => {
      const isUpdating = updatingOrderIds.includes(item.id);
      const isOverdue =
        item.status === "Pending" && daysSince(item.created_at) > 30;
      const statusKey = isOverdue ? "Overdue" : item.status;
      const chipStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["Pending"];

      const customerName = item.customer?.name ?? "Unknown Customer";
      const avatarColor = getAvatarColor(customerName);
      const initials = getInitials(customerName);

      return (
        <TouchableOpacity
          onPress={() => onPressOrder(item.id)}
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.neutral.surface,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.neutral[200],
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: avatarColor,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>
              {initials}
            </Text>
          </View>

          {/* Centre: bill number + customer name + date */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.neutral[900],
                  marginRight: 6,
                }}
                numberOfLines={1}
              >
                {item.bill_number}
              </Text>
              {isUpdating && <Loader />}
            </View>
            <Text
              style={{
                fontSize: 13,
                color: colors.neutral[700],
                marginBottom: 1,
              }}
              numberOfLines={1}
            >
              {customerName}
            </Text>
            <Text style={{ fontSize: 11, color: colors.neutral[400] }}>
              {formatDate(item.created_at)}
            </Text>
          </View>

          {/* Right: amount + status chip */}
          <View
            style={{ alignItems: "flex-end", flexShrink: 0, marginLeft: 8 }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.neutral[900],
                marginBottom: 5,
              }}
            >
              ₹{item.total_amount.toLocaleString("en-IN")}
            </Text>
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
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 0.5,
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
      contentContainerStyle={{ paddingBottom: 80, paddingTop: 4 }}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Text
            className="text-center p-4"
            style={{ color: colors.neutral[500] }}
          >
            Loading more...
          </Text>
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
