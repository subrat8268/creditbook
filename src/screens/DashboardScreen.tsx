import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, View } from "react-native";
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
import { dashboardPalette as C } from "../utils/dashboardUi";

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

  const mode = profile.dashboard_mode ?? profile.role ?? "vendor";
  const isVendorMode = [
    "vendor",
    "seller",
    "wholesaler",
    "retailer",
    "both",
  ].includes(mode);

  const heroAmount = isVendorMode ? data.customersOweMe : data.iOweSuppliers;
  const heroLabel = isVendorMode ? "YOU WILL RECEIVE" : "YOU OWE";

  const businessName = profile.business_name ?? profile.name ?? "My Business";
  const roleLabel =
    mode === "wholesaler"
      ? "CreditBook Wholesaler"
      : mode === "retailer"
        ? "CreditBook Retailer"
        : mode === "user"
          ? "CreditBook User"
          : "CreditBook Seller";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <DashboardHeader
        businessName={businessName}
        roleLabel={roleLabel}
        onPressSettings={() => router.push("/(main)/profile")}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeroCard label={heroLabel} amount={heroAmount} />

        <DashboardActionBar
          onViewReport={() => router.push("/(main)/export" as any)}
        />

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
        style={{
          position: "absolute",
          bottom: 96,
          right: 24,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: C.blue,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: C.blue,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={() => router.push("/orders/createOrderScreen")}
      >
        <Ionicons name="add" size={28} color="#fff" />
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
