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
import { dashboardPalette as C, formatINR } from "../utils/dashboardUi";

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
  const isBothMode = mode === "both";
  const isVendorMode = ["vendor", "seller", "wholesaler", "retailer"].includes(
    mode,
  );

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
        {isBothMode ? (
          <View
            style={{
              backgroundColor: C.white,
              borderRadius: 24,
              padding: 20,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Split row */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              {/* Customers owe me */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#F0FDF4",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    letterSpacing: 1,
                    color: "#16A34A",
                    fontWeight: "700",
                    marginBottom: 6,
                  }}
                >
                  YOU RECEIVE
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: "#16A34A",
                    letterSpacing: -0.3,
                  }}
                >
                  {formatINR(data.customersOweMe)}
                </Text>
              </View>

              {/* I owe suppliers */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FEF2F2",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    letterSpacing: 1,
                    color: "#DC2626",
                    fontWeight: "700",
                    marginBottom: 6,
                  }}
                >
                  YOU OWE
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: "#DC2626",
                    letterSpacing: -0.3,
                  }}
                >
                  {formatINR(data.iOweSuppliers)}
                </Text>
              </View>
            </View>

            {/* Net Position */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#F6F7FB",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#636366",
                  letterSpacing: 0.4,
                }}
              >
                NET POSITION
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: data.netPosition >= 0 ? "#16A34A" : "#DC2626",
                  letterSpacing: -0.3,
                }}
              >
                {data.netPosition >= 0 ? "+" : ""}
                {formatINR(data.netPosition)}
              </Text>
            </View>
          </View>
        ) : (
          <DashboardHeroCard label={heroLabel} amount={heroAmount} />
        )}

        <DashboardActionBar
          onViewReport={() => router.push("/(main)/reports" as any)}
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
        <Plus size={26} color="#fff" strokeWidth={2.5} />
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
