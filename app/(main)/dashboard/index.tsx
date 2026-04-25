import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import Loader from "@/src/components/feedback/Loader";
import Avatar from "@/src/components/ui/Avatar";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { colors, gradients, spacing, typography } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OverduePerson = {
  id: string;
  name: string;
  phone?: string;
  balance: number;
  daysSince: number;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => {
  const isNegative = value < 0;
  const absolute = Math.abs(value);
  return `${isNegative ? "-" : ""}₹${currencyFormatter.format(absolute)}`;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    toReceive,
    overdueCustomers: overduePeople,
    overdueTotalCount,
    weekDelta,
    isLoading,
  } = useDashboard(profile?.id);

  const totalOutstanding = useMemo(() => toReceive ?? 0, [toReceive]);
  const collectedThisWeek = weekDelta > 0 ? weekDelta : 0;
  const followUpPeople = useMemo(() => overduePeople.slice(0, 5), [overduePeople]);

  const heroSupportText = useMemo(() => {
    if (collectedThisWeek > 0) {
      return `${formatCurrency(collectedThisWeek)} from last week`;
    }

    if (overdueTotalCount > 0) {
      return `${overdueTotalCount} ${overdueTotalCount === 1 ? "customer" : "customers"} need follow-up`;
    }

    return "All customers are up to date";
  }, [collectedThisWeek, overdueTotalCount]);

  const openCustomer = (customerId: string) => {
    router.push({
      pathname: "/(main)/people/[customerId]",
      params: { customerId },
    } as never);
  };

  const recordPayment = (person: OverduePerson) => {
    router.push({
      pathname: "/(main)/entries/create",
      params: {
        customer: JSON.stringify({
          id: person.id,
          name: person.name,
          phone: person.phone,
        }),
        amount: String(person.balance),
      },
    } as never);
  };

  if (isLoading || !profile) {
    return (
      <View className="items-center justify-center bg-background" style={{ flex: 1 }}>
        <Loader message="Loading dashboard..." />
      </View>
    );
  }

  const firstFollowUp = followUpPeople[0];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />

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
            <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-dashboard-hero-orb" />
            <View className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-dashboard-hero-orb" />

            <Text
              className="text-dashboard-hero-text-muted opacity-75"
              style={typography.overline}
            >
              CUSTOMERS OWE YOU
            </Text>

            <MoneyAmount value={totalOutstanding} variant="hero" color={colors.dashboard.heroText} className="mt-1" />

            <View className="mt-2 flex-row items-center">
              <TrendingUp size={14} color={colors.dashboard.heroText} strokeWidth={2.2} />
              <Text className="ml-1.5 text-caption font-inter-medium text-dashboard-hero-text-muted">
                {heroSupportText}
              </Text>
            </View>

            <View className="mt-5 flex-row gap-2">
              <Pressable
                className="flex-1 items-center rounded-full bg-dashboard-hero-chip-bg py-3"
                onPress={() => router.push("/(main)/people" as never)}
              >
                <Text className="text-caption font-inter-semibold text-dashboard-hero-text">View Customers</Text>
              </Pressable>

              <Pressable
                className={`flex-1 items-center rounded-full bg-dashboard-hero-chip-bg py-3 ${firstFollowUp ? "" : "opacity-50"}`}
                onPress={() => (firstFollowUp ? recordPayment(firstFollowUp) : null)}
                disabled={!firstFollowUp}
              >
                <Text className="text-caption font-inter-semibold text-dashboard-hero-text">Record Payment</Text>
              </Pressable>
            </View>
          </LinearGradient>

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1 rounded-xl border border-soft bg-surface p-4 shadow-sm">
              <Text className="text-textSecondary" style={typography.overline}>
                NEEDS ACTION NOW
              </Text>
              <Text className="mt-2 text-h2 text-textPrimary">{overdueTotalCount}</Text>
              <Text className="mt-0.5 text-caption text-textSecondary">
                {overdueTotalCount === 1 ? "customer overdue" : "customers overdue"}
              </Text>
            </View>

            <View className="flex-1 rounded-xl border border-soft bg-surface p-4 shadow-sm">
              <Text className="text-textSecondary" style={typography.overline}>
                COLLECTED THIS WEEK
              </Text>
              <MoneyAmount
                value={collectedThisWeek}
                showPlusForPositive
                variant="title"
                color={collectedThisWeek > 0 ? colors.success : colors.textPrimary}
                style={typography.h2}
                className="mt-2"
              />
              <Text className="mt-0.5 text-caption text-textSecondary">
                {collectedThisWeek > 0 ? "cashflow improved" : "no collections yet"}
              </Text>
            </View>
          </View>

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-section-title text-textPrimary">Recent follow-ups</Text>
            <Pressable onPress={() => router.push("/(main)/people" as never)}>
              <Text className="text-caption font-inter-bold text-primary">See all</Text>
            </Pressable>
          </View>

          <View className="overflow-hidden rounded-xl border border-soft bg-surface">
            {followUpPeople.length > 0 ? (
              followUpPeople.map((person, index) => {
                const hasDivider = index !== followUpPeople.length - 1;

                return (
                  <View
                    key={person.id}
                    className={`flex-row items-center px-4 py-2 ${hasDivider ? "border-b border-light" : ""}`}
                  >
                    <Pressable
                      onPress={() => openCustomer(person.id)}
                      className="mr-2 flex-1 flex-row items-center"
                    >
                      <Avatar name={person.name} size="xs" />
                      <View className="ml-2 flex-1">
                        <Text className="text-body font-inter-medium text-textPrimary" numberOfLines={1}>
                          {person.name}
                        </Text>
                        <Text className="mt-0.5 text-caption text-textSecondary">
                          {person.daysSince}d overdue
                        </Text>
                      </View>
                    </Pressable>

                    <View className="items-end">
                      <MoneyAmount
                        value={person.balance}
                        variant="title"
                        color={colors.dangerStrong}
                        className="font-inter-semibold"
                      />

                      <View className="mt-0.5 flex-row items-center gap-1.5">
                        <View className="rounded-full bg-danger-light px-2 py-0.5">
                          <Text className="text-danger-text" style={typography.overline}>
                            OVERDUE
                          </Text>
                        </View>

                        <Pressable
                          className="rounded-full bg-search px-2 py-0.5"
                          onPress={() => recordPayment(person)}
                        >
                          <Text className="text-primary" style={typography.overline}>
                            PAY
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="px-4 py-5">
                <Text className="text-card-title text-textPrimary">Nothing needs action now</Text>
                <Text className="mt-1 text-caption text-textSecondary">
                  Overdue follow-ups will appear here when customers miss payment timelines.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={() => router.push("/(main)/entries/create" as never)}
        bottom={spacing.fabBottom}
        right={spacing.fabMargin}
        size={spacing.fabSizeCompact}
      />
    </SafeAreaView>
  );
}
