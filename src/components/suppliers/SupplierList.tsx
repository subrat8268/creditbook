import { Truck } from "lucide-react-native";
import { useCallback } from "react";
import { FlatList, RefreshControl } from "react-native";
import { Supplier } from "../../types/supplier";
import { colors } from "../../utils/theme";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import Loader from "../feedback/Loader";
import SupplierCard from "./SupplierCard";

// ── Supplier-specific empty state icon: truck (amber, no badge) ───────────────
const SupplierEmptyIcon = (
  <Truck size={56} color={colors.warning} strokeWidth={1.5} />
);

export default function SupplierList({
  suppliers,
  onPressSupplier,
  isLoading,
  error,
  onRefresh,
  refreshing,
  onEndReached,
  isFetchingNextPage,
  onAddSupplier,
}: {
  suppliers: Supplier[];
  onPressSupplier: (supplierId: string) => void;
  isLoading: boolean;
  error?: Error | null;
  onRefresh: () => void;
  refreshing: boolean;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  onAddSupplier?: () => void;
}) {
  const SUPPLIER_ITEM_H = 84;

  const renderItem = useCallback(
    ({ item }: { item: Supplier }) => (
      <SupplierCard supplier={item} onPress={() => onPressSupplier(item.id)} />
    ),
    [onPressSupplier],
  );

  if (isLoading) return <Loader message="Fetching suppliers" />;
  if (error) return <ErrorState message="Failed to fetch suppliers" />;

  return (
    <FlatList
      data={suppliers}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyState
          title="No suppliers added"
          description="Track what you owe your distributors and suppliers"
          icon={SupplierEmptyIcon}
          iconBgColor={colors.warningBg}
          iconSize={112}
          cta={onAddSupplier ? "Add Supplier" : undefined}
          onCta={onAddSupplier}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <Loader message="Loading more suppliers..." />
        ) : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={(_, i) => ({
        length: SUPPLIER_ITEM_H,
        offset: SUPPLIER_ITEM_H * i,
        index: i,
      })}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
}
