import ContactsPickerModal from "@/src/components/customers/ContactsPickerModal";
import CustomerList, {
    CustomerFilter,
} from "@/src/components/customers/CustomerList";
import CustomersHeader from "@/src/components/customers/CustomersHeader";
import NewCustomerModal from "@/src/components/customers/NewCustomerModal";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import SearchBar from "@/src/components/ui/SearchBar";
import { useAddCustomer, useCustomers } from "@/src/hooks/useCustomer";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useAuthStore } from "@/src/store/authStore";
import { useCustomersStore } from "@/src/store/customersStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { colors, spacing, typography } from "@/src/utils/theme";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Check, TrendingDown, Users } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTERS: CustomerFilter[] = ["All", "Overdue", "Paid", "Pending"];

const SORT_OPTIONS = [
  { label: "Recently Active", value: "recent" },
  { label: "Balance: High → Low", value: "balanceDesc" },
  { label: "Balance: Low → High", value: "balanceAsc" },
  { label: "Name: A → Z", value: "nameAsc" },
  { label: "Name: Z → A", value: "nameDesc" },
] as const;
type CustomerSort = (typeof SORT_OPTIONS)[number]["value"];

export default function CustomersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("All");
  const [sortBy, setSortBy] = useState<CustomerSort>("recent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const customers = useCustomersStore((s) => s.customers);
  const sortSheetRef = useRef<BottomSheet | null>(null);

  const {
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useCustomers(profile?.id, search);

  const addCustomerMutation = useAddCustomer(profile?.id ?? "");

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalOutstanding = useMemo(
    () => customers.reduce((s, c) => s + (c.outstandingBalance ?? 0), 0),
    [customers],
  );
  const overdueCount = useMemo(
    () => customers.filter((c) => c.isOverdue).length,
    [customers],
  );

  // ── Sorted customers (sorted before passing to CustomerList) ───────────────
  const sortedCustomers = useMemo(() => {
    const list = [...customers];
    switch (sortBy) {
      case "balanceDesc":
        return list.sort(
          (a, b) => (b.outstandingBalance ?? 0) - (a.outstandingBalance ?? 0),
        );
      case "balanceAsc":
        return list.sort(
          (a, b) => (a.outstandingBalance ?? 0) - (b.outstandingBalance ?? 0),
        );
      case "nameAsc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "nameDesc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list.sort(
          (a, b) =>
            new Date(b.lastActiveAt ?? b.created_at).getTime() -
            new Date(a.lastActiveAt ?? a.created_at).getTime(),
        );
    }
  }, [customers, sortBy]);

  const handleAddCustomer = async (values: {
    name: string;
    phone: string;
    address?: string;
    openingBalance?: number;
  }) => {
    try {
      await addCustomerMutation.mutateAsync(values);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to add customer:", err);
    }
  };

  const handleBulkImport = async (
    contacts: { name: string; phone: string }[],
  ) => {
    let imported = 0;
    let skipped = 0;
    for (const contact of contacts) {
      try {
        await addCustomerMutation.mutateAsync({
          name: contact.name,
          phone: contact.phone,
          address: "",
        });
        imported++;
      } catch {
        skipped++;
      }
    }
    Alert.alert(
      t("customers:importSuccess"),
      t("customers:importSummary", { imported, skipped }),
    );
  };

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

  const handlePressCustomer = (customerId: string) => {
    router.push({
      pathname: "/customers/[customerId]",
      params: { customerId },
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F6F7F9" }}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Screen header ── */}
      <CustomersHeader
        count={customers.length}
        onMenuPress={() => sortSheetRef.current?.expand()}
      />

      {/* ── Summary bar ── */}
      {customers.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.screenPadding,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surface,
            gap: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.successBg,
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrendingDown
              size={14}
              color={colors.primaryDark}
              strokeWidth={2}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Total Outstanding
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.primaryDark,
                marginLeft: 2,
              }}
            >
              {formatINR(totalOutstanding)}
            </Text>
          </View>
          {overdueCount > 0 && (
            <View
              style={{
                backgroundColor: colors.overdue.bg,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.overdue.text,
                }}
              >
                {overdueCount} Overdue
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Search + filter bar ── */}
      <View className="px-5 pt-3.5 pb-1 bg-white">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("customers.search")}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3.5 mb-0.5"
          contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                activeOpacity={0.75}
                className={`px-5 py-[9px] rounded-[24px] border ${
                  active
                    ? "bg-primary border-primary"
                    : "bg-search border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? "text-white font-bold" : "text-textPrimary"
                  }`}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Divider ── */}
      <View className="h-px bg-background mt-1" />

      {/* ── Customer list (full-width) ── */}
      <CustomerList
        customers={sortedCustomers}
        isLoading={isLoading}
        error={error}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        onPressCustomer={handlePressCustomer}
        filter={filter}
        onAddCustomer={() => setIsModalOpen(true)}
      />

      {/* ── Primary FAB — add customer ── */}
      <FloatingActionButton onPress={() => setIsModalOpen(true)} />

      {/* ── Secondary FAB — contacts import ── */}
      <TouchableOpacity
        onPress={() => setIsContactsModalOpen(true)}
        activeOpacity={0.85}
        accessibilityLabel="Import from contacts"
        style={styles.secondaryFab}
      >
        <Users size={20} color={colors.primary} strokeWidth={2} />
      </TouchableOpacity>

      <NewCustomerModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCustomer}
        loading={addCustomerMutation.isPending}
        errorMessage={addCustomerMutation.error?.message}
      />

      <ContactsPickerModal
        visible={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        onImport={handleBulkImport}
      />

      {/* ── Sort bottom sheet ── */}
      <BottomSheet
        ref={sortSheetRef}
        index={-1}
        snapPoints={[320]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="close" />
        )}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      >
        <BottomSheetView style={{ padding: spacing.lg }}>
          <Text style={{ ...typography.cardTitle, marginBottom: spacing.md }}>
            Sort Customers
          </Text>
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setSortBy(opt.value);
                  sortSheetRef.current?.close();
                }}
                style={{
                  paddingVertical: spacing.md,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.background,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: active ? colors.primaryDark : colors.textPrimary,
                    fontWeight: active ? "600" : "400",
                  }}
                >
                  {opt.label}
                </Text>
                {active && (
                  <Check size={18} color={colors.primaryDark} strokeWidth={2} />
                )}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const SECONDARY_FAB_BOTTOM = 80 + 16 + 56; // above main FAB (bottom=80, gap=16, mainFAB height=56)

const styles = StyleSheet.create({
  secondaryFab: {
    position: "absolute",
    bottom: SECONDARY_FAB_BOTTOM,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
});
