import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import CustomerList from "../components/customers/CustomerList";
import NewCustomerModal from "../components/customers/NewCustomerModal";
import FloatingActionButton from "../components/FloatingActionButton";
import ScreenWrapper from "../components/ScreenWrapper";
import SearchBar from "../components/SearchBar";
import { useAddCustomer, useCustomers } from "../hooks/useCustomer";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuthStore } from "../store/authStore";
import { useCustomersStore } from "../store/customersStore";

export default function CustomersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const customers = useCustomersStore((s) => s.customers);

  const {
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useCustomers(profile?.id, search);

  const addCustomerMutation = useAddCustomer(profile?.id ?? "");

  const handleAddCustomer = async (values: {
    name: string;
    phone: string;
    address?: string;
  }) => {
    try {
      await addCustomerMutation.mutateAsync(values);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to add customer:", err);
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

  const handlePressCustomer = (customerId: string) => {
    router.push({
      pathname: "/customers/[customerId]",
      params: { customerId },
    });
  };

  return (
    <ScreenWrapper>
      <View className="mb-4">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("customers.search")}
        />
      </View>

      <CustomerList
        customers={customers}
        isLoading={isLoading}
        error={error}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        onPressCustomer={handlePressCustomer}
      />

      <FloatingActionButton
        className="absolute bottom-6 right-6 bg-primary rounded-full p-4 shadow-lg"
        icon={<Ionicons name="add" size={24} color="white" />}
        onPress={() => setIsModalOpen(true)}
      />

      <NewCustomerModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCustomer}
        loading={addCustomerMutation.isPending}
        errorMessage={addCustomerMutation.error?.message}
      />
    </ScreenWrapper>
  );
}
