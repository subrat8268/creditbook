import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NewSupplierModal from "../components/suppliers/NewSupplierModal";
import SupplierList from "../components/suppliers/SupplierList";
import FloatingActionButton from "../components/ui/FloatingActionButton";
import SearchBar from "../components/ui/SearchBar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAddSupplier, useSuppliers } from "../hooks/useSuppliers";
import { useAuthStore } from "../store/authStore";
import { useSuppliersStore } from "../store/suppliersStore";
import { colors } from "../utils/theme";

export default function SuppliersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

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

  const totalOwed = suppliers.reduce((sum, s) => sum + (s.balanceOwed ?? 0), 0);

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-white">
      {/* ── Header ── */}
      <View
        className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b"
        style={{ borderBottomColor: colors.neutral[200] }}
      >
        <Text
          className="font-bold"
          style={{ fontSize: 28, color: colors.neutral[900] }}
        >
          Suppliers
        </Text>
        {totalOwed > 0 && (
          <View
            className="rounded-full px-3 py-[5px]"
            style={{ backgroundColor: colors.danger.light }}
          >
            <Text
              className="font-bold text-[13px]"
              style={{ color: colors.danger.DEFAULT }}
            >
              I Owe: ₹{totalOwed.toLocaleString("en-IN")}
            </Text>
          </View>
        )}
      </View>

      {/* ── Search ── */}
      <View className="px-5 pt-4 pb-2">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("suppliers.search")}
        />
      </View>

      {/* ── List ── */}
      <View className="flex-1">
        <SupplierList
          suppliers={suppliers}
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
    </SafeAreaView>
  );
}
