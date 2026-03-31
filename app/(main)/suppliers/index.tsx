import NewSupplierModal from "@/src/components/suppliers/NewSupplierModal";
import SupplierList from "@/src/components/suppliers/SupplierList";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import SearchBar from "@/src/components/ui/SearchBar";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useAddSupplier, useSuppliers } from "@/src/hooks/useSuppliers";
import { useAuthStore } from "@/src/store/authStore";
import { useSuppliersStore } from "@/src/store/suppliersStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { colors, spacing, typography } from "@/src/utils/theme";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Check, MoreVertical, TrendingUp } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SORT_OPTIONS = [
  { label: "Recently Active", value: "recent" },
  { label: "Amount Owed: High → Low", value: "owedDesc" },
  { label: "Amount Owed: Low → High", value: "owedAsc" },
  { label: "Name: A → Z", value: "nameAsc" },
  { label: "Name: Z → A", value: "nameDesc" },
] as const;
type SupplierSort = (typeof SORT_OPTIONS)[number]["value"];

export default function SuppliersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SupplierSort>("recent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sortSheetRef = useRef<BottomSheet | null>(null);

  const suppliers = useSuppliersStore((s) => s.suppliers);

  const {
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useSuppliers(profile?.id, search);

  const addSupplierMutation = useAddSupplier(profile?.id ?? "");

  const handleAddSupplier = async (values: any) => {
    try {
      await addSupplierMutation.mutateAsync(values);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to add supplier:", err);
    }
  };

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

  const handlePressSupplier = (supplierId: string) => {
    router.push({
      pathname: "/suppliers/[supplierId]" as any,
      params: { supplierId },
    });
  };

  const totalOwed = useMemo(
    () => suppliers.reduce((sum, s) => sum + (s.balanceOwed ?? 0), 0),
    [suppliers],
  );

  const sortedSuppliers = useMemo(() => {
    const list = [...suppliers];
    switch (sortBy) {
      case "owedDesc":
        return list.sort((a, b) => (b.balanceOwed ?? 0) - (a.balanceOwed ?? 0));
      case "owedAsc":
        return list.sort((a, b) => (a.balanceOwed ?? 0) - (b.balanceOwed ?? 0));
      case "nameAsc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "nameDesc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list.sort(
          (a, b) =>
            new Date(b.lastDeliveryAt ?? b.created_at).getTime() -
            new Date(a.lastDeliveryAt ?? a.created_at).getTime(),
        );
    }
  }, [suppliers, sortBy]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Left — title + count badge */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            Suppliers
          </Text>
          <View
            style={{
              backgroundColor: colors.pending.bg,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: colors.pending.text,
              }}
            >
              {suppliers.length}
            </Text>
          </View>
        </View>

        {/* Right — owed badge + sort icon */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {totalOwed > 0 && (
            <View
              style={{
                backgroundColor: "#FCE7F3",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.supplierPrimary,
                }}
              >
                I Owe {formatINR(totalOwed)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => sortSheetRef.current?.expand()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <MoreVertical
              size={22}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Summary bar ── */}
      {suppliers.length > 0 && totalOwed > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
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
              backgroundColor: "#FDF2F8",
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrendingUp
              size={14}
              color={colors.supplierPrimary}
              strokeWidth={2}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Total Payable
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.supplierPrimary,
                marginLeft: 2,
              }}
            >
              {formatINR(totalOwed)}
            </Text>
          </View>
        </View>
      )}

      {/* ── Search ── */}
      <View
        style={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("suppliers.search")}
        />
      </View>

      {/* ── List ── */}
      <View style={{ flex: 1 }}>
        <SupplierList
          suppliers={sortedSuppliers}
          isLoading={isLoading}
          error={error}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={handleEndReached}
          isFetchingNextPage={isFetchingNextPage}
          onPressSupplier={handlePressSupplier}
          onAddSupplier={() => setIsModalOpen(true)}
        />
      </View>

      <FloatingActionButton onPress={() => setIsModalOpen(true)} />

      <NewSupplierModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSupplier}
        loading={addSupplierMutation.isPending}
      />

      {/* ── Sort bottom sheet ── */}
      <BottomSheet
        ref={sortSheetRef}
        index={-1}
        snapPoints={[340]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="close" />
        )}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      >
        <BottomSheetView style={{ padding: spacing.lg }}>
          <Text style={{ ...typography.cardTitle, marginBottom: spacing.md }}>
            Sort Suppliers
          </Text>
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setSortBy(opt.value);
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
                    fontSize: 15,
                    color: active ? colors.supplierPrimary : colors.textPrimary,
                    fontWeight: active ? "600" : "400",
                  }}
                >
                  {opt.label}
                </Text>
                {active && (
                  <Check
                    size={18}
                    color={colors.supplierPrimary}
                    strokeWidth={2}
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
