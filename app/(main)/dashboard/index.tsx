import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import StatusBadge from "@/src/components/dashboard/StatusBadge";
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
import { Pressable, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const topOverduePeople = useMemo(() => overduePeople.slice(0, 3), [overduePeople]);

  const heroSubCopy = useMemo(() => {
    if (collectedThisWeek > 0) {
      return `${formatCurrency(collectedThisWeek)} collected this week`;
    }

    if (overdueTotalCount > 0) {
      return `${overdueTotalCount} ${overdueTotalCount === 1 ? "customer" : "customers"} need follow-up`;
    }

    return "All customers are up to date";
  }, [collectedThisWeek, overdueTotalCount]);

  if (isLoading || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Loader message="Loading dashboard..." />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.fabBottom + spacing.fabSize + spacing.tabBarHeight,
        }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          overdueCount={overdueTotalCount}
          showActions={false}
        />

        <View className="px-4">
          <LinearGradient
            colors={[gradients.dashboardHero.start, gradients.dashboardHero.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="relative mb-5 overflow-hidden rounded-xl px-5 py-5"
          >
            <View className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-dashboard-hero-orb" />
            <View className="absolute -bottom-12 right-7 h-24 w-24 rounded-full bg-dashboard-hero-orb" />

            <Text className="tracking-wider text-dashboard-hero-text-muted" style={typography.label}>
              CUSTOMERS OWE YOU
            </Text>

            <MoneyAmount
              value={totalOutstanding}
              variant="hero"
              color={colors.dashboard.heroText}
              className="mt-1"
            />

            <View className="mt-1 flex-row items-center gap-1">
              <TrendingUp size={14} color={colors.dashboard.heroText} strokeWidth={2.2} />
              <Text className="text-body font-inter-semibold text-dashboard-hero-text">
                {heroSubCopy}
              </Text>
            </View>

            <View className="mt-4 flex-row items-center gap-2">
              <View className="flex-1 rounded-full border border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg px-3 py-2">
                <Text className="text-center text-caption font-inter-semibold text-dashboard-hero-text">
                  {overdueTotalCount > 0
                    ? `${overdueTotalCount} ${overdueTotalCount === 1 ? "customer" : "customers"} need action`
                    : "Nothing needs action now"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(main)/people" as never)}
                className="rounded-full border border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg px-4 py-2"
              >
                <Text className="text-caption font-inter-bold text-dashboard-hero-text">View all</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View className="mb-3 flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-section-title text-textPrimary">Needs action now</Text>
              <Text className="mt-1 text-caption text-textSecondary">
                Start with the most overdue customers and record payments fast.
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(main)/people" as never)}>
              <Text className="mt-0.5 text-caption font-inter-bold text-primary">View all</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4 overflow-hidden rounded-xl border border-border bg-surface">
            {topOverduePeople.length > 0 ? (
              topOverduePeople.map((person, index) => (
                <View
                  key={person.id}
                  className={`flex-row items-center gap-2 px-4 py-3 ${index !== topOverduePeople.length - 1 ? "border-b border-light" : ""}`}
                >
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(main)/people/[customerId]",
                        params: { customerId: person.id },
                      } as never)
                    }
                    className="flex-1 flex-row items-center"
                  >
                    <Avatar name={person.name} size="sm" />
                    <View className="ml-3 flex-1">
                      <Text className="text-card-title text-textPrimary" numberOfLines={1}>
                        {person.name}
                      </Text>
                      <Text className="mt-0.5 text-caption text-textSecondary">
                        {person.daysSince}d overdue · Tap to open customer
                      </Text>
                    </View>
                  </Pressable>

                  <View className="ml-2 items-end gap-1">
                    <MoneyAmount
                      value={person.balance}
                      variant="title"
                      color={colors.dangerStrong}
                      className="font-inter-bold"
                    />
                    <StatusBadge status="Overdue" />
                    <TouchableOpacity
                      className="rounded-full bg-primary px-3 py-1.5"
                      onPress={() =>
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
                        } as never)
                      }
                    >
                      <Text className="text-caption font-inter-bold text-surface">Record payment</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="px-4 py-5">
                <Text className="text-card-title text-textPrimary">Nothing needs action now</Text>
                <Text className="mt-1 text-caption text-textSecondary">
                  Your overdue customers list is clear. New overdue entries will appear here.
                </Text>
              </View>
            )}
          </View>

          {collectedThisWeek > 0 ? (
            <View className="mb-4 rounded-xl border border-border bg-surface px-4 py-3">
              <Text className="text-textSecondary" style={typography.label}>
                Collected this week
              </Text>
              <MoneyAmount
                value={collectedThisWeek}
                showPlusForPositive
                variant="title"
                color={colors.success}
                className="mt-1 font-inter-bold"
              />
              <Text className="mt-1 text-caption text-textSecondary">
                Keep this momentum with timely payment follow-up.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={() => router.push("/(main)/entries/create" as never)}
        bottom={spacing.fabBottom}
        right={spacing.fabMargin}
      />
    </SafeAreaView>
  );
}
