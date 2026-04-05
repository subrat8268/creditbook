import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  Bell,
  Settings,
  ChevronRight,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import { colors, gradients } from "@/src/utils/theme";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import Loader from "@/src/components/feedback/Loader";

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { totalReceivables, overdueCustomers, recentActivity, isLoading } =
    useDashboard(profile?.id);

  if (isLoading || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Loader message="Loading dashboard..." />
      </View>
    );
  }

  const handleReminder = (name: string) => {
    Alert.alert("Reminder Sent", `A WhatsApp reminder has been sent to ${name}.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />

      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-background">
        <View>
          <Text className="text-[14px] text-textSecondary font-semibold">
            Digital Khata
          </Text>
          <Text className="text-[22px] font-extrabold text-textPrimary mt-0.5">
            {profile?.business_name || "My Business"}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(main)/notifications" as any)}
            className="p-2 bg-surface rounded-full border border-border"
          >
            <Bell size={22} className="text-textSecondary" strokeWidth={2.2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(main)/profile" as any)}
            className="p-2 bg-surface rounded-full border border-border"
          >
            <Settings size={22} className="text-textSecondary" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION: NET CARD */}
        <View className="px-5 mt-2 mb-8">
          <View className="p-6 rounded-[24px] shadow-sm" style={{ backgroundColor: gradients.netPosition }}>
            <Text className="text-[14px] font-bold text-surface opacity-90 uppercase tracking-widest mb-1">
              Customers Owe You
            </Text>
            <Text className="text-[42px] font-black text-surface tracking-tight">
              ₹{totalReceivables.toLocaleString("en-IN")}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(main)/customers" as any)}
              className="flex-row items-center mt-6 py-3 px-5 bg-surface/20 rounded-xl self-start"
            >
              <Text className="text-[14px] font-bold text-surface mr-2">
                View Customer Ledger
              </Text>
              <ChevronRight size={16} className="text-surface" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PENDING FOLLOW-UPS */}
        {overdueCustomers && overdueCustomers.length > 0 && (
          <View className="px-5 mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-extrabold text-textPrimary">
                Pending Follow-ups
              </Text>
              <View className="px-2.5 py-1 bg-dangerLight rounded-lg">
                <Text className="text-[12px] font-bold text-danger">
                  {overdueCustomers.length} Overdue
                </Text>
              </View>
            </View>

            {overdueCustomers.map((customer) => (
              <View
                key={customer.id}
                className="flex-row items-center justify-between p-4 mb-3 bg-surface rounded-2xl border border-border"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-dangerLight items-center justify-center mr-3">
                    <AlertCircle size={22} className="text-danger" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text className="text-[16px] font-bold text-textPrimary mb-0.5" numberOfLines={1}>
                      {customer.name}
                    </Text>
                    <Text className="text-[13px] font-semibold text-danger">
                      ₹{customer.balance.toLocaleString("en-IN")} • {customer.daysSince} days ago
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleReminder(customer.name)}
                  className="px-4 py-2 bg-textPrimary rounded-xl"
                >
                  <Text className="text-[13px] font-bold text-surface">
                    Remind
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* RECENT ACTIVITY TIMELINE */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-extrabold text-textPrimary">
              Recent Activity
            </Text>
            <TouchableOpacity onPress={() => router.push("/(main)/orders" as never)}>
              <Text className="text-[14px] font-bold text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          {recentActivity.length === 0 ? (
            <View className="p-6 items-center justify-center bg-surface rounded-2xl border border-border">
              <Text className="text-[14px] text-textSecondary font-semibold">
                No recent activity yet.
              </Text>
            </View>
          ) : (
            <View className="bg-surface rounded-[24px] border border-border overflow-hidden">
              {recentActivity.map((activity, index) => {
                const isPayment = activity.type === "payment";
                const isLast = index === recentActivity.length - 1;

                return (
                  <View
                    key={activity.id}
                    className={`flex-row items-center p-4 ${
                      !isLast ? "border-b border-border" : ""
                    }`}
                  >
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${
                        isPayment ? "bg-successBg" : "bg-primaryLight"
                      }`}
                    >
                      {isPayment ? (
                        <ArrowDownLeft size={22} className="text-success" strokeWidth={2.5} />
                      ) : (
                        <ArrowUpRight size={22} className="text-primary" strokeWidth={2.5} />
                      )}
                    </View>

                    <View className="flex-1 mr-2">
                      <Text className="text-[16px] font-bold text-textPrimary" numberOfLines={1}>
                        {activity.name}
                      </Text>
                      <Text className="text-[13px] text-textSecondary mt-0.5">
                        {activity.title}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        className={`text-[15px] font-extrabold ${
                          isPayment ? "text-success" : "text-textPrimary"
                        }`}
                      >
                        {isPayment ? "+" : ""}₹{activity.amount.toLocaleString("en-IN")}
                      </Text>
                      <Text className="text-[12px] text-textSecondary mt-0.5">
                        {new Date(activity.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        onPress={() => router.push("/(main)/orders/create" as any)}
        activeOpacity={0.8}
        className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg elevation-xl"
        style={{
          shadowColor: colors.fab, // Explicitly mapped to tokens
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Plus size={30} className="text-surface" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
