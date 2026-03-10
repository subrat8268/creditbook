import { Building2, Plus, Truck } from "lucide-react-native";
import { useCallback } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Supplier } from "../../types/supplier";
import { colors } from "../../utils/theme";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import Loader from "../feedback/Loader";
import SupplierCard from "./SupplierCard";

// ── Supplier-specific empty state icon: building + green plus badge ───────────
const SupplierEmptyIcon = (
  <View style={{ width: 64, height: 64 }}>
    <Building2 size={64} color={colors.warning.DEFAULT} strokeWidth={1.5} />
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.primary.DEFAULT,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    >
      <Plus size={11} color="#FFFFFF" strokeWidth={3} />
    </View>
  </View>
);

const SupplierEmptyCtaIcon = (
  <Truck size={18} color="#FFFFFF" strokeWidth={2} />
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
          title="No suppliers yet"
          description="Add your first supplier to track deliveries and payments"
          icon={SupplierEmptyIcon}
          iconBgColor={colors.warning.bg}
          iconSize={112}
          cta={onAddSupplier ? "Add Supplier" : undefined}
          onCta={onAddSupplier}
          ctaIcon={onAddSupplier ? SupplierEmptyCtaIcon : undefined}
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
