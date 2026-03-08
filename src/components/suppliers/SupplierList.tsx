import { FlatList, RefreshControl } from "react-native";
import { Supplier } from "../../types/supplier";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import Loader from "../feedback/Loader";
import SupplierCard from "./SupplierCard";

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
  if (isLoading) return <Loader message="Fetching suppliers" />;
  if (error) return <ErrorState message="Failed to fetch suppliers" />;

  return (
    <FlatList
      data={suppliers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SupplierCard
          supplier={item}
          onPress={() => onPressSupplier(item.id)}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyState
          title="No suppliers yet"
          description="Add a supplier to track deliveries and payments."
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
      initialNumToRender={10}
      contentContainerStyle={{ paddingBottom: 100 }}
      windowSize={10}
      removeClippedSubviews
    />
  );
}
