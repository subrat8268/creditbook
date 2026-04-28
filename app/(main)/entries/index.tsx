import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import SearchBar from "@/src/components/ui/SearchBar";
import EmptyState from "@/src/components/ui/EmptyState";
import Header from "@/src/components/layer2/Header";
import ListItem from "@/src/components/layer2/ListItem";
import ScreenLayout from "@/src/components/layer2/ScreenLayout";
import { useTheme } from "@/src/utils/ThemeProvider";
import { useOrders } from "@/src/hooks/useEntries";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Screen ────────────────────────────────────────────────────────────────────

// Filter type
type StatusFilter = "All" | "Paid" | "Pending" | "Overdue";

export default function OrdersScreen() {
  const { colors, spacing } = useTheme();
  const { profile } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: rawOrders,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders(profile?.id, search, undefined, "newest"); // minimal filters only

  const { isConnected } = useNetworkSync();

  const FILTER_OPTIONS: { label: StatusFilter; color: string; bg: string }[] = [
    { label: "All", color: colors.textPrimary, bg: colors.surface },
    { label: "Paid", color: colors.primary, bg: colors.successBg },
    { label: "Pending", color: colors.warning, bg: colors.warningBg },
    { label: "Overdue", color: colors.overdue.text, bg: colors.overdue.bg },
  ];

  // Filter orders by status (client-side)
  const orders = useMemo(() => {
    if (!rawOrders) return [];
    if (filter === "All") return rawOrders;
    
    return rawOrders.filter((order) => {
      if (filter === "Paid") return order.status === "Paid";
      if (filter === "Pending") return order.status === "Pending" || order.status === "Partially Paid";
      if (filter === "Overdue") {
        const dueDateValue =
          "due_date" in order && typeof order.due_date === "string"
            ? order.due_date
            : null;
        if (!dueDateValue) return false;
        const dueDate = new Date(dueDateValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return order.status !== "Paid" && dueDate < today;
      }
      return true;
    });
  }, [rawOrders, filter]);

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
      router.push({ pathname: "/(main)/entries/[orderId]", params: { orderId } }),
    [router],
  );

  const handleCreateEntry = useCallback(
    () => router.push("/(main)/entries/create"),
    [router],
  );

  return (
    <ScreenLayout>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View
        className="bg-surface border-b border-border dark:bg-surface-dark dark:border-border-dark"
        style={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xs,
        }}
      >
        <Header
          title="Entries"
          subtitle="Scan recent entries and their payment status"
        />

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3 -mx-2"
        >
          {FILTER_OPTIONS.map((f) => {
            const active = filter === f.label;
            return (
              <TouchableOpacity
                key={f.label}
                onPress={() => setFilter(f.label as StatusFilter)}
                className="px-3 py-1.5 rounded-full mr-2"
                style={{
                  backgroundColor: active ? f.color : f.bg,
                  borderWidth: active ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: active ? colors.surface : f.color }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Pill search bar — always visible */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search entry or customer…"
        />
      </View>

      {/* ── Entry list ────────────────────────────────────────────────── */}
      {isLoading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-textSecondary dark:text-textSecondary-dark text-[14px]">
            Loading entries…
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-danger dark:text-danger-light text-[14px] text-center">
            Could not load entries. Pull down to retry.
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
          renderItem={({ item }) => {
            const entryDate = new Date(item.created_at).toLocaleDateString("en-IN");
            const subtitle = `${item.bill_number || "—"} • ${entryDate}`;

            return (
              <ListItem
                title={item.customer?.name || "Unknown"}
                subtitle={subtitle}
                amount={item.total_amount}
                status={item.status as "Paid" | "Pending" | "Overdue" | "Partially Paid"}
                onPress={() => handlePressOrder(item.id)}
              />
            );
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
                <Text
                  className="text-center text-textSecondary dark:text-textSecondary-dark text-[13px]"
                  style={{ padding: spacing.lg }}
                >
                Loading more…
              </Text>
            ) : null
          }
          ListEmptyComponent={
            !isConnected ? (
              <View className="flex-1 items-center justify-center px-8 pt-20">
                <Text className="text-textSecondary dark:text-textSecondary-dark text-[14px] text-center">
                  Connect to the internet to load entries.
                </Text>
              </View>
            ) : search.trim() ? (
              <EmptyState
                illustration="search"
                headingEn="No results found"
                headingHi="कोई परिणाम नहीं"
                bodyEn="Try a different name or number"
                bodyHi="कोई दूसरा नाम या नंबर आज़माएं"
              />
            ) : (
              <EmptyState
                illustration="clipboard"
                headingEn="No entries yet"
                headingHi="कोई एंट्री नहीं"
                bodyEn="Record your first entry to start tracking"
                bodyHi="अपनी पहली एंट्री दर्ज करें और शुरुआत करें"
                ctaLabel="Add Entry"
                onCta={handleCreateEntry}
              />
            )
          }
        />
      )}

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      <FloatingActionButton
        onPress={handleCreateEntry}
        bottom={spacing.fabBottom}
        right={spacing.fabMargin}
      />

      {/* ── Sort bottom sheet removed for Phase 1 ──────────────────────── */}
    </ScreenLayout>
  );
}
