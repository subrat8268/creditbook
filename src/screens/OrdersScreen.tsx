import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import SearchBar from "@/src/components/ui/SearchBar";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useOrders } from "@/src/hooks/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { daysSince } from "@/src/utils/helper";
import { colors } from "@/src/utils/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Check, Search, SortAsc } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OrderList from "../components/orders/OrderList";

// ── Filter chips declared outside so they're stable references ───────────────
const FILTER_CHIPS = ["All", "Paid", "Partial", "Pending", "Overdue"] as const;
type FilterChip = (typeof FILTER_CHIPS)[number];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "High Amount", value: "high" },
  { label: "Low Amount", value: "low" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** Map display chip → API status filter value */
function chipToApiFilter(chip: FilterChip): string | undefined {
  if (chip === "All") return undefined;
  if (chip === "Partial") return "Partially Paid";
  if (chip === "Overdue") return "Pending"; // client-side sub-filter applied later
  return chip;
}

export default function OrdersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const [selectedChip, setSelectedChip] = useState<FilterChip>("All");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [refreshing, setRefreshing] = useState(false);

  const sortSheetRef = useRef<BottomSheet | null>(null);

  const apiFilter = chipToApiFilter(selectedChip);

  const {
    data: rawOrders,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders(profile?.id, search, apiFilter, sortBy);

  // Client-side Overdue sub-filter (Pending AND daysSince > 30)
  const orders = useMemo(() => {
    const list = rawOrders ?? [];
    if (selectedChip === "Overdue")
      return list.filter(
        (o) => o.status === "Pending" && daysSince(o.created_at) > 30,
      );
    return list;
  }, [rawOrders, selectedChip]);

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
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#F6F7F9" }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F9" />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#1C1C1E" }}>
          Orders
        </Text>
        <TouchableOpacity
          onPress={() => {
            setShowSearch((v) => !v);
            if (showSearch) setSearch("");
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Search size={22} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── Collapsible search ───────────────────────────────────────── */}
      {showSearch && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search bill no. or customer…"
          />
        </View>
      )}

      {/* ── Filter chips ──────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          paddingVertical: 10,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTER_CHIPS.map((chip) => {
            const active = selectedChip === chip;
            return (
              <TouchableOpacity
                key={chip}
                onPress={() => setSelectedChip(chip)}
                activeOpacity={0.75}
                style={{
                  height: 32,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? "#22C55E" : "#F6F7F9",
                  borderWidth: 1,
                  borderColor: active ? "#22C55E" : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "600" : "400",
                    color: active ? "#FFFFFF" : "#6B7280",
                  }}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Sort trigger — last chip in the row */}
          <TouchableOpacity
            onPress={() => sortSheetRef.current?.expand()}
            activeOpacity={0.75}
            style={{
              height: 32,
              paddingHorizontal: 14,
              borderRadius: 999,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#F6F7F9",
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <SortAsc size={14} color="#6B7280" strokeWidth={2} />
            <Text style={{ fontSize: 13, color: "#6B7280" }}>
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Order list ────────────────────────────────────────────────── */}
      <OrderList
        orders={orders}
        isLoading={isLoading}
        error={error}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        onPressOrder={handlePressOrder}
        onCreateBill={handleCreateBill}
      />

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <FloatingActionButton onPress={handleCreateBill} bottom={24} right={20} />

      {/* ── Sort BottomSheet ─────────────────────────────────────────── */}
      <BottomSheet
        ref={sortSheetRef}
        index={-1}
        snapPoints={[300]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="close" />
        )}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.white, borderRadius: 24 }}
        handleIndicatorStyle={{
          backgroundColor: colors.neutral[300],
          width: 40,
        }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#1C1C1E",
              marginBottom: 12,
            }}
          >
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
                style={{
                  paddingVertical: 14,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: active ? "#16A34A" : "#1C1C1E",
                    fontWeight: active ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
                {active && <Check size={18} color="#16A34A" />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
