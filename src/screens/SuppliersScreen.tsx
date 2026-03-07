import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import ScreenWrapper from "../components/ScreenWrapper";
import SearchBar from "../components/SearchBar";
import NewSupplierModal from "../components/suppliers/NewSupplierModal";
import SupplierList from "../components/suppliers/SupplierList";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAddSupplier, useSuppliers } from "../hooks/useSuppliers";
import { useAuthStore } from "../store/authStore";
import { useSuppliersStore } from "../store/suppliersStore";

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
      pathname: `/supplier/${supplierId}`,
      params: { supplierId },
    });
  };

  return (
    <ScreenWrapper>
      <View className="mb-4">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("suppliers.search")}
        />
      </View>

      <SupplierList
        suppliers={suppliers}
        isLoading={isLoading}
        error={error}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        onPressSupplier={handlePressSupplier}
      />

      <FloatingActionButton onPress={() => setIsModalOpen(true)} />

      <NewSupplierModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSupplier}
        loading={addSupplierMutation.isPending}
      />
    </ScreenWrapper>
  );
}
