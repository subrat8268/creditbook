import { useCustomers } from "@/src/hooks/useCustomer";
import { useCallback, useMemo, useState } from "react";
import { Keyboard, Text, TouchableOpacity } from "react-native";
import BottomSheetPicker from "./BottomSheetPicker";

interface CustomerPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedCustomer: any;
  setSelectedCustomer: (customer: any) => void;
  vendorId: string;
}

export default function CustomerPicker({
  visible,
  onClose,
  selectedCustomer,
  setSelectedCustomer,
  vendorId,
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
      onClose();
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

  return (
    <BottomSheetPicker
      visible={visible}
      onClose={onClose}
      title="Customer"
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
