import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import EmptyState from "../feedback/EmptyState";
import Loader from "../feedback/Loader";
import SearchBar from "../ui/SearchBar";

interface BottomSheetPickerProps<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onEndReached?: () => void;
  search?: string;
  setSearch?: (text: string) => void;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
}

export default function BottomSheetPicker<T>({
  visible,
  onClose,
  title,
  items,
  isLoading = false,
  isFetchingNextPage = false,
  onEndReached,
  search,
  setSearch,
  keyExtractor,
  renderItem,
}: BottomSheetPickerProps<T>) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["80%", "95%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  // ✅ Control open/close with useEffect
  useEffect(() => {
    if (visible) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [visible]);

  // ✅ Close logic (handles both manual close and programmatic)
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={{ backgroundColor: colors.neutral[300], width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      <View className="flex-row justify-between items-center px-4 py-2 border-b border-gray-200 bg-white">
        <Text className="text-lg font-semibold text-textDark">{title}</Text>
        <TouchableOpacity onPress={handleClose}>
          <X size={20} color={colors.neutral[900]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {setSearch && (
        <View className="px-4 py-3 bg-white border-b border-gray-100">
          <SearchBar
            value={search ?? ""}
            onChangeText={setSearch}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </View>
      )}

      {/* Content - Scrollable */}
      {isLoading ? (
        <BottomSheetView style={{ flex: 1 }}>
          <Loader message={`Loading ${title.toLowerCase()}...`} />
        </BottomSheetView>
      ) : (
        <BottomSheetFlatList
          data={items ?? []}
          keyExtractor={keyExtractor}
          renderItem={({ item }: { item: T }) => renderItem(item)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
          }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            isFetchingNextPage ? <Loader message="Loading more..." /> : null
          }
          ListEmptyComponent={
            <EmptyState message={`No ${title.toLowerCase()} found`} />
          }
        />
      )}
    </BottomSheet>
  );
}
