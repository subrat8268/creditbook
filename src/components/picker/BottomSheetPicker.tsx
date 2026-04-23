import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";
import Loader from "@/src/components/feedback/Loader";
import SearchBar from "@/src/components/ui/SearchBar";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { type ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/src/utils/theme";

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
  renderItem?: (item: any) => ReactElement | null;
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
  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      snapPoints={["90%"]}
      withScroll={false}
      contentContainerStyle={styles.sheetContent}
    >
      {setSearch ? (
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search..." />
        </View>
      ) : null}

      <BottomSheetFlatList
        data={items}
        keyExtractor={keyExtractor || ((item) => item.id?.toString() || "")}
        renderItem={({ item }) => renderItem?.(item) || null}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListHeaderComponent={
          isLoading ? (
            <View style={styles.loaderWrap}>
              <Loader message="Loading..." />
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loaderWrap}>
              <Loader message="Loading more..." />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <Text style={[typography.caption, styles.emptyText]}>No items found</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </BaseBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing["3xl"],
    flex: 1,
  },
  searchWrap: {
    marginBottom: spacing.md,
  },
  loaderWrap: {
    paddingVertical: spacing.lg,
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing["3xl"],
  },
});
