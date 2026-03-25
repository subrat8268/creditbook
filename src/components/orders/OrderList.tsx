import { Order } from "@/src/api/orders";
import { useOrderStore } from "@/src/store/orderStore";
import { daysSince } from "@/src/utils/helper";
import { colors } from "@/src/utils/theme";
import { useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Loader from "../feedback/Loader";

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  colors.danger,
  colors.warning,
  colors.primary,
  "#4F9CFF",
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

// Month abbreviations for reliable cross-platform date formatting
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Paid: { bg: "#DCFCE7", text: "#16A34A", label: "PAID" },
  "Partially Paid": { bg: "#DBEAFE", text: "#1D4ED8", label: "PARTIAL" },
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
  onCreateBill: () => void;
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
  onCreateBill,
}: Props) {
  const { updatingOrderIds } = useOrderStore();

  // card (96) + marginBottom (12) = 108 per slot
  const ORDER_ITEM_H = 108;

  const renderItem = useCallback(
    ({ item }: { item: Order }) => {
      const isUpdating = updatingOrderIds.includes(item.id);
      const isOverdue =
        item.status === "Pending" && daysSince(item.created_at) > 30;
      const statusKey = isOverdue ? "Overdue" : item.status;
      const chipStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["Pending"];
      const customerName = item.customer?.name ?? "Unknown Customer";

      return (
        <TouchableOpacity
          onPress={() => onPressOrder(item.id)}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 12,
            padding: 14,
            elevation: 2,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
          }}
        >
          {/* ── Main row: avatar + name/bill + amount/chip ────── */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {/* Avatar */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: getAvatarColor(customerName),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                flexShrink: 0,
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}
              >
                {getInitials(customerName)}
              </Text>
            </View>

            {/* Centre: customer name + bill number */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1C1C1E",
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                >
                  {customerName}
                </Text>
                {isUpdating && <Loader />}
              </View>
              <Text
                style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}
                numberOfLines={1}
              >
                {item.bill_number}
              </Text>
            </View>

            {/* Right: amount + status chip */}
            <View
              style={{ alignItems: "flex-end", flexShrink: 0, marginLeft: 8 }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#1C1C1E",
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
                    letterSpacing: 0.4,
                  }}
                >
                  {chipStyle.label}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Bottom row: date ─────────────────────────────── */}
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 10 }}>
            {formatDate(item.created_at)}
          </Text>
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
      windowSize={10}
      getItemLayout={(_, i) => ({
        length: ORDER_ITEM_H,
        offset: ORDER_ITEM_H * i,
        index: i,
      })}
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Text
            style={{
              textAlign: "center",
              padding: 16,
              color: "#6B7280",
              fontSize: 13,
            }}
          >
            Loading more…
          </Text>
        ) : null
      }
      ListEmptyComponent={
        !isLoading && !error ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 80,
              paddingHorizontal: 32,
            }}
          >
            {/* Illustration placeholder */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#F0FDF4",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 36 }}>📋</Text>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1C1C1E",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No orders yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 28,
              }}
            >
              Create your first bill to get started
            </Text>
            <TouchableOpacity
              onPress={onCreateBill}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#22C55E",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Create Bill
              </Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
    />
  );
}
