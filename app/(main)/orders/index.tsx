import OrderCard from "@/src/components/orders/OrderCard";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useOrders } from "@/src/hooks/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { daysSince } from "@/src/utils/helper";
import { colors, spacing, typography } from "@/src/utils/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Check, Search, SlidersHorizontal } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTER_TABS = ["All", "Paid", "Partial", "Pending", "Overdue"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "High Amount", value: "high" },
  { label: "Low Amount", value: "low" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function tabToApiFilter(tab: FilterTab): string | undefined {
  if (tab === "All") return undefined;
  if (tab === "Partial") return "Partially Paid";
  if (tab === "Overdue") return "Pending";
  return tab;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [refreshing, setRefreshing] = useState(false);

  const sortSheetRef = useRef<BottomSheet | null>(null);

  const apiFilter = tabToApiFilter(activeTab);

  const {
    data: rawOrders,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders(profile?.id, search, apiFilter, sortBy);

  // Client-side overdue sub-filter: Pending AND daysSince > 30
  const orders = useMemo(() => {
    const list = rawOrders ?? [];
    if (activeTab === "Overdue")
      return list.filter(
        (o) => o.status === "Pending" && daysSince(o.created_at) > 30,
      );
    return list;
  }, [rawOrders, activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEndReached = useInfiniteScroll(onLoadMore, [
    hasNextPage,
    isFetchingNextPage,
  ]);

  const handlePressOrder = useCallback(
    (orderId: string) =>
      router.push({ pathname: "/orders/[orderId]", params: { orderId } }),
    [router],
  );

  const handleCreateBill = useCallback(
    () => router.push("/orders/create"),
    [router],
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View
        className="bg-surface border-b border-border"
        style={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xs,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text style={typography.screenTitle}>Orders</Text>
          <TouchableOpacity
            onPress={() => sortSheetRef.current?.expand()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SlidersHorizontal
              size={22}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {/* Pill search bar — always visible */}
        <View
          className="flex-row items-center bg-background rounded-full px-4"
          style={{ height: spacing.searchBarHeight }}
        >
          <Search
            size={16}
            color={colors.textSecondary}
            strokeWidth={2}
            style={{ marginRight: spacing.sm }}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search bill no. or customer…"
            placeholderTextColor={colors.textSecondary}
            className="flex-1 text-textPrimary text-[14px]"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── Underline filter tabs ──────────────────────────────────────── */}
      <View className="bg-surface border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.screenPadding }}
        >
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.75}
                className={`py-3 mr-6 border-b-2 ${active ? "border-primary" : "border-transparent"}`}
              >
                <Text
                  className={`text-[14px] ${active ? "font-semibold text-primary" : "font-medium text-textSecondary"}`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Order list ────────────────────────────────────────────────── */}
      {isLoading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-textSecondary text-[14px]">
            Loading orders…
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-danger text-[14px] text-center">
            Could not load orders. Pull down to retry.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          removeClippedSubviews
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={10}
          contentContainerStyle={{
            paddingTop: spacing.md,
            paddingBottom: 120,
          }}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handlePressOrder} />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Text
                className="text-center text-textSecondary text-[13px]"
                style={{ padding: spacing.lg }}
              >
                Loading more…
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pt-20">
              <View
                className="items-center justify-center rounded-full mb-5"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: colors.successBg,
                }}
              >
                <Text style={{ fontSize: 36 }}>📋</Text>
              </View>
              <Text className="text-textPrimary text-[18px] font-bold mb-2 text-center">
                No orders yet
              </Text>
              <Text className="text-textSecondary text-[14px] text-center leading-6">
                Tap the{" "}
                <Text className="font-semibold text-warning">+ New Bill</Text>{" "}
                button to create your first bill.
              </Text>
            </View>
          }
        />
      )}

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      <FloatingActionButton onPress={handleCreateBill} bottom={24} right={20} />

      {/* ── Sort bottom sheet ──────────────────────────────────────────── */}
      <BottomSheet
        ref={sortSheetRef}
        index={-1}
        snapPoints={[300]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="close" />
        )}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.border,
          width: 40,
        }}
      >
        <BottomSheetView style={{ padding: spacing.lg }}>
          <Text style={{ ...typography.cardTitle, marginBottom: spacing.md }}>
            Sort by
          </Text>
          {SORT_OPTIONS.map((option) => {
            const active = sortBy === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSortBy(option.value);
                  sortSheetRef.current?.close();
                }}
                className="flex-row items-center justify-between py-3 border-b border-background"
              >
                <Text
                  style={{
                    ...typography.body,
                    color: active ? colors.primaryDark : colors.textPrimary,
                    fontWeight: active ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
                {active && (
                  <Check
                    size={18}
                    color={colors.primaryDark}
                    strokeWidth={2.5}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
