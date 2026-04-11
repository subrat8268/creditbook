import { useMemo } from "react";
import { ScrollView, View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { colors } from "@/src/utils/theme";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import Loader from "@/src/components/feedback/Loader";
import DashboardHeader from "@/src/components/dashboard/DashboardHeader";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

// Format currency for dashboard totals.
const formatCurrency = (value: number) => {
  const isNegative = value < 0;
  const absolute = Math.abs(value);
  return `${isNegative ? "-" : ""}₹${currencyFormatter.format(absolute)}`;
};

// Build initials for list avatars.
const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "KB";

// Deterministic avatar colors per person.
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
    // Alias for backward compatibility with the existing dashboard hook.
    overdueCustomers: overduePeople,
    overdueTotalCount,
    isLoading,
  } = useDashboard(profile?.id);

  const totalOutstanding = useMemo(() => toReceive ?? 0, [toReceive]);

  if (isLoading || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Loader message="Loading dashboard..." />
      </View>
    );
  }

  return (
    <SafeAreaView testID="dashboard-root" className="flex-1 bg-background" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          overdueCount={overdueTotalCount}
          onPressNotifications={() => router.push("/(main)/notifications" as never)}
          onPressSettings={() => router.push("/(main)/profile" as never)}
        />

        <View className="px-5">
          <View testID="dashboard-stats-card" className="rounded-[24px] bg-surface border border-border p-6 mb-5">
            <Text className="text-[12px] font-semibold text-textSecondary uppercase tracking-[2px]">
              Total Outstanding
            </Text>
            <Text className="text-[36px] font-black text-textPrimary mt-1">
              {formatCurrency(totalOutstanding)}
            </Text>
            <View className="flex-row items-center mt-2">
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: colors.overdue.bg }}
              >
                <Text className="text-[12px] font-bold" style={{ color: colors.overdue.text }}>
                  {overdueTotalCount} overdue
                </Text>
              </View>
            </View>
          </View>

          {/* Primary CTA — keep the home flow focused */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(main)/new-bill" as never)}
            className="flex-row items-center justify-center bg-primary rounded-2xl p-4 mb-6"
          >
            <Plus size={18} color={colors.surface} strokeWidth={2.5} />
            <Text className="text-[15px] font-semibold text-surface ml-2">
              Add Entry
            </Text>
          </TouchableOpacity>

          {overduePeople.length > 0 ? (
            <View testID="dashboard-entries-list" className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[16px] font-extrabold text-textPrimary">
                  Top overdue people
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(main)/customers" as never)}
                >
                  <Text className="text-[13px] font-semibold text-primary">See all people</Text>
                </TouchableOpacity>
              </View>

  {overduePeople.map((person: OverduePerson) => {
                const initials = getInitials(person.name);
                const avatarBg = getAvatarBg(person.name);
                return (
                  <TouchableOpacity
                    key={person.id}
                    className="flex-row items-center p-4 mb-3 bg-surface rounded-2xl border border-border"
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({ pathname: "/(main)/customers/[customerId]", params: { customerId: person.id } } as never)
                    }
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: avatarBg }}
                    >
                      <Text className="text-[13px] font-bold text-surface">{initials}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-textPrimary" numberOfLines={1}>
                        {person.name}
                      </Text>
                      <Text className="text-[12px] font-semibold text-danger mt-0.5">
                        {formatCurrency(person.balance)} • {person.daysSince} days overdue
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
