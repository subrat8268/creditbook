import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import StatusBadge from "@/src/components/dashboard/StatusBadge";
import Loader from "@/src/components/feedback/Loader";
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { colors, radius, spacing, typography } from "@/src/utils/theme";
import { useRouter } from "expo-router";
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
          showActions={false}
        />

        <View style={{ paddingHorizontal: spacing.screenPadding }}>
          <View
            className="mb-5"
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.cardPadding,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: colors.textPrimary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <Text
              style={[
                typography.label,
                {
                  color: colors.primary,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              Total outstanding
            </Text>
            <MoneyAmount
              value={totalOutstanding}
              variant="hero"
              color={colors.textPrimary}
            />
            <Text
              style={[
                typography.body,
                {
                  color: colors.textSecondary,
                  marginTop: spacing.sm,
                },
              ]}
            >
              {overdueTotalCount > 0
                ? `${overdueTotalCount} overdue ${overdueTotalCount === 1 ? "customer needs" : "customers need"} follow-up first.`
                : "All customers are up to date right now."}
            </Text>

            <View className="flex-row items-center mt-4 gap-2">
              <StatusBadge status={overdueTotalCount > 0 ? "Overdue" : "Paid"} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}> 
                {overdueTotalCount > 0
                  ? `${overdueTotalCount} overdue total`
                  : "Nothing urgent to clear"}
              </Text>
            </View>
          </View>

          {overduePeople.length > 0 ? (
            <View className="mb-6">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-4">
                  <Text style={typography.sectionTitle}>Needs action now</Text>
                  <Text style={[typography.caption, { marginTop: spacing.xs }]}>
                    Start with the most overdue customers and record collections as they happen.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/(main)/people" as never)}>
                  <Text className="text-[13px] font-semibold text-primary">View all</Text>
                </TouchableOpacity>
              </View>

              {overduePeople.slice(0, 3).map((person: OverduePerson) => {
                const initials = getInitials(person.name);
                const avatarBg = getAvatarBg(person.name);

                return (
                  <View
                    key={person.id}
                    className="flex-row items-center p-4 mb-3 bg-surface rounded-2xl border border-border"
                    style={{
                      shadowColor: colors.textPrimary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
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
                          {person.daysSince}d overdue · Tap to open customer
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="px-3 py-2 rounded-xl"
                      style={{ backgroundColor: colors.primary }}
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
                      <Text className="text-[12px] font-bold text-surface">Record payment</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="mb-6">
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  padding: spacing.cardPadding,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={typography.sectionTitle}>Nothing needs action now</Text>
                <Text style={[typography.caption, { marginTop: spacing.xs }]}>
                  Your overdue customers list is clear. Use the add-entry button when you need to record a new entry.
                </Text>
              </View>
            </View>
          )}

          {collectedThisWeek > 0 && (
            <View
              className="mb-6"
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.cardPadding,
                paddingVertical: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={typography.caption}>Collected this week</Text>
              <Text
                style={[
                  typography.cardTitle,
                  {
                    color: colors.success,
                    marginTop: spacing.xs,
                  },
                ]}
              >
                +{formatCurrency(collectedThisWeek)}
              </Text>
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
