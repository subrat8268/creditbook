import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { usePeople } from "@/src/hooks/usePeople";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View } from "react-native";
import Loader from "../feedback/Loader";
import SearchBar from "../ui/SearchBar";
import BottomSheetPicker from "./BottomSheetPicker";

interface CustomerPickerProps {
  visible: boolean;
  selectedPerson: any;
  setSelectedPerson: (person: any) => void;
  vendorId: string;
  onClose?: () => void;
  variant?: "sheet" | "inline";
  testIDPrefix?: string;
}

export default function CustomerPicker({
  visible,
  selectedPerson,
  setSelectedPerson,
  vendorId,
  onClose,
  variant = "sheet",
  testIDPrefix,
}: CustomerPickerProps) {
  const [search, setSearch] = useState("");
  const { isConnected } = useNetworkSync();

  const {
    data: peopleData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePeople(vendorId, search);

  // ✅ Flatten paginated data
  const people = useMemo(
    () => peopleData?.pages.flatMap((page) => page) ?? [],
    [peopleData],
  );

  // ✅ Infinite scroll loader
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = useCallback(
    (item: any) => {
      Keyboard.dismiss();
      setSelectedPerson(item);
      onClose?.();
    },
    [setSelectedPerson, onClose],
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
    const inlinePeople = people ?? [];
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
              testID={testIDPrefix ? `${testIDPrefix}-search` : undefined}
            />
          </View>
          {!isConnected && (
            <Text className="text-[12px] text-textSecondary mt-2">
              You’re offline. People will load when back online.
            </Text>
          )}
        </View>
        <FlatList
          data={inlinePeople}
          keyExtractor={keyExtractor}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <TouchableOpacity
              className={`px-4 py-3 border-b border-border ${
                selectedPerson?.id === item.id
                  ? "bg-primaryLight"
                  : "bg-surface"
              }`}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
              testID={testIDPrefix ? `${testIDPrefix}-row-${index}` : undefined}
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
                {isLoading
                  ? "Loading people..."
                  : !isConnected
                    ? "Offline — connect to load people"
                    : "No people found"}
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
      items={people}
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
