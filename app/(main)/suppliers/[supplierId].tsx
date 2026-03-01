import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import RecordDeliveryModal from "@/src/components/suppliers/RecordDeliveryModal";
import RecordPaymentMadeModal from "@/src/components/suppliers/RecordPaymentMadeModal";
import {
    useRecordDelivery,
    useRecordPaymentMade,
    useSupplierDetail,
} from "@/src/hooks/useSuppliers";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function SupplierDetailScreen() {
  const { supplierId } = useLocalSearchParams<{ supplierId: string }>();
  const profile = useAuthStore((s) => s.profile);

  const { data: supplier, isLoading, isError } = useSupplierDetail(supplierId);

  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const recordDelivery = useRecordDelivery(profile?.id ?? "", supplierId ?? "");
  const recordPayment = useRecordPaymentMade(
    profile?.id ?? "",
    supplierId ?? "",
  );

  if (isLoading) return <Loader />;
  if (isError || !supplier) return <EmptyState message="Supplier not found" />;

  const renderHeader = () => (
    <View>
      {/* Supplier Info */}
      <View className="rounded-lg p-4 border border-neutral-300 gap-3 mb-4">
        <View className="flex-row items-center gap-4">
          <View className="w-14 h-14 rounded-full bg-amber-100 items-center justify-center">
            <Ionicons name="business-outline" size={28} color="#d97706" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl text-neutral-900 font-inter-bold">
              {supplier.name}
            </Text>
            {supplier.phone ? (
              <Text className="text-neutral-600 font-inter">
                {supplier.phone}
              </Text>
            ) : null}
            {supplier.basket_mark ? (
              <Text className="text-neutral-400 text-sm font-inter">
                Mark: {supplier.basket_mark}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Bank details */}
        {supplier.bank_name ? (
          <View className="bg-neutral-50 rounded-lg p-3 gap-1">
            <Text className="text-xs font-inter-semibold text-neutral-500 uppercase tracking-wide">
              Bank Details
            </Text>
            <Text className="font-inter-medium text-neutral-800">
              {supplier.bank_name}
            </Text>
            {supplier.account_number ? (
              <Text className="font-inter text-neutral-600 text-sm">
                A/c: {supplier.account_number}
              </Text>
            ) : null}
            {supplier.ifsc_code ? (
              <Text className="font-inter text-neutral-600 text-sm">
                IFSC: {supplier.ifsc_code}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Balance Owed */}
      <View className="flex gap-2 border border-red-200 bg-red-50 rounded-lg p-4 mb-4">
        <Text className="text-xl font-inter-semibold text-neutral-900">
          Balance You Owe
        </Text>
        <Text
          className={`text-3xl font-inter-bold ${
            supplier.totalOwed > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          ₹ {supplier.totalOwed.toLocaleString("en-IN")}
        </Text>

        {supplier.totalOwed > 0 && (
          <TouchableOpacity
            onPress={() => setPaymentModalOpen(true)}
            className="flex-row items-center justify-center gap-2 bg-primary rounded-lg py-3 mt-1"
          >
            <Ionicons name="cash-outline" size={18} color="white" />
            <Text className="text-white font-inter-semibold text-sm">
              Record Payment
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Deliveries Header */}
      <Text className="text-xl font-inter-semibold text-neutral-900 mb-3">
        Delivery History
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <FlatList
        data={supplier.deliveries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState message="No deliveries recorded yet" />}
        renderItem={({ item }) => (
          <View className="border border-neutral-200 rounded-xl p-4 mb-3 bg-white">
            {/* Delivery header row */}
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-inter-medium text-neutral-900">
                {new Date(item.delivery_date).toDateString()}
              </Text>
              <Text className="font-inter-bold text-neutral-900 text-base">
                ₹{Number(item.total_amount).toLocaleString("en-IN")}
              </Text>
            </View>

            {/* Items list */}
            {(item.items ?? []).map((it, idx) => (
              <View
                key={idx}
                className="flex-row justify-between py-1 border-b border-neutral-100"
              >
                <Text className="text-neutral-600 font-inter text-sm flex-1">
                  {it.item_name}
                </Text>
                <Text className="text-neutral-500 text-sm font-inter">
                  {it.quantity} × ₹{it.rate} ={" "}
                  <Text className="text-neutral-800 font-inter-medium">
                    ₹
                    {((it.quantity ?? 0) * (it.rate ?? 0)).toLocaleString(
                      "en-IN",
                    )}
                  </Text>
                </Text>
              </View>
            ))}

            {/* Charges/advance row */}
            <View className="flex-row justify-between mt-2 pt-2 border-t border-neutral-100">
              {Number(item.loading_charge) > 0 ? (
                <Text className="text-neutral-500 text-xs font-inter">
                  Loading: ₹
                  {Number(item.loading_charge).toLocaleString("en-IN")}
                </Text>
              ) : (
                <View />
              )}
              {Number(item.advance_paid) > 0 ? (
                <Text className="text-green-600 text-xs font-inter-medium">
                  Advance paid: ₹
                  {Number(item.advance_paid).toLocaleString("en-IN")}
                </Text>
              ) : null}
            </View>

            {item.notes ? (
              <Text className="text-neutral-400 text-xs font-inter mt-1">
                {item.notes}
              </Text>
            ) : null}
          </View>
        )}
      />

      {/* FAB — Record Delivery */}
      <FloatingActionButton
        className="absolute bottom-6 right-6 bg-primary rounded-full p-4 shadow-lg"
        icon={<Ionicons name="add" size={24} color="white" />}
        onPress={() => setDeliveryModalOpen(true)}
      />

      {/* Record Delivery Modal */}
      <RecordDeliveryModal
        visible={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        loading={recordDelivery.isPending}
        onSubmit={async (data) => {
          await recordDelivery.mutateAsync(data);
          setDeliveryModalOpen(false);
          Alert.alert("Success", "Delivery recorded successfully.");
        }}
      />

      {/* Record Payment Modal */}
      <RecordPaymentMadeModal
        visible={paymentModalOpen}
        balanceOwed={supplier.totalOwed}
        onClose={() => setPaymentModalOpen(false)}
        loading={recordPayment.isPending}
        onSubmit={async (data) => {
          await recordPayment.mutateAsync(data);
          setPaymentModalOpen(false);
          Alert.alert("Success", "Payment recorded successfully.");
        }}
      />
    </ScreenWrapper>
  );
}
