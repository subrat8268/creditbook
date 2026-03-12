import { useRouter } from "expo-router";
import { Users } from "lucide-react-native";
import { useCallback, useState } from "react";
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
import ContactsPickerModal from "../components/customers/ContactsPickerModal";
import CustomerList, {
  CustomerFilter,
} from "../components/customers/CustomerList";
import CustomersHeader from "../components/customers/CustomersHeader";
import NewCustomerModal from "../components/customers/NewCustomerModal";
import FloatingActionButton from "../components/ui/FloatingActionButton";
import SearchBar from "../components/ui/SearchBar";
import { useAddCustomer, useCustomers } from "../hooks/useCustomer";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuthStore } from "../store/authStore";
import { useCustomersStore } from "../store/customersStore";
import { colors } from "../utils/theme";

const FILTERS: CustomerFilter[] = ["All", "Overdue", "Paid", "Pending"];

export default function CustomersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const customers = useCustomersStore((s) => s.customers);

  const {
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useCustomers(profile?.id, search);

  const addCustomerMutation = useAddCustomer(profile?.id ?? "");

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
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Screen header ── */}
      <CustomersHeader
        count={customers.length}
        onMenuPress={() => {
          // TODO: show bulk-action menu (export, sort, etc.)
        }}
      />

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
        customers={customers}
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
        <Users size={20} color={colors.primary.DEFAULT} strokeWidth={2} />
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
    borderColor: colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
});
