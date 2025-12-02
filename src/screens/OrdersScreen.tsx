import FloatingActionButton from "@/src/components/FloatingActionButton";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import OrderList from "@/src/components/orders/OrderList";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useOrders } from "@/src/hooks/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { FilterBar } from "../components/orders/FilterBar";
import { useOrderFilters } from "../hooks/useOrderFilters";

export default function OrdersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const filters = useOrderFilters();

  const {
    data: orders,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders(profile?.id, undefined, filters.selectedFilter, filters.sortBy);

  const [refreshing, setRefreshing] = useState(false);

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

  const handlePressOrder = (orderId: string) => {
    router.push({
      pathname: "/orders/[orderId]",
      params: { orderId },
    });
  };

  return (
    <>
      <ScreenWrapper>
        {/* FilterBar */}
        <FilterBar
          filters={filters.filters}
          selectedFilter={filters.selectedFilter}
          onSelectFilter={filters.setSelectedFilter}
          sortBy={filters.sortBy}
          openSortSheet={filters.openSortSheet}
          openFilterSheet={filters.openFilterSheet}
        />

        <OrderList
          orders={orders}
          isLoading={isLoading}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleEndReached}
          isFetchingNextPage={isFetchingNextPage}
          onPressOrder={handlePressOrder}
        />

        <FloatingActionButton
          className="absolute bottom-6 right-6 bg-primary rounded-full p-4 shadow-lg"
          icon={<Ionicons name="add" size={24} color="white" />}
          onPress={() => router.push("/orders/create")}
        />
      </ScreenWrapper>

      {/* Filter BottomSheet */}
      <BottomSheet
        ref={filters.filterSheetRef}
        index={-1}
        snapPoints={[250]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="close" />
        )}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#fff", borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: "#ccc", width: 40 }}
      >
        <BottomSheetView className="p-5">
          <Text className="text-lg font-semibold mb-3 text-gray-900">
            Filter by Status
          </Text>
          {filters.filters.map((item) => {
            const active = filters.selectedFilter === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => filters.setSelectedFilter(item)}
                className="py-3 flex-row justify-between items-center border-b border-gray-100"
              >
                <Text
                  className={`text-base ${
                    active ? "text-green-600 font-semibold" : "text-gray-700"
                  }`}
                >
                  {item}
                </Text>
                {active && <Check size={18} color="#16a34a" />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>

      {/* Sort BottomSheet (same as before) */}
      <BottomSheet
        ref={filters.bottomSheetRef}
        index={-1}
        snapPoints={[250]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="close" />
        )}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#fff", borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: "#ccc", width: 40 }}
      >
        <BottomSheetView className="p-5">
          <Text className="text-lg font-semibold mb-3 text-gray-900">
            Sort by
          </Text>
          {filters.sortOptions.map((option) => {
            const active = filters.sortBy === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => filters.setSortBy(option.value as any)}
                className="py-3 flex-row justify-between items-center border-b border-gray-100"
              >
                <Text
                  className={`text-base ${
                    active ? "text-green-600 font-semibold" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
                {active && <Check size={18} color="#16a34a" />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
