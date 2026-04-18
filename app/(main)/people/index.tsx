import { useToast } from "@/src/components/feedback/Toast";
import CustomerList from "@/src/components/people/CustomerList";
import NewCustomerModal from "@/src/components/people/NewCustomerModal";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import SearchBar from "@/src/components/ui/SearchBar";
import { useCreateOrder } from "@/src/hooks/useEntries";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import { useAddPerson, usePeople } from "@/src/hooks/usePeople";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { UserPlus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomersScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams<{ action?: string }>();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [redirectAfterAdd, setRedirectAfterAdd] = useState(false);
  const [inlineName, setInlineName] = useState("");
  const [inlinePhone, setInlinePhone] = useState("");

  const {
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    people,
  } = usePeople(profile?.id, search);

  const addPersonMutation = useAddPerson(profile?.id ?? "");
  const createOrderMutation = useCreateOrder(profile?.id ?? "");
  const { show: showToast } = useToast();

  useEffect(() => {
    if (params?.action === "add") {
      setIsModalOpen(true);
      setRedirectAfterAdd(true);
      router.setParams({ action: undefined });
    }
  }, [params, router]);

  // ── Sorted people (sorted before passing to list) ───────────────────────────
  const sortedPeople = useMemo(() => {
    const list = [...people];
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [people]);

  const handleAddPerson = async (values: {
    name: string;
    phone?: string;
    address?: string;
    openingBalance?: number;
    entryAmount?: number;
    entryNote?: string;
    redirectToEntry?: boolean;
  }) => {
    try {
      const createdPerson = await addPersonMutation.mutateAsync({
        ...values,
        phone: values.phone || "",
      } as any);
      if (values.entryAmount && values.entryAmount > 0) {
        await createOrderMutation.mutateAsync({
          customerId: createdPerson.id,
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
        showToast({
          message: `Entry added for ${createdPerson.name}`,
          type: "success",
        });
        router.push({
          pathname: "/people/[customerId]",
          params: { customerId: createdPerson.id },
        });
      }
      setIsModalOpen(false);
      if (!values.entryAmount || values.entryAmount <= 0) {
        const shouldRedirect = values.redirectToEntry ?? redirectAfterAdd;
        if (shouldRedirect) {
          router.push({
            pathname: "/(main)/entries/create",
            params: {
              customer: JSON.stringify(createdPerson),
              next: shouldRedirect ? "share" : undefined,
            },
          });
        }
      }
      setRedirectAfterAdd(false);
    } catch (err: any) {
      console.error("Failed to add customer:", err);
    }
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
    const selected = people.find((c) => c.id === customerId);
    if (!selected) return;
    // Tap person → amount-first entry flow.
    router.push({
      pathname: "/(main)/entries/create",
      params: { customer: JSON.stringify(selected) },
    });
  };

  const handleOpenLedger = useCallback(
    (customerId: string) => {
      router.push({
        pathname: "/people/[customerId]",
        params: { customerId },
      });
    },
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />

      {/* ── Screen header ── */}
      <View className="px-4 py-4 flex-row justify-between items-center">
        <Text
          className="text-2xl font-bold text-textPrimary"
        >
          People
        </Text>
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
          className="flex-row items-center"
        >
          <View style={styles.inlineAddPill}>
            <UserPlus size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.inlineAddText}>Add Person</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Summary Removed per design */}

      {/* ── Search bar ── */}
      <View className="px-4 pt-1 pb-2">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search people..."
        />
      </View>

      {/* ── Inline add person (name + phone) ── */}
      <View className="px-4 pb-3">
        <View className="bg-surface border border-border rounded-2xl p-4">
          <Text className="text-[12px] font-bold text-textSecondary tracking-widest mb-3">
            ADD PERSON
          </Text>
          <View className="gap-3">
            <Input
              label="Name"
              placeholder="e.g. Mohit Sharma"
              value={inlineName}
              onChangeText={setInlineName}
            />
            <Input
              label="Phone"
              placeholder="9876543210"
              value={inlinePhone}
              onChangeText={setInlinePhone}
              keyboardType="numeric"
            />
            <Button
              title="Add Person"
              onPress={async () => {
                if (!inlineName.trim()) return;
                await handleAddPerson({
                  name: inlineName.trim(),
                  phone: inlinePhone.trim(),
                  entryAmount: 0,
                });
                setInlineName("");
                setInlinePhone("");
              }}
              loading={addPersonMutation.isPending}
              disabled={!inlineName.trim()}
            />
          </View>
        </View>
      </View>

      {/* ── People list (full-width) ── */}
      <CustomerList
        people={sortedPeople}
        isLoading={isLoading}
        error={error}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        onPressPerson={handlePressCustomer}
        onLongPressPerson={handleOpenLedger}
        onAddPerson={() => setIsModalOpen(true)}
      />

      <NewCustomerModal
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRedirectAfterAdd(false);
        }}
        onSubmit={(values) =>
          handleAddPerson({
            ...values,
            redirectToEntry: redirectAfterAdd,
          })
        }
        loading={addPersonMutation.isPending}
        errorMessage={addPersonMutation.error?.message}
        entryFlow
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inlineAddPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  inlineAddText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
});
