import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface OrderBillSummaryProps {
  total: number;
  onSave: () => void;
  onSendBill: () => void;
}

export default function OrderBillSummary({
  total,
  onSave,
  onSendBill,
}: OrderBillSummaryProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
      {/* Total row */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-inter-medium text-gray-700">Total</Text>
        <Text className="text-xl font-inter-bold text-gray-900">₹{total}</Text>
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
