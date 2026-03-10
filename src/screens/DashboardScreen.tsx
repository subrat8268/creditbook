import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import NewCustomerModal from "../components/customers/NewCustomerModal";
import DashboardActionBar from "../components/dashboard/DashboardActionBar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardHeroCard from "../components/dashboard/DashboardHeroCard";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";
import DashboardStatCards from "../components/dashboard/DashboardStatCards";
import EmptyState from "../components/feedback/EmptyState";
import Loader from "../components/feedback/Loader";
import { useAddCustomer } from "../hooks/useCustomer";
import { useDashboard } from "../hooks/useDashboard";
import { useAuthStore } from "../store/authStore";
import { formatINR } from "../utils/dashboardUi";

// ─────────────── Main Screen ────────────
export const DashboardScreen = () => {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { data, isLoading, isError } = useDashboard(profile?.id);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const addCustomerMutation = useAddCustomer(profile?.id ?? "");

  const handleAddCustomer = async (values: {
    name: string;
    phone: string;
    address: string;
  }) => {
    try {
      await addCustomerMutation.mutateAsync(values);
      setIsCustomerModalOpen(false);
    } catch (err: any) {
      console.error("Failed to add customer:", err);
    }
  };

  if (!profile || isLoading) return <Loader />;
  if (isError || !data)
    return <EmptyState message="Failed to load dashboard data" />;

  const mode = profile.dashboard_mode ?? "seller";
  const isBothMode = mode === "both";
  const isSellerMode = mode === "seller";
  const isDistributor = mode === "distributor";

  const heroAmount = isSellerMode ? data.customersOweMe : data.iOweSuppliers;
  // Label is written as the customer reads it, not in abstract financial terms
  const heroLabel = isSellerMode ? "CUSTOMERS OWE YOU" : "YOU OWE SUPPLIERS";

  const businessName = profile.business_name ?? profile.name ?? "My Business";
  const roleLabel =
    mode === "distributor"
      ? "CreditBook Distributor"
      : mode === "both"
        ? "CreditBook Business"
        : "CreditBook Seller";

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F9" />

      <DashboardHeader
        overdueCount={data.overdueCustomers}
        onPressSettings={() => router.push("/(main)/profile")}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {isBothMode ? (
          <View
            className="bg-white rounded-3xl p-5 mb-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Split row */}
            <View className="flex-row gap-3 mb-3">
              {/* Customers owe me */}
              <View className="flex-1 bg-success-bg rounded-2xl p-4">
                <Text className="text-[10px] tracking-widest text-primary-dark font-bold mb-1.5">
                  YOU RECEIVE
                </Text>
                <Text className="text-[22px] font-extrabold text-primary-dark tracking-tight">
                  {formatINR(data.customersOweMe)}
                </Text>
              </View>

              {/* I owe suppliers */}
              <View className="flex-1 bg-danger-bg rounded-2xl p-4">
                <Text className="text-[10px] tracking-widest text-danger-strong font-bold mb-1.5">
                  YOU OWE
                </Text>
                <Text className="text-[22px] font-extrabold text-danger-strong tracking-tight">
                  {formatINR(data.iOweSuppliers)}
                </Text>
              </View>
            </View>

            {/* Net Position */}
            <View className="flex-row justify-between items-center bg-background rounded-xl px-4 py-2.5">
              <Text className="text-[13px] font-semibold text-textPrimary tracking-wide">
                NET POSITION
              </Text>
              <Text
                className="text-lg font-extrabold tracking-tight"
                style={{
                  color: data.netPosition >= 0 ? "#16A34A" : "#DC2626",
                }}
              >
                {data.netPosition >= 0 ? "+" : ""}
                {formatINR(data.netPosition)}
              </Text>
            </View>
          </View>
        ) : (
          <DashboardHeroCard
            label={heroLabel}
            amount={heroAmount}
            onViewReport={() => router.push("/(main)/reports" as any)}
            onSendReminder={() => {
              // TODO(v3.6): bulk WhatsApp reminder via Business API
            }}
          />
        )}

        {/* ActionBar only shown in "both" mode — seller/distributor use embedded buttons */}
        {isBothMode && (
          <DashboardActionBar
            onViewReport={() => router.push("/(main)/reports" as any)}
          />
        )}

        <DashboardStatCards
          activeBuyers={data.activeBuyers}
          overdueCustomers={data.overdueCustomers}
        />

        <DashboardRecentActivity
          items={data.recentActivity}
          onViewAll={() => router.push("/(main)/orders" as any)}
        />
      </ScrollView>

      <Pressable
        className="absolute items-center justify-center bg-primary rounded-full"
        style={{
          bottom: 96,
          right: 24,
          width: 58,
          height: 58,
          shadowColor: "#22C55E",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={() => router.push("/orders/createOrderScreen")}
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

      <NewCustomerModal
        visible={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleAddCustomer}
        loading={addCustomerMutation.isPending}
        errorMessage={addCustomerMutation.error?.message}
      />
    </View>
  );
};
