import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import Loader from "@/src/components/feedback/Loader";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useMemo } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          overdueCount={overdueTotalCount}
          onPressNotifications={() =>
            router.push("/(main)/profile" as never)
          }
          onPressSettings={() => router.push("/(main)/profile" as never)}
        />

        <View className="px-5">
          {/* Hero Card - Simple */}
          <View 
            className="rounded-[24px] p-6 mb-5"
            style={{
              backgroundColor: totalOutstanding > 0 ? colors.danger : colors.primary,
            }}
          >
            <Text className="text-[12px] font-semibold text-white/80 uppercase tracking-[2px]">
              Total Outstanding
            </Text>
            <Text className="text-[40px] font-black text-white mt-1">
              {formatCurrency(totalOutstanding)}
            </Text>
            
            {totalOutstanding > 0 && (
              <View className="flex-row items-center mt-3">
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Text className="text-[12px] font-bold text-white">
                    {overdueTotalCount} overdue
                  </Text>
                </View>
              </View>
            )}
            
            {totalOutstanding === 0 && (
              <Text className="text-[14px] text-white/80 mt-2">
                All clear!
              </Text>
            )}
          </View>

          {/* Primary CTA — keep the home flow focused */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(main)/entries/create" as never)}
            className="flex-row items-center justify-center bg-primary rounded-2xl p-4 mb-6"
          >
            <Plus size={18} color={colors.surface} strokeWidth={2.5} />
            <Text className="text-[15px] font-semibold text-surface ml-2">
              Add Entry
            </Text>
          </TouchableOpacity>

{overduePeople.length > 0 ? (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[16px] font-extrabold text-textPrimary">
                  Top Overdue
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(main)/people" as never)}
                >
                  <Text className="text-[13px] font-semibold text-primary">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Top 3 only - with quick pay */}
              {overduePeople.slice(0, 3).map((person: OverduePerson) => {
                const initials = getInitials(person.name);
                const avatarBg = getAvatarBg(person.name);
                return (
                  <View
                    key={person.id}
                    className="flex-row items-center p-3 mb-3 bg-surface rounded-2xl border border-border"
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
                        <Text className="text-[12px] font-bold text-surface">
                          {initials}
                        </Text>
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
                      </View>
                    </TouchableOpacity>
                    
                    {/* Quick Payment button */}
                    <TouchableOpacity
                      className="px-3 py-2 rounded-lg bg-danger"
                      onPress={() =>
                        router.push({
                          pathname: "/(main)/entries/create",
                          params: {
                            customer: JSON.stringify({
                              id: person.id,
                              name: person.name,
                              phone: person.phone,
                            }),
                          },
                        } as never)
                      }
                    >
                      <Text className="text-[12px] font-bold text-surface">
                        Pay
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            /* No overdue - show empty state */
            <View className="bg-surface rounded-2xl p-6 mb-6 items-center">
              <Text className="text-[15px] text-textSecondary">
                No overdue balances
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
