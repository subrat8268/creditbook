import { Customer } from "@/src/types/customer";
import { BookOpen, Plus, UserPlus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, View, TouchableOpacity, Text } from "react-native";
import { colors } from "../../utils/theme";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import Loader from "../feedback/Loader";
import CustomerCard from "./CustomerCard";

// ── Customer-specific empty state icon: open book + green plus badge ──────────
const CustomerEmptyIcon = (
  <View className="w-16 h-16">
    <BookOpen size={64} color={colors.primary} strokeWidth={1.5} />
    <View className="absolute -top-1 -right-1.5 w-[22px] h-[22px] rounded-full bg-primary items-center justify-center border-2 border-surface">
      <Plus size={11} color="#FFFFFF" strokeWidth={3} />
    </View>
  </View>
);

const CustomerEmptyCtaIcon = (
  <UserPlus size={18} color="#FFFFFF" strokeWidth={2} />
);

export type CustomerFilter = "All" | "Overdue" | "Paid" | "Pending";

const FILTER_TABS: CustomerFilter[] = ["All", "Overdue", "Paid", "Pending"];

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
  onAddCustomer?: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>("All");

  if (isLoading && customers.length === 0) {
    return <Loader message="Fetching customers" />;
  }
  
  if (error && customers.length === 0) {
    return <ErrorState message="Failed to fetch customers" />;
  }

  const filtered =
    activeFilter === "All"
      ? customers
      : customers.filter((c) => getStatus(c) === activeFilter);

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
    [onPressCustomer]
  );

  return (
    <View className="flex-1">
      {/* 4 Filter Tabs */}
      <View className="flex-row border-b border-border mb-2 mx-5">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.75}
              className={`flex-1 items-center pb-2.5 pt-1.5 border-b-2 ${
                isActive ? "border-primary" : "border-transparent"
              }`}
              style={{ marginBottom: isActive ? -1 : 0 }}
            >
              <Text className={`text-[13px] font-semibold ${isActive ? "text-primary" : "text-textSecondary"}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        className="flex-1"
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="mt-8">
            <EmptyState
              title={activeFilter === "All" ? "Your customer list is empty" : `No ${activeFilter.toLowerCase()} customers`}
              description={activeFilter === "All" ? "Add your first customer to start tracking credit" : "Try selecting a different filter"}
              icon={CustomerEmptyIcon}
              iconBgColor={colors.successBg}
              iconSize={112}
              cta={onAddCustomer && activeFilter === "All" ? "Add Customer" : undefined}
              onCta={onAddCustomer}
              ctaIcon={onAddCustomer && activeFilter === "All" ? CustomerEmptyCtaIcon : undefined}
            />
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <Loader message="Loading more customers..." />
            </View>
          ) : null
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 }}
      />
    </View>
  );
}
