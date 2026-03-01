import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { useCustomerDetail } from "@/src/hooks/useCustomer";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Linking, Text, TouchableOpacity, View } from "react-native";

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { data: customer, isLoading, isError } = useCustomerDetail(customerId);
  const profile = useAuthStore((s) => s.profile);

  const sendWhatsAppReminder = () => {
    if (!customer) return;
    const businessName = profile?.business_name || "our store";
    const balance = customer.outstandingBalance.toLocaleString("en-IN");
    const message = `Dear ${customer.name}, your outstanding balance with ${businessName} is ₹${balance}. Please arrange payment. Thank you.`;
    const url = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  if (isLoading) return <Loader />;
  if (isError || !customer) return <EmptyState message="Customer not found" />;

  const renderHeader = () => (
    <View>
      {/* Overdue Warning Banner */}
      {customer.isOverdue && (
        <View className="flex-row items-center gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-3 mb-4">
          <Ionicons name="warning-outline" size={18} color="#dc2626" />
          <Text className="text-red-700 font-inter-medium text-sm flex-1">
            Last billed {customer.daysSinceLastOrder} days ago — payment overdue
          </Text>
        </View>
      )}

      {/* Customer Info */}
      <View className="flex rounded-lg p-4 border-neutral-300 border gap-3 mb-4">
        <View className="flex-row items-center gap-4">
          <Ionicons name="person-circle-outline" size={64} color="gray" />
          <View>
            <Text className="text-2xl text-neutral-900 font-inter-bold">
              {customer.name}
            </Text>
            <Text className="text-neutral-600 font-inter">
              {customer.phone}
            </Text>
          </View>
        </View>

        {customer.address && (
          <View className="flex-row items-center rounded-lg border-neutral-300 border p-2">
            <Ionicons
              name="location-outline"
              className="mr-2"
              size={20}
              color="#171A1FFF"
            />
            <Text className="text-gray-900 text-lg font-inter-semibold">
              {customer.address}
            </Text>
          </View>
        )}
      </View>

      {/* Outstanding Balance */}
      <View className="flex gap-2 justify-between border border-neutral-300 rounded-lg p-4 mb-6">
        <Text className="text-xl font-inter-semibold text-neutral-900">
          Outstanding Balance
        </Text>
        <Text className="text-3xl text-primary font-inter-bold">
          ₹ {customer?.outstandingBalance.toLocaleString()}
        </Text>

        {/* Send Reminder Button */}
        {customer.outstandingBalance > 0 && (
          <TouchableOpacity
            onPress={sendWhatsAppReminder}
            className="flex-row items-center justify-center gap-2 bg-green-500 rounded-lg py-3 mt-2"
          >
            <Ionicons name="logo-whatsapp" size={18} color="white" />
            <Text className="text-white font-inter-semibold text-sm">
              Send Reminder
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Order History Header */}
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-inter-semibold">Order History</Text>
        <FloatingActionButton
          className="bg-primary flex-row items-center gap-2 py-3 px-4 rounded-lg"
          text="Add New Order"
          icon={<Ionicons name="add" size={16} color="white" />}
          onPress={() => {
            router.push({
              pathname: "/orders/create",
              params: { customer: JSON.stringify(customer) },
            });
          }}
        />
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <FlatList
        data={customer.orders}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between border border-neutral-300 p-4 rounded-lg mb-4">
            <View className="flex-col gap-1">
              <Text className="font-inter-medium text-neutral-900">
                Order on {new Date(item.created_at).toDateString()}
              </Text>
              <Text className="text-neutral-600 text-sm font-inter">
                ID: {item.id.slice(0, 9)}...
              </Text>
            </View>
            <View className="flex-col items-end gap-1">
              <Text className="text-lg font-inter-semibold text-neutral-900">
                ₹ {item.amount.toLocaleString()}
              </Text>
              <Text
                className={` py-1.5 rounded-full text-xs font-inter ${
                  item.status === "Paid"
                    ? "text-neutral-900"
                    : "bg-secondary text-white px-3"
                }`}
              >
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </ScreenWrapper>
  );
}
