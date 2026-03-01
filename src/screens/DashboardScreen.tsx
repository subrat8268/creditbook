import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import NewCustomerModal from "../components/customers/NewCustomerModal";
import EmptyState from "../components/feedback/EmptyState";
import Loader from "../components/feedback/Loader";
import QuickAction from "../components/QuickAction";
import Screen from "../components/ScreenWrapper";
import Card from "../components/ui/Card";
import { useAddCustomer } from "../hooks/useCustomer";
import { useDashboard } from "../hooks/useDashboard";
import { useAuthStore } from "../store/authStore";

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

  const mode = profile.dashboard_mode ?? "both";
  const showSeller = mode === "seller" || mode === "both";
  const showDistributor = mode === "distributor" || mode === "both";
  const showNet = mode === "both";

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-semibold mb-4">Financial Overview</Text>

        {/* Net Position Cards */}
        {(showSeller || showDistributor) && (
          <View className="flex gap-y-3 mb-6">
            {showSeller && (
              <Card
                title="Customers Owe Me"
                value={`₹ ${data.customersOweMe.toLocaleString("en-IN")}`}
                icon={
                  <Ionicons
                    name="trending-up-outline"
                    size={20}
                    color="white"
                  />
                }
                className="bg-green-50 border border-green-200"
              />
            )}
            {showDistributor && (
              <Card
                title="I Owe Suppliers"
                value={`₹ ${data.iOweSuppliers.toLocaleString("en-IN")}`}
                icon={
                  <Ionicons
                    name="trending-down-outline"
                    size={20}
                    color="white"
                  />
                }
                className="bg-red-50 border border-red-200"
              />
            )}
            {showNet && (
              <Card
                title="Net Position"
                value={`₹ ${data.netPosition.toLocaleString("en-IN")}`}
                icon={
                  <Ionicons
                    name="swap-vertical-outline"
                    size={20}
                    color="white"
                  />
                }
                className={
                  data.netPosition >= 0
                    ? "bg-green-100 border border-green-300"
                    : "bg-amber-50 border border-amber-300"
                }
              />
            )}
          </View>
        )}

        {/* Financial Cards */}
        <View className="flex gap-y-4 mb-6">
          <Card
            title="Total Revenue"
            value={`₹ ${data?.totalRevenue.toLocaleString()}`}
            icon={<Ionicons name="business-outline" size={20} color="white" />}
          />
          <Card
            title="Outstanding Amount"
            value={`₹ ${data?.outstandingAmount.toLocaleString()}`}
            icon={<Ionicons name="cash-outline" size={20} color="white" />}
          />
          <Card
            title="Unpaid Orders"
            value={`${data?.unpaidOrders} Orders`}
            icon={
              <Ionicons name="alert-circle-outline" size={20} color="white" />
            }
          />
          <Card
            title="Partial Orders"
            value={`${data?.partialOrders} Orders`}
            icon={
              <Ionicons name="alert-circle-outline" size={20} color="white" />
            }
          />
          <Card
            title="Overdue Customers"
            value={`${data?.overdueCustomers} Customers`}
            icon={<Ionicons name="time-outline" size={20} color="#dc2626" />}
            className="bg-red-50 border border-red-200"
          />
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold mb-4">Quick Actions</Text>
        <View className="flex gap-y-4">
          <QuickAction
            label="New Order"
            icon={<Ionicons name="cart-outline" size={28} color="green" />}
            onPress={() => router.push("/orders/createOrderScreen")}
          />
          <QuickAction
            label="Add Customer"
            icon={
              <Ionicons name="person-add-outline" size={28} color="green" />
            }
            onPress={() => setIsCustomerModalOpen(true)}
          />
          <QuickAction
            label="My Profile"
            icon={<Ionicons name="card-outline" size={28} color="green" />}
            onPress={() => router.push("/(main)/profile")}
          />
        </View>
      </ScrollView>

      {/* Customer Modal */}
      <NewCustomerModal
        visible={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleAddCustomer}
        loading={addCustomerMutation.isPending}
        errorMessage={addCustomerMutation.error?.message}
      />
    </Screen>
  );
};
