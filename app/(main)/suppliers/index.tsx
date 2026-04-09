import NewSupplierModal from "@/src/components/suppliers/NewSupplierModal";
import SupplierList from "@/src/components/suppliers/SupplierList";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import SearchBar from "@/src/components/ui/SearchBar";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useAddSupplier, useSuppliers } from "@/src/hooks/useSuppliers";
import { useAuthStore } from "@/src/store/authStore";
import { useSuppliersStore } from "@/src/store/suppliersStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { colors, spacing } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { TrendingUp } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Sort options removed for simplified flow.

export default function SuppliersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    return list.sort(
      (a, b) =>
        new Date(b.lastDeliveryAt ?? b.created_at).getTime() -
        new Date(a.lastDeliveryAt ?? a.created_at).getTime(),
    );
  }, [suppliers]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
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
            Parties
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

        {/* Right — owed badge */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {totalOwed > 0 && (
            <View
              style={{
                backgroundColor: colors.supplierBadgeBg,
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
              backgroundColor: colors.supplierBg,
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
            placeholder="Search parties..."
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

      {/* ── Sort bottom sheet removed for simplified flow ── */}
    </SafeAreaView>
  );
}
