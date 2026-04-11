import OrderCard from "@/src/components/orders/OrderCard";
import { Order } from "@/src/api/orders";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useOrders } from "@/src/hooks/useOrders";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useAuthStore } from "@/src/store/authStore";
import { colors, spacing, typography } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Screen ────────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
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

  const orders = useMemo(() => rawOrders ?? [], [rawOrders]);

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

  const handleCreateEntry = useCallback(
    () => router.push("/new-bill"),
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
      <FloatingActionButton onPress={handleCreateEntry} bottom={spacing.fabBottom} right={spacing.fabMargin} />

      {/* ── Sort bottom sheet removed for Phase 1 ──────────────────────── */}
    </SafeAreaView>
  );
}
