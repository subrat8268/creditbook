import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import StatusBadge from "@/src/components/dashboard/StatusBadge";
import Loader from "@/src/components/feedback/Loader";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { colors, radius, spacing, typography } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react-native";
import { useMemo } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => {
  const isNegative = value < 0;
  const absolute = Math.abs(value);
  return `${isNegative ? "-" : ""}₹${currencyFormatter.format(absolute)}`;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "KB";

const getAvatarBg = (name: string) => {
  const palette = colors.avatarPalette;
  if (!palette.length) return colors.primary;
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

type OverduePerson = {
  id: string;
  name: string;
  phone?: string;
  balance: number;
  daysSince: number;
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
          paddingBottom: spacing.fabBottom + spacing.fabSize + 56,
        }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          overdueCount={overdueTotalCount}
          onPressNotifications={() => router.push("/(main)/profile" as never)}
          onPressSettings={() => router.push("/(main)/profile" as never)}
        />

        <View style={{ paddingHorizontal: spacing.screenPadding }}>
          <View
            className="mb-4"
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.cardPadding,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: colors.textPrimary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={typography.caption}>Outstanding balance</Text>
            <MoneyAmount
              value={totalOutstanding}
              variant="hero"
              color={colors.textPrimary}
              style={{ marginTop: spacing.xs }}
            />

            <View className="flex-row items-center mt-3 gap-2">
              <StatusBadge status={overdueTotalCount > 0 ? "Overdue" : "Paid"} />
              <Text style={typography.caption}>
                {overdueTotalCount > 0
                  ? `${overdueTotalCount} overdue · ${overduePeople.length} customers`
                  : "All customers are up to date"}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Card
                title="Customers due"
                value={String(overduePeople.length)}
                icon={<AlertCircle size={18} color={colors.warning} strokeWidth={2} />}
              />
            </View>
            <View className="flex-1">
              <Card
                title="Overdue"
                value={String(overdueTotalCount)}
                icon={<ArrowUpRight size={18} color={colors.danger} strokeWidth={2} />}
              />
            </View>
          </View>

          {collectedThisWeek > 0 && (
            <View className="mb-6">
              <Card
                title="Collected this week"
                value={`+${formatCurrency(collectedThisWeek)}`}
                icon={<TrendingUp size={18} color={colors.success} strokeWidth={2} />}
              />
            </View>
          )}

          {overduePeople.length > 0 ? (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text style={typography.sectionTitle}>Top Overdue</Text>
                <TouchableOpacity onPress={() => router.push("/(main)/people" as never)}>
                  <Text className="text-[13px] font-semibold text-primary">See all</Text>
                </TouchableOpacity>
              </View>

              {overduePeople.slice(0, 3).map((person: OverduePerson) => {
                const initials = getInitials(person.name);
                const avatarBg = getAvatarBg(person.name);

                return (
                  <View
                    key={person.id}
                    className="flex-row items-center p-4 mb-3 bg-surface rounded-2xl border border-border"
                  >
                    <TouchableOpacity
                      className="flex-row items-center flex-1"
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push({
                          pathname: "/(main)/people/[customerId]",
                          params: { customerId: person.id },
                        } as never)
                      }
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: avatarBg }}
                      >
                        <Text className="text-[12px] font-bold text-surface">{initials}</Text>
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-[14px] font-bold text-textPrimary"
                          numberOfLines={1}
                        >
                          {person.name}
                        </Text>
                        <Text className="text-[12px] font-semibold text-danger">
                          {formatCurrency(person.balance)}
                        </Text>
                        <Text className="text-[11px] text-textSecondary mt-1">
                          {person.daysSince}d overdue
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="px-3 py-2 rounded-xl bg-danger"
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
                      <Text className="text-[12px] font-bold text-surface">Pay</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <Button
                title="View Customers"
                variant="secondary"
                onPress={() => router.push("/(main)/people" as never)}
              />
            </View>
          ) : (
            <View className="mb-6">
              <Card title="Overdue customers" value="0" />
            </View>
          )}
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
