import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useCallback } from "react";
import { Truck } from "lucide-react-native";

import EmptyState from "../feedback/EmptyState";
import SupplierCard from "./SupplierCard";
import { Supplier } from "../../types/supplier";
import { colors } from "../../utils/theme";

// ── Supplier-specific empty state icon ───────────────
const SupplierEmptyIcon = (
  <Truck size={56} color={colors.warning} strokeWidth={1.5} />
);

type Props = {
  suppliers: Supplier[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  refreshing: boolean;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  onPressSupplier: (id: string) => void;
  onAddSupplier: () => void;
};

export default function SupplierList({
  suppliers,
  isLoading,
  error,
  onRefresh,
  refreshing,
  onEndReached,
  isFetchingNextPage,
  onPressSupplier,
  onAddSupplier,
}: Props) {
  if (isLoading && suppliers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-5">
        <ActivityIndicator size="large" color={colors.supplierPrimary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-[15px] text-danger text-center">
          Failed to load suppliers.
        </Text>
      </View>
    );
  }

  return (
    <FlatList<Supplier>
      data={suppliers}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 100, // accommodate FAB
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.supplierPrimary}
          colors={[colors.supplierPrimary]}
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-5 items-center">
            <ActivityIndicator size="small" color={colors.supplierPrimary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          title="No suppliers found"
          description="You have no payable balances."
          icon={SupplierEmptyIcon}
          iconBgColor={colors.warningBg}
          cta="Add Supplier"
          onCta={onAddSupplier}
        />
      }
      renderItem={({ item }) => (
        <SupplierCard
          supplier={item}
          onPress={() => onPressSupplier(item.id)}
        />
      )}
    />
  );
}
