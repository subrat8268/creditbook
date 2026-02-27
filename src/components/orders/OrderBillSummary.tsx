import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface OrderBillSummaryProps {
  itemsTotal: number;
  loadingCharge: number;
  previousBalance: number;
  grandTotal: number;
  isFetchingBalance?: boolean;
  onSave: () => void;
  onSendBill: () => void;
  onLoadingChargeChange: (value: number) => void;
}

export default function OrderBillSummary({
  itemsTotal,
  loadingCharge,
  previousBalance,
  grandTotal,
  isFetchingBalance = false,
  onSave,
  onSendBill,
  onLoadingChargeChange,
}: OrderBillSummaryProps) {
  const [loadingChargeInput, setLoadingChargeInput] = useState(
    loadingCharge.toString(),
  );

  const handleLoadingChargeChange = (text: string) => {
    setLoadingChargeInput(text);
    const value = parseFloat(text) || 0;
    onLoadingChargeChange(value);
  };

  const todayTotal = itemsTotal + loadingCharge;

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 pt-3 pb-4">
      {/* Loading Charge Input */}
      <View className="flex-row items-center gap-3 mb-3">
        <Text className="text-sm font-inter-medium text-gray-600 flex-1">
          Loading Charge
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-28 text-right"
          placeholder="₹0"
          keyboardType="numeric"
          value={loadingChargeInput}
          onChangeText={handleLoadingChargeChange}
        />
      </View>

      {/* Bill breakdown */}
      <View className="mb-3 gap-y-1.5">
        {/* Items */}
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500">Today's Items</Text>
          <Text className="text-sm text-gray-700">
            ₹{itemsTotal.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Loading charge row — only if > 0 */}
        {loadingCharge > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Loading Charge</Text>
            <Text className="text-sm text-gray-700">
              ₹{loadingCharge.toLocaleString("en-IN")}
            </Text>
          </View>
        )}

        {/* Today's subtotal — only show when there's a previous balance */}
        {previousBalance > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Today's Total</Text>
            <Text className="text-sm font-inter-medium text-gray-800">
              ₹{todayTotal.toLocaleString("en-IN")}
            </Text>
          </View>
        )}

        {/* Previous balance */}
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-inter-medium text-amber-600">
            Previous Balance
          </Text>
          {isFetchingBalance ? (
            <ActivityIndicator size="small" color="#d97706" />
          ) : (
            <Text className="text-sm font-inter-semibold text-amber-600">
              ₹{previousBalance.toLocaleString("en-IN")}
            </Text>
          )}
        </View>

        {/* Divider */}
        <View className="border-t border-gray-200 my-1" />

        {/* Grand Total */}
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-inter-bold text-gray-900">
            Grand Total
          </Text>
          <Text className="text-xl font-inter-bold text-gray-900">
            ₹{grandTotal.toLocaleString("en-IN")}
          </Text>
        </View>

        {previousBalance > 0 && (
          <Text className="text-xs text-gray-400 text-right">
            Today ₹{todayTotal.toLocaleString("en-IN")} + Prev ₹
            {previousBalance.toLocaleString("en-IN")}
          </Text>
        )}
      </View>

      {/* CTA Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onSave}
          className="flex-1 bg-primary py-3 rounded-xl"
        >
          <Text className="text-white text-center font-inter-semibold text-base">
            Save Order
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSendBill}
          className="flex-1 bg-green-600 py-3 rounded-xl flex-row justify-center items-center"
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text className="text-white text-center font-inter-semibold text-base ml-2">
            Send Bill
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
