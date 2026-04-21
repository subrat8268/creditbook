import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useOrders } from "@/src/hooks/useEntries";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useAuthStore } from "@/src/store/authStore";
import { colors, spacing, typography } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { memo, useCallback, useMemo, useState } from "react";
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

// ── Inline Entry Card (replaces deleted OrderCard) ───────────────────────────
interface EntryItem {
  id: string;
  bill_number?: string;
  created_at: string;
  amount: number;
  status: "Paid" | "Pending" | "Partially Paid";
  party?: {
    name: string;
  };
}

const EntryCard = memo(function EntryCard({ entry, onPress }: { entry: EntryItem; onPress: () => void }) {
  const statusColors = {
    Paid: { bg: colors.paid.bg, text: colors.paid.text },
    Pending: { bg: colors.pending.bg, text: colors.pending.text },
    "Partially Paid": { bg: colors.pending.bg, text: colors.pending.text },
  };
  const status = entry.status === "Partially Paid" ? "Partial" : entry.status;
  const ui = statusColors[entry.status] || statusColors.Paid;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-surface rounded-2xl border border-border"
      style={{
        padding: spacing.cardPadding,
        marginBottom: spacing.md,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-1">
        <Text
          numberOfLines={1}
          style={[typography.body, { fontWeight: "600" as const, marginBottom: 2 }]}
        >
          {entry.party?.name || "Unknown"}
        </Text>
        <Text style={typography.caption}>
          {entry.bill_number || "—"} • {new Date(entry.created_at).toLocaleDateString("en-IN")}
        </Text>
      </View>
      <View className="items-end space-y-1.5">
        <MoneyAmount
          value={entry.amount}
          style={[typography.cardTitle, { fontWeight: "800" as const }]}
        />
        <View 
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: ui.bg }}
        >
          <Text 
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: ui.text }}
          >
            {status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Filter chips
const FILTER_OPTIONS: { label: StatusFilter; color: string; bg: string }[] = [
  { label: "All", color: colors.textPrimary, bg: colors.surface },
  { label: "Paid", color: colors.primary, bg: colors.successBg },
  { label: "Pending", color: colors.warning, bg: colors.warningBg },
  { label: "Overdue", color: colors.danger, bg: colors.dangerBg },
];

// ── Screen ────────────────────────────────────────────────────────────────────

// Filter type
type StatusFilter = "All" | "Paid" | "Pending" | "Overdue";

export default function OrdersScreen() {
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

  // Filter orders by status (client-side)
  const orders = useMemo(() => {
    if (!rawOrders) return [];
    if (filter === "All") return rawOrders;
    
    return rawOrders.filter((order) => {
      if (filter === "Paid") return order.status === "Paid";
      if (filter === "Pending") return order.status === "Pending" || order.status === "Partially Paid";
      if (filter === "Overdue") {
        // Overdue if pending for 30+ days
        const days = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return order.status === "Pending" && days > 30;
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
          <Text style={typography.screenTitle}>Entries</Text>
        </View>

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
            placeholder="Search entry or person…"
            placeholderTextColor={colors.textSecondary}
            className="flex-1 text-textPrimary text-[14px]"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── Entry list ────────────────────────────────────────────────── */}
      {isLoading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-textSecondary text-[14px]">
            Loading entries…
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-danger text-[14px] text-center">
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
          renderItem={({ item }) => (
            <EntryCard entry={item} onPress={() => handlePressOrder(item.id)} />
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
                {isConnected ? "No entries yet" : "You’re offline"}
              </Text>
              <Text className="text-textSecondary text-[14px] text-center leading-6">
                {isConnected
                  ? "Add your first entry to start tracking."
                  : "Connect to the internet to load entries."}
              </Text>
              {isConnected ? (
                <TouchableOpacity
                  onPress={handleCreateEntry}
                  activeOpacity={0.85}
                  className="mt-5 rounded-full bg-primary px-8 py-3"
                >
                  <Text className="text-[14px] font-bold text-surface">
                    Add Entry
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
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
    </SafeAreaView>
  );
}
