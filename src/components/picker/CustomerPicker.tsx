import { useCustomers } from "@/src/hooks/useCustomer";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View } from "react-native";
import BottomSheetPicker from "./BottomSheetPicker";
import SearchBar from "../ui/SearchBar";
import Loader from "../feedback/Loader";

interface CustomerPickerProps {
  visible: boolean;
  selectedCustomer: any;
  setSelectedCustomer: (customer: any) => void;
  vendorId: string;
  onClose?: () => void;
  variant?: "sheet" | "inline";
}

export default function CustomerPicker({
  visible,
  selectedCustomer,
  setSelectedCustomer,
  vendorId,
  onClose,
  variant = "sheet",
}: CustomerPickerProps) {
  const [search, setSearch] = useState("");

  const {
    data: customersData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCustomers(vendorId, search);

  // ✅ Flatten paginated data
  const customers = useMemo(
    () => customersData?.pages.flatMap((page) => page) ?? [],
    [customersData]
  );

  // ✅ Infinite scroll loader
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = useCallback(
    (item: any) => {
      Keyboard.dismiss();
      setSelectedCustomer(item);
      onClose?.();
    },
    [setSelectedCustomer, onClose]
  );

  // ✅ Render each customer
  const renderItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      className="p-4 mb-3 bg-white border border-gray-200 rounded-2xl shadow-sm"
      onPress={() => handleSelect(item)}
    >
      <Text className="text-gray-900 font-medium">{item.name}</Text>
      {item.phone && (
        <Text className="text-gray-500 text-sm">{item.phone}</Text>
      )}
    </TouchableOpacity>
  );

  // ✅ Unique key
  const keyExtractor = (item: any) => item.id.toString();

   if (variant === "inline") {
    const inlineCustomers = customers ?? [];
    return (
      <View className="rounded-2xl bg-surface border border-border overflow-hidden">
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-[12px] font-bold text-textSecondary tracking-widest">
            SELECT PERSON
          </Text>
          <View className="mt-2">
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search people..."
            />
          </View>
        </View>
        <FlatList
          data={inlineCustomers}
          keyExtractor={keyExtractor}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              className={`px-4 py-3 border-b border-border ${
                selectedCustomer?.id === item.id ? "bg-primaryLight" : "bg-surface"
              }`}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
            >
              <Text className="text-[15px] font-semibold text-textPrimary">
                {item.name}
              </Text>
              {item.phone ? (
                <Text className="text-[12px] text-textSecondary mt-0.5">
                  {item.phone}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 8 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isLoading ? (
              <View className="py-4">
                <Loader message="Loading people..." />
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? <Loader message="Loading more..." /> : null
          }
          ListEmptyComponent={
            <View className="py-6 items-center">
              <Text className="text-textSecondary">
                {isLoading ? "Loading people..." : "No people found"}
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
      <BottomSheetPicker
        visible={visible}
        onClose={onClose ?? (() => {})}
        title="Person"
        items={customers}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={handleEndReached}
      search={search} // optional if your hook handles search internally
      setSearch={setSearch} // optional placeholder if not using search
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}
