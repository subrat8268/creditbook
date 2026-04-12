import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { Keyboard, Text, View } from "react-native";
import Loader from "../feedback/Loader";
import SearchBar from "../ui/SearchBar";

interface BottomSheetPickerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: any[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onEndReached?: () => void;
  search?: string;
  setSearch?: (search: string) => void;
  keyExtractor?: (item: any) => string;
  renderItem?: (item: any) => React.ReactNode;
}

export default function BottomSheetPicker({
  visible,
  onClose,
  title,
  items = [],
  isLoading = false,
  isFetchingNextPage = false,
  onEndReached,
  search = "",
  setSearch,
  keyExtractor,
  renderItem,
}: BottomSheetPickerProps) {
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["90%"], []);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        Keyboard.dismiss();
        onClose();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.5}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  const handleEndReached = useCallback(() => {
    onEndReached?.();
  }, [onEndReached]);

  return (
    <>
      {visible && (
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          onClose={onClose}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetScrollView
            scrollEnabled={false}
            contentContainerStyle={{ flex: 1, paddingHorizontal: 16 }}
          >
            {/* Header */}
            <View className="py-3 border-b border-border mb-3">
              <Text className="text-[14px] font-bold text-textSecondary tracking-widest mb-3">
                {title}
              </Text>
              {setSearch && (
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search..."
                />
              )}
            </View>

            {/* List */}
            <BottomSheetFlatList
              data={items}
              keyExtractor={
                keyExtractor || ((item) => item.id?.toString() || "")
              }
              renderItem={({ item }) => renderItem?.(item) || null}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              ListHeaderComponent={
                isLoading ? (
                  <View className="py-4">
                    <Loader message="Loading..." />
                  </View>
                ) : null
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4">
                    <Loader message="Loading more..." />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !isLoading ? (
                  <View className="py-6 items-center">
                    <Text className="text-textSecondary">No items found</Text>
                  </View>
                ) : null
              }
              contentContainerStyle={{ paddingBottom: 40 }}
              scrollEnabled={true}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </>
  );
}
