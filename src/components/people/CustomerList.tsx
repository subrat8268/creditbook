import { Person } from "@/src/types/customer";
import { BookOpen, Plus, UserPlus } from "lucide-react-native";
import { useCallback } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { colors } from "../../utils/theme";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import Loader from "../feedback/Loader";
import CustomerCard from "./CustomerCard";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";

// ── People-specific empty state icon: open book + green plus badge ──────────
const PeopleEmptyIcon = (
  <View className="w-16 h-16">
    <BookOpen size={64} color={colors.primary} strokeWidth={1.5} />
    <View className="absolute -top-1 -right-1.5 w-[22px] h-[22px] rounded-full bg-primary items-center justify-center border-2 border-surface">
      <Plus size={11} color={colors.surface} strokeWidth={3} />
    </View>
  </View>
);

const PeopleEmptyCtaIcon = (
  <UserPlus size={18} color={colors.surface} strokeWidth={2} />
);

export default function CustomerList({
  people,
  onPressPerson,
  onLongPressPerson,
  isLoading,
  error,
  onRefresh,
  refreshing,
  onEndReached,
  isFetchingNextPage,
  onAddPerson,
}: {
  people: Person[];
  onPressPerson: (personId: string) => void;
  onLongPressPerson?: (personId: string) => void;
  isLoading: boolean;
  error?: Error | null;
  onRefresh: () => void;
  refreshing: boolean;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  onAddPerson?: () => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Person }) => (
      <CustomerCard
        name={item.name}
        phone={item.phone}
        isOverdue={item.isOverdue}
        outstandingBalance={item.outstandingBalance}
        lastActiveAt={item.lastActiveAt}
        onPress={() => onPressPerson(item.id)}
        onLongPress={onLongPressPerson ? () => onLongPressPerson(item.id) : undefined}
      />
    ),
    [onPressPerson, onLongPressPerson]
  );

  const { isConnected } = useNetworkSync();

  if (isLoading && people.length === 0) {
    return <Loader message="Loading people" />;
  }
  
  if (error && people.length === 0) {
    return <ErrorState message="Failed to fetch people" />;
  }

  return (
    <View className="flex-1">
      <FlatList
        data={people}
        keyExtractor={(item) => item.id}
        className="flex-1"
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="mt-8">
            <EmptyState
              title={isConnected ? "Your people list is empty" : "You’re offline"}
              description={
                isConnected
                  ? "Add your first person to start tracking entries"
                  : "Connect to the internet to load your people"
              }
              icon={PeopleEmptyIcon}
              iconBgColor={colors.successBg}
              iconSize={112}
              cta={isConnected && onAddPerson ? "Add Person" : undefined}
              onCta={isConnected ? onAddPerson : undefined}
              ctaIcon={isConnected && onAddPerson ? PeopleEmptyCtaIcon : undefined}
            />
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <Loader message="Loading more customers..." />
            </View>
          ) : null
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 }}
      />
    </View>
  );
}
