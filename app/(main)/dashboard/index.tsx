import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import BottomSheetPicker from "@/src/components/picker/BottomSheetPicker";
import Avatar from "@/src/components/ui/Avatar";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { fetchPersonDetail } from "@/src/api/people";
import { useDashboard } from "@/src/hooks/useDashboard";
import { usePeople } from "@/src/hooks/usePeople";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowDownCircle, TrendingUp, Users } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentContext = {
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  initialAmount?: number;
};

export default function DashboardScreen() {
  const { colors, gradients, spacing, typography, statusBarStyle, isDark } = useTheme();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { show: showToast } = useToast();
  const {
    toReceive,
    overdueCustomers: overduePeople,
    overdueTotalCount,
    weekDelta,
    isLoading,
    refreshDashboard,
  } = useDashboard(profile?.id);

  const totalOutstanding = useMemo(() => toReceive ?? 0, [toReceive]);
  const collectedThisWeek = weekDelta > 0 ? weekDelta : 0;
  const followUpPeople = useMemo(() => {
    const seen = new Set<string>();
    const unique = overduePeople.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // Prefer oldest overdue first, then highest balance.
    unique.sort((a, b) => {
      if (b.daysSince !== a.daysSince) return b.daysSince - a.daysSince;
      return b.balance - a.balance;
    });

    return unique.slice(0, 3);
  }, [overduePeople]);

  const heroSupportText = useMemo(() => {
    if (collectedThisWeek > 0) {
      return `${formatINR(collectedThisWeek)} collected this week`;
    }

    if (overdueTotalCount > 0) {
      return `Start with the most overdue customer today`;
    }

    return "You are all caught up. Add new entries as they happen.";
  }, [collectedThisWeek, overdueTotalCount]);

  const openCustomer = (customerId: string) => {
    router.push({
      pathname: "/(main)/people/[customerId]",
      params: { customerId },
    } as never);
  };

  const paymentSheetRef = useRef<BottomSheetModal>(null);
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const {
    people: pickerPeople,
    isLoading: isPickerLoading,
    fetchNextPage: fetchMorePickerPeople,
    hasNextPage: pickerHasNextPage,
    isFetchingNextPage: pickerIsFetchingNextPage,
  } = usePeople(profile?.id, customerSearch);

  const openRecordPaymentForCustomer = useCallback(
    async (customerId: string, customerName: string) => {
      setIsCollecting(true);
      try {
        const detail = await fetchPersonDetail(customerId);
        if (!detail?.pendingOrderId || !detail.pendingOrderBalance) {
          showToast({
            message: "No outstanding balance to collect for this customer.",
            type: "error",
          });
          return;
        }

        setPaymentContext({
          orderId: detail.pendingOrderId,
          balanceDue: detail.pendingOrderBalance,
          customerId: detail.id,
          customerName,
          initialAmount: detail.pendingOrderBalance,
        });

        paymentSheetRef.current?.present();
      } catch {
        showToast({ message: "Could not open collection flow.", type: "error" });
      } finally {
        setIsCollecting(false);
      }
    },
    [showToast],
  );

  const handleCollectNow = useCallback(async () => {
    const top = followUpPeople[0];
    if (top) {
      await openRecordPaymentForCustomer(top.id, top.name);
      return;
    }

    setIsCustomerPickerOpen(true);
  }, [followUpPeople, openRecordPaymentForCustomer]);

  if (isLoading || !profile) {
    return (
      <View className="items-center justify-center bg-background dark:bg-background-dark" style={{ flex: 1 }}>
        <Loader message="Loading dashboard..." />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} translucent={false} />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.fabBottom + spacing.fabSize + spacing.tabBarHeight,
        }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          overdueCount={overdueTotalCount}
          showNotification
          onPressNotifications={() => router.push("/(main)/people" as never)}
        />

        <View className="px-4">
          <LinearGradient
            colors={[gradients.dashboardHero.start, gradients.dashboardHero.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="relative mb-4 overflow-hidden rounded-2xl px-6 pb-5 pt-6 shadow-lg"
          >
            <View className={`absolute -right-10 -top-12 h-36 w-36 rounded-full ${isDark ? "bg-dashboard-hero-orb-dark" : "bg-dashboard-hero-orb"}`} />
            <View className={`absolute -bottom-12 right-10 h-28 w-28 rounded-full ${isDark ? "bg-dashboard-hero-orb-dark" : "bg-dashboard-hero-orb"}`} />

            <Text className="text-dashboard-hero-text-muted opacity-75" style={typography.overline}>
              COLLECT OUTSTANDING
            </Text>

            <MoneyAmount value={totalOutstanding} variant="hero" color={colors.dashboard.heroText} className="mt-1" />

            <View className="mt-2 flex-row items-center">
              <TrendingUp size={14} color={colors.dashboard.heroText} strokeWidth={2.2} />
              <Text className="ml-1.5 text-caption font-inter-medium text-dashboard-hero-text-muted">
                {heroSupportText}
              </Text>
            </View>
          </LinearGradient>

          <View className="mb-5 flex-row gap-3">
            <Pressable
              className={`flex-1 flex-row items-center justify-center rounded-full bg-primary py-3 shadow-sm ${isCollecting ? "opacity-70" : ""}`}
              onPress={handleCollectNow}
              disabled={isCollecting}
            >
              <ArrowDownCircle size={18} color={colors.surface} strokeWidth={2.1} />
              <Text className="ml-2 text-body font-inter-semibold text-surface">Collect Now</Text>
            </Pressable>

            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-full border border-soft bg-surface py-3 dark:border-border-soft-dark dark:bg-surface-dark"
              onPress={() => router.push("/(main)/people" as never)}
            >
              <Users size={18} color={colors.primary} strokeWidth={2.1} />
              <Text className="ml-2 text-body font-inter-semibold text-primary">View Customers</Text>
            </Pressable>
          </View>

          <View className="mb-4 mt-1 flex-row items-center justify-between">
            <Text className="text-section-title text-textPrimary dark:text-textPrimary-dark">Start collecting</Text>
            <Pressable onPress={() => router.push("/(main)/people" as never)}>
              <Text className="text-caption font-inter-bold text-primary">See all</Text>
            </Pressable>
          </View>

          <View className="overflow-hidden rounded-2xl border border-soft bg-surface shadow-sm dark:border-border-soft-dark dark:bg-surface-dark">
            {followUpPeople.length > 0 ? (
              followUpPeople.map((person, index) => {
                const isLast = index === followUpPeople.length - 1;

                return (
                  <View key={person.id}>
                    <View className="flex-row items-center px-5 py-2.5">
                      <Pressable
                        onPress={() => openCustomer(person.id)}
                        className="flex-1 flex-row items-center"
                      >
                        <Avatar name={person.name} size="xs" />

                        <View className="ml-3 flex-1">
                          <Text className="text-body font-inter-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
                            {person.name}
                          </Text>
                          <Text className="mt-0.5 text-caption text-textMuted dark:text-textMuted-dark">
                            <Text className="mt-0.5 text-caption" style={{ color: colors.overdue.text }}>
                            {person.daysSince}d overdue
                          </Text>
                          </Text>
                        </View>
                      </Pressable>

                      <View className="w-36 items-end">
                        <MoneyAmount
                          value={person.balance}
                          variant="title"
                          color={colors.textPrimary}
                          className="font-inter-semibold"
                          style={{ fontVariant: ["tabular-nums"] }}
                        />

                        <Pressable
                          className="mt-1 rounded-full bg-search px-3 py-1 dark:bg-search-dark"
                          onPress={() => openRecordPaymentForCustomer(person.id, person.name)}
                        >
                          <Text className="text-primary" style={typography.overline}>
                            COLLECT
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {!isLast ? <View className="ml-16 mr-5 h-px bg-border-soft dark:bg-border-soft-dark" /> : null}
                  </View>
                );
              })
            ) : (
              <View className="px-4 py-5">
                  <Text className="text-card-title text-textPrimary dark:text-textPrimary-dark">Nothing needs action now</Text>
                  <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark">
                    Overdue follow-ups will appear here when customers miss payment timelines.
                  </Text>
                </View>
              )}
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-xl border border-soft bg-surface p-4 dark:border-border-soft-dark dark:bg-surface-dark">
              <Text className="text-textSecondary dark:text-textSecondary-dark" style={typography.overline}>
                NEEDS ACTION NOW
              </Text>
              <Text className="mt-2 text-h2 text-textPrimary dark:text-textPrimary-dark">{overdueTotalCount}</Text>
              <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark">
                {overdueTotalCount === 1 ? "customer overdue" : "customers overdue"}
              </Text>
            </View>

            <View className="flex-1 rounded-xl border border-soft bg-surface p-4 dark:border-border-soft-dark dark:bg-surface-dark">
              <Text className="text-textSecondary dark:text-textSecondary-dark" style={typography.overline}>
                COLLECTED THIS WEEK
              </Text>
              <MoneyAmount
                value={collectedThisWeek}
                showPlusForPositive
                variant="title"
                color={colors.textPrimary}
                style={typography.h2}
                className="mt-2"
              />
              <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark">
                {collectedThisWeek > 0 ? "cashflow improved" : "no collections yet"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={() => router.push("/(main)/entries/create" as never)}
        bottom={spacing.fabBottom}
        right={spacing.fabMargin}
        size={spacing.fabSizeCompact}
      />

      <BottomSheetPicker
        visible={isCustomerPickerOpen}
        onClose={() => setIsCustomerPickerOpen(false)}
        title="Select customer"
        items={pickerPeople}
        isLoading={isPickerLoading}
        isFetchingNextPage={pickerIsFetchingNextPage}
        onEndReached={() => {
          if (pickerHasNextPage) fetchMorePickerPeople();
        }}
        search={customerSearch}
        setSearch={setCustomerSearch}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <Pressable
            className="flex-row items-center rounded-xl border border-soft bg-surface px-4 py-3 dark:border-border-soft-dark dark:bg-surface-dark"
            onPress={() => {
              setIsCustomerPickerOpen(false);
              openRecordPaymentForCustomer(item.id, item.name);
            }}
          >
            <Avatar name={item.name} size="sm" />
            <View className="ml-3 flex-1">
              <Text className="text-body font-inter-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={1}>
                Open to record a payment
              </Text>
            </View>
          </Pressable>
        )}
      />

      {paymentContext ? (
        <RecordCustomerPaymentModal
          ref={paymentSheetRef}
          onSuccess={() => {
            refreshDashboard();
            showToast({ message: "Payment recorded", type: "success" });
            setPaymentContext(null);
          }}
          orderId={paymentContext.orderId}
          balanceDue={paymentContext.balanceDue}
          customerId={paymentContext.customerId}
          customerName={paymentContext.customerName}
          initialAmount={paymentContext.initialAmount}
          onDismiss={() => setPaymentContext(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}
