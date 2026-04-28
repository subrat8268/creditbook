import EmptyState from "@/src/components/ui/EmptyState";
import ErrorState from "@/src/components/feedback/ErrorState";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import Header from "@/src/components/layer2/Header";
import ListItem from "@/src/components/layer2/ListItem";
import ScreenLayout from "@/src/components/layer2/ScreenLayout";
import StatusBadge from "@/src/components/layer2/StatusBadge";
import NewCustomerModal from "@/src/components/people/NewCustomerModal";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import SearchBar from "@/src/components/ui/SearchBar";
import Avatar from "@/src/components/ui/Avatar";
import { useCreateOrder } from "@/src/hooks/useEntries";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useAddPerson, usePeople } from "@/src/hooks/usePeople";
import { useAuthStore } from "@/src/store/authStore";
import type { Person } from "@/src/types/customer";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatRelativeActivity } from "@/src/utils/helper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FilterOption = "All" | "Overdue" | "Pending" | "Paid";
type CustomerStatus = "Overdue" | "Pending" | "Paid" | "Advance";

const FILTER_OPTIONS: FilterOption[] = ["All", "Overdue", "Pending", "Paid"];

function getCustomerStatus(balance: number, isOverdue?: boolean): CustomerStatus {
  if (balance > 0 && isOverdue) return "Overdue";
  if (balance > 0) return "Pending";
  if (balance < 0) return "Advance";
  return "Paid";
}

export default function CustomersScreen() {
  const { colors, radius, spacing, typography } = useTheme();
  const { profile } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams<{ action?: string }>();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [redirectAfterAdd, setRedirectAfterAdd] = useState(false);
  const styles = useMemo(
    () => createStyles(colors, spacing, typography, radius),
    [colors, spacing, typography, radius],
  );

  const {
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    people,
  } = usePeople(profile?.id, search);

  const addCustomerMutation = useAddPerson(profile?.id ?? "");
  const createOrderMutation = useCreateOrder(profile?.id ?? "");
  const { show: showToast } = useToast();

  useEffect(() => {
    if (params?.action === "add") {
      setIsModalOpen(true);
      setRedirectAfterAdd(true);
      router.setParams({ action: undefined });
    }
  }, [params, router]);

  const sortedCustomers = useMemo(() => {
    const list = [...people];
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [people]);

  const filteredCustomers = useMemo(() => {
    if (filter === "All") return sortedCustomers;

    return sortedCustomers.filter((customer) => {
      const status = getCustomerStatus(
        customer.outstandingBalance ?? 0,
        customer.isOverdue,
      );

      if (filter === "Paid") return status === "Paid" || status === "Advance";
      return status === filter;
    });
  }, [filter, sortedCustomers]);

  const handleAddCustomer = async (values: {
    name: string;
    phone?: string;
    address?: string;
    openingBalance?: number;
    entryAmount?: number;
    entryNote?: string;
    redirectToEntry?: boolean;
  }) => {
    try {
      const createdCustomer = await addCustomerMutation.mutateAsync({
        phone: values.phone || "",
        name: values.name,
        address: values.address,
        openingBalance: values.openingBalance,
      });

      if (values.entryAmount && values.entryAmount > 0) {
        await createOrderMutation.mutateAsync({
          customerId: createdCustomer.id,
          vendorId: profile?.id ?? "",
          items: [
            {
              product_id: null,
              product_name: values.entryNote?.trim() || "Entry Amount",
              price: values.entryAmount,
              quantity: 1,
            },
          ],
          amountPaid: 0,
          loadingCharge: 0,
          taxPercent: 0,
          billNumberPrefix: profile?.bill_number_prefix || "INV",
        });

        showToast({ message: `Entry added for ${createdCustomer.name}`, type: "success" });
        router.push({
          pathname: "/(main)/people/[customerId]",
          params: { customerId: createdCustomer.id },
        });
      }

      setIsModalOpen(false);

      if (!values.entryAmount || values.entryAmount <= 0) {
        const shouldRedirect = values.redirectToEntry ?? redirectAfterAdd;
        if (shouldRedirect) {
          router.push({
            pathname: "/(main)/entries/create",
            params: {
              customer: JSON.stringify(createdCustomer),
              next: shouldRedirect ? "share" : undefined,
            },
          });
        }
      }

      setRedirectAfterAdd(false);
    } catch (error) {
      console.error("Failed to add customer:", error);
      showToast({ message: "Failed to add customer", type: "error" });
    }
  };

  const handleOpenCustomer = useCallback(
    (customerId: string) => {
      router.push({
        pathname: "/(main)/people/[customerId]",
        params: { customerId },
      });
    },
    [router],
  );

  const handleAddEntry = useCallback(
    (customer: Person) => {
      router.push({
        pathname: "/(main)/entries/create",
        params: { customer: JSON.stringify(customer) },
      });
    },
    [router],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEndReached = useInfiniteScroll(onLoadMore, [
    hasNextPage,
    isFetchingNextPage,
  ]);

  const activeFilterStatus =
    filter === "All" ? undefined : (filter as "Overdue" | "Pending" | "Paid");

  const amountColorMap: Record<CustomerStatus, string> = {
    Overdue: colors.overdue.text,
    Pending: colors.warning,
    Paid: colors.success,
    Advance: colors.primary,
  };

  return (
    <ScreenLayout>
      <Header title="People" subtitle="Track customers and balances" />

      <View style={styles.controlsWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search customers..."
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = option === filter;
            return (
              <Pressable
                key={option}
                onPress={() => setFilter(option)}
                style={[styles.chip, isActive ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeFilterStatus ? (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterLabel}>Showing</Text>
            <StatusBadge status={activeFilterStatus} align="left" />
          </View>
        ) : null}
      </View>

      {isLoading && filteredCustomers.length === 0 ? (
        <Loader message="Loading customers" />
      ) : error && filteredCustomers.length === 0 ? (
        <ErrorState message="Failed to fetch customers" />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const status = getCustomerStatus(
              item.outstandingBalance ?? 0,
              item.isOverdue,
            );

            const displayBalance =
              status === "Paid" ? 0 : Math.abs(item.outstandingBalance ?? 0);

            return (
              <ListItem
                title={item.name}
                subtitle={`Last activity: ${formatRelativeActivity(item.lastActiveAt)}`}
                leftSlot={<Avatar name={item.name} size="md" />}
                amount={displayBalance}
                amountColor={amountColorMap[status]}
                status={status}
                onPress={() => handleOpenCustomer(item.id)}
                variant="row"
                bordered={index < filteredCustomers.length - 1}
                noMargin
                secondaryAction={
                  <Pressable
                    onPress={() => handleAddEntry(item)}
                    style={({ pressed }) => [styles.entryAction, pressed ? styles.entryActionPressed : null]}
                  >
                    <Text style={styles.entryActionText}>Add Entry</Text>
                  </Pressable>
                }
              />
            );
          }}
          ListFooterComponent={
            isFetchingNextPage ? <Loader message="Loading more customers..." /> : null
          }
          ListEmptyComponent={
            search.trim() ? (
              <EmptyState
                illustration="search"
                headingEn="No results found"
                headingHi="कोई परिणाम नहीं"
                bodyEn="Try a different name or number"
                bodyHi="कोई दूसरा नाम या नंबर आज़माएं"
              />
            ) : (
              <EmptyState
                illustration="person"
                headingEn="No customers yet"
                headingHi="कोई ग्राहक नहीं"
                bodyEn="Tap + to add your first customer"
                bodyHi="+ दबाएं और पहला ग्राहक जोड़ें"
                ctaLabel="Add Customer"
                onCta={() => setIsModalOpen(true)}
              />
            )
          }
        />
      )}

      <FloatingActionButton
        onPress={() => setIsModalOpen(true)}
        bottom={spacing.fabBottom}
        right={spacing.fabMargin}
      />

      <NewCustomerModal
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRedirectAfterAdd(false);
        }}
        onSubmit={(values) =>
          handleAddCustomer({
            ...values,
            redirectToEntry: redirectAfterAdd,
          })
        }
        loading={addCustomerMutation.isPending}
        errorMessage={addCustomerMutation.error?.message}
      />
    </ScreenLayout>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  spacing: ReturnType<typeof useTheme>["spacing"],
  typography: ReturnType<typeof useTheme>["typography"],
  radius: ReturnType<typeof useTheme>["radius"],
) =>
  StyleSheet.create({
    controlsWrap: {
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    chipsContainer: {
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    chip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    chipText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    chipTextActive: {
      color: colors.primary,
    },
    activeFilterRow: {
      marginTop: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    activeFilterLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    listContent: {
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.fabSize + spacing.fabBottom + spacing.xl,
    },
    entryAction: {
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    entryActionPressed: {
      opacity: 0.8,
    },
    entryActionText: {
      ...typography.small,
      color: colors.textSecondary,
      fontWeight: "600",
    },
  });
