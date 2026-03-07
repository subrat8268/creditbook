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
  taxPercent: number;
  taxAmount: number;
  previousBalance: number;
  grandTotal: number;
  isFetchingBalance?: boolean;
  onSave: () => void;
  onSendBill: () => void;
  onLoadingChargeChange: (value: number) => void;
  onTaxChange: (value: number) => void;
}

export default function OrderBillSummary({
  itemsTotal,
  loadingCharge,
  taxPercent,
  taxAmount,
  previousBalance,
  grandTotal,
  isFetchingBalance = false,
  onSave,
  onSendBill,
  onLoadingChargeChange,
  onTaxChange,
}: OrderBillSummaryProps) {
  const [loadingChargeInput, setLoadingChargeInput] = useState(
    loadingCharge.toString(),
  );
  const [taxInput, setTaxInput] = useState(taxPercent.toString());

  const handleLoadingChargeChange = (text: string) => {
    setLoadingChargeInput(text);
    const value = parseFloat(text) || 0;
    onLoadingChargeChange(value);
  };

  const handleTaxChange = (text: string) => {
    setTaxInput(text);
    const value = Math.min(parseFloat(text) || 0, 100);
    onTaxChange(value);
  };

  const todayTotal = itemsTotal + taxAmount + loadingCharge;

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 pt-3 pb-4">
      {/* Loading Charge + Tax inputs */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 flex-row items-center">
          <Text className="text-sm font-inter-medium text-gray-600 flex-1">
            Loading ₹
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24 text-right"
            placeholder="0"
            keyboardType="numeric"
            value={loadingChargeInput}
            onChangeText={handleLoadingChargeChange}
          />
        </View>
        <View className="flex-1 flex-row items-center">
          <Text className="text-sm font-inter-medium text-gray-600 flex-1">
            GST %
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24 text-right"
            placeholder="0"
            keyboardType="numeric"
            value={taxInput}
            onChangeText={handleTaxChange}
          />
        </View>
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

        {/* Tax row — only if taxPercent > 0 */}
        {taxAmount > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">GST ({taxPercent}%)</Text>
            <Text className="text-sm text-gray-700">
              ₹{taxAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}

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
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1C1E" }}>
            Grand Total
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#1C1C1E" }}>
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
