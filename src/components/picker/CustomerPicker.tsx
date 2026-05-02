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
}

export default function CustomerPicker({
  visible,
  selectedPerson,
  setSelectedPerson,
  vendorId,
  onClose,
  variant = "sheet",
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

  // ✅ Flatten paginated data (use deduped people from hook)
  const people = useMemo(
    () => peopleData?.people ?? [],
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
      className="p-4 mb-3 rounded-2xl border border-border bg-surface shadow-sm dark:border-border-dark dark:bg-surface-dark"
      onPress={() => handleSelect(item)}
    >
      <Text className="font-medium text-textPrimary dark:text-textPrimary-dark">{item.name}</Text>
      {item.phone && (
        <Text className="text-sm text-textSecondary dark:text-textSecondary-dark">{item.phone}</Text>
      )}
    </TouchableOpacity>
  );

  // ✅ Unique key
  const keyExtractor = (item: any) => item.id.toString();

  if (variant === "inline") {
    const inlinePeople = people ?? [];
    return (
      <View className="rounded-2xl bg-surface border border-border overflow-hidden dark:bg-surface-dark dark:border-border-dark">
        <View className="px-4 py-3 border-b border-border dark:border-border-dark">
          <Text className="text-[12px] font-bold text-textSecondary tracking-widest dark:text-textSecondary-dark">
            SELECT PERSON
          </Text>
          <View className="mt-2">
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search people..."
            />
          </View>
          {!isConnected && (
            <Text className="mt-2 text-[12px] text-textSecondary dark:text-textSecondary-dark">
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
                  ? "bg-primary-light dark:bg-primary-soft-dark"
                  : "bg-surface dark:bg-surface-dark"
              }`}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
            >
              <Text className="text-[15px] font-semibold text-textPrimary dark:text-textPrimary-dark">
                {item.name}
              </Text>
              {item.phone ? (
                <Text className="mt-0.5 text-[12px] text-textSecondary dark:text-textSecondary-dark">
                  {item.phone}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 8 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
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
              <Text className="text-textSecondary dark:text-textSecondary-dark">
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
