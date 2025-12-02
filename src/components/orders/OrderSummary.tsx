import { Text, View } from "react-native";
import StatusDot from "../ui/StatusDot";

interface OrderSummaryProps {
  id: string;
  created_at: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
}

export default function OrderSummary({
  id,
  created_at,
  total_amount,
  amount_paid,
  balance_due,
  status,
}: OrderSummaryProps) {
  return (
    <View className="px-4 py-5 border border-neutral-300 rounded-lg mb-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-inter-semibold">Order Summary</Text>
        <Text className="text-neutral-600">
          {new Date(created_at).toLocaleDateString()}
        </Text>
      </View>
      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-neutral-600 text-sm font-inter">
          Total Amount:
        </Text>
        <Text className="font-inter-semibold text-neutral-900 text-2xl">
          ₹ {total_amount.toLocaleString()}
        </Text>
      </View>
      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-neutral-600 text-sm font-inter">
          Amount Paid:
        </Text>
        <Text className="font-inter-semibold text-neutral-900 text-2xl">
          ₹ {amount_paid.toLocaleString()}
        </Text>
      </View>
      <View className="flex-row border-t border-neutral-300 items-center justify-between pt-4 mt-4">
        <Text className="text-neutral-600 font-inter-medium text-lg">
          Balance Due:
        </Text>
        <View className="flex-row gap-4 items-center">
          <StatusDot status={status as any} />
          <Text className="font-inter-semibold text-danger text-3xl">
            ₹ {balance_due.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
