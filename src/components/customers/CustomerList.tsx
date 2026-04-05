import { Customer } from "@/src/types/customer";
import { BookOpen, Plus, UserPlus } from "lucide-react-native";
import { useCallback } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { colors } from "../../utils/theme";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import Loader from "../feedback/Loader"; // assume these generic feedback components exist
import CustomerCard from "./CustomerCard";

// ── Customer-specific empty state icon: open book + green plus badge ──────────
const CustomerEmptyIcon = (
  <View style={{ width: 64, height: 64 }}>
    <BookOpen size={64} color={colors.primary} strokeWidth={1.5} />
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    >
      <Plus size={11} color="#FFFFFF" strokeWidth={3} />
    </View>
  </View>
);

const CustomerEmptyCtaIcon = (
  <UserPlus size={18} color="#FFFFFF" strokeWidth={2} />
);

export type CustomerFilter = "All" | "Overdue" | "Paid" | "Pending";

function getStatus(c: Customer): CustomerFilter {
  const bal = c.outstandingBalance ?? 0;
  if (bal > 0 && c.isOverdue) return "Overdue";
  if (bal > 0 && !c.isOverdue) return "Pending";
  return "Paid";
}

export default function CustomerList({
  customers,
  onPressCustomer,
  isLoading,
  error,
  onRefresh,
  refreshing,
  onEndReached,
  isFetchingNextPage,
  filter = "All",
  onAddCustomer,
}: {
  customers: Customer[];
  onPressCustomer: (customerId: string) => void;
  isLoading: boolean;
  error?: Error | null;
  onRefresh: () => void;
  refreshing: boolean;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  filter?: CustomerFilter;
  onAddCustomer?: () => void;
}) {
  if (isLoading) return <Loader message="Fetching customers" />;
  if (error) return <ErrorState message="Failed to fetch customers" />;

  const filtered =
    filter === "All"
      ? customers
      : customers.filter((c) => getStatus(c) === filter);

  const CUSTOMER_ITEM_H = 88;

  const renderItem = useCallback(
    ({ item }: { item: Customer }) => (
      <CustomerCard
        name={item.name}
        phone={item.phone}
        isOverdue={item.isOverdue}
        outstandingBalance={item.outstandingBalance}
        lastActiveAt={item.lastActiveAt}
        onPress={() => onPressCustomer(item.id)}
      />
    ),
    [onPressCustomer],
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyState
          title="Your customer list is empty"
          description="Add your first customer to start tracking credit"
          icon={CustomerEmptyIcon}
          iconBgColor={colors.successBg}
          iconSize={112}
          cta={onAddCustomer ? "Add Customer" : undefined}
          onCta={onAddCustomer}
          ctaIcon={onAddCustomer ? CustomerEmptyCtaIcon : undefined}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <Loader message="Loading more customers..." />
        ) : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={(_, i) => ({
        length: CUSTOMER_ITEM_H,
        offset: CUSTOMER_ITEM_H * i,
        index: i,
      })}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 }}
    />
  );
}
