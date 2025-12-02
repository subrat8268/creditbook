import { Customer } from "@/src/api/customers";
import { FlatList, RefreshControl } from "react-native";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import Loader from "../feedback/Loader"; // assume these generic feedback components exist
import CustomerCard from "./CustomerCard";

export default function CustomerList({
  customers,
  onPressCustomer,
  isLoading,
  error,
  onRefresh,
  refreshing,
  onEndReached,
  isFetchingNextPage,
}: {
  customers: Customer[];
  onPressCustomer: (customerId: string) => void;
  isLoading: boolean;
  error?: Error | null;
  onRefresh: () => void;
  refreshing: boolean;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
}) {
  if (isLoading) return <Loader message="Fetching customers" />;
  if (error) return <ErrorState message="Failed to fetch customers" />;

  return (
    <FlatList
      data={customers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CustomerCard
          name={item.name}
          phone={item.phone}
          onPress={() => onPressCustomer(item.id)}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={<EmptyState message="No customers found" />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Loader message="Loading more customers..." />
        ) : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      initialNumToRender={10}
      contentContainerStyle={{ paddingBottom: 80 }}
      windowSize={10}
      removeClippedSubviews
    />
  );
}
