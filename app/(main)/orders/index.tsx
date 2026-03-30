import OrderList from "@/src/components/orders/OrderList";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import SearchBar from "@/src/components/ui/SearchBar";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useOrders } from "@/src/hooks/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { daysSince } from "@/src/utils/helper";
import { colors, spacing, typography } from "@/src/utils/theme";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    Check,
    FileText,
    Search,
    SortAsc,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  // Dashboard totals for summary bar
  const { data: dashData } = useDashboard(profile?.id);

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
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.screenPadding,
          paddingVertical: spacing.sm,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={typography.screenTitle}>Orders</Text>
        <TouchableOpacity
          onPress={() => {
            setShowSearch((v) => !v);
            if (showSearch) setSearch("");
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Search size={22} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── Collapsible search ───────────────────────────────────────── */}
      {showSearch && (
        <View
          style={{
            paddingHorizontal: spacing.screenPadding,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search bill no. or customer…"
          />
        </View>
      )}

      {/* ── Summary bar ── */}
      {dashData &&
        (dashData.outstandingAmount > 0 ||
          dashData.unpaidOrders > 0 ||
          dashData.partialOrders > 0) && (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: spacing.screenPadding,
              paddingVertical: spacing.sm,
              backgroundColor: colors.surface,
              gap: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: colors.dangerBg,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FileText size={14} color={colors.danger} strokeWidth={2} />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Outstanding
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.danger,
                  marginLeft: 2,
                }}
              >
                {formatINR(dashData.outstandingAmount)}
              </Text>
            </View>
            {dashData.overdueCustomers > 0 && (
              <View
                style={{
                  backgroundColor: colors.overdue.bg,
                  borderRadius: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <AlertCircle
                  size={13}
                  color={colors.overdue.text}
                  strokeWidth={2}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.overdue.text,
                  }}
                >
                  {dashData.overdueCustomers} Overdue
                </Text>
              </View>
            )}
          </View>
        )}

      {/* ── Filter chips ──────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingVertical: spacing.sm,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.screenPadding,
            gap: spacing.sm,
          }}
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
                  backgroundColor: active ? colors.primary : colors.background,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "600" : "400",
                    color: active ? colors.surface : colors.textSecondary,
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
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <SortAsc size={14} color={colors.textSecondary} strokeWidth={2} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
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
        backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
        handleIndicatorStyle={{
          backgroundColor: colors.border,
          width: 40,
        }}
      >
        <BottomSheetView style={{ padding: spacing.lg }}>
          <Text
            style={{
              ...typography.cardTitle,
              marginBottom: spacing.md,
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
                  paddingVertical: spacing.md,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.background,
                }}
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
                {active && <Check size={18} color={colors.primaryDark} />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
